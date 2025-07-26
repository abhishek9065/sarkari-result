const mongoose = require('mongoose');
const Job = require('./models/Job');
require('dotenv').config();

// Sample job data including SSC MTS
const sampleJobs = [
  {
    title: 'SSC MTS 2024',
    organization: 'Staff Selection Commission',
    department: 'Multi-Tasking Staff',
    category: 'SSC Jobs',
    type: 'Full Time',
    qualification: {
      minimum: '10th Pass',
      preferred: '12th Pass'
    },
    experience: {
      minimum: 0,
      maximum: 0
    },
    ageLimit: {
      minimum: 18,
      maximum: 25,
      relaxation: {
        obc: 3,
        sc: 5,
        st: 5
      }
    },
    salary: {
      minimum: 18000,
      maximum: 22000,
      currency: 'INR'
    },
    location: {
      state: 'All India',
      city: 'Various',
      district: 'Multiple'
    },
    totalPosts: 9000,
    postDetails: [{
      postName: 'Multi Tasking Staff',
      numberOfPosts: 9000,
      reservation: {
        general: 4500,
        obc: 2700,
        sc: 1350,
        st: 450,
        ews: 900
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
      notificationDate: new Date('2024-01-15'),
      applicationStartDate: new Date('2024-02-01'),
      applicationEndDate: new Date('2024-03-15'),
      examDate: new Date('2024-05-20'),
      resultDate: new Date('2024-07-30')
    },
    examDetails: {
      examPattern: 'Computer Based Test (CBT)',
      syllabus: 'General Intelligence, Numerical Aptitude, General English, General Awareness',
      examMode: 'Online'
    },
    howToApply: 'Online through official SSC website',
    officialWebsite: 'https://ssc.nic.in',
    notificationPDF: 'https://ssc.nic.in/SSCFileServer/PortalManagement/UploadedFiles/notice_MTS_15012024.pdf',
    applicationLink: 'https://ssc.nic.in/Portal/SchemeApplyOnline',
    description: 'Staff Selection Commission is conducting recruitment for Multi-Tasking Staff (MTS) posts across various ministries and departments of Government of India.',
    eligibilityCriteria: 'Candidates should have passed 10th standard or equivalent from a recognized board.',
    selectionProcess: 'Selection will be based on Computer Based Test (CBT) followed by Physical Efficiency Test (PET) and Physical Standard Test (PST) for certain posts.',
    isActive: true,
    isFeatured: true,
    views: 12500
  },
  {
    title: 'UPSC Civil Services 2024',
    organization: 'Union Public Service Commission',
    department: 'Various',
    category: 'UPSC Jobs',
    type: 'Full Time',
    qualification: {
      minimum: 'Graduation',
      preferred: 'Post Graduation'
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
      city: 'Various',
      district: 'Multiple'
    },
    totalPosts: 1105,
    postDetails: [{
      postName: 'IAS/IPS/IFS Officers',
      numberOfPosts: 1105,
      reservation: {
        general: 553,
        obc: 298,
        sc: 166,
        st: 83,
        ews: 110
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
      notificationDate: new Date('2024-02-14'),
      applicationStartDate: new Date('2024-02-14'),
      applicationEndDate: new Date('2024-03-05'),
      examDate: new Date('2024-06-16'),
      resultDate: new Date('2024-10-15')
    },
    examDetails: {
      examPattern: 'Prelims + Mains + Interview',
      syllabus: 'History, Geography, Polity, Economics, Environment, Current Affairs',
      examMode: 'Offline'
    },
    howToApply: 'Online through UPSC official website',
    officialWebsite: 'https://upsc.gov.in',
    notificationPDF: 'https://upsc.gov.in/sites/default/files/Notification-CSE-2024-Engl.pdf',
    applicationLink: 'https://upsconline.nic.in',
    description: 'Civil Services Examination for recruitment to IAS, IPS, IFS and other Group A and Group B services.',
    eligibilityCriteria: 'Graduation from a recognized university. Age limit varies by category.',
    selectionProcess: 'Three stage selection: Preliminary, Main examination and Personality Test (Interview).',
    isActive: true,
    isFeatured: true,
    views: 45000
  },
  {
    title: 'Railway NTPC 2024',
    organization: 'Railway Recruitment Board',
    department: 'Non-Technical Popular Categories',
    category: 'Railway Jobs',
    type: 'Full Time',
    qualification: {
      minimum: 'Graduation',
      preferred: 'Any Graduate'
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
      city: 'Various',
      district: 'Multiple'
    },
    totalPosts: 35281,
    postDetails: [{
      postName: 'Various NTPC Posts',
      numberOfPosts: 35281,
      reservation: {
        general: 17640,
        obc: 9525,
        sc: 5292,
        st: 1764,
        ews: 3528
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
      notificationDate: new Date('2024-01-28'),
      applicationStartDate: new Date('2024-02-15'),
      applicationEndDate: new Date('2024-03-31'),
      examDate: new Date('2024-06-15'),
      resultDate: new Date('2024-09-30')
    },
    examDetails: {
      examPattern: 'Computer Based Test (CBT)',
      syllabus: 'Mathematics, General Intelligence, General Awareness, General Science',
      examMode: 'Online'
    },
    howToApply: 'Online through RRB official website',
    officialWebsite: 'https://rrbcdg.gov.in',
    notificationPDF: 'https://rrbcdg.gov.in/uploads/notices/ntpc_2024.pdf',
    applicationLink: 'https://www.rrbcdg.gov.in/cen-01-2024',
    description: 'Railway Recruitment Board is conducting recruitment for Non-Technical Popular Categories posts.',
    eligibilityCriteria: 'Graduation in any discipline from a recognized university.',
    selectionProcess: 'Computer Based Test (CBT) Stage I & II followed by Typing Skill Test/Computer Based Aptitude Test.',
    isActive: true,
    isFeatured: true,
    views: 28000
  },
  {
    title: 'IBPS PO 2024',
    organization: 'Institute of Banking Personnel Selection',
    department: 'Probationary Officer',
    category: 'Bank Jobs',
    type: 'Full Time',
    qualification: {
      minimum: 'Graduation',
      preferred: 'Any Graduate'
    },
    experience: {
      minimum: 0,
      maximum: 0
    },
    ageLimit: {
      minimum: 20,
      maximum: 30,
      relaxation: {
        obc: 3,
        sc: 5,
        st: 5
      }
    },
    salary: {
      minimum: 23700,
      maximum: 42020,
      currency: 'INR'
    },
    location: {
      state: 'All India',
      city: 'Various',
      district: 'Multiple'
    },
    totalPosts: 6432,
    postDetails: [{
      postName: 'Probationary Officer',
      numberOfPosts: 6432,
      reservation: {
        general: 3216,
        obc: 1737,
        sc: 965,
        st: 322,
        ews: 643
      }
    }],
    applicationFee: {
      general: 850,
      obc: 850,
      sc: 175,
      st: 175,
      ews: 850
    },
    importantDates: {
      notificationDate: new Date('2024-07-01'),
      applicationStartDate: new Date('2024-07-03'),
      applicationEndDate: new Date('2024-07-23'),
      examDate: new Date('2024-10-19'),
      resultDate: new Date('2024-12-30')
    },
    examDetails: {
      examPattern: 'Prelims + Mains + Interview',
      syllabus: 'English Language, Quantitative Aptitude, Reasoning Ability, General Awareness, Computer Knowledge',
      examMode: 'Online'
    },
    howToApply: 'Online through IBPS official website',
    officialWebsite: 'https://ibps.in',
    notificationPDF: 'https://ibps.in/downloads/crp-po-xiv-2024.pdf',
    applicationLink: 'https://ibps.in/crp-po-xiv',
    description: 'IBPS Probationary Officer recruitment for public sector banks.',
    eligibilityCriteria: 'Graduation in any discipline with minimum 50% marks.',
    selectionProcess: 'Three tier selection process: Preliminary Exam, Main Exam and Interview.',
    isActive: true,
    isFeatured: false,
    views: 15000
  },
  {
    title: 'UP Police Constable 2024',
    organization: 'Uttar Pradesh Police Recruitment Board',
    department: 'Police Department',
    category: 'Police Jobs',
    type: 'Full Time',
    qualification: {
      minimum: '12th Pass',
      preferred: '12th Pass'
    },
    experience: {
      minimum: 0,
      maximum: 0
    },
    ageLimit: {
      minimum: 18,
      maximum: 22,
      relaxation: {
        obc: 3,
        sc: 5,
        st: 5
      }
    },
    salary: {
      minimum: 21700,
      maximum: 30000,
      currency: 'INR'
    },
    location: {
      state: 'Uttar Pradesh',
      city: 'Various',
      district: 'All Districts'
    },
    totalPosts: 60244,
    postDetails: [{
      postName: 'Police Constable',
      numberOfPosts: 60244,
      reservation: {
        general: 30122,
        obc: 16266,
        sc: 9037,
        st: 3012,
        ews: 6024
      }
    }],
    applicationFee: {
      general: 400,
      obc: 400,
      sc: 200,
      st: 200,
      ews: 400
    },
    importantDates: {
      notificationDate: new Date('2024-06-25'),
      applicationStartDate: new Date('2024-06-25'),
      applicationEndDate: new Date('2024-07-24'),
      examDate: new Date('2024-08-23'),
      resultDate: new Date('2024-11-30')
    },
    examDetails: {
      examPattern: 'Computer Based Test + Physical Test',
      syllabus: 'General Knowledge, General Hindi, Numerical & Mental Ability, Mental Aptitude, IQ & Reasoning Ability',
      examMode: 'Online'
    },
    howToApply: 'Online through UP Police official website',
    officialWebsite: 'https://uppbpb.gov.in',
    notificationPDF: 'https://uppbpb.gov.in/Upload/Notification/Advertisement_60244.pdf',
    applicationLink: 'https://uppbpb.gov.in/newsite',
    description: 'UP Police Constable recruitment for various districts of Uttar Pradesh.',
    eligibilityCriteria: 'Intermediate (12th) passed from UP Board or equivalent board.',
    selectionProcess: 'Written Exam, Document Verification, Physical Standard Test, Physical Efficiency Test.',
    isActive: true,
    isFeatured: false,
    views: 35000
  }
];

// Connect to MongoDB and seed data
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sarkari-results', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing jobs (optional - remove this line if you want to keep existing data)
    // await Job.deleteMany({});
    // console.log('Cleared existing jobs');

    // Insert sample jobs
    const insertedJobs = await Job.insertMany(sampleJobs);
    console.log(`Successfully inserted ${insertedJobs.length} sample jobs`);

    // List the inserted jobs
    insertedJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} - ${job.organization}`);
    });

    console.log('\nSample data has been seeded successfully!');
    console.log('You can now see these jobs in your "New Online Forms" section');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleJobs };
