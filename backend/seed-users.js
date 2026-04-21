/**
 * seed-users.js — Seeds test doctor + patient users directly into MongoDB
 * (bypasses OTP flow, marks both email + phone as verified)
 * Run: node seed-users.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

async function seedUsers() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not set in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB\n');

  // Lazy-load model after connection
  const User = require('./models/User');

  const TEST_USERS = [
    {
      name:           'Dr. Ananya Krishnamurthy',
      email:          'dr.ananya.krishnamurthy@medichain.in',
      phone:          '+919876543210',
      password:       'Doctor@123',
      role:           'doctor',
      email_verified: true,
      phone_verified: true,
      avatar:         'https://api.dicebear.com/7.x/lorelei/svg?seed=ananya-krishnamurthy&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc&radius=50',
    },
    {
      name:           'Rahul Sharma',
      email:          'rahul.sharma@patient.medichain.in',
      phone:          '+919876543211',
      password:       'Patient@123',
      role:           'patient',
      email_verified: true,
      phone_verified: true,
      avatar:         'https://api.dicebear.com/7.x/lorelei/svg?seed=rahul-sharma-patient&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc&radius=50',
    },
  ];

  for (const u of TEST_USERS) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`⏭️  ${u.email} already exists — skipping`);
      continue;
    }
    const hashed = await bcrypt.hash(u.password, 10);
    await User.create({ ...u, password: hashed });
    console.log(`✅ Created ${u.role}: ${u.email}  (password: ${u.password})`);
  }

  console.log('\n🎉 User seeding complete!');
  await mongoose.disconnect();
  process.exit(0);
}

seedUsers().catch(err => {
  console.error('❌ User seed failed:', err.message);
  process.exit(1);
});
