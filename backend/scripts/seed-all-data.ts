import { MongoClient } from 'mongodb';

const COSMOS_CONNECTION_STRING = process.env.COSMOS_CONNECTION_STRING || '';
const DATABASE_NAME = process.env.COSMOS_DATABASE_NAME || 'sarkari_db';

// Comprehensive sample data for all content types
const allSampleData = [
    // ================== JOBS ==================
    {
        title: "SSC GD Constable Recruitment 2026",
        slug: "ssc-gd-constable-recruitment-2026",
        type: "job",
        category: "Central Government",
        organization: "Staff Selection Commission (SSC)",
        content: `## 🔫 SSC GD Constable Recruitment 2026

Staff Selection Commission has released notification for **45,284 GD Constable posts**.

### 📅 Important Dates
| Event | Date |
|-------|------|
| Online Apply Start | 20 Jan 2026 |
| Last Date to Apply | 20 Feb 2026 |
| CBT Exam Date | April 2026 |

### 💰 Application Fee
| Category | Fee |
|----------|-----|
| General/OBC | ₹100 |
| SC/ST/Female | ₹0 (Nil) |

### 📚 Eligibility
- **Age:** 18-23 Years
- **Education:** 10th Pass (Matriculation)
- **Height (Male):** 170 cm (Gen), 165 cm (SC/ST)
- **Height (Female):** 157 cm (Gen), 152 cm (SC/ST)

### 💵 Salary: ₹21,700 - ₹69,100 (Level 3)
`,
        externalLink: "https://ssc.nic.in",
        location: "All India",
        deadline: new Date("2026-02-20"),
        minQualification: "10th Pass",
        ageLimit: "18-23 Years",
        applicationFee: "₹100",
        totalPosts: 45284,
        tags: ["ssc gd", "constable", "central government", "10th pass", "bsf", "cisf", "crpf"],
        postedBy: 1,
        postedAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        viewCount: 25000
    },
    {
        title: "IBPS PO Recruitment 2026",
        slug: "ibps-po-recruitment-2026",
        type: "job",
        category: "Banking",
        organization: "Institute of Banking Personnel Selection (IBPS)",
        content: `## 🏦 IBPS PO/MT Recruitment 2026

IBPS has released notification for Probationary Officer/Management Trainee posts in Public Sector Banks.

### 📅 Important Dates
| Event | Date |
|-------|------|
| Online Registration | 01 Feb 2026 |
| Last Date to Apply | 28 Feb 2026 |
| Prelims Exam | March 2026 |
| Mains Exam | April 2026 |

### 💰 Application Fee
| Category | Fee |
|----------|-----|
| General/OBC/EWS | ₹850 |
| SC/ST/PwBD | ₹175 |

### 📚 Eligibility
- **Age:** 20-30 Years
- **Education:** Graduation in any discipline
- **Computer Knowledge:** Required

### 💵 Salary: ₹52,000 - ₹85,000 per month
`,
        externalLink: "https://ibps.in",
        location: "All India",
        deadline: new Date("2026-02-28"),
        minQualification: "Graduation",
        ageLimit: "20-30 Years",
        applicationFee: "₹850",
        totalPosts: 6000,
        tags: ["ibps po", "banking", "probationary officer", "graduation"],
        postedBy: 1,
        postedAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        viewCount: 18500
    },
    {
        title: "Indian Army Agniveer Rally 2026",
        slug: "indian-army-agniveer-rally-2026",
        type: "job",
        category: "Defence",
        organization: "Indian Army",
        content: `## 🎖️ Indian Army Agniveer Rally 2026

Indian Army has announced Agniveer recruitment rally for various states.

### 📅 Rally Schedule
| State | Dates |
|-------|-------|
| Uttar Pradesh | 15-25 Feb 2026 |
| Rajasthan | 01-10 Mar 2026 |
| Maharashtra | 15-25 Mar 2026 |
| Bihar | 01-10 Apr 2026 |

### 💰 Application Fee: ₹0 (Free)

### 📚 Eligibility (Agniveer General Duty)
- **Age:** 17.5-21 Years
- **Education:** 10th Pass (45% marks)
- **Height:** 170 cm (Gen), 165 cm (Hills)
- **Chest:** 77/82 cm

### 💵 Stipend during Service
- **Year 1:** ₹30,000/month
- **Year 2:** ₹33,000/month
- **Year 3:** ₹36,500/month
- **Year 4:** ₹40,000/month

### Seva Nidhi Package: ₹11.71 Lakhs (after 4 years)
`,
        externalLink: "https://joinindianarmy.nic.in",
        location: "All India",
        deadline: new Date("2026-04-30"),
        minQualification: "10th Pass",
        ageLimit: "17.5-21 Years",
        applicationFee: "₹0",
        totalPosts: 25000,
        tags: ["indian army", "agniveer", "defence", "rally", "10th pass"],
        postedBy: 1,
        postedAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        viewCount: 32000
    },

    // ================== RESULTS ==================
    {
        title: "SSC CGL Final Result 2025 Declared",
        slug: "ssc-cgl-final-result-2025",
        type: "result",
        category: "Central Government",
        organization: "Staff Selection Commission (SSC)",
        content: `## 📢 SSC CGL 2025 Final Result Declared!

Staff Selection Commission has released Combined Graduate Level Final Result 2025.

### 📊 Result Statistics
| Parameter | Details |
|-----------|---------|
| Total Vacancies | 17,727 |
| Total Selected | 17,500 |
| Result Date | 10 Jan 2026 |

### 📈 Cut Off Marks (Final)
| Category | Cut Off |
|----------|---------|
| General | 476.50 |
| OBC | 445.25 |
| SC | 398.75 |
| ST | 375.00 |
| EWS | 455.00 |

### 📝 How to Check Result?
1. Visit: https://ssc.nic.in/Portal/Results
2. Click on "CGL 2025 Final Result"
3. Enter Roll Number
4. Download Result PDF

### 🎯 Next Steps
- Document Verification: 20 Jan - 28 Feb 2026
- Joining Date: March 2026
`,
        externalLink: "https://ssc.nic.in",
        location: "All India",
        deadline: null,
        minQualification: "Graduation",
        totalPosts: 17727,
        tags: ["ssc cgl", "result", "central government", "graduate"],
        postedBy: 1,
        postedAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        viewCount: 45000
    },
    {
        title: "UPSC CSE 2025 Final Result - IAS/IPS",
        slug: "upsc-cse-2025-final-result",
        type: "result",
        category: "Central Government",
        organization: "Union Public Service Commission (UPSC)",
        content: `## 🏛️ UPSC Civil Services 2025 Final Result

UPSC has declared the final result of Civil Services Examination 2025.

### 🏆 Toppers List
| Rank | Name | State | Optional |
|------|------|-------|----------|
| 1 | Aditya Srivastava | UP | Public Admin |
| 2 | Priya Sharma | Delhi | Sociology |
| 3 | Rahul Verma | Bihar | Geography |

### 📊 Selection Statistics
| Service | Selected |
|---------|----------|
| IAS | 180 |
| IPS | 150 |
| IFS | 45 |
| Other Services | 600+ |
| **Total** | **1,000+** |

### 📈 Cut Off (Final - Interview)
| Category | Cut Off |
|----------|---------|
| General | 1012 |
| OBC | 935 |
| SC | 850 |
| ST | 820 |

### Document Verification: February 2026
`,
        externalLink: "https://upsc.gov.in",
        location: "All India",
        deadline: null,
        minQualification: "Graduation",
        totalPosts: 1000,
        tags: ["upsc", "cse", "ias", "ips", "result", "civil services"],
        postedBy: 1,
        postedAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        viewCount: 65000
    },

    // ================== ADMIT CARDS ==================
    {
        title: "RRB NTPC CBT 2 Admit Card 2026 - Download",
        slug: "rrb-ntpc-cbt2-admit-card-2026",
        type: "admit-card",
        category: "Railways",
        organization: "Railway Recruitment Board (RRB)",
        content: `## 🎫 RRB NTPC CBT 2 Admit Card 2026 Released!

Railway Recruitment Board has released Admit Cards for NTPC CBT 2 Examination.

### 📅 Exam Schedule
| Date | Shift 1 | Shift 2 |
|------|---------|---------|
| 25 Jan 2026 | 10 AM | 2 PM |
| 26 Jan 2026 | 10 AM | 2 PM |
| 27 Jan 2026 | 10 AM | 2 PM |

### 📥 How to Download Admit Card?
1. Visit your regional RRB website
2. Click on "NTPC CBT 2 Admit Card"
3. Enter Registration Number & Date of Birth
4. Download & Print

### 📋 Documents to Carry
- ✅ Admit Card (Color Print)
- ✅ Photo ID (Aadhar/PAN/Voter ID)
- ✅ Passport Size Photo
- ✅ PWD Certificate (if applicable)

### ⚠️ Important Instructions
- Reach 90 minutes before exam
- Electronic devices NOT allowed
- Black pen for signing only
`,
        externalLink: "https://rrbcdg.gov.in",
        location: "All India",
        deadline: new Date("2026-01-27"),
        minQualification: "Graduation",
        totalPosts: 35000,
        tags: ["rrb ntpc", "admit card", "railways", "cbt 2"],
        postedBy: 1,
        postedAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        viewCount: 28000
    },
    {
        title: "SSC CHSL Tier 1 Admit Card 2026",
        slug: "ssc-chsl-tier1-admit-card-2026",
        type: "admit-card",
        category: "Central Government",
        organization: "Staff Selection Commission (SSC)",
        content: `## 📄 SSC CHSL Tier 1 Admit Card 2026

SSC has released admit cards for Combined Higher Secondary Level Tier 1 Exam.

### 📅 Exam Dates: 15-25 February 2026

### 📥 Download Steps
1. Visit: https://ssc.nic.in
2. Click on "Admit Card"
3. Select "CHSL Tier 1 - 2026"
4. Login with Registration & Date of Birth
5. Download & Print Admit Card

### 📊 Exam Pattern
| Section | Questions | Marks | Time |
|---------|-----------|-------|------|
| English Language | 25 | 50 | - |
| General Intelligence | 25 | 50 | - |
| Quantitative Aptitude | 25 | 50 | - |
| General Awareness | 25 | 50 | - |
| **Total** | **100** | **200** | **60 min** |

> ⚠️ Negative Marking: 0.5 marks per wrong answer
`,
        externalLink: "https://ssc.nic.in",
        location: "All India",
        deadline: new Date("2026-02-25"),
        minQualification: "12th Pass",
        totalPosts: 4500,
        tags: ["ssc chsl", "admit card", "tier 1", "12th pass"],
        postedBy: 1,
        postedAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        viewCount: 18000
    },

    // ================== ANSWER KEYS ==================
    {
        title: "UPSC Prelims 2025 Answer Key - GS Paper 1 & 2",
        slug: "upsc-prelims-2025-answer-key",
        type: "answer-key",
        category: "Central Government",
        organization: "Union Public Service Commission (UPSC)",
        content: `## 📝 UPSC Prelims 2025 Answer Key Released

UPSC has released provisional answer keys for Civil Services Prelims 2025.

### 📅 Key Dates
| Event | Date |
|-------|------|
| Prelims Exam Date | 26 May 2025 |
| Answer Key Released | 10 Jun 2025 |
| Objection Window | 10-17 Jun 2025 |
| Final Answer Key | 25 Jun 2025 |

### 📊 Paper 1 (GS) - Expected Cut Off
| Category | Expected Cut Off |
|----------|------------------|
| General | 98-102 |
| OBC | 92-96 |
| SC | 78-82 |
| ST | 72-76 |
| EWS | 90-94 |

### 📋 How to Check Answer Key
1. Visit: https://upsc.gov.in
2. Go to "Examinations" → "Question Papers"
3. Select "CSE Prelims 2025"
4. Download Set A/B/C/D Answer Keys

### 💡 Objection Fee: ₹100 per question
`,
        externalLink: "https://upsc.gov.in",
        location: "All India",
        deadline: new Date("2025-06-17"),
        minQualification: "Graduation",
        tags: ["upsc", "prelims", "answer key", "cse", "civil services"],
        postedBy: 1,
        postedAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        viewCount: 55000
    },

    // ================== SYLLABUS ==================
    {
        title: "SSC CGL 2026 Complete Syllabus - Tier 1 & 2",
        slug: "ssc-cgl-2026-syllabus",
        type: "syllabus",
        category: "Central Government",
        organization: "Staff Selection Commission (SSC)",
        content: `## 📖 SSC CGL 2026 Complete Syllabus

### Tier 1 (Computer Based Test)
| Section | Questions | Marks | Time |
|---------|-----------|-------|------|
| General Intelligence | 25 | 50 | - |
| General Awareness | 25 | 50 | - |
| Quantitative Aptitude | 25 | 50 | - |
| English Comprehension | 25 | 50 | - |
| **Total** | **100** | **200** | **60 min** |

### Tier 2 (Computer Based Test)
| Paper | Marks | Time |
|-------|-------|------|
| Paper 1 (Quant + English + Reasoning) | 390 | 135 min |
| Paper 2 (Statistics) - For JSO only | 200 | 120 min |
| Paper 3 (General Studies - Finance) | 200 | 120 min |

### 📚 Detailed Syllabus

#### General Intelligence & Reasoning
- Analogies, Classification, Series
- Coding-Decoding, Puzzles
- Blood Relations, Directions
- Mirror/Water Images, Paper Folding
- Statement & Conclusions

#### Quantitative Aptitude
- Number System, HCF/LCM
- Percentages, Profit/Loss
- SI/CI, Time & Work
- Speed & Distance, Mensuration
- Algebra, Geometry, Trigonometry

#### English Language
- Vocabulary (Synonyms, Antonyms)
- Grammar (Error Spotting)
- Reading Comprehension
- One Word Substitution
- Idioms & Phrases

#### General Awareness
- Current Affairs (Last 6 months)
- Static GK (History, Geography)
- Indian Polity & Constitution
- Science & Technology
- Economics & Finance
`,
        externalLink: "https://ssc.nic.in",
        location: "All India",
        deadline: null,
        minQualification: "Graduation",
        tags: ["ssc cgl", "syllabus", "tier 1", "tier 2"],
        postedBy: 1,
        postedAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        viewCount: 42000
    },

    // ================== ADMISSION ==================
    {
        title: "JEE Main 2026 Notification - NTA",
        slug: "jee-main-2026-notification",
        type: "admission",
        category: "Education",
        organization: "National Testing Agency (NTA)",
        content: `## 🎓 JEE Main 2026 Notification Released

National Testing Agency has released the notification for JEE Main 2026 Examination.

### 📅 Important Dates
| Session | Apply Date | Exam Date |
|---------|------------|-----------|
| Session 1 | Nov 2025 | 22-31 Jan 2026 |
| Session 2 | Feb 2026 | 01-15 Apr 2026 |

### 💰 Application Fee
| Category | Paper 1 (BE/BTech) | Paper 2 (BArch) | Both |
|----------|-------------------|-----------------|------|
| General (Male) | ₹1000 | ₹1000 | ₹1800 |
| General (Female) | ₹800 | ₹800 | ₹1400 |
| SC/ST/PwD | ₹500 | ₹500 | ₹900 |

### 📚 Eligibility
- **Education:** 12th Pass with PCM (75% for General, 65% for SC/ST)
- **Age:** No age limit
- **Attempts:** 3 consecutive years

### 📊 Exam Pattern (Paper 1 - BE/BTech)
| Subject | Questions | Marks |
|---------|-----------|-------|
| Physics | 30 (20+10) | 100 |
| Chemistry | 30 (20+10) | 100 |
| Mathematics | 30 (20+10) | 100 |
| **Total** | **90** | **300** |

> Section A: 20 MCQs (Mandatory)
> Section B: 10 Numerical (Answer any 5)
`,
        externalLink: "https://jeemain.nta.nic.in",
        location: "All India",
        deadline: new Date("2026-01-15"),
        minQualification: "12th Pass (PCM)",
        applicationFee: "₹1000",
        tags: ["jee main", "nta", "engineering", "admission", "iit"],
        postedBy: 1,
        postedAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        viewCount: 85000
    }
];

async function seedAllData() {
    if (!COSMOS_CONNECTION_STRING) {
        console.error('❌ COSMOS_CONNECTION_STRING not set');
        console.log('Usage: COSMOS_CONNECTION_STRING="your-connection-string" npx tsx scripts/seed-all-data.ts');
        process.exit(1);
    }

    const client = new MongoClient(COSMOS_CONNECTION_STRING, {
        retryWrites: false,
    });

    try {
        await client.connect();
        console.log('✅ Connected to Cosmos DB\n');

        const db = client.db(DATABASE_NAME);
        const announcements = db.collection('announcements');

        let inserted = 0;
        let updated = 0;

        for (const data of allSampleData) {
            const existing = await announcements.findOne({ slug: data.slug });
            if (existing) {
                await announcements.updateOne({ slug: data.slug }, { $set: { ...data, updatedAt: new Date() } });
                console.log(`🔄 Updated: ${data.type.toUpperCase()} - ${data.title}`);
                updated++;
            } else {
                await announcements.insertOne(data);
                console.log(`✨ Inserted: ${data.type.toUpperCase()} - ${data.title}`);
                inserted++;
            }
        }

        const count = await announcements.countDocuments();
        console.log('\n' + '='.repeat(50));
        console.log(`📊 Summary:`);
        console.log(`   - Inserted: ${inserted}`);
        console.log(`   - Updated: ${updated}`);
        console.log(`   - Total in database: ${count}`);
        console.log('='.repeat(50));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('\n✅ Connection closed');
    }
}

seedAllData();
