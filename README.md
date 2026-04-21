# 🏥 MediChain

A blockchain-secured healthcare platform for managing medical records, doctor bookings, payments, and AI-based assistance.

---

## 🚀 Features

* 🔐 User Authentication (JWT + OTP)
* 📋 Medical Records (Doctor creates, patient views)
* ⛓️ Blockchain-based record integrity
* 🩺 Doctor Finder & Appointment Booking
* 💊 Medicine Price Comparison + Generic Alternatives
* 🔬 Diagnostic Lab Finder
* 🚑 ER Triage System
* 💳 Payments (Online via Razorpay + Cash)
* 🤖 AI Chatbot (Google Gemini)

---

## 🛠 Tech Stack

* Frontend: React + Vite
* Backend: Node.js + Express
* Database: MongoDB (Mongoose)
* Auth: JWT + bcrypt
* AI: Google Gemini
* Payments: Razorpay

---

## 📁 Project Structure

```
medichain/
  backend/
  frontend/
```

---

## ⚙️ Setup

### 1. Clone project

```bash
git clone <your-repo-url>
cd medichain
```

### 2. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

---

## 🔑 Environment Variables

Create `backend/.env`:

```env
PORT=8000
JWT_SECRET=your_secret

MONGODB_URI=your_mongodb_uri

GEMINI_API_KEY=your_gemini_key

RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

---

## 🌱 Seed Database

```bash
cd backend
node seed.js
node seed-users.js
```

---

## ▶️ Run Project

### Start backend

```bash
cd backend
npm run dev
```

### Start frontend

```bash
cd frontend
npm run dev
```

---

## 🌐 URLs

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend: [http://localhost:8000](http://localhost:8000)
* API: [http://localhost:8000/api](http://localhost:8000/api)
* Health: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 🧪 Test Accounts

**Doctor**

```
dr.ananya.krishnamurthy@medichain.in
Doctor@123
```

**Patient**

```
rahul.sharma@patient.medichain.in
Patient@123
```

---

## 💳 Payments (Test Mode)

* Card: 4111 1111 1111 1111
* CVV: 123
* OTP: 1234
* UPI: success@razorpay

---

## 🤖 AI Chatbot

* Powered by Google Gemini
* Answers medical queries
* Suggests doctors, medicines, tests

---

## 📄 License

MIT License

---

## ❤️ Notes

* Works best with MongoDB Atlas
* Use test Razorpay keys for development
* Email OTP uses Gmail or test mail

---

