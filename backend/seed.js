/**
 * MediChain — Seed Script
 * Populates all new collections with realistic Indian healthcare data.
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Medicine = require('./models/Medicine');
const Specialist = require('./models/Specialist');
const HospitalProcedure = require('./models/HospitalProcedure');
const DiagnosticCenter = require('./models/DiagnosticCenter');

// ─── MEDICINES ──────────────────────────────────────────────────────────────
const medicines = [
  {
    name: 'Dolo 650', generic_name: 'Paracetamol', manufacturer: 'Micro Labs',
    category: 'Analgesic / Antipyretic', composition: 'Paracetamol 650mg',
    dosage_form: 'Tablet', uses: ['Fever', 'Headache', 'Body pain', 'Toothache'],
    side_effects: ['Nausea', 'Liver damage (overdose)', 'Allergic reactions'],
    prices: [
      { pharmacy: 'Apollo Pharmacy',   logo: '🔵', price: 31, mrp: 36,  discount: 14, in_stock: true,  delivery_days: 2 },
      { pharmacy: 'MedPlus',           logo: '🟢', price: 29, mrp: 36,  discount: 19, in_stock: true,  delivery_days: 3 },
      { pharmacy: '1mg',               logo: '🔴', price: 27, mrp: 36,  discount: 25, in_stock: true,  delivery_days: 1 },
      { pharmacy: 'Netmeds',           logo: '🟣', price: 30, mrp: 36,  discount: 17, in_stock: false, delivery_days: 4 },
      { pharmacy: 'Wellness Forever',  logo: '🟡', price: 33, mrp: 36,  discount: 8,  in_stock: true,  delivery_days: 2 },
    ],
  },
  {
    name: 'Crocin 500', generic_name: 'Paracetamol', manufacturer: 'GSK',
    category: 'Analgesic / Antipyretic', composition: 'Paracetamol 500mg',
    dosage_form: 'Tablet', uses: ['Fever', 'Mild pain', 'Cold & flu'],
    side_effects: ['Nausea', 'Stomach upset'],
    prices: [
      { pharmacy: 'Apollo Pharmacy',  logo: '🔵', price: 22, mrp: 25,  discount: 12, in_stock: true,  delivery_days: 2 },
      { pharmacy: '1mg',              logo: '🔴', price: 19, mrp: 25,  discount: 24, in_stock: true,  delivery_days: 1 },
      { pharmacy: 'Netmeds',          logo: '🟣', price: 21, mrp: 25,  discount: 16, in_stock: true,  delivery_days: 3 },
    ],
  },
  {
    name: 'Augmentin 625', generic_name: 'Amoxicillin + Clavulanate', manufacturer: 'GSK',
    category: 'Antibiotic', composition: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
    dosage_form: 'Tablet', uses: ['Bacterial infections', 'Sinusitis', 'Pneumonia', 'UTI'],
    side_effects: ['Diarrhoea', 'Nausea', 'Vomiting', 'Rash'],
    prices: [
      { pharmacy: 'Apollo Pharmacy',  logo: '🔵', price: 210, mrp: 249, discount: 16, in_stock: true,  delivery_days: 2 },
      { pharmacy: '1mg',              logo: '🔴', price: 195, mrp: 249, discount: 22, in_stock: true,  delivery_days: 1 },
      { pharmacy: 'MedPlus',          logo: '🟢', price: 205, mrp: 249, discount: 18, in_stock: false, delivery_days: 3 },
      { pharmacy: 'Netmeds',          logo: '🟣', price: 198, mrp: 249, discount: 20, in_stock: true,  delivery_days: 2 },
    ],
  },
  {
    name: 'Combiflam', generic_name: 'Ibuprofen + Paracetamol', manufacturer: 'Sanofi',
    category: 'Analgesic / Anti-inflammatory', composition: 'Ibuprofen 400mg + Paracetamol 325mg',
    dosage_form: 'Tablet', uses: ['Pain', 'Fever', 'Inflammation', 'Menstrual cramps'],
    side_effects: ['Stomach pain', 'Heartburn', 'Nausea', 'Kidney issues with prolonged use'],
    prices: [
      { pharmacy: 'Apollo Pharmacy',  logo: '🔵', price: 38, mrp: 45,  discount: 16, in_stock: true, delivery_days: 2 },
      { pharmacy: '1mg',              logo: '🔴', price: 33, mrp: 45,  discount: 27, in_stock: true, delivery_days: 1 },
      { pharmacy: 'Netmeds',          logo: '🟣', price: 36, mrp: 45,  discount: 20, in_stock: true, delivery_days: 3 },
      { pharmacy: 'MedPlus',          logo: '🟢', price: 35, mrp: 45,  discount: 22, in_stock: true, delivery_days: 2 },
    ],
  },
  {
    name: 'Glycomet 500', generic_name: 'Metformin', manufacturer: 'USV',
    category: 'Anti-diabetic', composition: 'Metformin HCl 500mg',
    dosage_form: 'Tablet', uses: ['Type 2 Diabetes', 'Blood sugar control'],
    side_effects: ['Nausea', 'Diarrhoea', 'Stomach upset', 'Lactic acidosis (rare)'],
    prices: [
      { pharmacy: 'Apollo Pharmacy',  logo: '🔵', price: 42, mrp: 55,  discount: 24, in_stock: true,  delivery_days: 2 },
      { pharmacy: '1mg',              logo: '🔴', price: 38, mrp: 55,  discount: 31, in_stock: true,  delivery_days: 1 },
      { pharmacy: 'Wellness Forever', logo: '🟡', price: 47, mrp: 55,  discount: 15, in_stock: true,  delivery_days: 1 },
      { pharmacy: 'Netmeds',          logo: '🟣', price: 40, mrp: 55,  discount: 27, in_stock: false, delivery_days: 4 },
    ],
  },
  {
    name: 'Paracetamol 650mg (Generic)', generic_name: 'Paracetamol', manufacturer: 'Jan Aushadhi',
    category: 'Analgesic / Antipyretic', composition: 'Paracetamol 650mg',
    dosage_form: 'Tablet', uses: ['Fever', 'Headache', 'Body pain'],
    side_effects: ['Nausea', 'Liver damage (overdose)'],
    prices: [
      { pharmacy: 'Jan Aushadhi Kendra', logo: '🇮🇳', price: 3, mrp: 5,  discount: 40, in_stock: true, delivery_days: 0 },
      { pharmacy: 'Apollo Pharmacy',     logo: '🔵', price: 8, mrp: 10, discount: 20, in_stock: true, delivery_days: 2 },
    ],
  },
  {
    name: 'Amoxicillin 500mg (Generic)', generic_name: 'Amoxicillin + Clavulanate', manufacturer: 'Cipla',
    category: 'Antibiotic', composition: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
    dosage_form: 'Tablet', uses: ['Bacterial infections', 'Respiratory tract infections'],
    side_effects: ['Diarrhoea', 'Nausea', 'Skin rash'],
    prices: [
      { pharmacy: 'Jan Aushadhi Kendra', logo: '🇮🇳', price: 45, mrp: 60, discount: 25, in_stock: true, delivery_days: 0 },
      { pharmacy: '1mg',                 logo: '🔴', price: 80, mrp: 110, discount: 27, in_stock: true, delivery_days: 1 },
    ],
  },
  {
    name: 'Metformin 500mg (Generic)', generic_name: 'Metformin', manufacturer: 'Sun Pharma',
    category: 'Anti-diabetic', composition: 'Metformin HCl 500mg',
    dosage_form: 'Tablet', uses: ['Type 2 Diabetes'],
    side_effects: ['Nausea', 'Diarrhoea'],
    prices: [
      { pharmacy: 'Jan Aushadhi Kendra', logo: '🇮🇳', price: 8,  mrp: 12, discount: 33, in_stock: true, delivery_days: 0 },
      { pharmacy: 'Apollo Pharmacy',     logo: '🔵', price: 18, mrp: 25, discount: 28, in_stock: true, delivery_days: 2 },
    ],
  },
  {
    name: 'Amlodipine 5mg (Generic)', generic_name: 'Amlodipine', manufacturer: 'Cipla',
    category: 'Anti-hypertensive', composition: 'Amlodipine 5mg',
    dosage_form: 'Tablet', uses: ['High blood pressure', 'Angina'],
    side_effects: ['Swelling in ankles', 'Flushing', 'Headache'],
    prices: [
      { pharmacy: 'Jan Aushadhi Kendra', logo: '🇮🇳', price: 6,  mrp: 10, discount: 40, in_stock: true, delivery_days: 0 },
      { pharmacy: '1mg',                 logo: '🔴', price: 22, mrp: 30, discount: 27, in_stock: true, delivery_days: 1 },
    ],
  },
  {
    name: 'Amlokind-AT', generic_name: 'Amlodipine', manufacturer: 'Mankind',
    category: 'Anti-hypertensive', composition: 'Amlodipine 5mg + Atenolol 50mg',
    dosage_form: 'Tablet', uses: ['High blood pressure', 'Heart conditions'],
    side_effects: ['Fatigue', 'Dizziness', 'Cold hands/feet'],
    prices: [
      { pharmacy: 'Apollo Pharmacy',  logo: '🔵', price: 72, mrp: 90, discount: 20, in_stock: true, delivery_days: 2 },
      { pharmacy: 'MedPlus',          logo: '🟢', price: 68, mrp: 90, discount: 24, in_stock: true, delivery_days: 3 },
      { pharmacy: '1mg',              logo: '🔴', price: 64, mrp: 90, discount: 29, in_stock: true, delivery_days: 1 },
    ],
  },
];

// ─── SPECIALISTS ──────────────────────────────────────────────────────────────
// Avatars via DiceBear lorelei — free, no API key, consistent per name seed
function av(seed) {
  return `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc&radius=50`;
}

const specialists = [
  // Mumbai
  { name: 'Dr. Priya Sharma',       avatar: av('priya-sharma'),       specialty: 'Cardiology',       sub_specialty: 'Interventional Cardiology',    city: 'Mumbai',    hospital: 'Kokilaben Dhirubhai Ambani Hospital',  experience_years: 18, rating: 4.9, reviews: 432,  consultation_fee: 1200, available_online: true,  languages: ['English','Hindi','Marathi'],            next_available: 'Tomorrow',  education: ['MBBS - Grant Medical College','DM Cardiology - AIIMS Delhi'] },
  { name: 'Dr. Rahul Mehta',        avatar: av('rahul-mehta'),        specialty: 'Neurology',        sub_specialty: 'Stroke & Epilepsy',             city: 'Mumbai',    hospital: 'Lilavati Hospital',                    experience_years: 14, rating: 4.7, reviews: 287,  consultation_fee: 1500, available_online: true,  languages: ['English','Hindi','Gujarati'],           next_available: 'Today 4PM', education: ['MBBS - KEM Hospital','DM Neurology - NIMHANS'] },
  { name: 'Dr. Anjali Desai',       avatar: av('anjali-desai'),       specialty: 'Gynaecology',      sub_specialty: 'High Risk Pregnancy',           city: 'Mumbai',    hospital: 'Breach Candy Hospital',                experience_years: 20, rating: 4.8, reviews: 561,  consultation_fee: 1000, available_online: false, languages: ['English','Hindi','Marathi'],            next_available: 'Thu',       education: ['MBBS - Seth GS Medical College','MD OBG - KEM Hospital'] },
  { name: 'Dr. Suresh Patil',       avatar: av('suresh-patil'),       specialty: 'Orthopaedics',     sub_specialty: 'Joint Replacement',             city: 'Mumbai',    hospital: 'Jupiter Hospital',                     experience_years: 22, rating: 4.6, reviews: 198,  consultation_fee: 800,  available_online: true,  languages: ['English','Hindi','Marathi'],            next_available: 'Today 6PM', education: ['MBBS - Topiwala College','MS Ortho - KEM','Fellowship Joint Replacement - Germany'] },

  // Delhi
  { name: 'Dr. Vikram Singh',       avatar: av('vikram-singh'),       specialty: 'Cardiology',       sub_specialty: 'Cardiac Surgery',               city: 'Delhi',     hospital: 'AIIMS',                                experience_years: 25, rating: 4.9, reviews: 1200, consultation_fee: 500,  available_online: false, languages: ['English','Hindi'],                      next_available: 'Next Week', education: ['MBBS - AIIMS','MS - AIIMS','DM Cardiology - AIIMS'] },
  { name: 'Dr. Neha Gupta',         avatar: av('neha-gupta'),         specialty: 'Endocrinology',    sub_specialty: 'Diabetes & Thyroid',            city: 'Delhi',     hospital: 'Fortis Shalimar Bagh',                 experience_years: 10, rating: 4.5, reviews: 320,  consultation_fee: 1200, available_online: true,  languages: ['English','Hindi'],                      next_available: 'Tomorrow',  education: ['MBBS - Lady Hardinge','MD Internal Medicine','DM Endocrinology - SGPGI'] },
  { name: 'Dr. Arun Kumar',         avatar: av('arun-kumar'),         specialty: 'Oncology',         sub_specialty: 'Medical Oncology',              city: 'Delhi',     hospital: 'Max Super Speciality Hospital',         experience_years: 16, rating: 4.7, reviews: 445,  consultation_fee: 1500, available_online: true,  languages: ['English','Hindi'],                      next_available: 'Wed',       education: ['MBBS - MAMC','MD Medicine - Safdarjung','DM Oncology - AIIMS'] },

  // Bangalore
  { name: 'Dr. Kavita Reddy',       avatar: av('kavita-reddy'),       specialty: 'Dermatology',      sub_specialty: 'Cosmetic Dermatology',          city: 'Bangalore', hospital: 'Manipal Hospital Whitefield',           experience_years: 12, rating: 4.8, reviews: 678,  consultation_fee: 900,  available_online: true,  languages: ['English','Kannada','Telugu','Hindi'],   next_available: 'Today 5PM', education: ['MBBS - Bangalore Medical College','MD Dermatology - NIMHANS'] },
  { name: 'Dr. Sriram Rao',         avatar: av('sriram-rao'),         specialty: 'Gastroenterology', sub_specialty: 'Hepatology',                    city: 'Bangalore', hospital: 'Narayana Health City',                  experience_years: 15, rating: 4.6, reviews: 213,  consultation_fee: 1100, available_online: true,  languages: ['English','Kannada','Telugu','Hindi'],   next_available: 'Tomorrow',  education: ['MBBS - AIMS Bangalore','MD - JIPMER','DM Gastro - CMC Vellore'] },

  // Chennai
  { name: 'Dr. Meenakshi Sundaram', avatar: av('meenakshi-sundaram'), specialty: 'Ophthalmology',    sub_specialty: 'Retina & Vitreous',             city: 'Chennai',   hospital: 'Sankara Nethralaya',                   experience_years: 19, rating: 4.9, reviews: 892,  consultation_fee: 800,  available_online: false, languages: ['English','Tamil','Hindi'],               next_available: 'Fri',       education: ['MBBS - Madras Medical College','DO - RIOGOH','Fellowship Retina - USA'] },
  { name: 'Dr. Kartik Raman',       avatar: av('kartik-raman'),       specialty: 'Nephrology',       sub_specialty: 'Kidney Transplant',             city: 'Chennai',   hospital: 'Apollo Hospitals Chennai',              experience_years: 21, rating: 4.7, reviews: 301,  consultation_fee: 1400, available_online: true,  languages: ['English','Tamil'],                      next_available: 'Mon',       education: ['MBBS - Stanley Medical College','MD Medicine','DM Nephrology - CMC Vellore'] },

  // Hyderabad
  { name: 'Dr. Padmaja Rao',        avatar: av('padmaja-rao'),        specialty: 'Gynaecology',      sub_specialty: 'Infertility & IVF',             city: 'Hyderabad', hospital: 'CARE Hospitals Banjara Hills',          experience_years: 17, rating: 4.8, reviews: 734,  consultation_fee: 700,  available_online: true,  languages: ['English','Telugu','Hindi'],              next_available: 'Today 3PM', education: ['MBBS - Osmania Medical College','MS OBG - NIMS','Fellowship IVF - Germany'] },
  { name: 'Dr. Sunil Verma',        avatar: av('sunil-verma'),        specialty: 'Pulmonology',      sub_specialty: 'Respiratory Medicine',          city: 'Hyderabad', hospital: 'Yashoda Hospitals Secunderabad',        experience_years: 13, rating: 4.5, reviews: 189,  consultation_fee: 800,  available_online: true,  languages: ['English','Telugu','Hindi'],              next_available: 'Tomorrow',  education: ['MBBS - Kakatiya Medical College','MD Pulmonary Medicine - AIIMS'] },

  // Jaipur
  { name: 'Dr. Ramesh Joshi',       avatar: av('ramesh-joshi'),       specialty: 'Cardiology',       sub_specialty: 'Non-invasive Cardiology',       city: 'Jaipur',    hospital: 'Eternal Heart Care Centre',            experience_years: 16, rating: 4.6, reviews: 247,  consultation_fee: 600,  available_online: true,  languages: ['English','Hindi','Rajasthani'],          next_available: 'Today 7PM', education: ['MBBS - SMS Medical College','MD Medicine','DM Cardiology - PGIMER'] },
  { name: 'Dr. Sunita Jain',        avatar: av('sunita-jain'),        specialty: 'Neurology',        sub_specialty: 'Movement Disorders',            city: 'Jaipur',    hospital: 'Sawai Man Singh Hospital',             experience_years: 11, rating: 4.4, reviews: 143,  consultation_fee: 400,  available_online: true,  languages: ['English','Hindi'],                      next_available: 'Thu',       education: ['MBBS - SMS Medical College Jaipur','MD Neurology - SGPGI Lucknow'] },

  // Indore
  { name: 'Dr. Manish Agarwal',     avatar: av('manish-agarwal'),     specialty: 'Orthopaedics',     sub_specialty: 'Sports Medicine',               city: 'Indore',    hospital: 'Bombay Hospital Indore',               experience_years: 9,  rating: 4.3, reviews: 98,   consultation_fee: 500,  available_online: true,  languages: ['English','Hindi'],                      next_available: 'Tomorrow',  education: ['MBBS - MGM Medical College Indore','MS Orthopaedics - AIIMS'] },
  { name: 'Dr. Archana Shah',       avatar: av('archana-shah'),       specialty: 'Gynaecology',      sub_specialty: 'Minimally Invasive Surgery',     city: 'Indore',    hospital: 'CHL Hospital',                         experience_years: 14, rating: 4.5, reviews: 211,  consultation_fee: 550,  available_online: true,  languages: ['English','Hindi','Gujarati'],            next_available: 'Today',     education: ['MBBS - MGM Medical College','MS OBG - Government Medical College Aurangabad'] },

  // Lucknow
  { name: 'Dr. Akhilesh Tripathi',  avatar: av('akhilesh-tripathi'),  specialty: 'Oncology',         sub_specialty: 'Surgical Oncology',             city: 'Lucknow',   hospital: "King George's Medical University",     experience_years: 20, rating: 4.7, reviews: 312,  consultation_fee: 300,  available_online: false, languages: ['English','Hindi'],                      next_available: 'Sat',       education: ['MBBS - KGMU','MS Surgery - KGMU','MCh Oncosurgery - TATA Memorial'] },
  { name: 'Dr. Pooja Srivastava',   avatar: av('pooja-srivastava'),   specialty: 'Endocrinology',    sub_specialty: 'Diabetes',                      city: 'Lucknow',   hospital: 'Medanta Hospital Lucknow',             experience_years: 8,  rating: 4.4, reviews: 124,  consultation_fee: 700,  available_online: true,  languages: ['English','Hindi'],                      next_available: 'Tomorrow',  education: ['MBBS - GSVM Medical College','MD Internal Medicine - KGMU','DM Endocrinology - PGIMER'] },

  // Test doctor (matches seed-users.js)
  { name: 'Dr. Ananya Krishnamurthy', avatar: av('ananya-krishnamurthy'), specialty: 'General Medicine', sub_specialty: 'Internal Medicine',           city: 'Mumbai',    hospital: 'Kokilaben Dhirubhai Ambani Hospital',  experience_years: 12, rating: 4.8, reviews: 520,  consultation_fee: 900,  available_online: true,  languages: ['English','Hindi','Tamil'],               next_available: 'Today 2PM', education: ['MBBS - Grant Medical College','MD Internal Medicine - KEM Hospital'] },
];



// ─── HOSPITAL PROCEDURES ───────────────────────────────────────────────────────
const procedures = [
  {
    name: 'MRI Brain', category: 'Imaging', description: 'Magnetic Resonance Imaging of Brain',
    avg_duration: '45-60 min',
    hospitals: [
      { name: 'AIIMS Delhi', city: 'Delhi', tier: 'Government', price: 2800, rating: 4.8, accredited: true, wait_days: 30, insurance: true },
      { name: 'Apollo Delhi', city: 'Delhi', tier: 'Corporate', price: 9500, rating: 4.7, accredited: true, wait_days: 1, insurance: true },
      { name: 'Max Hospital Delhi', city: 'Delhi', tier: 'Corporate', price: 8200, rating: 4.6, accredited: true, wait_days: 2, insurance: true },
      { name: 'Fortis Delhi', city: 'Delhi', tier: 'Corporate', price: 7800, rating: 4.5, accredited: true, wait_days: 1, insurance: true },
      { name: 'Safdarjung Hospital', city: 'Delhi', tier: 'Government', price: 1200, rating: 3.8, accredited: false, wait_days: 45, insurance: false },
      { name: 'Kokilaben Mumbai', city: 'Mumbai', tier: 'Corporate', price: 11000, rating: 4.9, accredited: true, wait_days: 1, insurance: true },
      { name: 'KEM Hospital Mumbai', city: 'Mumbai', tier: 'Government', price: 1500, rating: 3.9, accredited: false, wait_days: 20, insurance: false },
    ],
  },
  {
    name: 'CT Scan Chest', category: 'Imaging', description: 'Computed Tomography of Chest for lung & heart assessment',
    avg_duration: '15-20 min',
    hospitals: [
      { name: 'Apollo Delhi', city: 'Delhi', tier: 'Corporate', price: 4800, rating: 4.7, accredited: true, wait_days: 1, insurance: true },
      { name: 'AIIMS Delhi', city: 'Delhi', tier: 'Government', price: 1500, rating: 4.8, accredited: true, wait_days: 25, insurance: true },
      { name: 'Manipal Bangalore', city: 'Bangalore', tier: 'Corporate', price: 4200, rating: 4.6, accredited: true, wait_days: 1, insurance: true },
      { name: 'Narayana Bangalore', city: 'Bangalore', tier: 'Corporate', price: 3600, rating: 4.5, accredited: true, wait_days: 2, insurance: true },
      { name: 'Kokilaben Mumbai', city: 'Mumbai', tier: 'Corporate', price: 5500, rating: 4.9, accredited: true, wait_days: 1, insurance: true },
    ],
  },
  {
    name: 'Knee Replacement', category: 'Orthopaedics', description: 'Total Knee Arthroplasty (TKA) — full knee joint replacement',
    avg_duration: '2-3 hours',
    hospitals: [
      { name: 'AIIMS Delhi', city: 'Delhi', tier: 'Government', price: 50000, rating: 4.8, accredited: true, wait_days: 120, insurance: true },
      { name: 'Apollo Delhi', city: 'Delhi', tier: 'Corporate', price: 220000, rating: 4.7, accredited: true, wait_days: 7, insurance: true },
      { name: 'Medanta Gurugram', city: 'Delhi', tier: 'Corporate', price: 180000, rating: 4.8, accredited: true, wait_days: 5, insurance: true },
      { name: 'Fortis Mohali', city: 'Chandigarh', tier: 'Corporate', price: 150000, rating: 4.6, accredited: true, wait_days: 10, insurance: true },
      { name: 'KGMU Lucknow', city: 'Lucknow', tier: 'Government', price: 45000, rating: 4.2, accredited: false, wait_days: 90, insurance: true },
    ],
  },
  {
    name: 'Angioplasty (PTCA)', category: 'Cardiology', description: 'Percutaneous Transluminal Coronary Angioplasty with stent',
    avg_duration: '1-2 hours',
    hospitals: [
      { name: 'Escorts Heart Institute Delhi', city: 'Delhi', tier: 'Corporate', price: 150000, rating: 4.8, accredited: true, wait_days: 3, insurance: true },
      { name: 'AIIMS Delhi', city: 'Delhi', tier: 'Government', price: 35000, rating: 4.9, accredited: true, wait_days: 60, insurance: true },
      { name: 'Narayana Hrudayalaya Bangalore', city: 'Bangalore', tier: 'Corporate', price: 120000, rating: 4.8, accredited: true, wait_days: 2, insurance: true },
      { name: 'Apollo Chennai', city: 'Chennai', tier: 'Corporate', price: 145000, rating: 4.7, accredited: true, wait_days: 3, insurance: true },
    ],
  },
  {
    name: 'Cataract Surgery', category: 'Ophthalmology', description: 'Phacoemulsification with IOL implant (per eye)',
    avg_duration: '30-45 min',
    hospitals: [
      { name: 'Sankara Nethralaya Chennai', city: 'Chennai', tier: 'Trust', price: 12000, rating: 4.9, accredited: true, wait_days: 7, insurance: true },
      { name: 'LV Prasad Eye Institute Hyderabad', city: 'Hyderabad', tier: 'Trust', price: 8000, rating: 4.9, accredited: true, wait_days: 5, insurance: true },
      { name: 'Apollo Hospitals Delhi', city: 'Delhi', tier: 'Corporate', price: 28000, rating: 4.7, accredited: true, wait_days: 2, insurance: true },
      { name: 'AIIMS Delhi', city: 'Delhi', tier: 'Government', price: 2500, rating: 4.7, accredited: true, wait_days: 90, insurance: false },
      { name: 'Vasan Eye Care Bangalore', city: 'Bangalore', tier: 'Corporate', price: 18000, rating: 4.5, accredited: true, wait_days: 3, insurance: true },
    ],
  },
  {
    name: 'Laparoscopic Appendectomy', category: 'General Surgery', description: 'Minimally invasive removal of the appendix',
    avg_duration: '45-90 min',
    hospitals: [
      { name: 'Apollo Delhi', city: 'Delhi', tier: 'Corporate', price: 65000, rating: 4.7, accredited: true, wait_days: 1, insurance: true },
      { name: 'AIIMS Delhi', city: 'Delhi', tier: 'Government', price: 8000, rating: 4.8, accredited: true, wait_days: 14, insurance: true },
      { name: 'Manipal Bangalore', city: 'Bangalore', tier: 'Corporate', price: 55000, rating: 4.6, accredited: true, wait_days: 2, insurance: true },
      { name: 'Government Medical College Kozhikode', city: 'Kozhikode', tier: 'Government', price: 5000, rating: 4.0, accredited: false, wait_days: 10, insurance: false },
    ],
  },
  {
    name: 'Dialysis (single session)', category: 'Nephrology', description: 'Haemodialysis session for chronic kidney disease',
    avg_duration: '3-4 hours',
    hospitals: [
      { name: 'Apollo Delhi', city: 'Delhi', tier: 'Corporate', price: 3200, rating: 4.7, accredited: true, wait_days: 0, insurance: true },
      { name: 'AIIMS Delhi', city: 'Delhi', tier: 'Government', price: 800, rating: 4.8, accredited: true, wait_days: 0, insurance: false },
      { name: 'Narayana Bangalore', city: 'Bangalore', tier: 'Corporate', price: 2800, rating: 4.6, accredited: true, wait_days: 0, insurance: true },
      { name: 'Yashoda Hyderabad', city: 'Hyderabad', tier: 'Corporate', price: 2500, rating: 4.5, accredited: true, wait_days: 0, insurance: true },
    ],
  },
];

// ─── DIAGNOSTIC CENTERS ────────────────────────────────────────────────────────
const diagnosticCenters = [
  {
    name: 'Dr. Lal PathLabs', city: 'Delhi', area: 'Multiple Branches',
    address: 'Block E, Sector 18, Rohini, Delhi', rating: 4.6, reviews: 2300,
    women_friendly: true, home_collection: true, accredited: true,
    phone: '1800-111-555', timings: '7AM - 9PM (all days)',
    tests: [
      { name: 'Complete Blood Count (CBC)', price: 280, turnaround_hours: 6, home_collection: true },
      { name: 'HbA1c (Diabetes)', price: 380, turnaround_hours: 12, home_collection: true },
      { name: 'Thyroid Profile (T3/T4/TSH)', price: 450, turnaround_hours: 12, home_collection: true },
      { name: 'Lipid Profile', price: 380, turnaround_hours: 6, home_collection: true },
      { name: 'Vitamin D', price: 700, turnaround_hours: 24, home_collection: true },
      { name: 'Pap Smear', price: 850, turnaround_hours: 48, home_collection: false },
    ],
    women_specific_tests: ['Pap Smear', 'PCOD Panel', 'Fertility Hormones', 'AMH'],
    tags: ['NABL Accredited', 'Home Collection', 'Women Friendly', '250+ Tests'],
  },
  {
    name: 'Thyrocare Technologies', city: 'Mumbai', area: 'Navi Mumbai',
    address: 'D-37/1, TTC Industrial Area, Navi Mumbai', rating: 4.5, reviews: 1800,
    women_friendly: true, home_collection: true, accredited: true,
    phone: '1800-209-2600', timings: '6AM - 10PM',
    tests: [
      { name: 'Aarogyam X (Full Body Check)', price: 1800, turnaround_hours: 24, home_collection: true },
      { name: 'CBC', price: 150, turnaround_hours: 6, home_collection: true },
      { name: 'Thyroid Profile', price: 250, turnaround_hours: 12, home_collection: true },
      { name: 'Blood Glucose Fasting', price: 80, turnaround_hours: 6, home_collection: true },
    ],
    women_specific_tests: ['Pregnancy Package', 'Women Wellness Package', 'PCOD Profile'],
    tags: ['Lowest Price', 'Pan India', 'AI-Driven Reports'],
  },
  {
    name: 'SRL Diagnostics', city: 'Bangalore', area: 'Indiranagar',
    address: '100 Feet Road, Indiranagar, Bangalore', rating: 4.4, reviews: 920,
    women_friendly: true, home_collection: true, accredited: true,
    phone: '1800-102-0800', timings: '7AM - 8PM',
    tests: [
      { name: 'CBC', price: 300, turnaround_hours: 6, home_collection: true },
      { name: 'Urine Culture', price: 550, turnaround_hours: 48, home_collection: true },
      { name: 'HbA1c', price: 420, turnaround_hours: 12, home_collection: true },
      { name: 'Breast Cancer Marker (CA 15-3)', price: 1200, turnaround_hours: 24, home_collection: false },
    ],
    women_specific_tests: ['Breast Cancer Panel', 'Cervical Cancer Screen', 'Hormonal Assay'],
    tags: ['NABL Accredited', 'Corporate Tie-ups', 'Specialist Pathologists'],
  },
  {
    name: 'Metropolis Healthcare', city: 'Chennai', area: 'Anna Nagar',
    address: '15, 4th Ave, Anna Nagar, Chennai', rating: 4.7, reviews: 1450,
    women_friendly: true, home_collection: true, accredited: true,
    phone: '1800-212-8181', timings: '7AM - 9PM',
    tests: [
      { name: 'CBC', price: 320, turnaround_hours: 6, home_collection: true },
      { name: 'Pap Smear', price: 900, turnaround_hours: 48, home_collection: false },
      { name: 'MaterniT21 NIPT (Prenatal)', price: 18000, turnaround_hours: 72, home_collection: true },
      { name: 'BRCA 1 & 2 (Genetic)', price: 15000, turnaround_hours: 168, home_collection: true },
    ],
    women_specific_tests: ['NIPT Prenatal', 'BRCA Gene Test', 'Fertility Panel', 'Pap Smear'],
    tags: ['Women Exclusive Packages', 'Genetic Testing', 'NABL'],
  },
  {
    name: 'Vijaya Diagnostic Centre', city: 'Hyderabad', area: 'Banjara Hills',
    address: 'Road No. 2, Banjara Hills, Hyderabad', rating: 4.6, reviews: 1100,
    women_friendly: true, home_collection: true, accredited: true,
    phone: '040-45800500', timings: '6:30AM - 9PM',
    tests: [
      { name: 'CBC', price: 260, turnaround_hours: 4, home_collection: true },
      { name: 'PCOD Profile', price: 850, turnaround_hours: 24, home_collection: true },
      { name: 'Prenatal Screening', price: 1200, turnaround_hours: 24, home_collection: false },
      { name: 'Vitamin B12', price: 500, turnaround_hours: 12, home_collection: true },
    ],
    women_specific_tests: ['PCOD Profile', 'Prenatal Package', 'Female Infertility Panel'],
    tags: ['Budget Friendly', 'Women Specialised', 'Same Day Reports'],
  },
  {
    name: 'Rural Health Diagnostic Van', city: 'Jaipur', area: 'Mobile Service — Rural Rajasthan',
    address: 'BMCHRC Campus, Jaipur (van dispatched to rural areas)', rating: 4.2, reviews: 340,
    women_friendly: true, home_collection: true, accredited: false,
    phone: '0141-2709900', timings: 'By appointment',
    tests: [
      { name: 'CBC', price: 80, turnaround_hours: 24, home_collection: true },
      { name: 'Blood Glucose', price: 40, turnaround_hours: 2, home_collection: true },
      { name: 'Pregnancy Test', price: 30, turnaround_hours: 1, home_collection: true },
      { name: 'Haemoglobin', price: 50, turnaround_hours: 2, home_collection: true },
    ],
    women_specific_tests: ['Antenatal Check', 'Anaemia Screen', 'TB Screen'],
    tags: ['Rural Outreach', 'Women Privacy Ensured', 'Affordable'],
  },
];

// ─── SEED FUNCTION ─────────────────────────────────────────────────────────────
async function seed() {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mem = await MongoMemoryServer.create();
    uri = mem.getUri();
    console.log('⚠️  Using in-memory MongoDB for seeding (data will NOT persist).');
    console.log('    Set MONGODB_URI in .env to seed a real database.\n');
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB for seeding\n');

  // Clear existing
  await Promise.all([
    Medicine.deleteMany({}),
    Specialist.deleteMany({}),
    HospitalProcedure.deleteMany({}),
    DiagnosticCenter.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing seed data');

  await Medicine.insertMany(medicines);
  console.log(`✅ Seeded ${medicines.length} medicines`);

  await Specialist.insertMany(specialists);
  console.log(`✅ Seeded ${specialists.length} specialists`);

  await HospitalProcedure.insertMany(procedures);
  console.log(`✅ Seeded ${procedures.length} procedures`);

  await DiagnosticCenter.insertMany(diagnosticCenters);
  console.log(`✅ Seeded ${diagnosticCenters.length} diagnostic centers`);

  console.log('\n🎉 Seeding complete!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
