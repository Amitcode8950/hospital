const nodemailer = require('nodemailer');

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  const { EMAIL_USER, CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, EMAIL_PASS } = process.env;

  // ── Option 1: Gmail OAuth2 (CLIENT_ID + CLIENT_SECRET + REFRESH_TOKEN) ──
  if (EMAIL_USER && CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type:         'OAuth2',
        user:         EMAIL_USER,
        clientId:     CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
      },
    });
    console.log(`📧 Gmail OAuth2 transporter ready (${EMAIL_USER})`);
    return transporter;
  }

  // ── Option 2: Gmail App Password ──────────────────────────────
  if (EMAIL_USER && EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });
    console.log(`📧 Gmail App Password transporter ready (${EMAIL_USER})`);
    return transporter;
  }

  // ── Option 3: Dev fallback — Ethereal fake inbox ───────────────
  const testAcc = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email', port: 587, secure: false,
    auth: { user: testAcc.user, pass: testAcc.pass },
  });
  console.log('📧 DEV MODE — Ethereal test account:');
  console.log(`   User: ${testAcc.user} | Pass: ${testAcc.pass}`);
  return transporter;
}

async function sendOTPEmail(toEmail, toName, otp) {
  const t = await getTransporter();
  const info = await t.sendMail({
    from: `"MediChain 🏥" <${process.env.EMAIL_USER || 'noreply@medichain.health'}>`,
    to: toEmail,
    subject: `${otp} — Your MediChain Verification Code`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');
  body{margin:0;padding:0;background:#050a14;font-family:'Outfit',Arial,sans-serif;}
  .wrap{max-width:520px;margin:40px auto;padding:20px;}
  .card{background:linear-gradient(135deg,#0b1629,#0f1f3d);border:1px solid rgba(0,212,255,0.25);border-radius:20px;padding:44px 40px;}
  .logo{font-size:26px;font-weight:800;color:#00d4ff;margin-bottom:4px;}
  .sub{font-size:13px;color:#475569;margin-bottom:32px;}
  .hi{font-size:22px;font-weight:700;color:#e2e8f0;margin-bottom:12px;}
  .txt{font-size:15px;color:#94a3b8;line-height:1.6;margin-bottom:28px;}
  .otp-box{background:rgba(0,212,255,0.08);border:2px solid rgba(0,212,255,0.4);border-radius:16px;padding:28px;text-align:center;margin:28px 0;}
  .otp-label{font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#475569;margin-bottom:12px;}
  .otp-code{font-size:48px;font-weight:800;letter-spacing:10px;color:#00d4ff;}
  .expiry{font-size:13px;color:#f59e0b;margin-top:14px;}
  .warn{background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:10px;padding:14px 18px;font-size:13px;color:#fbbf24;}
  hr{border:none;border-top:1px solid rgba(255,255,255,0.06);margin:28px 0;}
  .footer{margin-top:28px;text-align:center;font-size:12px;color:#334155;}
</style>
</head>
<body>
<div class="wrap"><div class="card">
  <div class="logo">🏥 MediChain</div>
  <div class="sub">Blockchain-Secured Patient Records</div>
  <div class="hi">Hello, ${toName}! 👋</div>
  <p class="txt">Use the code below to verify your email. It expires in <strong>10 minutes</strong>.</p>
  <div class="otp-box">
    <div class="otp-label">Verification Code</div>
    <div class="otp-code">${otp}</div>
    <div class="expiry">⏱ Expires in 10 minutes</div>
  </div>
  <div class="warn">🔒 Never share this code. MediChain will never ask for your OTP.</div>
  <hr/>
  <p style="font-size:13px;color:#475569">If you didn't register, ignore this email.</p>
  <div class="footer">⛓️ © 2026 MediChain — Your Health Records, Your Control</div>
</div></div>
</body>
</html>`,
  });

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.log(`\n📧 EMAIL PREVIEW → ${preview}\n`);
  return info;
}

async function sendWelcomeEmail(toEmail, toName) {
  const t = await getTransporter();
  const info = await t.sendMail({
    from: `"MediChain 🏥" <${process.env.EMAIL_USER || 'noreply@medichain.health'}>`,
    to: toEmail,
    subject: '🎉 Welcome to MediChain — Account Verified!',
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/>
<style>
  body{margin:0;padding:0;background:#050a14;font-family:Arial,sans-serif;}
  .wrap{max-width:520px;margin:40px auto;padding:20px;}
  .card{background:linear-gradient(135deg,#0b1629,#0f1f3d);border:1px solid rgba(0,212,255,0.25);border-radius:20px;padding:44px 40px;}
  .logo{font-size:26px;font-weight:800;color:#00d4ff;}
  h2{font-size:24px;color:#e2e8f0;margin:20px 0 12px;}
  p{font-size:15px;color:#94a3b8;line-height:1.7;}
  .feat{display:flex;gap:12px;margin:14px 0;}
  .cta{display:block;background:linear-gradient(135deg,#00d4ff,#0099cc);color:#050a14;text-decoration:none;text-align:center;padding:16px;border-radius:10px;font-weight:700;font-size:16px;margin:28px 0;}
  .footer{text-align:center;font-size:12px;color:#334155;margin-top:24px;}
</style>
</head>
<body><div class="wrap"><div class="card">
  <div class="logo">🏥 MediChain</div>
  <h2>Welcome aboard, ${toName}! 🎉</h2>
  <p>Your account is fully verified. Here's what you can do now:</p>
  <div class="feat"><span>📋</span><div><strong style="color:#e2e8f0">View Medical Records</strong><br/><span style="font-size:13px;color:#94a3b8">All your records, secure and accessible</span></div></div>
  <div class="feat"><span>⛓️</span><div><strong style="color:#e2e8f0">Blockchain-Anchored</strong><br/><span style="font-size:13px;color:#94a3b8">Every record is cryptographically tamper-proof</span></div></div>
  <div class="feat"><span>🔗</span><div><strong style="color:#e2e8f0">Share Securely</strong><br/><span style="font-size:13px;color:#94a3b8">Time-limited links for specialists</span></div></div>
  <a class="cta" href="http://localhost:5173/dashboard">Go to My Dashboard →</a>
  <div class="footer">© 2026 MediChain — Blockchain-Secured Medical Records</div>
</div></div></body></html>`,
  });
  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.log(`📧 WELCOME EMAIL PREVIEW → ${preview}`);
  return info;
}

async function sendPhoneOTPEmail(toEmail, toName, phone, otp) {
  const t = await getTransporter();
  const maskedPhone = phone.replace(/(\d{2})\d+(\d{2})$/, '$1******$2');
  const info = await t.sendMail({
    from: `"MediChain 🏥" <${process.env.EMAIL_USER || 'noreply@medichain.health'}>`,
    to: toEmail,
    subject: `${otp} — Your MediChain Phone Verification Code`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');
  body{margin:0;padding:0;background:#050a14;font-family:'Outfit',Arial,sans-serif;}
  .wrap{max-width:520px;margin:40px auto;padding:20px;}
  .card{background:linear-gradient(135deg,#0b1629,#0f1f3d);border:1px solid rgba(0,212,255,0.25);border-radius:20px;padding:44px 40px;}
  .logo{font-size:26px;font-weight:800;color:#00d4ff;margin-bottom:4px;}
  .sub{font-size:13px;color:#475569;margin-bottom:32px;}
  .hi{font-size:22px;font-weight:700;color:#e2e8f0;margin-bottom:12px;}
  .txt{font-size:15px;color:#94a3b8;line-height:1.6;margin-bottom:28px;}
  .otp-box{background:rgba(0,212,255,0.08);border:2px solid rgba(0,212,255,0.4);border-radius:16px;padding:28px;text-align:center;margin:28px 0;}
  .otp-label{font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#475569;margin-bottom:12px;}
  .otp-code{font-size:48px;font-weight:800;letter-spacing:10px;color:#00d4ff;}
  .expiry{font-size:13px;color:#f59e0b;margin-top:14px;}
  .phone-badge{background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:8px;padding:10px 16px;font-size:14px;color:#10b981;margin-bottom:20px;display:inline-block;}
  .warn{background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:10px;padding:14px 18px;font-size:13px;color:#fbbf24;}
  hr{border:none;border-top:1px solid rgba(255,255,255,0.06);margin:28px 0;}
  .footer{margin-top:28px;text-align:center;font-size:12px;color:#334155;}
</style>
</head>
<body>
<div class="wrap"><div class="card">
  <div class="logo">🏥 MediChain</div>
  <div class="sub">Blockchain-Secured Patient Records</div>
  <div class="hi">Hello, ${toName}! 📱</div>
  <p class="txt">Use the code below to verify your phone number ending in <span class="phone-badge">${maskedPhone}</span>. It expires in <strong>10 minutes</strong>.</p>
  <div class="otp-box">
    <div class="otp-label">Phone Verification Code</div>
    <div class="otp-code">${otp}</div>
    <div class="expiry">⏱ Expires in 10 minutes</div>
  </div>
  <div class="warn">🔒 Never share this code. MediChain will never ask for your OTP.</div>
  <hr/>
  <p style="font-size:13px;color:#475569">If you didn't request this, ignore this email.</p>
  <div class="footer">⛓️ © 2026 MediChain — Your Health Records, Your Control</div>
</div></div>
</body>
</html>`,
  });
  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.log(`\n📧 PHONE OTP EMAIL PREVIEW → ${preview}\n`);
  return info;
}

// ── Booking action → patient email ────────────────────────────────────────────
async function sendBookingActionEmail(booking, action, doctorNotes) {
  const t = await getTransporter();
  const isConfirmed = action === 'confirmed';
  const accentColor = isConfirmed ? '#10b981' : '#ef4444';
  const icon        = isConfirmed ? '✅' : '❌';
  const actionLabel = isConfirmed ? 'Confirmed' : 'Rejected';
  const bookingDate = new Date(booking.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const info = await t.sendMail({
    from:    `"MediChain 🏥" <${process.env.EMAIL_USER || 'noreply@medichain.health'}>`,
    to:      booking.user_email,
    subject: `${icon} Your appointment with ${booking.item_name} has been ${actionLabel}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');
  body{margin:0;padding:0;background:#050a14;font-family:'Outfit',Arial,sans-serif;}
  .wrap{max-width:540px;margin:40px auto;padding:20px;}
  .card{background:linear-gradient(135deg,#0b1629,#0f1f3d);border:1px solid rgba(0,212,255,0.2);border-radius:20px;padding:44px 40px;}
  .logo{font-size:22px;font-weight:800;color:#00d4ff;margin-bottom:4px;}
  .sub{font-size:12px;color:#475569;margin-bottom:28px;}
  .status-banner{background:${isConfirmed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'};border:2px solid ${accentColor};border-radius:14px;padding:24px;text-align:center;margin:24px 0;}
  .status-icon{font-size:48px;margin-bottom:8px;}
  .status-text{font-size:22px;font-weight:800;color:${accentColor};}
  .detail-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:14px;}
  .detail-label{color:#64748b;}
  .detail-value{color:#e2e8f0;font-weight:600;}
  .notes-box{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px 18px;margin:20px 0;font-size:14px;color:#94a3b8;line-height:1.6;}
  .cta{display:block;background:linear-gradient(135deg,#00d4ff,#0099cc);color:#050a14;text-decoration:none;text-align:center;padding:14px;border-radius:10px;font-weight:700;font-size:15px;margin:24px 0;}
  .footer{text-align:center;font-size:12px;color:#334155;margin-top:24px;}
</style>
</head>
<body><div class="wrap"><div class="card">
  <div class="logo">🏥 MediChain</div>
  <div class="sub">Blockchain-Secured Patient Records</div>

  <div class="status-banner">
    <div class="status-icon">${icon}</div>
    <div class="status-text">Appointment ${actionLabel}</div>
  </div>

  <p style="font-size:15px;color:#94a3b8;margin-bottom:20px;">
    Dear <strong style="color:#e2e8f0">${booking.user_name}</strong>,<br/><br/>
    ${isConfirmed
      ? `Your appointment with <strong style="color:#00d4ff">${booking.item_name}</strong> has been <strong style="color:#10b981">confirmed</strong>. Please be on time.`
      : `Unfortunately, your appointment with <strong style="color:#00d4ff">${booking.item_name}</strong> has been <strong style="color:#ef4444">rejected</strong>. You may book another slot or contact the clinic directly.`
    }
  </p>

  <div>
    <div class="detail-row"><span class="detail-label">Doctor</span><span class="detail-value">${booking.item_name}</span></div>
    <div class="detail-row"><span class="detail-label">Specialty</span><span class="detail-value">${booking.sub_item || '—'}</span></div>
    <div class="detail-row"><span class="detail-label">Hospital</span><span class="detail-value">${booking.location || '—'}</span></div>
    <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${bookingDate}</span></div>
    <div class="detail-row"><span class="detail-label">Time Slot</span><span class="detail-value">${booking.time_slot}</span></div>
    <div class="detail-row"><span class="detail-label">Fee</span><span class="detail-value" style="color:#10b981">₹${booking.amount}</span></div>
    <div class="detail-row"><span class="detail-label">Payment</span><span class="detail-value">${booking.payment_method === 'online' ? '💳 Online' : '💵 Cash at Visit'}</span></div>
    <div class="detail-row"><span class="detail-label">Booking ID</span><span class="detail-value">#${String(booking._id).slice(-6).toUpperCase()}</span></div>
  </div>

  ${doctorNotes ? `<div class="notes-box">💬 <strong>Message from Doctor:</strong><br/>${doctorNotes}</div>` : ''}

  <a class="cta" href="http://localhost:5173/my-bookings">View My Bookings →</a>

  ${isConfirmed ? `
  <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:14px 18px;font-size:13px;color:#6ee7b7;">
    ✅ <strong>Appointment Tips:</strong> Arrive 10 minutes early. Bring your previous reports if any. You can view and share your records at medichain.
  </div>` : `
  <div style="background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:14px 18px;font-size:13px;color:#fca5a5;">
    💡 <strong>What next?</strong> You can book another available slot with this doctor or find another specialist on MediChain.
  </div>`}

  <div class="footer">⛓️ © 2026 MediChain — Your Health Records, Your Control</div>
</div></div></body></html>`,
  });

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.log(`\n📧 BOOKING ${actionLabel.toUpperCase()} EMAIL PREVIEW → ${preview}\n`);
  return info;
}

// ── New booking alert → doctor email ─────────────────────────────────────────
async function sendNewBookingAlert(doctorEmail, doctorName, booking) {
  const t = await getTransporter();
  const bookingDate = new Date(booking.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const info = await t.sendMail({
    from:    `"MediChain 🏥" <${process.env.EMAIL_USER || 'noreply@medichain.health'}>`,
    to:      doctorEmail,
    subject: `📅 New Appointment Request from ${booking.user_name}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/>
<style>
  body{margin:0;padding:0;background:#050a14;font-family:Arial,sans-serif;}
  .wrap{max-width:520px;margin:40px auto;padding:20px;}
  .card{background:linear-gradient(135deg,#0b1629,#0f1f3d);border:1px solid rgba(0,212,255,0.2);border-radius:20px;padding:40px;}
  .logo{font-size:22px;font-weight:800;color:#00d4ff;margin-bottom:24px;}
  .alert{background:rgba(0,212,255,0.08);border:2px solid rgba(0,212,255,0.3);border-radius:14px;padding:20px;margin:20px 0;text-align:center;}
  .detail-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:14px;}
  .cta{display:block;background:linear-gradient(135deg,#00d4ff,#0099cc);color:#050a14;text-decoration:none;text-align:center;padding:14px;border-radius:10px;font-weight:700;font-size:15px;margin:24px 0;}
  .footer{text-align:center;font-size:12px;color:#334155;margin-top:24px;}
</style>
</head>
<body><div class="wrap"><div class="card">
  <div class="logo">🏥 MediChain</div>
  <div class="alert">
    <div style="font-size:36px;margin-bottom:8px">📅</div>
    <div style="font-size:18px;font-weight:800;color:#00d4ff">New Appointment Request</div>
  </div>

  <p style="font-size:15px;color:#94a3b8;">Dear <strong style="color:#e2e8f0">${doctorName}</strong>, you have a new appointment request:</p>

  <div>
    <div class="detail-row"><span style="color:#64748b">Patient</span><span style="color:#e2e8f0;font-weight:600">${booking.user_name}</span></div>
    <div class="detail-row"><span style="color:#64748b">Email</span><span style="color:#94a3b8">${booking.user_email}</span></div>
    <div class="detail-row"><span style="color:#64748b">Date</span><span style="color:#e2e8f0;font-weight:600">${bookingDate}</span></div>
    <div class="detail-row"><span style="color:#64748b">Time</span><span style="color:#e2e8f0">${booking.time_slot}</span></div>
    <div class="detail-row"><span style="color:#64748b">Fee</span><span style="color:#10b981;font-weight:700">₹${booking.amount}</span></div>
    <div class="detail-row"><span style="color:#64748b">Payment</span><span style="color:#e2e8f0">${booking.payment_method === 'online' ? '💳 Online' : '💵 Cash at Visit'}</span></div>
    ${booking.notes ? `<div class="detail-row"><span style="color:#64748b">Patient Notes</span><span style="color:#94a3b8">${booking.notes}</span></div>` : ''}
  </div>

  <a class="cta" href="http://localhost:5173/profile">Confirm or Reject →</a>
  <div class="footer">⛓️ © 2026 MediChain</div>
</div></div></body></html>`,
  });

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.log(`\n📧 DOCTOR ALERT EMAIL PREVIEW → ${preview}\n`);
  return info;
}

module.exports = { sendOTPEmail, sendWelcomeEmail, sendPhoneOTPEmail, sendBookingActionEmail, sendNewBookingAlert };
