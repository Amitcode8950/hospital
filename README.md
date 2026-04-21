# 🏥 MediChain — Blockchain-Secured Medical Records Platform

> A full-stack healthcare platform for India with secure medical records, AI-powered chatbot, doctor booking, payment gateway (Razorpay + Cash), medicine price comparison, ER triage, and diagnostic lab finder.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Node.js%20%2B%20MongoDB-green)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-orange)
![Payments](https://img.shields.io/badge/payments-Razorpay%20%2B%20Cash-purple)

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Features](#-features)
4. [Project Structure](#-project-structure)
5. [Setup & Installation](#-setup--installation)
6. [Environment Variables](#-environment-variables)
7. [Database Seeding](#-database-seeding)
8. [API Reference](#-api-reference)
9. [Doctor — Step-by-Step Guide](#-doctor--step-by-step-guide)
10. [Patient — Step-by-Step Guide](#-patient--step-by-step-guide)
11. [Payment Guide](#-payment-guide)
12. [AI Chatbot (MediBot)](#-ai-chatbot-medibot)
13. [Test Credentials](#-test-credentials)
14. [Running Tests](#-running-tests)

---

## 🌐 Project Overview

**MediChain** is a blockchain-secured Electronic Health Record (EHR) system built for the Indian healthcare ecosystem. It enables doctors to create tamper-proof patient records and patients to control who sees their data — all backed by a MongoDB Atlas database, Google Gemini AI, and Razorpay payments.

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:5173       |
| Backend  | http://localhost:8000       |
| API Base | http://localhost:8000/api   |
| Health   | http://localhost:8000/api/health |

---

## 🛠 Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | React 18, Vite, React Router v6   |
| Backend     | Node.js, Express.js               |
| Database    | MongoDB Atlas (Mongoose ODM)      |
| Auth        | JWT (JSON Web Tokens) + bcryptjs  |
| Email       | Nodemailer + Gmail OAuth2         |
| AI Chatbot  | Google Gemini 1.5 Flash           |
| Payments    | Razorpay (Cards / UPI / Wallet)   |
| Blockchain  | Custom SHA-256 hash chain         |
| Avatars     | DiceBear Lorelei (SVG)            |

---

## ✨ Features

| Module              | Description                                              |
|---------------------|----------------------------------------------------------|
| 🔐 Auth             | Register, Email OTP verify, Login, JWT sessions          |
| 📋 Medical Records  | Doctors create records; patients view their own          |
| ⛓️ Blockchain       | SHA-256 chained records — tamper-evident audit trail     |
| 💊 Medicine Prices  | Compare prices across Apollo, 1mg, MedPlus, Netmeds      |
| 🏷️ Generic Drugs   | Find cheap generic alternatives to branded medicines     |
| 🩺 Specialist Finder| Find doctors by city/specialty, book appointments        |
| 🔬 Diagnostic Labs  | Find labs, book home collection or walk-in tests         |
| 🏥 Hospital Pricing | Compare procedure costs across government & private      |
| 🚑 ER Triage        | Emergency room queue management with severity sorting    |
| 📅 Bookings         | Full booking system — Razorpay online + cash on delivery |
| 🤖 MediBot AI       | Google Gemini chatbot with live DB context               |
| 🔗 Share Records    | Secure 24-hour expiry share links for specialists        |

---

## 📁 Project Structure

```
medichain/
├── backend/
│   ├── models/
│   │   ├── User.js             # User schema (doctor/patient, avatar)
│   │   ├── Record.js           # Medical record schema + blockchain hash
│   │   ├── AuditLog.js         # Audit trail for all record access
│   │   ├── Medicine.js         # Medicine + pharmacy prices
│   │   ├── Specialist.js       # Doctor profiles with avatar
│   │   ├── HospitalProcedure.js# Procedure pricing across hospitals
│   │   ├── DiagnosticCenter.js # Lab finder with tests + home collection
│   │   ├── ERPatient.js        # ER triage queue
│   │   └── Booking.js          # Appointment bookings + payment status
│   ├── routes/
│   │   ├── auth.js             # Register, OTP, Login, Me
│   │   ├── records.js          # CRUD for medical records
│   │   ├── audit.js            # Audit log access
│   │   ├── blockchain.js       # Blockchain explorer + validation
│   │   ├── medicines.js        # Medicine search + generic finder
│   │   ├── specialists.js      # Doctor finder + filters
│   │   ├── er.js               # ER patient management
│   │   ├── procedures.js       # Hospital procedure comparison
│   │   ├── diagnostics.js      # Diagnostic lab finder
│   │   ├── chat.js             # AI chatbot (Gemini)
│   │   └── bookings.js         # Bookings + Razorpay payment
│   ├── utils/
│   │   └── mailer.js           # Email OTP sender (Gmail / Ethereal)
│   ├── seed.js                 # Seed medicines, specialists, labs, procedures
│   ├── seed-users.js           # Seed test doctor + patient accounts
│   ├── test-api.js             # Full API test suite (63 tests)
│   ├── server.js               # Express app entry point
│   └── .env                    # Environment variables
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx       # Top navigation with modules dropdown
    │   │   ├── AiChat.jsx       # Floating MediBot AI chat widget
    │   │   ├── BookingModal.jsx  # Multi-step booking + payment modal
    │   │   ├── OTPInput.jsx     # 6-digit OTP input component
    │   │   ├── RecordCard.jsx   # Medical record display card
    │   │   └── BlockCard.jsx    # Blockchain block display card
    │   ├── pages/
    │   │   ├── Home.jsx         # Landing page
    │   │   ├── Register.jsx     # User registration (name, email, password, role)
    │   │   ├── VerifyEmail.jsx  # Email OTP verification
    │   │   ├── Login.jsx        # Login page
    │   │   ├── Dashboard.jsx    # Patient/Doctor records dashboard
    │   │   ├── AddRecord.jsx    # (Doctor only) Add medical record
    │   │   ├── RecordDetail.jsx # View single record + share link
    │   │   ├── BlockchainView.jsx  # Blockchain explorer
    │   │   ├── ShareView.jsx    # Public record share viewer
    │   │   ├── MedicinePrices.jsx  # Medicine price comparison
    │   │   ├── GenericDrugs.jsx    # Generic drug finder
    │   │   ├── SpecialistFinder.jsx# Doctor finder + booking
    │   │   ├── DiagnosticFinder.jsx# Lab finder + test booking
    │   │   ├── HospitalPricing.jsx # Hospital procedure prices
    │   │   ├── ERTriage.jsx     # ER queue management
    │   │   ├── DiagnosisCompare.jsx# Diagnosis cost comparison
    │   │   └── MyBookings.jsx   # User's booking history + status
    │   ├── api/
    │   │   └── axios.js         # Axios instance with JWT interceptor
    │   └── App.jsx              # Routes definition
    └── vite.config.js           # Vite config + proxy to :8000
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js v18+ and npm
- MongoDB Atlas account (free tier works)
- Gmail account (for email OTP)

### Step 1 — Clone & Install

```bash
# Install backend dependencies
cd medichain/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2 — Configure Environment

```bash
# Copy the example and fill in your values
cd medichain/backend
# Edit .env with your MongoDB URI, Gmail credentials, etc.
```

See [Environment Variables](#-environment-variables) section below.

### Step 3 — Seed the Database

```bash
cd medichain/backend

# Seed medicines, specialists, procedures, diagnostic labs
node seed.js

# Seed test accounts (doctor + patient, pre-verified)
node seed-users.js
```

### Step 4 — Start Development Servers

```bash
# Terminal 1 — Backend (port 8000)
cd medichain/backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd medichain/frontend
npm run dev
```

### Step 5 — Open the App

Navigate to **http://localhost:5173**

---

## 🔑 Environment Variables

File: `medichain/backend/.env`

```env
# ── Server ────────────────────────────────────────────
PORT=8000
JWT_SECRET=your_super_secret_jwt_key_here

# ── MongoDB Atlas ─────────────────────────────────────
# Leave blank for auto in-memory MongoDB (dev, data resets)
# Atlas: mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/medichain
MONGODB_URI=mongodb+srv://...

# ── Google Gemini AI Chatbot ──────────────────────────
# Free key: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=AIzaSy...

# ── Razorpay Payment Gateway ──────────────────────────
# Free test account: https://dashboard.razorpay.com
# Test keys work instantly, no real money deducted
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# ── Gmail Email (for OTP) ─────────────────────────────
# Your Gmail address
EMAIL_USER=your_gmail@gmail.com
# OAuth2: https://console.cloud.google.com
CLIENT_ID=...
CLIENT_SECRET=...
REFRESH_TOKEN=...
# If not set → uses Ethereal (fake inbox, URL printed in console)
```

---

## 🌱 Database Seeding

| Script           | What it seeds                                              | Command              |
|------------------|------------------------------------------------------------|----------------------|
| `seed.js`        | 10 medicines, 20 specialist doctors, 7 procedures, 6 labs | `node seed.js`       |
| `seed-users.js`  | 1 test doctor + 1 test patient (pre-verified, skip OTP)    | `node seed-users.js` |

> ⚠️ Both scripts **clear existing data** before inserting — safe to re-run anytime.

---

## 📡 API Reference

**Base URL:** `http://localhost:8000/api`

> 🔒 = Requires `Authorization: Bearer <token>` header
> 👨‍⚕️ = Doctor role only
> 👤 = Any authenticated user

---

### 🏥 Health Check

| Method | Endpoint       | Description              |
|--------|----------------|--------------------------|
| GET    | `/health`      | Server + DB status check |

**Response:**
```json
{
  "status": "ok",
  "time": "2026-04-21T03:00:00.000Z",
  "service": "MediChain API v2.0 (MongoDB)",
  "db": "connected"
}
```

---

### 🔐 Authentication — `/api/auth`

| Method | Endpoint                | Auth | Description                              |
|--------|-------------------------|------|------------------------------------------|
| POST   | `/register`             | ❌   | Register new user (doctor or patient)    |
| POST   | `/verify-email`         | ❌   | Verify email with 6-digit OTP            |
| POST   | `/resend-email-otp`     | ❌   | Resend email OTP                         |
| POST   | `/login`                | ❌   | Login — returns JWT token                |
| GET    | `/me`                   | 🔒   | Get current logged-in user profile       |

**Register body:**
```json
{
  "name": "Dr. Priya Sharma",
  "email": "priya@example.com",
  "phone": "+919876543210",
  "password": "Password@123",
  "role": "doctor"
}
```

**Login response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Dr. Priya Sharma",
    "email": "priya@example.com",
    "role": "doctor",
    "avatar": "https://api.dicebear.com/..."
  }
}
```

---

### 📋 Medical Records — `/api/records`

| Method | Endpoint                  | Auth  | Description                                   |
|--------|---------------------------|-------|-----------------------------------------------|
| GET    | `/`                       | 🔒👤  | Get all records (doctors see all, patients own)|
| POST   | `/`                       | 🔒👨‍⚕️ | Create a new medical record                   |
| GET    | `/:id`                    | 🔒👤  | Get single record by ID                       |
| GET    | `/patients/list`          | 🔒👨‍⚕️ | Get list of all patients (doctor only)        |
| POST   | `/:id/share`              | 🔒👤  | Generate 24-hour share link                   |
| GET    | `/share/:token`           | ❌    | Public — view shared record (no login needed) |

**Create record body:**
```json
{
  "patient_id": "...",
  "diagnosis": "Type 2 Diabetes",
  "prescription": "Metformin 500mg twice daily",
  "notes": "Follow-up in 3 months",
  "attachments": []
}
```

---

### 📜 Audit Log — `/api/audit`

| Method | Endpoint | Auth | Description                             |
|--------|----------|------|-----------------------------------------|
| GET    | `/`      | 🔒👤 | Get audit trail for all record accesses |

---

### ⛓️ Blockchain — `/api/blockchain`

| Method | Endpoint    | Auth | Description                                    |
|--------|-------------|------|------------------------------------------------|
| GET    | `/`         | 🔒👤 | View full blockchain of all records            |
| GET    | `/validate` | 🔒👤 | Validate chain integrity (detect tampering)     |

---

### 💊 Medicines — `/api/medicines`

| Method | Endpoint                         | Auth | Description                               |
|--------|----------------------------------|------|-------------------------------------------|
| GET    | `/`                              | ❌   | List all medicines (paginated)            |
| GET    | `/?page=1&limit=10`              | ❌   | Paginated medicine list                   |
| GET    | `/search?q=paracetamol`          | ❌   | Search medicines by name                  |
| GET    | `/generic?branded=Dolo+650`      | ❌   | Find cheap generic alternatives           |

**Generic finder response:**
```json
{
  "branded": "Dolo 650",
  "generic_name": "Paracetamol",
  "savings": "Up to 80%",
  "alternatives": [
    { "name": "Crocin 650", "price": 28, "manufacturer": "GSK" }
  ]
}
```

---

### 🩺 Specialists — `/api/specialists`

| Method | Endpoint                           | Auth | Description                          |
|--------|------------------------------------|------|--------------------------------------|
| GET    | `/`                                | ❌   | List all specialists                 |
| GET    | `/?city=Mumbai`                    | ❌   | Filter by city                       |
| GET    | `/?specialty=Cardiology`           | ❌   | Filter by specialty                  |
| GET    | `/?online=true`                    | ❌   | Online-only doctors                  |
| GET    | `/?city=Delhi&specialty=Neurology` | ❌   | Combined filters                     |
| GET    | `/cities`                          | ❌   | List all available cities            |
| GET    | `/specialties`                     | ❌   | List all specialties                 |

---

### 🔬 Diagnostics — `/api/diagnostics`

| Method | Endpoint                  | Auth | Description                            |
|--------|---------------------------|------|----------------------------------------|
| GET    | `/`                       | ❌   | List all diagnostic centers            |
| GET    | `/?city=Mumbai`           | ❌   | Filter by city                         |
| GET    | `/?women=true`            | ❌   | Women-friendly labs only               |
| GET    | `/?home=true`             | ❌   | Home collection available              |
| GET    | `/?q=blood`               | ❌   | Search by test name or lab name        |
| GET    | `/cities`                 | ❌   | List all cities with labs              |

---

### 🏥 Procedures — `/api/procedures`

| Method | Endpoint                         | Auth | Description                              |
|--------|----------------------------------|------|------------------------------------------|
| GET    | `/`                              | ❌   | List all hospital procedures             |
| GET    | `/search?q=MRI`                  | ❌   | Search procedures by name                |
| GET    | `/search?q=MRI&city=Mumbai`      | ❌   | Filter by procedure name + city          |
| GET    | `/categories`                    | ❌   | List all procedure categories            |

---

### 🚑 ER Triage — `/api/er`

| Method | Endpoint           | Auth | Description                              |
|--------|--------------------|------|------------------------------------------|
| GET    | `/patients`        | 🔒👤 | List all current ER patients (queued)    |
| GET    | `/stats`           | 🔒👤 | ER queue stats (count by severity)       |
| POST   | `/patients`        | 🔒👤 | Admit new ER patient with severity       |
| PUT    | `/patients/:id`    | 🔒👤 | Update patient severity or status        |
| DELETE | `/patients/:id`    | 🔒👤 | Discharge patient from ER queue          |

**Admit patient body:**
```json
{
  "patient_name": "Ravi Kumar",
  "age": 45,
  "gender": "Male",
  "chief_complaint": "Chest pain",
  "severity": "Critical",
  "vitals": { "bp": "150/90", "pulse": 110, "spo2": 94 }
}
```

---

### 📅 Bookings & Payments — `/api/bookings`

| Method | Endpoint                      | Auth | Description                                   |
|--------|-------------------------------|------|-----------------------------------------------|
| POST   | `/`                           | 🔒👤 | Create a booking (doctor/lab/procedure)        |
| GET    | `/`                           | 🔒👤 | Get all bookings for logged-in user            |
| GET    | `/:id`                        | 🔒👤 | Get single booking detail                     |
| DELETE | `/:id`                        | 🔒👤 | Cancel a booking                              |
| POST   | `/payment/create-order`       | 🔒👤 | Create Razorpay payment order                 |
| POST   | `/payment/verify`             | 🔒👤 | Verify Razorpay payment signature              |

**Create booking body:**
```json
{
  "type": "doctor",
  "item_id": "specialist_id",
  "item_name": "Dr. Priya Sharma",
  "sub_item": "Cardiology · Interventional",
  "location": "Kokilaben Hospital",
  "city": "Mumbai",
  "date": "2026-04-25",
  "time_slot": "10:00 AM–11:00 AM",
  "amount": 1200,
  "payment_method": "cash",
  "notes": "Follow-up consultation"
}
```

**Booking types:** `doctor` | `lab` | `procedure`
**Payment methods:** `online` (Razorpay) | `cash` (pay at visit)
**Payment status:** `pending` → `paid` | `cod` | `failed`

---

### 🤖 AI Chat — `/api/chat`

| Method | Endpoint | Auth | Description                                    |
|--------|----------|------|------------------------------------------------|
| POST   | `/`      | ❌   | Send message to MediBot AI (Google Gemini)     |

**Request body:**
```json
{
  "message": "What is Dolo 650 used for?",
  "history": [
    { "role": "user",      "content": "previous message" },
    { "role": "assistant", "content": "previous reply" }
  ]
}
```

**Response:**
```json
{
  "reply": "Dolo 650 contains Paracetamol 650mg. It is used to relieve mild to moderate pain and fever..."
}
```

---

## 👨‍⚕️ Doctor — Step-by-Step Guide

### Step 1: Register as a Doctor

1. Go to **http://localhost:5173/register**
2. Fill in:
   - **Full Name:** Dr. Ananya Krishnamurthy
   - **Email:** your email address
   - **Password:** minimum 8 characters
   - **I am a...** → Select **👨‍⚕️ Doctor**
3. Click **Create Account & Verify →**

### Step 2: Verify Your Email

1. Check your email inbox for a **6-digit OTP**
2. Go to **http://localhost:5173/verify-email**
3. Enter the 6-digit code
4. Click **Verify Email →**
5. You'll be redirected to Login

### Step 3: Login

1. Go to **http://localhost:5173/login**
2. Enter your **email** and **password**
3. Click **Sign In →**
4. You land on your **Dashboard**

### Step 4: Add a Patient's Medical Record

1. Click **➕ Add Record** in the navbar
2. Fill in the form:
   - **Patient** — select from patient list
   - **Diagnosis** — e.g., "Hypertension Stage 2"
   - **Prescription** — e.g., "Amlodipine 5mg, once daily"
   - **Notes** — follow-up instructions, lifestyle advice
3. Click **Save Record**
4. The record is automatically **hashed and anchored to the blockchain**

### Step 5: View & Manage Records

1. Go to **Dashboard** → see all records you created
2. Click any record to open its detail view
3. **Generate Share Link** — gives patient a secure 24-hour access URL

### Step 6: ER Triage Management (Doctors & Staff)

1. Click **🚑 ER Triage** from the Modules menu
2. Click **Admit Patient** → fill patient details + severity level:
   - **Critical** 🔴 — immediate life threat
   - **Urgent** 🟠 — needs attention within 30 min
   - **Stable** 🟡 — can wait
3. Update severity or discharge patients as they're treated

### Step 7: Use MediBot AI

1. Click the **🤖** floating button (bottom-right corner)
2. Ask clinical questions:
   - *"What is the generic alternative for Amoxicillin?"*
   - *"Find cardiologists in Bangalore"*
   - *"What tests should a diabetic patient do quarterly?"*

---

## 🧑‍💼 Patient — Step-by-Step Guide

### Step 1: Register as a Patient

1. Go to **http://localhost:5173/register**
2. Fill in:
   - **Full Name:** Rahul Sharma
   - **Email:** your email address
   - **Password:** minimum 8 characters
   - **I am a...** → Select **🧑‍⚕️ Patient**
3. Click **Create Account & Verify →**

### Step 2: Verify Email

1. Check inbox for a **6-digit OTP**
2. Enter it on the Verify Email page
3. Redirected to Login

### Step 3: Login & View Dashboard

1. Login at **http://localhost:5173/login**
2. Dashboard shows **all your medical records** from your doctors

### Step 4: Find a Specialist Doctor

1. Click **🧩 Modules → 🩺 Find Specialist**
2. Filter by **City** and **Specialty**
3. Browse doctors with ratings, experience, fees, and profile pictures
4. Click **📅 Book Now** on any doctor card

### Step 5: Book a Doctor Appointment

1. **Step 1 of 3** — Select a **Date** (next 7 days) and **Time Slot**
2. **Step 2 of 3** — Review booking details:
   - Doctor name, specialty, fee (₹)
   - Add optional notes (symptoms, queries)
   - Choose payment:
     - 💳 **Pay Online** — Razorpay (UPI/Card/Wallet)
     - 💵 **Cash / Pay at Visit** — pay when you arrive
3. Click **Confirm Booking** or **💳 Pay ₹XXX**
4. **Done!** Booking confirmed with reference ID

### Step 6: Book a Lab Test

1. Click **🧩 Modules → 🔬 Diagnostic Labs**
2. Filter by city, search test name (e.g., "CBC", "HbA1c")
3. Each test card shows **price** and **turnaround time**
4. Click **📅 Book** next to the test you want
5. Complete booking with date/time and payment method

### Step 7: Check Your Bookings

1. Click **🧩 Modules → 📅 My Bookings**
2. See all appointments with:
   - ✅ Confirmed / ❌ Cancelled / ✔ Completed status
   - 💳 Paid Online / 💵 Pay at Visit tags
   - **Cancel** button for upcoming appointments
3. Stats bar shows total spent and upcoming count

### Step 8: Compare Medicine Prices

1. Go to **🧩 Modules → 💊 Medicine Prices**
2. Search any medicine name
3. See prices across **Apollo, 1mg, MedPlus, Netmeds**
4. Switch to **🏷️ Generic Drugs** page to find cheaper alternatives

### Step 9: Share Your Medical Records

1. Go to **Dashboard** → click any record
2. Click **🔗 Generate Share Link**
3. Share the URL with your specialist
4. Link expires automatically after **24 hours**

### Step 10: Chat with MediBot AI

1. Click **🤖** floating button (bottom-right, all pages)
2. Ask health questions:
   - *"I have a fever of 102°F, what should I do?"*
   - *"What does HbA1c test measure?"*
   - *"Find a gynecologist in Chennai"*
   - *"What is the generic alternative to Azithral 500?"*
3. MediBot has live knowledge of all doctors and medicines in the database

---

## 💳 Payment Guide

### Online Payment (Razorpay)

**Test Mode (no real money):**
| Field       | Test Value               |
|-------------|--------------------------|
| Card Number | `4111 1111 1111 1111`    |
| Expiry      | Any future date (12/26)  |
| CVV         | `123`                    |
| OTP/2FA     | `1234` (test mode)       |

**UPI Test ID:** `success@razorpay`

**To enable real Razorpay:**
1. Sign up at https://dashboard.razorpay.com (free)
2. Go to Settings → API Keys → Generate Key
3. Add to `backend/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_secret_here
   ```

### Cash / Pay at Visit

- Select **💵 Cash / Pay at Visit** during booking
- No payment needed upfront
- Booking is confirmed immediately
- Pay when you arrive at the clinic/lab

---

## 🤖 AI Chatbot (MediBot)

MediBot is powered by **Google Gemini 1.5 Flash** with live database context.

### Setup

1. Get a free API key: https://aistudio.google.com/app/apikey
2. Add to `backend/.env`:
   ```
   GEMINI_API_KEY=AIzaSy...
   ```
3. Restart the backend server

### What MediBot Knows

- All 20+ specialist doctors (name, specialty, city, fee)
- All 10 medicines with prices and generics
- All hospital procedures and diagnostic tests
- MediChain platform features and navigation
- General medical information (not a diagnostic tool)

### Quick Action Chips

When you open MediBot, tap these quick prompts:
- 💊 What is Dolo 650?
- 🩺 Find cardiologist
- 🏷️ Generic alternatives
- 🔬 Book a blood test
- 🏥 Hospital pricing
- 📋 Share my records

---

## 🧪 Test Credentials

Pre-seeded accounts (already email-verified, no OTP needed):

| Role    | Email                                      | Password    |
|---------|--------------------------------------------|-------------|
| Doctor  | `dr.ananya.krishnamurthy@medichain.in`     | `Doctor@123` |
| Patient | `rahul.sharma@patient.medichain.in`        | `Patient@123` |

To re-seed these accounts: `node seed-users.js`

---

## 🧪 Running Tests

```bash
cd medichain/backend

# Make sure backend is running first:
npm run dev

# In a new terminal, run all 63 API tests:
node test-api.js
```

**Expected output:**
```
╔══════════════════════════════════════════════════╗
║        MediChain — Full API Test Suite           ║
╚══════════════════════════════════════════════════╝

━━━ 1. Health ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ [200] GET /api/health

...

━━━ 12. AI Chat (MediBot) ━━━━━━━━━━━━━━━━━━━━━━━
  ✅ [400] POST /api/chat (missing message) → 400
  ✅ [200] POST /api/chat (Gemini response)
  ✅ [200] POST /api/chat (multi-turn follow-up)

╔══════════════════════════════════════════════════╗
║  Results: 63/63 passed  (all good! 🎉)           ║
╚══════════════════════════════════════════════════╝
```

### Test Coverage

| Section    | Tests | Endpoints Covered                               |
|------------|-------|-------------------------------------------------|
| Health     | 1     | GET /health                                     |
| Auth       | 10    | register, verify, resend, login, /me            |
| Records    | 9     | CRUD, patient list, auth guards                 |
| Audit      | 3     | Auth guard, doctor access, patient access        |
| Blockchain | 3     | View chain, validate integrity                  |
| Medicines  | 5     | List, paginate, search, generic finder          |
| Specialists| 7     | List, filters, avatar check, cities, specialties |
| ER         | 8     | Admit, update, discharge, stats                 |
| Procedures | 4     | List, search, city filter, categories           |
| Diagnostics| 6     | List, city, women, home, search, cities         |
| AI Chat    | 4     | Error case, Gemini response, multi-turn         |
| **Total**  | **63**| **All endpoints covered** ✅                   |

---

## 📄 License

MIT License — free for educational and personal use.

---

## 👨‍💻 Built With ❤️ for Indian Healthcare

MediChain is designed with the Indian healthcare ecosystem in mind:
- 🇮🇳 All prices in **₹ Indian Rupees**
- 🏙️ Covers cities from **Mumbai to Lucknow**
- 💊 Includes **Indian medicine brands** (Dolo, Crocin, Glucon-D, etc.)
- 🏥 Features both **Government** and **Private** hospital tiers
- 📱 OTP via **Email** (free, no Twilio required)
- 💳 Payments via **Razorpay** (India's #1 payment gateway)
#   h o s t p i t a l  
 