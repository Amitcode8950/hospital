const mongoose = require('mongoose');

mongoose.set('bufferTimeoutMS', 30000);

let _memServer = null;

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      console.log('📡 Connecting to MongoDB...');
      await mongoose.connect(uri, { 
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000 
      });
      
      const isAtlas = uri.includes('mongodb.net');
      console.log(`✅ MongoDB connected → ${isAtlas ? 'Atlas Cluster' : 'Local/Standard'}`);
      return;
    } catch (err) {
      console.error('❌ MongoDB Connection Error:', err.message);
      if (err.message.includes('ECONNREFUSED')) {
        console.error('👉 Suggestion: Check if your IP is whitelisted in MongoDB Atlas or if you are behind a firewall.');
      }
      throw err;
    }
  }

  // ── Dev fallback: in-memory MongoDB (zero install) ────────────
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    if (!_memServer) _memServer = await MongoMemoryServer.create();
    await mongoose.connect(_memServer.getUri(), { serverSelectionTimeoutMS: 10000 });
    console.log('✅ In-memory MongoDB ready (dev mode — data resets on restart)');
    console.log('   Set MONGODB_URI in .env for persistent storage.\n');
  } catch (err) {
    console.error('❌ Failed to start In-memory MongoDB:', err.message);
    throw err;
  }
}

module.exports = { connectDB };
