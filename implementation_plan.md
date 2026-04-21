# MediChain — Implementation Plan

This document tracks how the **MediChain** stack is built and what is left to wire. The backend is **Express + MongoDB (Mongoose)**; the frontend is **React (Vite)**. Medical records are **anchored to an in-database hash chain** (see Blockchain below).

---

## Platform overview (as implemented)

| Area | Location / notes |
|------|-------------------|
| API entry | `backend/server.js` — CORS, JSON, routes, `connectDB()`, `initBlockchain()` |
| Auth | `backend/routes/auth.js`, JWT; frontend stores `medichain_token` |
| Health records | `backend/routes/records.js` — doctor creates records; each create calls `addBlock()` |
| Audit | `backend/routes/audit.js`, `backend/models/AuditLog.js` |
| Modules | Medicines, specialists, ER, procedures, diagnostics, chat, vitals (`/api/*` routes in `server.js`) |
| Bookings & payments | `backend/routes/bookings.js`, `backend/models/Booking.js`, Razorpay optional |
| Frontend shell | `frontend/src/App.jsx`, `Navbar.jsx`, `AiChat` |

---

## Blockchain (immutability layer)

| Piece | Role |
|-------|------|
| `backend/blockchain.js` | `sha256` + `computeHash`, `initBlockchain`, `addBlock`, `getChain`, `validateChain` |
| `backend/models/BlockchainBlock.js` | MongoDB documents: `idx`, `timestamp`, `data`, `prev_hash`, `hash`, `nonce` |
| `backend/routes/blockchain.js` | `GET /api/blockchain` (full chain), `GET /api/blockchain/validate` — both require auth (`middleware/auth.js`) |
| `backend/routes/records.js` | On `POST /api/records`, builds `blockData` (`type: 'MEDICAL_RECORD'`, patient/doctor emails, title, etc.), calls `addBlock`, then saves `Record` with `block_index` / `block_hash` |

Genesis: created on first run if no blocks exist (`initBlockchain` in `blockchain.js`).

---

## Booking & payment gateway

### Summary

End-to-end booking for **doctor** and **lab** flows from the finder pages, with **Razorpay** (when keys are set) or **mock order/pay** for local dev. **Cash / pay at visit** sets `payment_status` to `cod`.

### User setup (Razorpay)

> [!IMPORTANT]
> Razorpay needs a free test account at https://dashboard.razorpay.com. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `backend/.env`. If keys are missing or still placeholder, the API uses **mock** orders (`order_mock_*`) and verify accepts them without a real signature.

> [!NOTE]
> In test mode, card `4111 1111 1111 1111`, future expiry, CVV `123` — no real charge.

### Backend — status

| Item | Status |
|------|--------|
| `backend/models/Booking.js` | **Done** — includes `sub_item`, `location`, `city`, `notes`, `doctor_action`, `doctor_notes`, `doctor_email`; timestamps `created_at` / `updated_at` |
| `backend/routes/bookings.js` | **Done** — `POST /`, `GET /`, `GET /:id`, `DELETE /:id`, `POST /payment/create-order`, `POST /payment/verify`; also `GET /incoming` (doctors), `PUT /:id/action` (confirm/reject + email via `utils/mailer.js`) |
| `backend/server.js` | **Done** — `app.use('/api/bookings', ...)` |
| `razorpay` dependency | **Done** — `backend/package.json` |

### Frontend — status

| Item | Status |
|------|--------|
| `frontend/src/components/BookingModal.jsx` | **Done** — multi-step date/time, review, online vs cash |
| `frontend/src/pages/MyBookings.jsx` | **Done** — route `/my-bookings` (protected in `App.jsx`) |
| `frontend/src/pages/SpecialistFinder.jsx` | **Done** — **Book Now** opens modal; avatars via `<img src={s.avatar} />` when present |
| `frontend/src/pages/DiagnosticFinder.jsx` | **Done** — home collection booking wired to modal |
| `frontend/src/pages/HospitalPricing.jsx` | **Not done** — compare/search UI only; no **Book procedure** / `BookingModal` yet |
| `frontend/src/components/Navbar.jsx` | **Done** — **My Bookings** in module nav |

---

## Outstanding work

1. **Hospital procedure booking** — Add `BookingModal` (type `procedure`) to `HospitalPricing.jsx` for each hospital row (or primary CTA), passing procedure name, hospital, city, and price as `amount`, consistent with `BookingModal` props used in specialists/diagnostics.
2. **Tests** — Extend `backend/test-api.js` with booking create + payment create-order flows if not already covered end-to-end.

---

## Verification plan

### Automated

- Run `node test-api.js` (from `backend/`) — includes blockchain endpoints with auth.

### Manual

1. `/specialists` → **Book Now** → complete modal → **My Bookings** lists entry.
2. `/diagnostics` → book home collection → same.
3. Online path: if Razorpay configured, complete checkout; otherwise mock verify path should mark paid.
4. Cash path → immediate `cod` status.
5. `/blockchain` (logged in) → chain loads; validate endpoint returns `valid: true` when intact.
6. Doctor flow (if testing): incoming bookings and confirm/reject + email (depends on mail env).
