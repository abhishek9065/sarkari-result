import { MongoClient } from 'mongodb';

const COSMOS_CONNECTION_STRING = process.env.COSMOS_CONNECTION_STRING || '';
const DATABASE_NAME = process.env.COSMOS_DATABASE_NAME || 'sarkari_db';

const upPoliceData = {
    title: "UP Police Constable Recruitment 2026",
    slug: "up-police-constable-recruitment-2026",
    type: "job",
    category: "State Government",
    organization: "Uttar Pradesh Police Recruitment and Promotion Board (UPPRPB)",
    content: `## 🚔 UP Police Constable Recruitment 2026

Uttar Pradesh Police Recruitment and Promotion Board (UPPRPB) has released the notification for **32,679 Constable posts** in UP Police.

### 📅 Important Dates
| Event | Date |
|-------|------|
| Application Begin | 15 Jan 2026 |
| Last Date to Apply | 28 Feb 2026 |
| Last Date Fee Payment | 28 Feb 2026 |
| Exam Date | 15 May 2026 |
| Admit Card Available | 01 May 2026 |

### 💰 Application Fee
| Category | Fee |
|----------|-----|
| General / OBC / EWS | ₹400 |
| SC / ST | ₹400 |
| PH (Divyang) | ₹400 |
| **Payment Mode** | Online (Debit Card / Credit Card / Net Banking / UPI) |

### 👤 Age Limits (As on 01 July 2025)
- **Minimum Age:** 18 Years
- **Maximum Age:** 22 Years

#### Age Relaxation:
| Category | Relaxation | Max Age |
|----------|------------|---------|
| OBC (UP Domicile) | 3 Years | 25 Years |
| SC / ST (UP Domicile) | 5 Years | 27 Years |
| PH (General) | 15 Years | 37 Years |
| PH (OBC) | 18 Years | 40 Years |
| PH (SC/ST) | 20 Years | 42 Years |

### 📊 Category-wise Vacancy Details
| Category | Male | Female | Total |
|----------|------|--------|-------|
| General | 8,500 | 2,500 | 11,000 |
| OBC | 7,000 | 2,000 | 9,000 |
| SC | 5,500 | 1,500 | 7,000 |
| ST | 600 | 200 | 800 |
| EWS | 3,500 | 1,379 | 4,879 |
| **Total** | **25,100** | **7,579** | **32,679** |

### 📚 Eligibility Criteria
- **Nationality:** Indian Citizen
- **Domicile:** Must be domicile of Uttar Pradesh
- **Education:** 12th Pass (Intermediate) from any recognized board
- **Age:** 18 to 22 years (relaxation as per rules)
- **Physical Fitness:** As per UP Police standards

### 💵 UP Police Constable Salary 2026
| Parameter | Details |
|-----------|---------|
| Pay Level | Level - 3 |
| Pay Scale | ₹21,700 - ₹69,100 |
| In-Hand Salary | ₹25,000 - ₹30,000 |

### 🏃 Physical Eligibility 2026

#### 👨 Male Candidates
- Height (General): 168 cm
- Height (SC/ST): 160 cm
- Chest (Normal): 79 cm
- Chest (Expanded): 84 cm
- Running: 4.8 km in 25 minutes

#### 👩 Female Candidates
- Height (General): 152 cm
- Height (SC/ST): 147 cm
- Running: 2.4 km in 14 minutes

### 📝 Exam Pattern 2026
| Subject | Questions | Marks |
|---------|-----------|-------|
| General Hindi | 37 | 74 |
| General Knowledge / Current Affairs | 38 | 76 |
| Numerical Ability | 38 | 76 |
| Mental Aptitude / IQ / Reasoning | 37 | 74 |
| **Total** | **150** | **300** |

> ⚠️ **Note:** Negative Marking: 0.25 marks for each wrong answer. Time: 2 Hours.

### 🎯 Selection Process
1. **Written Exam (CBT)** - Computer Based Test - 150 Questions, 300 Marks, 2 Hours
2. **Physical Standard Test (PST)** - Height & Chest Measurement
3. **Physical Efficiency Test (PET)** - Running Test
4. **Document Verification** - Original Documents Verification
5. **Medical Examination** - Medical Fitness Test
6. **Final Merit List** - Based on Written Exam Marks

### 📝 How to Apply Online?
1. Visit the official website: https://uppbpb.gov.in
2. Click on "Apply Online" link for UP Police Constable 2026
3. Register with valid Email ID and Mobile Number
4. Fill the application form with correct details
5. Upload Photo, Signature, and Documents
6. Pay the application fee online
7. Submit the form and take printout for future reference
`,
    externalLink: "https://uppbpb.gov.in",
    location: "Uttar Pradesh",
    deadline: new Date("2026-02-28"),
    minQualification: "12th Pass (Intermediate)",
    ageLimit: "18-22 Years",
    applicationFee: "₹400",
    totalPosts: 32679,
    tags: ["up police", "constable", "police recruitment", "uttar pradesh", "state government", "12th pass"],
    postedBy: 1,
    postedAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    viewCount: 0,
    jobDetails: {
        applyLink: "https://uppbpb.gov.in",
        notificationLink: "https://uppbpb.gov.in",
        officialWebsite: "https://uppbpb.gov.in",
        importantDates: {
            applicationBegin: "15 Jan 2026",
            lastDateToApply: "28 Feb 2026",
            examDate: "15 May 2026",
            admitCardDate: "01 May 2026"
        },
        vacancy: {
            total: 32679,
            male: 25100,
            female: 7579
        },
        salary: {
            payLevel: "Level - 3",
            payScale: "₹21,700 - ₹69,100",
            inHandSalary: "₹25,000 - ₹30,000"
        }
    }
};

async function seedDatabase() {
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

        // Check if already exists
        const existing = await announcements.findOne({ slug: upPoliceData.slug });
        if (existing) {
            console.log('UP Police recruitment already exists, updating...');
            await announcements.updateOne(
                { slug: upPoliceData.slug },
                { $set: { ...upPoliceData, updatedAt: new Date() } }
            );
            console.log('Updated successfully!');
        } else {
            const result = await announcements.insertOne(upPoliceData);
            console.log('Inserted UP Police recruitment with ID:', result.insertedId);
        }

        // Show count
        const count = await announcements.countDocuments();
        console.log('Total announcements in database:', count);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

seedDatabase();
