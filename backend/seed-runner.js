/**
 * seed-runner.js
 * Exported as a function so server.js can call it on startup.
 * Uses the already-open Mongoose connection (no connect/disconnect).
 */
const Medicine         = require('./models/Medicine');
const Specialist       = require('./models/Specialist');
const HospitalProcedure = require('./models/HospitalProcedure');
const DiagnosticCenter = require('./models/DiagnosticCenter');

const medicines = [
  {
    name: 'Dolo 650', generic_name: 'Paracetamol', manufacturer: 'Micro Labs',
    category: 'Analgesic / Antipyretic', composition: 'Paracetamol 650mg',
    dosage_form: 'Tablet', uses: ['Fever', 'Headache', 'Body pain', 'Toothache'],
    side_effects: ['Nausea', 'Liver damage (overdose)', 'Allergic reactions'],
    prices: [
      { pharmacy: 'Apollo Pharmacy',  logo: '🔵', price: 31, mrp: 36, discount: 14, in_stock: true,  delivery_days: 2 },
      { pharmacy: 'MedPlus',          logo: '🟢', price: 29, mrp: 36, discount: 19, in_stock: true,  delivery_days: 3 },
      { pharmacy: '1mg',              logo: '🔴', price: 27, mrp: 36, discount: 25, in_stock: true,  delivery_days: 1 },
      { pharmacy: 'Netmeds',          logo: '🟣', price: 30, mrp: 36, discount: 17, in_stock: false, delivery_days: 4 },
      { pharmacy: 'Wellness Forever', logo: '🟡', price: 33, mrp: 36, discount: 8,  in_stock: true,  delivery_days: 2 },
    ],
  },
  {
    name: 'Augmentin 625', generic_name: 'Amoxicillin + Clavulanate', manufacturer: 'GSK',
    category: 'Antibiotic', composition: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
    dosage_form: 'Tablet', uses: ['Bacterial infections', 'Sinusitis', 'UTI'],
    side_effects: ['Diarrhoea', 'Nausea', 'Rash'],
    prices: [
      { pharmacy: 'Apollo Pharmacy', logo: '🔵', price: 210, mrp: 249, discount: 16, in_stock: true,  delivery_days: 2 },
      { pharmacy: '1mg',             logo: '🔴', price: 195, mrp: 249, discount: 22, in_stock: true,  delivery_days: 1 },
      { pharmacy: 'MedPlus',         logo: '🟢', price: 205, mrp: 249, discount: 18, in_stock: false, delivery_days: 3 },
      { pharmacy: 'Netmeds',         logo: '🟣', price: 198, mrp: 249, discount: 20, in_stock: true,  delivery_days: 2 },
    ],
  },
  {
    name: 'Combiflam', generic_name: 'Ibuprofen + Paracetamol', manufacturer: 'Sanofi',
    category: 'Analgesic / Anti-inflammatory', composition: 'Ibuprofen 400mg + Paracetamol 325mg',
    dosage_form: 'Tablet', uses: ['Pain', 'Fever', 'Inflammation', 'Menstrual cramps'],
    side_effects: ['Stomach pain', 'Heartburn', 'Nausea'],
    prices: [
      { pharmacy: 'Apollo Pharmacy', logo: '🔵', price: 38, mrp: 45, discount: 16, in_stock: true, delivery_days: 2 },
      { pharmacy: '1mg',             logo: '🔴', price: 33, mrp: 45, discount: 27, in_stock: true, delivery_days: 1 },
      { pharmacy: 'MedPlus',         logo: '🟢', price: 35, mrp: 45, discount: 22, in_stock: true, delivery_days: 2 },
    ],
  },
  {
    name: 'Glycomet 500', generic_name: 'Metformin', manufacturer: 'USV',
    category: 'Anti-diabetic', composition: 'Metformin HCl 500mg',
    dosage_form: 'Tablet', uses: ['Type 2 Diabetes', 'Blood sugar control'],
    side_effects: ['Nausea', 'Diarrhoea', 'Stomach upset'],
    prices: [
      { pharmacy: 'Apollo Pharmacy',  logo: '🔵', price: 42, mrp: 55, discount: 24, in_stock: true,  delivery_days: 2 },
      { pharmacy: '1mg',              logo: '🔴', price: 38, mrp: 55, discount: 31, in_stock: true,  delivery_days: 1 },
      { pharmacy: 'Wellness Forever', logo: '🟡', price: 47, mrp: 55, discount: 15, in_stock: true,  delivery_days: 1 },
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
    side_effects: ['Diarrhoea', 'Nausea'],
    prices: [
      { pharmacy: 'Jan Aushadhi Kendra', logo: '🇮🇳', price: 45, mrp: 60,  discount: 25, in_stock: true, delivery_days: 0 },
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
];

const specialists = [
  { name: 'Dr. Priya Sharma',    specialty: 'Cardiology',      city: 'Mumbai',    hospital: 'Kokilaben Hospital',           experience_years: 18, rating: 4.9, reviews: 432, consultation_fee: 1200, available_online: true,  languages: ['English','Hindi','Marathi'], next_available: 'Tomorrow' },
  { name: 'Dr. Rahul Mehta',     specialty: 'Neurology',       city: 'Mumbai',    hospital: 'Lilavati Hospital',            experience_years: 14, rating: 4.7, reviews: 287, consultation_fee: 1500, available_online: true,  languages: ['English','Hindi'],             next_available: 'Today 4PM' },
  { name: 'Dr. Anjali Desai',    specialty: 'Gynaecology',     city: 'Mumbai',    hospital: 'Breach Candy Hospital',        experience_years: 20, rating: 4.8, reviews: 561, consultation_fee: 1000, available_online: false, languages: ['English','Marathi'],           next_available: 'Thu' },
  { name: 'Dr. Vikram Singh',    specialty: 'Cardiology',      city: 'Delhi',     hospital: 'AIIMS',                        experience_years: 25, rating: 4.9, reviews: 1200,consultation_fee: 500,  available_online: false, languages: ['English','Hindi'],             next_available: 'Next Week' },
  { name: 'Dr. Neha Gupta',      specialty: 'Endocrinology',   city: 'Delhi',     hospital: 'Fortis Shalimar Bagh',         experience_years: 10, rating: 4.5, reviews: 320, consultation_fee: 1200, available_online: true,  languages: ['English','Hindi'],             next_available: 'Tomorrow' },
  { name: 'Dr. Arun Kumar',      specialty: 'Oncology',        city: 'Delhi',     hospital: 'Max Super Speciality Hospital',experience_years: 16, rating: 4.7, reviews: 445, consultation_fee: 1500, available_online: true,  languages: ['English','Hindi'],             next_available: 'Wed' },
  { name: 'Dr. Kavita Reddy',    specialty: 'Dermatology',     city: 'Bangalore', hospital: 'Manipal Hospital Whitefield',  experience_years: 12, rating: 4.8, reviews: 678, consultation_fee: 900,  available_online: true,  languages: ['English','Kannada','Telugu'],  next_available: 'Today 5PM' },
  { name: 'Dr. Sriram Rao',      specialty: 'Gastroenterology',city: 'Bangalore', hospital: 'Narayana Health City',         experience_years: 15, rating: 4.6, reviews: 213, consultation_fee: 1100, available_online: true,  languages: ['English','Kannada'],           next_available: 'Tomorrow' },
  { name: 'Dr. Meenakshi S.',    specialty: 'Ophthalmology',   city: 'Chennai',   hospital: 'Sankara Nethralaya',           experience_years: 19, rating: 4.9, reviews: 892, consultation_fee: 800,  available_online: false, languages: ['English','Tamil'],             next_available: 'Fri' },
  { name: 'Dr. Padmaja Rao',     specialty: 'Gynaecology',     city: 'Hyderabad', hospital: 'CARE Hospitals Banjara Hills', experience_years: 17, rating: 4.8, reviews: 734, consultation_fee: 700,  available_online: true,  languages: ['English','Telugu'],            next_available: 'Today 3PM' },
  { name: 'Dr. Ramesh Joshi',    specialty: 'Cardiology',      city: 'Jaipur',    hospital: 'Eternal Heart Care Centre',    experience_years: 16, rating: 4.6, reviews: 247, consultation_fee: 600,  available_online: true,  languages: ['English','Hindi'],             next_available: 'Today 7PM' },
  { name: 'Dr. Manish Agarwal',  specialty: 'Orthopaedics',    city: 'Indore',    hospital: 'Bombay Hospital Indore',       experience_years: 9,  rating: 4.3, reviews: 98,  consultation_fee: 500,  available_online: true,  languages: ['English','Hindi'],             next_available: 'Tomorrow' },
  { name: 'Dr. Akhilesh Tripathi',specialty:'Oncology',         city: 'Lucknow',   hospital: "King George's Medical Univ.", experience_years: 20, rating: 4.7, reviews: 312, consultation_fee: 300,  available_online: false, languages: ['English','Hindi'],             next_available: 'Sat' },
];

const procedures = [
  {
    name: 'MRI Brain', category: 'Imaging', description: 'Magnetic Resonance Imaging of Brain', avg_duration: '45-60 min',
    hospitals: [
      { name: 'AIIMS Delhi',        city: 'Delhi',  tier: 'Government', price: 2800,  rating: 4.8, accredited: true,  wait_days: 30, insurance: true  },
      { name: 'Apollo Delhi',       city: 'Delhi',  tier: 'Corporate',  price: 9500,  rating: 4.7, accredited: true,  wait_days: 1,  insurance: true  },
      { name: 'Max Hospital',       city: 'Delhi',  tier: 'Corporate',  price: 8200,  rating: 4.6, accredited: true,  wait_days: 2,  insurance: true  },
      { name: 'Kokilaben Mumbai',   city: 'Mumbai', tier: 'Corporate',  price: 11000, rating: 4.9, accredited: true,  wait_days: 1,  insurance: true  },
      { name: 'KEM Hospital Mumbai',city: 'Mumbai', tier: 'Government', price: 1500,  rating: 3.9, accredited: false, wait_days: 20, insurance: false },
    ],
  },
  {
    name: 'Knee Replacement', category: 'Orthopaedics', description: 'Total Knee Arthroplasty (TKA)', avg_duration: '2-3 hours',
    hospitals: [
      { name: 'AIIMS Delhi',    city: 'Delhi',       tier: 'Government', price: 50000,  rating: 4.8, accredited: true, wait_days: 120, insurance: true },
      { name: 'Apollo Delhi',   city: 'Delhi',       tier: 'Corporate',  price: 220000, rating: 4.7, accredited: true, wait_days: 7,   insurance: true },
      { name: 'Medanta Gurgaon',city: 'Delhi',       tier: 'Corporate',  price: 180000, rating: 4.8, accredited: true, wait_days: 5,   insurance: true },
      { name: 'KGMU Lucknow',   city: 'Lucknow',    tier: 'Government', price: 45000,  rating: 4.2, accredited: false,wait_days: 90,  insurance: true },
    ],
  },
  {
    name: 'Cataract Surgery', category: 'Ophthalmology', description: 'Phacoemulsification with IOL implant (per eye)', avg_duration: '30-45 min',
    hospitals: [
      { name: 'Sankara Nethralaya', city: 'Chennai',    tier: 'Trust',      price: 12000, rating: 4.9, accredited: true,  wait_days: 7,  insurance: true },
      { name: 'LV Prasad Eye Inst.',city: 'Hyderabad',  tier: 'Trust',      price: 8000,  rating: 4.9, accredited: true,  wait_days: 5,  insurance: true },
      { name: 'Apollo Delhi',       city: 'Delhi',      tier: 'Corporate',  price: 28000, rating: 4.7, accredited: true,  wait_days: 2,  insurance: true },
      { name: 'AIIMS Delhi',        city: 'Delhi',      tier: 'Government', price: 2500,  rating: 4.7, accredited: true,  wait_days: 90, insurance: false},
    ],
  },
  {
    name: 'Dialysis (single session)', category: 'Nephrology', description: 'Haemodialysis for CKD', avg_duration: '3-4 hours',
    hospitals: [
      { name: 'Apollo Delhi',     city: 'Delhi',     tier: 'Corporate',  price: 3200, rating: 4.7, accredited: true, wait_days: 0, insurance: true },
      { name: 'AIIMS Delhi',      city: 'Delhi',     tier: 'Government', price: 800,  rating: 4.8, accredited: true, wait_days: 0, insurance: false},
      { name: 'Narayana Banglr.', city: 'Bangalore', tier: 'Corporate',  price: 2800, rating: 4.6, accredited: true, wait_days: 0, insurance: true },
    ],
  },
  {
    name: 'CT Scan Chest', category: 'Imaging', description: 'Computed Tomography of chest', avg_duration: '15-20 min',
    hospitals: [
      { name: 'Apollo Delhi',      city: 'Delhi',     tier: 'Corporate', price: 4800, rating: 4.7, accredited: true, wait_days: 1, insurance: true },
      { name: 'AIIMS Delhi',       city: 'Delhi',     tier: 'Government',price: 1500, rating: 4.8, accredited: true, wait_days: 25,insurance: true },
      { name: 'Manipal Bangalore', city: 'Bangalore', tier: 'Corporate', price: 4200, rating: 4.6, accredited: true, wait_days: 1, insurance: true },
    ],
  },
];

const diagnosticCenters = [
  {
    name: 'Dr. Lal PathLabs', city: 'Delhi', area: 'Multiple Branches', rating: 4.6, reviews: 2300,
    women_friendly: true, home_collection: true, accredited: true, phone: '1800-111-555', timings: '7AM - 9PM',
    tests: [
      { name: 'CBC', price: 280, turnaround_hours: 6, home_collection: true },
      { name: 'HbA1c', price: 380, turnaround_hours: 12, home_collection: true },
      { name: 'Thyroid Profile', price: 450, turnaround_hours: 12, home_collection: true },
      { name: 'Vitamin D', price: 700, turnaround_hours: 24, home_collection: true },
      { name: 'Pap Smear', price: 850, turnaround_hours: 48, home_collection: false },
    ],
    women_specific_tests: ['Pap Smear', 'PCOD Panel', 'Fertility Hormones', 'AMH'],
    tags: ['NABL Accredited', 'Home Collection', 'Women Friendly'],
  },
  {
    name: 'Thyrocare Technologies', city: 'Mumbai', area: 'Navi Mumbai', rating: 4.5, reviews: 1800,
    women_friendly: true, home_collection: true, accredited: true, phone: '1800-209-2600', timings: '6AM - 10PM',
    tests: [
      { name: 'Aarogyam X (Full Body)', price: 1800, turnaround_hours: 24, home_collection: true },
      { name: 'CBC', price: 150, turnaround_hours: 6, home_collection: true },
      { name: 'Thyroid Profile', price: 250, turnaround_hours: 12, home_collection: true },
    ],
    women_specific_tests: ['Pregnancy Package', 'Women Wellness Package', 'PCOD Profile'],
    tags: ['Lowest Price', 'Pan India'],
  },
  {
    name: 'SRL Diagnostics', city: 'Bangalore', area: 'Indiranagar', rating: 4.4, reviews: 920,
    women_friendly: true, home_collection: true, accredited: true, phone: '1800-102-0800', timings: '7AM - 8PM',
    tests: [
      { name: 'CBC', price: 300, turnaround_hours: 6, home_collection: true },
      { name: 'Urine Culture', price: 550, turnaround_hours: 48, home_collection: true },
      { name: 'Breast Cancer Marker', price: 1200, turnaround_hours: 24, home_collection: false },
    ],
    women_specific_tests: ['Breast Cancer Panel', 'Cervical Cancer Screen'],
    tags: ['NABL Accredited', 'Women Specialised'],
  },
  {
    name: 'Metropolis Healthcare', city: 'Chennai', area: 'Anna Nagar', rating: 4.7, reviews: 1450,
    women_friendly: true, home_collection: true, accredited: true, phone: '1800-212-8181', timings: '7AM - 9PM',
    tests: [
      { name: 'CBC', price: 320, turnaround_hours: 6, home_collection: true },
      { name: 'Pap Smear', price: 900, turnaround_hours: 48, home_collection: false },
      { name: 'BRCA 1 & 2 (Genetic)', price: 15000, turnaround_hours: 168, home_collection: true },
    ],
    women_specific_tests: ['NIPT Prenatal', 'BRCA Gene Test', 'Pap Smear'],
    tags: ['Women Exclusive Packages', 'Genetic Testing', 'NABL'],
  },
  {
    name: 'Vijaya Diagnostic Centre', city: 'Hyderabad', area: 'Banjara Hills', rating: 4.6, reviews: 1100,
    women_friendly: true, home_collection: true, accredited: true, phone: '040-45800500', timings: '6:30AM - 9PM',
    tests: [
      { name: 'CBC', price: 260, turnaround_hours: 4, home_collection: true },
      { name: 'PCOD Profile', price: 850, turnaround_hours: 24, home_collection: true },
    ],
    women_specific_tests: ['PCOD Profile', 'Prenatal Package', 'Female Infertility Panel'],
    tags: ['Budget Friendly', 'Women Specialised'],
  },
];

module.exports = async function seedAll() {
  await Medicine.deleteMany({});
  await Specialist.deleteMany({});
  await HospitalProcedure.deleteMany({});
  await DiagnosticCenter.deleteMany({});

  await Medicine.insertMany(medicines);
  await Specialist.insertMany(specialists);
  await HospitalProcedure.insertMany(procedures);
  await DiagnosticCenter.insertMany(diagnosticCenters);

  console.log(`  💊 ${medicines.length} medicines`);
  console.log(`  🩺 ${specialists.length} specialists`);
  console.log(`  🏥 ${procedures.length} procedures`);
  console.log(`  🔬 ${diagnosticCenters.length} diagnostic centers`);
};
