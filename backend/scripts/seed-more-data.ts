import { MongoClient } from 'mongodb';

const COSMOS_CONNECTION_STRING = process.env.COSMOS_CONNECTION_STRING || '';
const DATABASE_NAME = process.env.COSMOS_DATABASE_NAME || 'sarkari_db';

const sampleData = [
    // Result
    {
        title: "SSC CGL Final Result 2025 [Out] - Check Merit List",
        slug: "ssc-cgl-final-result-2025",
        type: "result",
        category: "Central Government",
        organization: "Staff Selection Commission (SSC)",
        content: `## 📢 SSC CGL Final Result 2025 Declared!

Staff Selection Commission has released the **Combined Graduate Level (CGL) Final Result 2025**.

### 📊 Result Highlights
| Parameter | Details |
|-----------|---------|
| Total Vacancies | 17,727 |
| Total Selected | 17,500+ |
| Cut Off (UR) | 156.75 |
| Cut Off (OBC) | 145.50 |
| Cut Off (SC) | 132.00 |
| Cut Off (ST) | 125.50 |

### 📅 Important Dates
- **Tier 1 Exam:** March 2025
- **Tier 2 Exam:** June 2025
- **Result Date:** 10 Jan 2026

### 📝 How to Check Result?
1. Visit official website: https://ssc.nic.in
2. Click on "Results" section
3. Select "CGL 2025 Final Result"
4. Enter Roll Number and Date of Birth
5. Download Result PDF

### 🎯 Next Steps for Selected Candidates
- Document Verification will start from 20 Jan 2026
- Appointment letters expected by March 2026
`,
        externalLink: "https://ssc.nic.in",
        location: "All India",
        deadline: null,
        minQualification: "Graduation",
        totalPosts: 17727,
        tags: ["ssc cgl", "result", "central government", "graduate level"],
        postedBy: 1,
        postedAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        viewCount: 15234
    },
    // Admit Card
    {
        title: "IBPS PO Prelims Admit Card 2026 - Download Now",
        slug: "ibps-po-prelims-admit-card-2026",
        type: "admit-card",
        category: "Banking",
        organization: "Institute of Banking Personnel Selection (IBPS)",
        content: `## 📥 IBPS PO Prelims Admit Card 2026 Released!

IBPS has released the Admit Card for Probationary Officer (PO) Prelims Examination 2026.

### 📅 Exam Schedule
| Exam Date | Shift 1 | Shift 2 | Shift 3 |
|-----------|---------|---------|---------|
| 25 Jan 2026 | 9:00 AM | 12:00 PM | 3:00 PM |
| 26 Jan 2026 | 9:00 AM | 12:00 PM | 3:00 PM |
| 27 Jan 2026 | 9:00 AM | 12:00 PM | - |

### 📝 How to Download Admit Card?
1. Visit: https://ibps.in
2. Click on "CRP PO/MT XIV - Admit Card"
3. Enter Registration Number and Password
4. Download and Print Admit Card

### 📋 Documents to Carry
- Admit Card (Color Printout)
- Photo ID Proof (Aadhar/PAN/Passport)
- Recent Passport Size Photo
- COVID-19 Vaccination Certificate

### 📊 Exam Pattern
| Section | Questions | Marks | Time |
|---------|-----------|-------|------|
| English Language | 30 | 30 | 20 min |
| Quantitative Aptitude | 35 | 35 | 20 min |
| Reasoning Ability | 35 | 35 | 20 min |
| **Total** | **100** | **100** | **60 min** |
`,
        externalLink: "https://ibps.in",
        location: "All India",
        deadline: new Date("2026-01-27"),
        minQualification: "Graduation",
        totalPosts: 6000,
        tags: ["ibps po", "admit card", "banking", "prelims"],
        postedBy: 1,
        postedAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        viewCount: 8976
    },
    // Another Job
    {
        title: "Indian Railways RPF Constable Recruitment 2026",
        slug: "indian-railways-rpf-constable-2026",
        type: "job",
        category: "Railways",
        organization: "Railway Protection Force (RPF)",
        content: `## 🚂 RPF Constable Recruitment 2026

Railway Protection Force has announced recruitment for **9,000+ Constable posts**.

### 👥 Vacancy Details
| Category | Posts |
|----------|-------|
| General | 4,500 |
| OBC | 2,430 |
| SC | 1,350 |
| ST | 720 |
| **Total** | **9,000** |

### 💰 Application Fee
| Category | Fee |
|----------|-----|
| General/OBC | ₹500 |
| SC/ST/ExSM | ₹250 |
| Female | ₹250 |

### 📚 Eligibility
- **Age:** 18-25 Years
- **Education:** 10th Pass (Matriculation)
- **Physical:** As per RPF standards

### 💵 Salary: ₹21,700 - ₹69,100 (Level 3)

### 📅 Important Dates
| Event | Date |
|-------|------|
| Online Apply Start | 01 Feb 2026 |
| Last Date | 28 Feb 2026 |
| CBT Exam | April 2026 |
`,
        externalLink: "https://indianrailways.gov.in",
        location: "All India",
        deadline: new Date("2026-02-28"),
        minQualification: "10th Pass",
        ageLimit: "18-25 Years",
        applicationFee: "₹500",
        totalPosts: 9000,
        tags: ["railways", "rpf", "constable", "10th pass"],
        postedBy: 1,
        postedAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        viewCount: 12456
    },
    // Syllabus
    {
        title: "UPSC CSE Prelims Syllabus 2026 - Complete Guide",
        slug: "upsc-cse-prelims-syllabus-2026",
        type: "syllabus",
        category: "Central Government",
        organization: "Union Public Service Commission (UPSC)",
        content: `## 📖 UPSC CSE Prelims Syllabus 2026

Complete syllabus for UPSC Civil Services Preliminary Examination 2026.

### 📝 Paper 1: General Studies (GS)
1. **Current Events** - National & International importance
2. **History of India** - Indian National Movement
3. **Indian & World Geography** - Physical, Social, Economic
4. **Indian Polity & Governance** - Constitution, Political System
5. **Economic & Social Development** - Sustainable Development, Poverty
6. **Environmental Ecology** - Bio-diversity, Climate Change
7. **General Science** - Physics, Chemistry, Biology basics

### 📝 Paper 2: CSAT (Aptitude)
1. **Comprehension** - Reading & Understanding passages
2. **Interpersonal Skills** - Communication
3. **Logical Reasoning** - Analytical ability
4. **Decision Making** - Problem Solving
5. **General Mental Ability** - Basic Numeracy
6. **Data Interpretation** - Charts, Graphs, Tables

### 📊 Exam Pattern
| Paper | Questions | Marks | Duration |
|-------|-----------|-------|----------|
| GS Paper 1 | 100 | 200 | 2 Hours |
| CSAT Paper 2 | 80 | 200 | 2 Hours |

> **Note:** Paper 2 is qualifying (33% minimum). Only GS marks counted for merit.

### 📅 UPSC CSE 2026 Schedule
- **Notification:** February 2026
- **Prelims:** May 2026
- **Mains:** September 2026
- **Interview:** March 2027
`,
        externalLink: "https://upsc.gov.in",
        location: "All India",
        deadline: null,
        minQualification: "Graduation",
        tags: ["upsc", "cse", "ias", "syllabus", "civil services"],
        postedBy: 1,
        postedAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        viewCount: 25678
    },
    // Answer Key
    {
        title: "RRB NTPC CBT 2 Answer Key 2026 - Download PDF",
        slug: "rrb-ntpc-cbt2-answer-key-2026",
        type: "answer-key",
        category: "Railways",
        organization: "Railway Recruitment Board (RRB)",
        content: `## 📄 RRB NTPC CBT 2 Answer Key 2026 Released!

Railway Recruitment Board has released the provisional answer key for NTPC CBT 2 Examination.

### 📅 Key Dates
| Event | Date |
|-------|------|
| CBT 2 Exam | 05-15 Jan 2026 |
| Answer Key Released | 18 Jan 2026 |
| Objection Window | 18-22 Jan 2026 |
| Final Answer Key | 28 Jan 2026 |

### 📝 How to Check Answer Key?
1. Visit regional RRB website
2. Login with Registration Number
3. Download Question Paper + Answer Key PDF
4. Raise objections if any (₹50 per question)

### 📋 Exam Conducted For
- **Level 2:** Junior Clerk, Accounts Clerk, Typist
- **Level 3:** Junior Time Keeper, Trains Clerk
- **Level 4:** Commercial Apprentice, Station Master
- **Level 5:** Senior Commercial cum Ticket Clerk
- **Level 6:** Traffic Assistant, Goods Guard

### 📊 Expected Cut Off (Tentative)
| Category | Expected Cut Off |
|----------|------------------|
| General | 85-90 |
| OBC | 75-80 |
| SC | 65-70 |
| ST | 55-60 |
`,
        externalLink: "https://rrbcdg.gov.in",
        location: "All India",
        deadline: new Date("2026-01-22"),
        minQualification: "Graduation",
        tags: ["rrb", "ntpc", "answer key", "railways"],
        postedBy: 1,
        postedAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        viewCount: 18234
    }
];

async function seedMoreData() {
    if (!COSMOS_CONNECTION_STRING) {
        console.error('COSMOS_CONNECTION_STRING not set');
        process.exit(1);
    }

    const client = new MongoClient(COSMOS_CONNECTION_STRING, {
        retryWrites: false,
    });

    try {
        await client.connect();
        console.log('Connected to Cosmos DB');

        const db = client.db(DATABASE_NAME);
        const announcements = db.collection('announcements');

        for (const data of sampleData) {
            const existing = await announcements.findOne({ slug: data.slug });
            if (existing) {
                console.log(`Updating: ${data.title}`);
                await announcements.updateOne({ slug: data.slug }, { $set: data });
            } else {
                console.log(`Inserting: ${data.title}`);
                await announcements.insertOne(data);
            }
        }

        const count = await announcements.countDocuments();
        console.log('\nTotal announcements:', count);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

seedMoreData();
