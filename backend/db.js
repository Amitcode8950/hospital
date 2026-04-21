const mongoose = require('mongoose');

mongoose.set('bufferTimeoutMS', 30000);

let _memServer = null;

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  // ── Use configured URI (Atlas or local) ──────────────────────
  if (uri) {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ MongoDB connected → ${uri.replace(/:\/\/[^@]+@/, '://<credentials>@')}`);
    return;
  }

  // ── Dev fallback: in-memory MongoDB (zero install) ────────────
  const { MongoMemoryServer } = require('mongodb-memory-server');
  if (!_memServer) _memServer = await MongoMemoryServer.create();
  await mongoose.connect(_memServer.getUri(), { serverSelectionTimeoutMS: 10000 });
  console.log('✅ In-memory MongoDB ready (dev mode — data resets on restart)');
  console.log('   Set MONGODB_URI in .env for persistent storage.\n');
}

module.exports = { connectDB };
