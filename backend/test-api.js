/**
 * MediChain — Full API Test Suite
 * Run: node test-api.js
 * Requires the backend server to be running on port 8000
 */

const BASE = 'http://localhost:8000';

// ── tiny http helper ──────────────────────────────────────────────────────────
async function req(method, path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let data;
  try { data = await res.json(); } catch { data = {}; }
  return { status: res.status, data };
}

// ── result tracker ────────────────────────────────────────────────────────────
const results = [];
let passed = 0, failed = 0, skipped = 0;

function log(label, res, expectStatus, note = '', skip = false) {
  if (skip) {
    skipped++;
    console.log(`  ⏭️  [SKIP] ${label}${note ? '  » ' + note : ''}`);
    results.push({ label, status: res.status, ok: true, skipped: true });
    return;
  }
  const ok = res.status === expectStatus;
  if (ok) passed++; else failed++;
  const icon  = ok ? '✅' : '❌';
  const badge = `[${res.status}]`;
  console.log(`  ${icon} ${badge} ${label}${note ? '  » ' + note : ''}`);
  if (!ok) {
    console.log(`     Expected ${expectStatus}, got ${res.status}`);
    console.log(`     Body: ${JSON.stringify(res.data).slice(0, 200)}`);
  }
  results.push({ label, status: res.status, ok });
}

// ── helpers ───────────────────────────────────────────────────────────────────
const rand = () => Math.random().toString(36).slice(2, 8);
const email = (role) => `test_${role}_${rand()}@medichain.test`;

// ── MAIN ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║        MediChain — Full API Test Suite           ║');
  console.log(`╚══════════════════════════════════════════════════╝`);
  console.log(`Server: ${BASE}\n`);

  // ── 1. Health ─────────────────────────────────────────────────────────────
  console.log('━━━ 1. Health ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('GET /api/health', await req('GET', '/api/health'), 200);

  // ── 2. Auth — Registration flow ───────────────────────────────────────────
  console.log('\n━━━ 2. Auth — Registration ━━━━━━━━━━━━━━━━━━━━━━━');

  const docEmail = email('doc');
  const patEmail = email('pat');
  const password  = 'Test@12345';

  // Register doctor
  const regDoc = await req('POST', '/api/auth/register', {
    name: 'Dr. Test', email: docEmail, phone: '+919999900001', password, role: 'doctor',
  });
  log('POST /api/auth/register (doctor)', regDoc, 201);
  const docId = regDoc.data.userId;

  // Register patient
  const regPat = await req('POST', '/api/auth/register', {
    name: 'Pat Test', email: patEmail, phone: '+919999900002', password, role: 'patient',
  });
  log('POST /api/auth/register (patient)', regPat, 201);
  const patId = regPat.data.userId;

  // Duplicate email → 409
  log('POST /api/auth/register (duplicate) → 409',
    await req('POST', '/api/auth/register', { name: 'X', email: docEmail, phone: '+910000000001', password }), 409);

  // Missing fields → 400
  log('POST /api/auth/register (missing fields) → 400',
    await req('POST', '/api/auth/register', { name: 'X' }), 400);

  // ── 3. Auth — OTP + Login ─────────────────────────────────────────────────
  console.log('\n━━━ 3. Auth — OTP Verification & Login ━━━━━━━━━━━━');

  // Try login before verification → 403
  log('POST /api/auth/login (unverified) → 403',
    await req('POST', '/api/auth/login', { email: docEmail, password }), 403);

  // Wrong email OTP → 400
  if (docId) {
    log('POST /api/auth/verify-email (wrong OTP) → 400',
      await req('POST', '/api/auth/verify-email', { userId: docId, otp: '000000' }), 400);

    // Resend email OTP
    log('POST /api/auth/resend-email-otp',
      await req('POST', '/api/auth/resend-email-otp', { userId: docId }), 200);
  }

  // ── Note: Full OTP flow requires real OTP from email/sms ─────────────────
  // We'll use pre-seeded/existing users if available, otherwise skip token-gated tests
  console.log('\n  ℹ️  Attempting login with known seeded credentials…');

  let docToken = null, patToken = null;

  // Try seeded doctor credentials (from seed.js)
  const seedDocLogin = await req('POST', '/api/auth/login', {
    email: 'dr.ananya.krishnamurthy@medichain.in', password: 'Doctor@123',
  });
  if (seedDocLogin.status === 200) {
    docToken = seedDocLogin.data.token;
    log('POST /api/auth/login (seeded doctor)', seedDocLogin, 200);
  } else {
    log('POST /api/auth/login (seeded doctor)', seedDocLogin, 200,
      'seed user not in Atlas DB — run seed.js first', true);
  }

  // Try seeded patient credentials
  const seedPatLogin = await req('POST', '/api/auth/login', {
    email: 'rahul.sharma@patient.medichain.in', password: 'Patient@123',
  });
  if (seedPatLogin.status === 200) {
    patToken = seedPatLogin.data.token;
    log('POST /api/auth/login (seeded patient)', seedPatLogin, 200);
  } else {
    log('POST /api/auth/login (seeded patient)', seedPatLogin, 200,
      'seed user not in Atlas DB — run seed.js first', true);
  }

  // Wrong password → 401
  log('POST /api/auth/login (wrong password) → 401',
    await req('POST', '/api/auth/login', { email: 'dr.ananya.krishnamurthy@medichain.in', password: 'wrongpass' }),
    401);

  // GET /api/auth/me — no token → 401
  log('GET /api/auth/me (no token) → 401',
    await req('GET', '/api/auth/me'), 401);

  if (docToken) {
    log('GET /api/auth/me (doctor)', await req('GET', '/api/auth/me', null, docToken), 200);
  }
  if (patToken) {
    log('GET /api/auth/me (patient)', await req('GET', '/api/auth/me', null, patToken), 200);
  }

  // ── 4. Records ─────────────────────────────────────────────────────────────
  console.log('\n━━━ 4. Records ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // No auth → 401
  log('GET /api/records (no auth) → 401', await req('GET', '/api/records'), 401);

  if (docToken) {
    log('GET /api/records (doctor)', await req('GET', '/api/records', null, docToken), 200);

    // GET patients list (doctor only)
    log('GET /api/records/patients/list (doctor)', await req('GET', '/api/records/patients/list', null, docToken), 200);

    // Post a record
    const addRec = await req('POST', '/api/records', {
      patient_email: 'rahul.sharma@patient.medichain.in',
      record_type: 'Consultation',
      title: 'Test Consultation',
      description: 'API test record',
      diagnosis: 'Healthy',
    }, docToken);
    log('POST /api/records (doctor adds)', addRec, 201);
    const newRecordId = addRec.data.record_id;

    if (newRecordId) {
      log(`GET /api/records/${newRecordId}`, await req('GET', `/api/records/${newRecordId}`, null, docToken), 200);
    }

    // Missing fields → 400
    log('POST /api/records (missing fields) → 400',
      await req('POST', '/api/records', { title: 'No email' }, docToken), 400);
  }

  if (patToken) {
    log('GET /api/records (patient)', await req('GET', '/api/records', null, patToken), 200);

    // Patients list → 403 for patient
    log('GET /api/records/patients/list (patient) → 403',
      await req('GET', '/api/records/patients/list', null, patToken), 403);

    // Patient cannot add records → 403
    log('POST /api/records (patient) → 403',
      await req('POST', '/api/records', {
        patient_email: 'someone@test.com', record_type: 'Consultation', title: 'Hack',
      }, patToken), 403);
  }

  // ── 5. Audit ───────────────────────────────────────────────────────────────
  console.log('\n━━━ 5. Audit ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('GET /api/audit (no auth) → 401', await req('GET', '/api/audit'), 401);
  if (docToken) log('GET /api/audit (doctor)', await req('GET', '/api/audit', null, docToken), 200);
  if (patToken) log('GET /api/audit (patient)', await req('GET', '/api/audit', null, patToken), 200);

  // ── 6. Blockchain ──────────────────────────────────────────────────────────
  console.log('\n━━━ 6. Blockchain ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('GET /api/blockchain (no auth) → 401', await req('GET', '/api/blockchain'), 401);
  if (docToken) {
    log('GET /api/blockchain', await req('GET', '/api/blockchain', null, docToken), 200);
    log('GET /api/blockchain/validate', await req('GET', '/api/blockchain/validate', null, docToken), 200);
  }

  // ── 7. Medicines ───────────────────────────────────────────────────────────
  console.log('\n━━━ 7. Medicines ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('GET /api/medicines', await req('GET', '/api/medicines'), 200);
  log('GET /api/medicines?page=1&limit=5', await req('GET', '/api/medicines?page=1&limit=5'), 200);
  log('GET /api/medicines/search?q=para', await req('GET', '/api/medicines/search?q=para'), 200);
  // Generic lookup — grab a real medicine name from the DB first
  const medList = await req('GET', '/api/medicines?limit=1');
  const firstMedName = medList.data?.[0]?.name || '';
  if (firstMedName) {
    log(`GET /api/medicines/generic?branded=${encodeURIComponent(firstMedName)}`,
      await req('GET', `/api/medicines/generic?branded=${encodeURIComponent(firstMedName)}`), 200);
  } else {
    log('GET /api/medicines/generic?branded=... (no medicines in DB)', medList, 200, 'skipped — empty medicines collection', true);
  }
  log('GET /api/medicines/generic?branded=XXXXNOTFOUND → 404',
    await req('GET', '/api/medicines/generic?branded=XXXXNOTFOUND'), 404);

  // ── 8. Specialists ─────────────────────────────────────────────────────────
  console.log('\n━━━ 8. Specialists ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const specsRes = await req('GET', '/api/specialists');
  log('GET /api/specialists', specsRes, 200);
  // Verify avatars are present
  const specsWithAvatar = (specsRes.data || []).filter(s => s.avatar && s.avatar.startsWith('https://'));
  const totalSpecs = (specsRes.data || []).length;
  if (totalSpecs > 0) {
    const fakeRes = { status: specsWithAvatar.length > 0 ? 200 : 422, data: {} };
    log(`  ↳ Specialists have avatar URLs (${specsWithAvatar.length}/${totalSpecs})`, fakeRes, 200);
  }
  log('GET /api/specialists?city=Mumbai', await req('GET', '/api/specialists?city=Mumbai'), 200);
  log('GET /api/specialists?specialty=Cardiology', await req('GET', '/api/specialists?specialty=Cardiology'), 200);
  log('GET /api/specialists?online=true', await req('GET', '/api/specialists?online=true'), 200);
  log('GET /api/specialists/cities', await req('GET', '/api/specialists/cities'), 200);
  log('GET /api/specialists/specialties', await req('GET', '/api/specialists/specialties'), 200);


  // ── 9. ER (Emergency Room) ─────────────────────────────────────────────────
  console.log('\n━━━ 9. ER — Emergency Room ━━━━━━━━━━━━━━━━━━━━━━━━');
  log('GET /api/er/patients (no auth) → 401', await req('GET', '/api/er/patients'), 401);
  log('GET /api/er/stats (no auth) → 401', await req('GET', '/api/er/stats'), 401);

  if (docToken) {
    log('GET /api/er/patients', await req('GET', '/api/er/patients', null, docToken), 200);
    log('GET /api/er/stats', await req('GET', '/api/er/stats', null, docToken), 200);

    // Admit a new ER patient
    const erAdmit = await req('POST', '/api/er/patients', {
      name: 'Test ER Patient',
      age: 45,
      gender: 'Male',
      condition: 'Chest pain',
      chief_complaint: 'Shortness of breath',
      severity: 2,
      vitals: { bp: '140/90', pulse: 95, temp: 37.5 },
    }, docToken);
    log('POST /api/er/patients (admit)', erAdmit, 201);
    const erPatId = erAdmit.data?._id;

    if (erPatId) {
      // Update ER patient
      log(`PUT /api/er/patients/${erPatId}`,
        await req('PUT', `/api/er/patients/${erPatId}`, { status: 'In Treatment', assigned_doctor: 'Dr. Test' }, docToken), 200);

      // Discharge
      log(`DELETE /api/er/patients/${erPatId} (discharge)`,
        await req('DELETE', `/api/er/patients/${erPatId}`, null, docToken), 200);
    }

    // Missing fields → 400
    log('POST /api/er/patients (missing fields) → 400',
      await req('POST', '/api/er/patients', { name: 'No severity' }, docToken), 400);
  }

  // ── 10. Procedures ─────────────────────────────────────────────────────────
  console.log('\n━━━ 10. Procedures ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('GET /api/procedures', await req('GET', '/api/procedures'), 200);
  log('GET /api/procedures/search?q=MRI', await req('GET', '/api/procedures/search?q=MRI'), 200);
  log('GET /api/procedures/search?q=MRI&city=Mumbai', await req('GET', '/api/procedures/search?q=MRI&city=Mumbai'), 200);
  log('GET /api/procedures/categories', await req('GET', '/api/procedures/categories'), 200);

  // ── 11. Diagnostics ────────────────────────────────────────────────────────
  console.log('\n━━━ 11. Diagnostics ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('GET /api/diagnostics', await req('GET', '/api/diagnostics'), 200);
  log('GET /api/diagnostics?city=Mumbai', await req('GET', '/api/diagnostics?city=Mumbai'), 200);
  log('GET /api/diagnostics?women=true', await req('GET', '/api/diagnostics?women=true'), 200);
  log('GET /api/diagnostics?home=true', await req('GET', '/api/diagnostics?home=true'), 200);
  log('GET /api/diagnostics?q=blood', await req('GET', '/api/diagnostics?q=blood'), 200);
  log('GET /api/diagnostics/cities', await req('GET', '/api/diagnostics/cities'), 200);

  // ── 12. AI Chat ─────────────────────────────────────────────────────────────
  console.log('\n━━━ 12. AI Chat (MediBot) ━━━━━━━━━━━━━━━━━━━━━━━');
  // Missing body → 400
  log('POST /api/chat (missing message) → 400',
    await req('POST', '/api/chat', {}), 400);

  // Real message → 200 with reply
  const chatRes = await req('POST', '/api/chat', { message: 'What is Dolo 650 used for?', history: [] });
  log('POST /api/chat (Gemini response)', chatRes, 200);
  if (chatRes.status === 200) {
    const hasReply = typeof chatRes.data?.reply === 'string' && chatRes.data.reply.length > 5;
    const fakeRes  = { status: hasReply ? 200 : 422, data: {} };
    log('  ↳ Response contains reply text', fakeRes, 200);
    if (hasReply) console.log(`     Preview: "${chatRes.data.reply.slice(0, 100)}…"`);
  }

  // Multi-turn: follow-up message
  const followRes = await req('POST', '/api/chat', {
    message: 'What is its generic alternative?',
    history: [
      { role: 'user',      content: 'What is Dolo 650 used for?' },
      { role: 'assistant', content: chatRes.data?.reply || 'It is a paracetamol-based medicine.' },
    ],
  });
  log('POST /api/chat (multi-turn follow-up)', followRes, 200);

  // ── Summary ────────────────────────────────────────────────────────────────
  const total = passed + failed + skipped;
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log(`║  Results: ${passed}/${total - skipped} passed  ${skipped > 0 ? `${skipped} skipped  ` : ''}${failed > 0 ? `(${failed} failed)` : '(all good! 🎉)'}`.padEnd(51) + '║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  if (failed > 0) {
    console.log('Failed tests:');
    results.filter(r => !r.ok && !r.skipped).forEach(r => {
      console.log(`  ❌ [${r.status}] ${r.label}`);
    });
    console.log('');
  }
  if (skipped > 0) {
    console.log(`ℹ️  ${skipped} test(s) skipped — run seed.js to populate Atlas DB for full coverage.\n`);
  }
})();
