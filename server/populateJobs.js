// Utility script to populate database with sample jobs
const Job = require('./models/Job');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sarkari_results';

const sampleJobs = [
  {
    title: 'SSC CGL 2024',
    organization: 'Staff Selection Commission',
    department: 'Central Government',
    category: 'SSC Jobs',
    type: 'Full Time',
    qualification: {
      minimum: 'Graduation',
      preferred: 'Graduation with 60% marks'
    },
    experience: {
      minimum: 0,
      maximum: 0
    },
    ageLimit: {
      minimum: 18,
      maximum: 27,
      relaxation: {
        obc: 3,
        sc: 5,
        st: 5
      }
    },
    salary: {
      minimum: 25000,
      maximum: 81100,
      currency: 'INR'
    },
    location: {
      state: 'All India',
      city: 'Multiple Cities',
      district: 'All'
    },
    totalPosts: 17727,
    postDetails: [{
      postName: 'Assistant Section Officer',
      numberOfPosts: 17727,
      reservation: {
        general: 7500,
        obc: 4800,
        sc: 2700,
        st: 1327,
        ews: 1400
      }
    }],
    applicationFee: {
      general: 100,
      obc: 100,
      sc: 0,
      st: 0,
      ews: 100
    },
    importantDates: {
      notificationDate: new Date('2024-01-01'),
      applicationStartDate: new Date('2024-01-15'),
      applicationEndDate: new Date('2024-02-15'),
      examDate: new Date('2024-03-15'),
      resultDate: new Date('2024-05-15')
    },
    examDetails: {
      examPattern: 'Objective Type (Multiple Choice Questions)',
      syllabus: 'General Intelligence, Quantitative Aptitude, English, General Awareness',
      examMode: 'Online'
    },
    howToApply: 'Apply online through official website',
    officialWebsite: 'https://ssc.nic.in',
    notificationPDF: 'https://ssc.nic.in/notification-cgl-2024.pdf',
    applicationLink: 'https://ssc.nic.in/apply-online',
    description: 'Staff Selection Commission Combined Graduate Level Examination 2024 for recruitment to various Group B and Group C posts.',
    eligibilityCriteria: 'Graduation from recognized university',
    selectionProcess: 'Tier-I, Tier-II, Tier-III examination followed by document verification',
    isActive: true,
    isFeatured: true
  },
  {
    title: 'UPSC Civil Services 2024',
    organization: 'Union Public Service Commission',
    department: 'Central Government',
    category: 'UPSC Jobs',
    type: 'Full Time',
    qualification: {
      minimum: 'Graduation',
      preferred: 'Graduation from recognized university'
    },
    experience: {
      minimum: 0,
      maximum: 0
    },
    ageLimit: {
      minimum: 21,
      maximum: 32,
      relaxation: {
        obc: 3,
        sc: 5,
        st: 5
      }
    },
    salary: {
      minimum: 56100,
      maximum: 250000,
      currency: 'INR'
    },
    location: {
      state: 'All India',
      city: 'Multiple Cities',
      district: 'All'
    },
    totalPosts: 1105,
    postDetails: [{
      postName: 'IAS/IPS/IFS Officers',
      numberOfPosts: 1105,
      reservation: {
        general: 400,
        obc: 300,
        sc: 200,
        st: 150,
        ews: 55
      }
    }],
    applicationFee: {
      general: 200,
      obc: 200,
      sc: 0,
      st: 0,
      ews: 200
    },
    importantDates: {
      notificationDate: new Date('2024-01-15'),
      applicationStartDate: new Date('2024-02-01'),
      applicationEndDate: new Date('2024-03-01'),
      examDate: new Date('2024-06-15'),
      resultDate: new Date('2024-08-15')
    },
    examDetails: {
      examPattern: 'Prelims + Mains + Interview',
      syllabus: 'General Studies, CSAT, Optional Subject, Essay',
      examMode: 'Offline'
    },
    howToApply: 'Apply online through UPSC official website',
    officialWebsite: 'https://upsc.gov.in',
    notificationPDF: 'https://upsc.gov.in/notification-cse-2024.pdf',
    applicationLink: 'https://upsconline.nic.in',
    description: 'Civil Services Examination 2024 for recruitment to Indian Administrative Service, Indian Police Service and other Central Services.',
    eligibilityCriteria: 'Graduation from recognized university, Indian citizen',
    selectionProcess: 'Preliminary examination, Main examination, Interview',
    isActive: true,
    isFeatured: true
  },
  {
    title: 'Railway NTPC 2024',
    organization: 'Railway Recruitment Board',
    department: 'Railway',
    category: 'Railway Jobs',
    type: 'Full Time',
    qualification: {
      minimum: 'Graduation',
      preferred: 'Graduation with 60% marks'
    },
    experience: {
      minimum: 0,
      maximum: 0
    },
    ageLimit: {
      minimum: 18,
      maximum: 30,
      relaxation: {
        obc: 3,
        sc: 5,
        st: 5
      }
    },
    salary: {
      minimum: 35400,
      maximum: 112400,
      currency: 'INR'
    },
    location: {
      state: 'All India',
      city: 'Multiple Cities',
      district: 'All'
    },
    totalPosts: 35281,
    postDetails: [{
      postName: 'Station Master, Goods Guard, Commercial Clerk',
      numberOfPosts: 35281,
      reservation: {
        general: 15000,
        obc: 9500,
        sc: 6000,
        st: 3000,
        ews: 1781
      }
    }],
    applicationFee: {
      general: 500,
      obc: 500,
      sc: 250,
      st: 250,
      ews: 500
    },
    importantDates: {
      notificationDate: new Date('2024-01-20'),
      applicationStartDate: new Date('2024-01-28'),
      applicationEndDate: new Date('2024-02-28'),
      examDate: new Date('2024-04-15'),
      resultDate: new Date('2024-06-15')
    },
    examDetails: {
      examPattern: 'Computer Based Test (CBT)',
      syllabus: 'General Awareness, Mathematics, General Intelligence & Reasoning',
      examMode: 'Online'
    },
    howToApply: 'Apply online through RRB official website',
    officialWebsite: 'https://rrbcdg.gov.in',
    notificationPDF: 'https://rrbcdg.gov.in/notification-ntpc-2024.pdf',
    applicationLink: 'https://rrbcdg.gov.in/apply-online',
    description: 'Railway Non-Technical Popular Categories 2024 for recruitment to various posts in Indian Railways.',
    eligibilityCriteria: 'Graduation from recognized university, age between 18-30 years',
    selectionProcess: 'Computer Based Test (CBT 1 & CBT 2), Document Verification, Medical Examination',
    isActive: true,
    isFeatured: true
  }
];

const populateJobs = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing jobs
    await Job.deleteMany({});
    console.log('🗑️ Cleared existing jobs');

    // Insert sample jobs
    const insertedJobs = await Job.insertMany(sampleJobs);
    console.log('✅ Inserted', insertedJobs.length, 'sample jobs');
    
    console.log('📋 Job IDs:');
    insertedJobs.forEach(job => {
      console.log(`- ${job.title}: ${job._id}`);
    });

    await mongoose.disconnect();
    console.log('✅ Database populated successfully!');
  } catch (error) {
    console.error('❌ Error populating database:', error);
    process.exit(1);
  }
};

populateJobs();
