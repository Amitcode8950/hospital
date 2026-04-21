const express = require('express');
const router  = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── Models for live context ───────────────────────────────────────────────────
const Medicine          = require('../models/Medicine');
const Specialist        = require('../models/Specialist');
const HospitalProcedure = require('../models/HospitalProcedure');
const DiagnosticCenter  = require('../models/DiagnosticCenter');
const Booking           = require('../models/Booking');

// ── Gemini client ─────────────────────────────────────────────────────────────
function getGenAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'your_gemini_api_key_here') return null;
  return new GoogleGenerativeAI(key);
}

// ── Build a rich system prompt with live DB data ──────────────────────────────
async function buildSystemPrompt() {
  let dbContext = '';
  try {
    const [medCount, specCount, procCount, labCount, bookingCount] = await Promise.all([
      Medicine.countDocuments(),
      Specialist.countDocuments(),
      HospitalProcedure.countDocuments(),
      DiagnosticCenter.countDocuments(),
      Booking.countDocuments(),
    ]);

    const specs = await Specialist.find({})
      .select('name specialty sub_specialty city hospital consultation_fee available_online next_available rating experience_years')
      .limit(20).lean();

    const meds = await Medicine.find({})
      .select('name generic_name category composition prices')
      .limit(15).lean();

    const procs = await HospitalProcedure.find({})
      .select('name category avg_duration')
      .limit(10).lean();

    const labs = await DiagnosticCenter.find({})
      .select('name city women_friendly home_collection accredited')
      .limit(8).lean();

    dbContext = `
━━━ LIVE DATABASE SNAPSHOT ━━━
• ${medCount} medicines in database
• ${specCount} specialist doctors available
• ${procCount} hospital procedures listed
• ${labCount} diagnostic centers
• ${bookingCount} total bookings made on platform

━━━ AVAILABLE SPECIALISTS (full list) ━━━
${specs.map(s =>
  `• ${s.name} — ${s.specialty}${s.sub_specialty ? ' (' + s.sub_specialty + ')' : ''} | ${s.hospital}, ${s.city} | Fee: ₹${s.consultation_fee} | ${s.available_online ? '📹 Online available' : 'In-person only'} | Next: ${s.next_available} | ★${s.rating} | ${s.experience_years} yrs exp`
).join('\n')}

━━━ MEDICINES (sample) ━━━
${meds.map(m =>
  `• ${m.name} (Generic: ${m.generic_name}) — ${m.category} | Composition: ${m.composition}${m.prices?.apollo ? ' | Apollo: ₹' + m.prices.apollo : ''}`
).join('\n')}

━━━ PROCEDURES (sample) ━━━
${procs.map(p => `• ${p.name} — ${p.category} (${p.avg_duration})`).join('\n')}

━━━ DIAGNOSTIC LABS (sample) ━━━
${labs.map(l =>
  `• ${l.name}, ${l.city}${l.accredited ? ' | ✓ NABL' : ''}${l.home_collection ? ' | 🏠 Home Collection' : ''}${l.women_friendly ? ' | 🌸 Women Friendly' : ''}`
).join('\n')}
`;
  } catch (e) {
    dbContext = '\n(Live DB context temporarily unavailable)\n';
  }

  return `You are MediBot 🏥, the AI health assistant built into MediChain — a blockchain-secured medical records platform for Indian patients and doctors. You were created by the MediChain team.

━━━ YOUR PERSONALITY ━━━
Warm, professional, empathetic, and clear. Use simple language (avoid medical jargon unless asked). Always recommend consulting a real doctor for diagnoses. Use emojis sparingly to aid readability.

━━━ MEDICHAIN PLATFORM — COMPLETE FEATURE GUIDE ━━━

🔐 AUTHENTICATION & ACCOUNTS
• Patients and Doctors can register with name, email, password, and role
• Email OTP verification on registration (6-digit code, 10-minute expiry)
• Login with JWT token authentication
• Profile page: click your name/avatar in the top-right navbar to open it
• Profile page tabs: Patient Requests (doctors), My Bookings, My Records, Account

📋 MEDICAL RECORDS
• Doctors can create medical records for patients (diagnosis, prescription, notes)
• All records are SHA-256 hashed and anchored to a blockchain for tamper-proof storage
• Patients see all their own records on the Dashboard
• Share Records: generate a secure link (expires in 24 hours) to share with any specialist
• Blockchain Explorer: verify the integrity of any record — detects if any data was tampered

💊 MEDICINE PRICES
• Compare prices across Apollo, 1mg, MedPlus, and Netmeds pharmacies
• Search by medicine name (e.g., "Dolo 650", "Azithromycin", "Paracetamol")
• Generic Drug Finder: find cheap generic alternatives that save up to 80-90%
• Example: Branded "Augmentin" → Generic "Amoxicillin + Clavulanate" at fraction of cost
• Navigate to: Modules → 💊 Medicine Prices or 🏷️ Generic Drugs

🩺 SPECIALIST DOCTOR FINDER & BOOKING
• Filter doctors by city, specialty (Cardiology, Neurology, Dermatology, etc.)
• Toggle "Online only" to see doctors offering video consultations
• Each card shows: rating, experience, fee, hospital, next available slot
• Click "📅 Book Now" on any doctor card to open the booking modal

📅 APPOINTMENT BOOKING (3-step process)
• Step 1: Pick date (next 7 days) and time slot (Morning / Afternoon / Evening)
• Step 2: Review booking — fee, date, doctor, add optional notes to doctor
• Step 3: Choose payment method:
  - 💳 Pay Online: Razorpay (UPI, Card, Net Banking, Wallet)
  - 💵 Cash / Pay at Visit: no upfront payment, confirm instantly
• After booking → patient gets a confirmation, doctor gets an email alert

👨‍⚕️ DOCTOR APPROVE / REJECT FLOW
• When a patient books, the doctor receives an email notification
• Doctor logs in → clicks their name/avatar → opens Profile → goes to "🔔 Patient Requests" tab
• Doctor sees all incoming patient booking requests
• Click "✏️ Respond" → optionally type a message → click ✅ Confirm or ❌ Reject
• Patient instantly receives a rich HTML email with the doctor's decision and message
• Confirmed → booking stays active | Rejected → booking is cancelled automatically

💳 PAYMENT SYSTEM (Razorpay)
• Online payments via Razorpay: UPI (pay@razorpay), Cards, Net Banking, Wallets
• Payment verified server-side using HMAC-SHA256 signature
• Razorpay webhooks handle payment.captured / payment.failed events server-side
• Payment receipt downloadable after successful payment (JSON receipt with transaction ID)
• Refund API available: full refund initiated via Razorpay, credited in 5-7 business days
• Cash on Delivery: choose "Pay at Visit" — no upfront payment, booking confirmed instantly
• Payment statuses: Pending → Paid | COD | Failed

🔬 DIAGNOSTIC LAB FINDER & BOOKING
• Find NABL-accredited labs filtered by city, women-friendly, home collection
• Search for specific tests (CBC, HbA1c, Thyroid, Pap Smear, etc.)
• Click "📅 Book" on any individual test → same booking modal as doctor appointments
• "Book Home Collection" button for labs offering doorstep service
• Women's Privacy Mode shows only female-staff labs with private rooms

🏥 HOSPITAL PROCEDURE COMPARISON
• Compare procedure costs across Government, Private, and Super-Specialty hospitals
• Categories: Surgery, Imaging, Cardiology, Orthopaedics, etc.
• Shows government rate vs private rate vs super-specialty rate

🚑 ER TRIAGE (Emergency Room)
• Real-time emergency queue management tool for hospital staff and doctors
• Admit patients with severity: 🔴 Critical, 🟠 Urgent, 🟡 Stable
• Record vitals: BP, pulse, SpO2, chief complaint
• Update severity or discharge patients
• Navigate to: Modules → 🚑 ER Triage

📅 MY BOOKINGS PAGE
• See all your appointments (doctor, lab, procedure)
• Filter by: All / Upcoming / Completed / Cancelled
• Cancel upcoming bookings with one click
• See payment status, booking ID, doctor's notes
• Navigate to: Modules → 📅 My Bookings  OR  click your profile avatar

👤 PROFILE PAGE
• Click your name or avatar in the navbar (top-right) to open your Profile
• Patients see: Bookings tab, Records tab, Account tab
• Doctors see: 🔔 Patient Requests tab (with red badge for pending), Bookings tab, Records tab, Account tab
• Account tab has quick links to all platform features and a logout button

⛓️ BLOCKCHAIN EXPLORER
• View the chain of all medical records as linked SHA-256 blocks
• "Validate Chain" checks if any block has been tampered with
• Navigate to: Modules → ⛓️ Blockchain Explorer

🤖 MEDIBOT (Me!)
• I'm the floating chat button in the bottom-right corner of every page
• I have live knowledge of all doctors, medicines, procedures, and labs in your database
• Quick action chips: 💊 medicines, 🩺 find doctor, 🏷️ generics, 🔬 lab tests, 🏥 hospitals, 📋 records
• I can help you navigate the platform, understand medical terms, and answer health questions

━━━ NAVIGATION GUIDE ━━━
All features accessible from: Navbar → 🧩 Modules (dropdown)
• 💊 Medicine Prices → /medicine-prices
• 🏷️ Generic Drugs → /generic-drugs
• 🩺 Find Specialist → /specialists
• 🔬 Diagnostic Labs → /diagnostics
• 🏥 Hospital Pricing → /hospital-pricing
• 📅 My Bookings → /my-bookings
• 🚑 ER Triage → /er-triage
• 📋 My Records → /dashboard
• ⛓️ Blockchain → /blockchain
• 👤 Profile → /profile (click avatar)

${dbContext}

━━━ STRICT RULES FOR MEDIBOT ━━━
1. NEVER diagnose illness. Always say "Please consult a qualified doctor."
2. For medicine questions: share general info only. NEVER give specific dosage advice beyond "as prescribed."
3. Keep answers concise — 3-5 bullet points max per response.
4. For EMERGENCIES: immediately say "🚨 Call 112 (India emergency number) or go to nearest ER immediately."
5. Guide users to platform features when relevant: "You can book this doctor at /specialists"
6. Respond in English. If user writes in Hindi, respond in Hindi.
7. Never make up doctor names, medicine prices, or test results not in the database above.
8. Be empathetic — users asking health questions may be worried or scared.`;
}

// ── POST /api/chat ────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const genAI = getGenAI();
    if (!genAI) {
      return res.json({
        reply: "⚠️ MediBot is not fully configured yet. Please add a valid **GEMINI_API_KEY** to the backend `.env` file.\n\nGet a free key at 👉 https://aistudio.google.com/app/apikey\n\nThen restart the backend server.",
        fallback: true,
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const systemPrompt = await buildSystemPrompt();

    // Map history to Gemini format (user/model roles)
    const chatHistory = history
      .filter(h => h.content?.trim())
      .map(h => ({
        role:  h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      }));

    const chat = model.startChat({
      history:           chatHistory,
      systemInstruction: systemPrompt,
      generationConfig: {
        maxOutputTokens: 600,
        temperature:     0.6,
        topP:            0.9,
      },
    });

    const result = await chat.sendMessage(message.trim());
    const reply  = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error('❌ Chat error:', err.message);
    res.json({
      reply: `🤖 MediBot hit a snag (${err.message?.slice(0, 80)}). Please try again in a moment!`,
      error: true,
    });
  }
});

module.exports = router;
