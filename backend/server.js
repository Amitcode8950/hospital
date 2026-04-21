const express = require('express');
const cors = require('cors');
require('dotenv').config({ override: true });

const { connectDB } = require('./db');
const { initBlockchain } = require('./blockchain');

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Payments — must be registered after express config ───────────────────────
app.use('/api/payments', require('./routes/payments'));

app.use('/api/auth',        require('./routes/auth'));
app.use('/api/records',     require('./routes/records'));
app.use('/api/audit',       require('./routes/audit'));
app.use('/api/blockchain',  require('./routes/blockchain'));
// ── New Modules ──────────────────────────────────────────────
app.use('/api/medicines',   require('./routes/medicines'));
app.use('/api/specialists', require('./routes/specialists'));
app.use('/api/er',          require('./routes/er'));
app.use('/api/procedures',  require('./routes/procedures'));
app.use('/api/diagnostics', require('./routes/diagnostics'));
app.use('/api/chat',        require('./routes/chat'));        // 🤖 AI Chatbot
app.use('/api/bookings',    require('./routes/bookings'));    // 📅 Bookings & Payments
app.use('/api/vitals',      require('./routes/vitals'));      // 🫀 Health Vitals Tracker

app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    service: 'MediChain API v2.0 (MongoDB)',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    await initBlockchain();

    // Auto-seed module data when using in-memory DB (no MONGODB_URI set)
    if (!process.env.MONGODB_URI?.trim()) {
      const Medicine         = require('./models/Medicine');
      const alreadySeeded    = await Medicine.countDocuments();
      if (alreadySeeded === 0) {
        console.log('🌱 Seeding module data...');
        await require('./seed-runner')();
        console.log('✅ Seed complete\n');
      }
    }

    const server = app.listen(PORT, () => {
      console.log('\n╔══════════════════════════════════════════╗');
      console.log('║   🏥  MediChain Backend (MongoDB)         ║');
      console.log('╠══════════════════════════════════════════╣');
      console.log(`║  API:    http://localhost:${PORT}            ║`);
      console.log(`║  Health: http://localhost:${PORT}/api/health ║`);
      console.log('╚══════════════════════════════════════════╝\n');
      const hasEmail = process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_gmail@gmail.com';
      console.log(`📧 Email: ${hasEmail ? '✅ Gmail configured' : '⚠️  DEV MODE — Ethereal (check console for preview URLs)'}`);
      console.log(`📱 Phone OTP: delivered via email (SMS removed)\n`);
    });

    // ── Fix EADDRINUSE: handle port conflict gracefully ──────────
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use.`);
        console.error(`   Run this to free it: npx kill-port ${PORT}`);
        console.error(`   Then restart: npm run dev\n`);
      } else {
        console.error('❌ Server error:', err.message);
      }
      process.exit(1);
    });

    // ── Graceful shutdown on Ctrl+C ──────────────────────────────
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down MediChain...');
      server.close();
      await require('mongoose').connection.close();
      console.log('✅ Shutdown complete');
      process.exit(0);
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
