const mongoose = require('mongoose');
const User = require('./models/User');
const Hospital = require('./models/Hospital');
const Laboratory = require('./models/Laboratory');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected:', mongoose.connection.host?.split('.')[0]);

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Hospital.deleteMany({});
    await Laboratory.deleteMany({});
    console.log('✅ Data cleared');

    // Create Users
    console.log('👤 Adding sample users...');
    
    const user = await User.create({
      name: 'Aman Kumar',
      email: 'aman@example.com',
      password: 'password123',
      phone: '9876543210',
      role: 'user'
    });
    console.log('✅ User added:', user.email);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@hospital.com',
      password: 'admin123',
      phone: '9876543211',
      role: 'admin',
      isActive: true
    });
    console.log('✅ Admin added:', admin.email);

    console.log('🏥 Adding hospitals...');
    
    const hospitals = [
      // ---------------- EXISTING HOSPITALS ----------------
      {
        name: 'Apollo Hospitals Delhi',
        type: 'Multi Specialty Hospital',
        category: 'private',
        description: 'Leading multi-specialty hospital with world-class infrastructure',
        address: { street: 'Sarita Vihar', area: 'Mathura Road', city: 'Delhi', state: 'Delhi', pincode: '110076', landmark: 'Near Holy Family Hospital' },
        location: { type: 'Point', coordinates: [77.2855, 28.5355] },
        phone: '01126825000',
        email: 'info@apollohospitals.com',
        website: 'https://www.apollohospitals.com',
        operatingHours: { open: '00:00', close: '23:59' },
        emergencyAvailable: true,
        facilities: ['ICU', 'Emergency', 'Pharmacy', 'Lab', 'X-Ray', 'CT Scan', 'MRI', 'Blood Bank'],
        googleRating: 4.3,
        googleReviewCount: 2543,
        establishedDate: new Date('1996-01-15'),
        tests: ['Blood Test', 'X-Ray', 'CT Scan', 'MRI', 'ECG', 'Echo', 'Ultrasound'],
        treatments: ['Diabetes Management', 'Hypertension Treatment', 'Fever Treatment'],
        surgeries: ['Cardiac Surgery', 'Orthopedic Surgery', 'General Surgery'],
        procedures: ['Angioplasty', 'Endoscopy', 'Colonoscopy'],
        therapies: ['Physiotherapy', 'Occupational Therapy'],
        managementServices: ['Diabetes Management', 'Cardiac Care'],
        insuranceAccepted: ['Ayushman Bharat', 'Star Health', 'HDFC Ergo', 'ICICI Lombard'],
        numberOfBeds: 500,
        doctors: [{ name: 'Dr. Rajesh Sharma', specialization: 'Cardiologist', rating: 4.8, experience: '15 years', consultationFee: 1000 }]
      },
      {
        name: 'Fortis Hospital Vasant Kunj',
        type: 'Super Specialty Hospital',
        category: 'private',
        description: 'Premium healthcare facility',
        address: { street: 'Sector B', area: 'Pocket 1, Aruna Asaf Ali Marg', city: 'Delhi', state: 'Delhi', pincode: '110070', landmark: 'Near Vasant Kunj Metro' },
        location: { type: 'Point', coordinates: [77.1580, 28.5201] },
        phone: '01142776222',
        emergencyAvailable: true,
        facilities: ['ICU', 'Emergency', 'Pharmacy', 'Lab', 'X-Ray', 'CT Scan'],
        googleRating: 4.1,
        googleReviewCount: 1234,
        establishedDate: new Date('2008-03-20'),
        tests: ['Blood Test', 'X-Ray', 'CT Scan', 'Ultrasound'],
        treatments: ['Cardiac Care', 'Orthopedics'],
        surgeries: ['Heart Surgery', 'Joint Replacement'],
        insuranceAccepted: ['Star Health', 'HDFC Ergo'],
        numberOfBeds: 300
      },
      {
        name: 'Medanta - The Medicity',
        type: 'Multi Specialty Hospital',
        category: 'private',
        description: 'Multi-super specialty hospital',
        address: { street: 'CH Baktawar Singh Road', area: 'Sector 38', city: 'Gurgaon', state: 'Haryana', pincode: '122001', landmark: 'Near Rajiv Chowk' },
        location: { type: 'Point', coordinates: [77.0659, 28.4345] },
        phone: '01244141414',
        emergencyAvailable: true,
        facilities: ['ICU', 'Emergency', 'Pharmacy', 'Lab', 'X-Ray', 'CT Scan', 'MRI'],
        googleRating: 4.4,
        googleReviewCount: 3456,
        establishedDate: new Date('2009-11-18'),
        tests: ['Blood Test', 'MRI', 'CT Scan'],
        treatments: ['Cancer Treatment', 'Cardiac Care'],
        surgeries: ['Robotic Surgery', 'Transplant'],
        insuranceAccepted: ['Ayushman Bharat', 'ICICI Lombard'],
        numberOfBeds: 1250
      },
      {
        name: 'Sarvodaya Hospital Faridabad',
        type: 'General Hospital',
        category: 'private',
        description: 'Comprehensive healthcare facility',
        address: { street: 'Sector 8', area: 'Faridabad', city: 'Faridabad', state: 'Haryana', pincode: '121006', landmark: 'Near BPTP' },
        location: { type: 'Point', coordinates: [77.3178, 28.4089] },
        phone: '01294270000',
        operatingHours: { open: '00:00', close: '23:59' },
        emergencyAvailable: true,
        facilities: ['ICU', 'Emergency', 'Pharmacy', 'Lab', 'X-Ray', 'CT Scan', 'Blood Bank'],
        googleRating: 4.2,
        googleReviewCount: 1823,
        establishedDate: new Date('1994-07-10'),
        appointmentsEnabled: true,
        tests: ['Blood Test', 'Urine Test', 'X-Ray', 'ECG', 'Ultrasound'],
        treatments: ['Fever', 'Cold & Cough', 'Diabetes'],
        surgeries: ['General Surgery', 'Laparoscopy'],
        procedures: ['Biopsy', 'Endoscopy'],
        therapies: ['Physiotherapy'],
        managementServices: ['Diabetes Management'],
        insuranceAccepted: ['Ayushman Bharat', 'Star Health'],
        numberOfBeds: 210,
        doctors: [{ name: 'Dr. B D Pathak', specialization: 'General Surgeon', rating: 4.9, experience: '20 years', consultationFee: 800 }]
      },
      {
        name: 'AIIMS New Delhi',
        type: 'Government Hospital',
        category: 'government',
        description: 'Premier medical institute',
        address: { street: 'Ansari Nagar East', area: 'Ansari Nagar', city: 'Delhi', state: 'Delhi', pincode: '110029', landmark: 'Near Safdarjung Airport' },
        location: { type: 'Point', coordinates: [77.2090, 28.5672] },
        phone: '01126588500',
        emergencyAvailable: true,
        facilities: ['ICU', 'Emergency', 'Pharmacy', 'Lab', 'X-Ray', 'CT Scan', 'MRI', 'Blood Bank'],
        googleRating: 4.5,
        googleReviewCount: 8765,
        establishedDate: new Date('1956-09-25'),
        tests: ['Blood Test', 'X-Ray', 'MRI', 'CT Scan'],
        treatments: ['All Specialties'],
        surgeries: ['All Types'],
        insuranceAccepted: ['Ayushman Bharat', 'CGHS'],
        numberOfBeds: 2478
      },
      {
        name: 'Lilavati Hospital Mumbai',
        type: 'Multi Specialty Hospital',
        category: 'private',
        address: { street: 'A-791, Bandra Reclamation', area: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400050' },
        location: { type: 'Point', coordinates: [72.8181, 19.0511] },
        phone: '02226567891',
        emergencyAvailable: true,
        facilities: ['ICU', 'Emergency', 'Pharmacy', 'Lab'],
        googleRating: 4.3,
        googleReviewCount: 2345,
        establishedDate: new Date('1978-06-12'),
        tests: ['Blood Test', 'X-Ray'],
        numberOfBeds: 350
      },
      {
        name: 'Kokilaben Dhirubhai Ambani Hospital',
        type: 'Multi Specialty Hospital',
        category: 'private',
        address: { street: 'Four Bungalows', area: 'Andheri West', city: 'Mumbai', state: 'Maharashtra', pincode: '400053' },
        location: { type: 'Point', coordinates: [72.8263, 19.1334] },
        phone: '02230999999',
        emergencyAvailable: true,
        facilities: ['ICU', 'Emergency', 'Pharmacy', 'Lab', 'X-Ray', 'CT Scan', 'MRI'],
        googleRating: 4.4,
        googleReviewCount: 3456,
        establishedDate: new Date('2009-01-26'),
        numberOfBeds: 750
      },
      {
        name: 'Manipal Hospital Bangalore',
        type: 'Multi Specialty Hospital',
        category: 'private',
        address: { street: '98, HAL Airport Road', area: 'Old Airport Road', city: 'Bangalore', state: 'Karnataka', pincode: '560017' },
        location: { type: 'Point', coordinates: [77.6412, 12.9716] },
        phone: '08025024444',
        emergencyAvailable: true,
        facilities: ['ICU', 'Emergency', 'Pharmacy', 'Lab'],
        googleRating: 4.2,
        googleReviewCount: 1890,
        establishedDate: new Date('1991-05-03'),
        numberOfBeds: 600
      },
      {
        name: 'Columbia Asia Hospital Whitefield',
        type: 'Multi Specialty Hospital',
        category: 'private',
        address: { street: 'Survey No 10P & 12P', area: 'Ramagondanahalli, Varthur Hobli', city: 'Bangalore', state: 'Karnataka', pincode: '560066' },
        location: { type: 'Point', coordinates: [77.7499, 12.9698] },
        phone: '08066753333',
        emergencyAvailable: true,
        facilities: ['ICU', 'Emergency', 'Pharmacy', 'Lab'],
        googleRating: 4.0,
        googleReviewCount: 1234,
        establishedDate: new Date('2005-08-15'),
        numberOfBeds: 200
      },
      {
        name: 'Apollo Hospitals Chennai',
        type: 'Multi Specialty Hospital',
        category: 'private',
        address: { street: '21, Greams Lane', area: 'Off Greams Road', city: 'Chennai', state: 'Tamil Nadu', pincode: '600006' },
        location: { type: 'Point', coordinates: [80.2488, 13.0569] },
        phone: '04428293333',
        emergencyAvailable: true,
        facilities: ['ICU', 'Emergency', 'Pharmacy', 'Lab', 'X-Ray', 'CT Scan'],
        googleRating: 4.3,
        googleReviewCount: 4567,
        establishedDate: new Date('1983-09-19'),
        numberOfBeds: 550
      },
      {
        name: 'Shroff Eye Centre Delhi',
        type: 'Eye Hospital',
        category: 'private',
        address: { street: 'A-9, Kailash Colony', area: 'Kailash Colony', city: 'Delhi', state: 'Delhi', pincode: '110048' },
        location: { type: 'Point', coordinates: [77.2431, 28.5494] },
        phone: '01129212255',
        facilities: ['Eye Tests', 'Surgery Theater', 'Pharmacy'],
        googleRating: 4.7,
        googleReviewCount: 890,
        establishedDate: new Date('1919-04-01'),
        tests: ['Eye Examination', 'Retinal Scan'],
        surgeries: ['Cataract', 'LASIK'],
        numberOfBeds: 50
      },
      {
        name: 'Cloudnine Hospital Gurgaon',
        type: 'Maternity Hospital',
        category: 'private',
        address: { street: 'Block F, South City 2', area: 'Sector 51', city: 'Gurgaon', state: 'Haryana', pincode: '122018' },
        location: { type: 'Point', coordinates: [77.0688, 28.4211] },
        phone: '01246521000',
        facilities: ['NICU', 'Labor Room', 'Pharmacy'],
        googleRating: 4.5,
        googleReviewCount: 678,
        establishedDate: new Date('2007-12-01'),
        tests: ['Ultrasound', 'Prenatal Tests'],
        numberOfBeds: 100
      },

      // ---------------- NEW HOSPITALS ----------------
      {
        name: 'Max Super Speciality Hospital Saket',
        type: 'Super Specialty Hospital',
        category: 'private',
        description: 'Leading multi-specialty hospital',
        address: { street: '1, 2, Press Enclave Road', area: 'Saket', city: 'Delhi', state: 'Delhi', pincode: '110017', landmark: 'Near Saket Metro' },
        location: { type: 'Point', coordinates: [77.2177, 28.5244] },
        phone: '01126515050',
        emergencyAvailable: true,
        facilities: ['ICU', 'Emergency', 'Pharmacy', 'Lab', 'X-Ray', 'CT Scan', 'MRI'],
        googleRating: 4.4,
        googleReviewCount: 3421,
        establishedDate: new Date('2006-09-01'),
        tests: ['Blood Test', 'MRI', 'CT Scan', 'PET Scan'],
        treatments: ['Cancer Treatment', 'Cardiac Care', 'Neurology'],
        surgeries: ['Robotic Surgery', 'Transplant Surgery', 'Cardiac Surgery'],
        insuranceAccepted: ['Ayushman Bharat', 'Star Health', 'Max Bupa'],
        numberOfBeds: 500,
        appointmentsEnabled: true
      },
      {
        name: 'Fortis Hospital Noida',
        type: 'Multi Specialty Hospital',
        category: 'private',
        description: 'State-of-the-art healthcare facility',
        address: { street: 'B-22, Sector 62', area: 'Noida', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', landmark: 'Near Sector 62 Metro' },
        location: { type: 'Point', coordinates: [77.3660, 28.6272] },
        phone: '01206777777',
        emergencyAvailable: true,
        facilities: ['ICU', 'Emergency', 'Pharmacy', 'Lab', 'X-Ray', 'CT Scan'],
        googleRating: 4.2,
        googleReviewCount: 2156,
        establishedDate: new Date('2010-05-15'),
        tests: ['Blood Test', 'X-Ray', 'Ultrasound'],
        treatments: ['Orthopedics', 'Cardiology'],
        surgeries: ['Joint Replacement', 'Heart Surgery'],
        insuranceAccepted: ['Star Health', 'HDFC Ergo'],
        numberOfBeds: 400
      },
      {
        name: 'BLK Super Speciality Hospital',
        type: 'Super Specialty Hospital',
        category: 'private',
        description: 'Tertiary care multi-specialty hospital',
        address: { street: 'Pusa Road', area: 'Rajinder Nagar', city: 'Delhi', state: 'Delhi', pincode: '110005', landmark: 'Near Rajinder Nagar Metro' },
        location: { type: 'Point', coordinates: [77.1769, 28.6424] },
        phone: '01130403040',
        emergencyAvailable: true,
        facilities: ['ICU', 'Emergency', 'Pharmacy', 'Lab', 'X-Ray', 'CT Scan', 'MRI'],
        googleRating: 4.3,
        googleReviewCount: 2890,
        establishedDate: new Date('1959-08-10'),
        tests: ['Blood Test', 'CT Scan', 'MRI'],
        treatments: ['Oncology', 'Neurology', 'Cardiology'],
        surgeries: ['Cancer Surgery', 'Brain Surgery'],
        numberOfBeds: 700
      },
      {
        name: 'Indraprastha Apollo Hospital',
        type: 'Multi Specialty Hospital',
        category: 'private',
        description: 'Comprehensive tertiary care hospital',
        address: { street: 'Sarita Vihar', area: 'Delhi Mathura Road', city: 'Delhi', state: 'Delhi', pincode: '110076', landmark: 'Near Jasola Apollo Metro' },
        location: { type: 'Point', coordinates: [77.2855, 28.5355] },
        phone: '01126825001',
        emergencyAvailable: true,
        facilities: ['ICU', 'Emergency', 'Pharmacy', 'Lab', 'Blood Bank'],
        googleRating: 4.4,
        googleReviewCount: 5432,
        establishedDate: new Date('1996-03-13'),
        numberOfBeds: 710
      },
      {
        name: 'Sir Ganga Ram Hospital',
        type: 'General Hospital',
        category: 'charity',
        description: 'Multi-specialty charitable hospital',
        address: { street: 'Rajinder Nagar', area: 'New Rajinder Nagar', city: 'Delhi', state: 'Delhi', pincode: '110060', landmark: 'Near Karol Bagh' },
        location: { type: 'Point', coordinates: [77.1884, 28.6423] },
        phone: '01125750000',
        emergencyAvailable: true,
        facilities: ['ICU', 'Emergency', 'Pharmacy', 'Lab'],
        googleRating: 4.5,
        googleReviewCount: 4321,
        establishedDate: new Date('1951-11-11'),
        numberOfBeds: 675
      },
      {
        name: 'Safdarjung Hospital',
        type: 'Government Hospital',
        category: 'government',
        description: 'Central Government Hospital',
        address: { street: 'Ring Road', area: 'Safdarjung Enclave', city: 'Delhi', state: 'Delhi', pincode: '110029', landmark: 'Near AIIMS' },
        location: { type: 'Point', coordinates: [77.2088, 28.5672] },
        phone: '01126165060',
        emergencyAvailable: true,
        facilities: ['ICU', 'Emergency', 'Pharmacy', 'Lab', 'Blood Bank'],
        googleRating: 3.8,
        googleReviewCount: 1234,
        establishedDate: new Date('1942-01-01'),
        numberOfBeds: 1500
      },
      {
        name: 'Holy Family Hospital Delhi',
        type: 'General Hospital',
        category: 'private',
        description: 'Catholic Hospital providing quality healthcare',
        address: { street: 'Okhla Road', area: 'Okhla', city: 'Delhi', state: 'Delhi', pincode: '110025', landmark: 'Near Okhla' },
        location: { type: 'Point', coordinates: [77.2756, 28.5515] },
        phone: '01126845000',
        emergencyAvailable: true,
        facilities: ['ICU', 'Emergency', 'Pharmacy', 'Lab'],
        googleRating: 4.2,
        googleReviewCount: 876,
        establishedDate: new Date('1960-12-08'),
        numberOfBeds: 350
      },
      {
        name: 'Fortis Escorts Heart Institute',
        type: 'Cardiac Hospital',
        category: 'private',
        description: 'Premier cardiac care hospital',
        address: { street: 'Okhla Road', area: 'Okhla', city: 'Delhi', state: 'Delhi', pincode: '110025', landmark: 'Near Okhla Metro' },
        location: { type: 'Point', coordinates: [77.2759, 28.5518] },
        phone: '01147135000',
        emergencyAvailable: true,
        facilities: ['Cath Lab', 'ICU', 'Emergency', 'Pharmacy'],
        googleRating: 4.6,
        googleReviewCount: 3214,
        establishedDate: new Date('1988-07-16'),
        tests: ['ECG', 'Echo', 'Stress Test', 'Angiography'],
        treatments: ['Heart Disease', 'Hypertension'],
        surgeries: ['Bypass Surgery', 'Angioplasty', 'Valve Replacement'],
        numberOfBeds: 310
      }
    ];

    const createdHospitals = await Hospital.insertMany(hospitals);
    console.log(`✅ ${createdHospitals.length} hospitals added`);

    // ✅ FIRST OWNER (already exists)
    const owner = await User.create({
      name: 'Hospital Owner',
      email: 'owner@hospital.com',
      password: 'owner123',
      phone: '9876543212',
      role: 'owner',
      isActive: true,
      ownerProfile: {
        facilityType: 'hospital',
        facilityId: createdHospitals.find(h => h.name === 'Sarvodaya Hospital Faridabad')._id,
        isVerified: true
      }
    });
    
    await Hospital.findByIdAndUpdate(
      createdHospitals.find(h => h.name === 'Sarvodaya Hospital Faridabad')._id,
      { owner: owner._id, appointmentsEnabled: true }
    );
    console.log('✅ Owner added:', owner.email);

    // ==================== ADD THIS NEW CODE HERE ====================
    
    // ✅ SECOND OWNER for Max Hospital
    const owner2 = await User.create({
      name: 'Max Hospital Owner',
      email: 'owner2@hospital.com',
      password: 'owner123',
      phone: '9876543213',
      role: 'owner',
      isActive: true,
      ownerProfile: {
        facilityType: 'hospital',
        facilityId: createdHospitals.find(h => h.name === 'Max Super Speciality Hospital Saket')._id,
        isVerified: true
      }
    });

    await Hospital.findByIdAndUpdate(
      createdHospitals.find(h => h.name === 'Max Super Speciality Hospital Saket')._id,
      { owner: owner2._id, appointmentsEnabled: true }
    );
    console.log('✅ Second owner added:', owner2.email);

    // ==================== END NEW CODE ====================

    console.log('🔬 Adding laboratories...');
    
    const labs = [
      // ---------------- EXISTING LABS ----------------
      {
        name: 'Dr. Lal PathLabs Faridabad',
        type: 'franchise',
        category: 'private',
        description: 'Leading diagnostic laboratory',
        address: { street: 'Sector 16', area: 'Faridabad', city: 'Faridabad', state: 'Haryana', pincode: '121002', landmark: 'Near Nehru Ground' },
        location: { type: 'Point', coordinates: [77.3178, 28.4189] },
        phone: '01294270000',
        operatingHours: { open: '07:00', close: '20:00' },
        facilities: ['Blood Test', 'Urine Test', 'X-Ray', 'Ultrasound', 'Home Collection'],
        googleRating: 4.4,
        googleReviewCount: 523,
        reportTime: '24 hours',
        homeCollection: true,
        establishedDate: new Date('1949-01-01'),
        tests: ['CBC', 'Lipid Profile', 'Thyroid Test']
      },
      {
        name: 'Thyrocare Delhi',
        type: 'franchise',
        category: 'private',
        address: { street: 'Rajouri Garden', city: 'Delhi', state: 'Delhi', pincode: '110027' },
        location: { type: 'Point', coordinates: [77.1213, 28.6414] },
        phone: '01145678901',
        googleRating: 4.2,
        homeCollection: true
      },
      {
        name: 'SRL Diagnostics Gurgaon',
        type: 'franchise',
        category: 'private',
        address: { street: 'Sector 14', city: 'Gurgaon', state: 'Haryana', pincode: '122001' },
        location: { type: 'Point', coordinates: [77.0320, 28.4595] },
        phone: '01244567890',
        googleRating: 4.3,
        homeCollection: true
      },
      {
        name: 'Metropolis Healthcare Mumbai',
        type: 'franchise',
        category: 'private',
        address: { street: 'Andheri East', city: 'Mumbai', state: 'Maharashtra', pincode: '400069' },
        location: { type: 'Point', coordinates: [72.8681, 19.1136] },
        googleRating: 4.1,
        homeCollection: true
      },
      {
        name: 'Vijaya Diagnostic Centre Bangalore',
        type: 'independent',
        category: 'private',
        address: { street: 'Jayanagar', city: 'Bangalore', state: 'Karnataka', pincode: '560041' },
        location: { type: 'Point', coordinates: [77.5833, 12.9250] },
        googleRating: 4.4
      },

      // ---------------- NEW LABS ----------------
      {
        name: 'Pathkind Labs Faridabad',
        type: 'franchise', 
        category: 'private',
        description: 'Quality diagnostic services',
        address: { street: 'Sector 15', area: 'Faridabad', city: 'Faridabad', state: 'Haryana', pincode: '121007', landmark: 'Near Sector 15 Market' },
        location: { type: 'Point', coordinates: [77.3078, 28.4089] },
        phone: '01294270100',
        facilities: ['Blood Test', 'Urine Test', 'Home Collection'],
        googleRating: 4.3,
        googleReviewCount: 234,
        reportTime: '24 hours',
        homeCollection: true,
        establishedDate: new Date('2010-03-15'),
        tests: ['CBC', 'Thyroid', 'Diabetes', 'Lipid Profile'],
        treatments: ['Health Packages'],
        procedures: ['Blood Collection', 'Sample Collection'],
        insuranceAccepted: ['Star Health'],
        appointmentsEnabled: true
      },
      {
        name: 'Oncquest Laboratories Delhi',
        type: 'independent',
        category: 'private',
        description: 'Advanced diagnostic center',
        address: { street: 'Nehru Place', area: 'Nehru Place', city: 'Delhi', state: 'Delhi', pincode: '110019', landmark: 'Near Nehru Place Metro' },
        location: { type: 'Point', coordinates: [77.2504, 28.5494] },
        phone: '01141414141',
        facilities: ['Blood Test', 'Pathology', 'Radiology', 'Home Collection'],
        googleRating: 4.4,
        googleReviewCount: 567,
        reportTime: '48 hours',
        homeCollection: true,
        accreditation: ['NABL'], 
        establishedDate: new Date('2007-06-20'),
        tests: ['Cancer Screening', 'Genetic Testing', 'Pathology'],
        numberOfBeds: 0
      },
      {
        name: 'Apollo Diagnostics Gurgaon',
        type: 'franchise',
        category: 'private',
        description: 'Part of Apollo Healthcare',
        address: { street: 'Sector 29', area: 'Gurgaon', city: 'Gurgaon', state: 'Haryana', pincode: '122001', landmark: 'Near Leisure Valley' },
        location: { type: 'Point', coordinates: [77.0588, 28.4646] },
        phone: '01244567800',
        facilities: ['Blood Test', 'X-Ray', 'Ultrasound', 'Home Collection'],
        googleRating: 4.2,
        googleReviewCount: 432,
        reportTime: '24 hours',
        homeCollection: true,
        establishedDate: new Date('2012-09-10'),
        tests: ['Complete Blood Count', 'X-Ray', 'Ultrasound']
      },
      {
        name: 'Neuberg Diagnostics Delhi',
        type: 'franchise',
        category: 'private',
        address: { street: 'Lajpat Nagar', area: 'Lajpat Nagar', city: 'Delhi', state: 'Delhi', pincode: '110024' },
        location: { type: 'Point', coordinates: [77.2431, 28.5677] },
        phone: '01146789012',
        facilities: ['Blood Test', 'Molecular Testing', 'Home Collection'],
        googleRating: 4.1,
        googleReviewCount: 289,
        reportTime: 'Same day',
        homeCollection: true,
        establishedDate: new Date('2015-11-05')
      }
    ];

    const createdLabs = await Laboratory.insertMany(labs);
    console.log(`✅ ${labs.length} laboratories added`);

    // ==================== ADD THIS NEW CODE HERE ====================
    
    // ✅ LAB OWNER for Pathkind Lab
    const labOwner = await User.create({
      name: 'Lab Owner',
      email: 'labowner@hospital.com',
      password: 'owner123',
      phone: '9876543214',
      role: 'owner',
      isActive: true,
      ownerProfile: {
        facilityType: 'laboratory',
        facilityId: createdLabs.find(l => l.name === 'Pathkind Labs Faridabad')._id,
        isVerified: true
      }
    });

    await Laboratory.findByIdAndUpdate(
      createdLabs.find(l => l.name === 'Pathkind Labs Faridabad')._id,
      { owner: labOwner._id, appointmentsEnabled: true }
    );
    console.log('✅ Lab owner added:', labOwner.email);

    // ==================== END NEW CODE ====================

    // ✅ UPDATE SUMMARY
    console.log('\n🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('📊 Summary:');
    console.log(`   - 5 Users (1 Admin, 3 Owners, 1 User)`);
    console.log(`   - ${hospitals.length} Hospitals (2 with owners)`);
    console.log(`   - ${labs.length} Laboratories (1 with owner)`);
    console.log('\n🔐 Login Credentials:');
    console.log('   Admin: admin@hospital.com / admin123');
    console.log('   Owner 1: owner@hospital.com / owner123 (Sarvodaya Hospital)');
    console.log('   Owner 2: owner2@hospital.com / owner123 (Max Hospital)');
    console.log('   Lab Owner: labowner@hospital.com / owner123 (Pathkind Lab)');
    console.log('   User: aman@example.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();