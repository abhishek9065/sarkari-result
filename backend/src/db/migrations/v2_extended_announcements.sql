-- Enhanced Announcements Schema for Detailed Job Postings
-- Adds JSONB column for structured job details

-- Add job_details JSONB column to store all structured data
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS job_details JSONB DEFAULT '{}';

-- Create index for efficient JSON queries
CREATE INDEX IF NOT EXISTS idx_announcements_job_details 
ON announcements USING GIN (job_details);

-- Add icon column for custom icons/emojis
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS icon VARCHAR(20) DEFAULT '';

-- Add short_description for cards
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS short_description TEXT DEFAULT '';

-- Comment explaining the job_details structure
COMMENT ON COLUMN announcements.job_details IS '
Structured JSON containing:
{
  "importantDates": [
    {"name": "Application Begin", "date": "2026-01-15"},
    {"name": "Last Date to Apply", "date": "2026-02-28"}
  ],
  "applicationFees": [
    {"category": "General / OBC / EWS", "amount": 400},
    {"category": "SC / ST", "amount": 400}
  ],
  "ageLimits": {
    "minAge": 18,
    "maxAge": 22,
    "asOnDate": "2025-07-01",
    "relaxations": [
      {"category": "OBC (UP Domicile)", "years": 3, "maxAge": 25},
      {"category": "SC / ST (UP Domicile)", "years": 5, "maxAge": 27}
    ]
  },
  "vacancies": {
    "total": 32679,
    "details": [
      {"category": "General", "male": 8500, "female": 2500, "total": 11000},
      {"category": "OBC", "male": 7000, "female": 2000, "total": 9000}
    ]
  },
  "eligibility": {
    "nationality": "Indian Citizen",
    "domicile": "Must be domicile of Uttar Pradesh",
    "education": "12th Pass (Intermediate) from any recognized board",
    "additional": ["Physical Fitness: As per UP Police standards"]
  },
  "salary": {
    "payLevel": "Level - 3",
    "payScale": "₹21,700 - ₹69,100",
    "inHandSalary": "₹25,000 - ₹30,000"
  },
  "physicalRequirements": {
    "male": {
      "height": {"general": "168 cm", "scst": "160 cm"},
      "chest": {"normal": "79 cm", "expanded": "84 cm"},
      "running": "4.8 km in 25 minutes"
    },
    "female": {
      "height": {"general": "152 cm", "scst": "147 cm"},
      "running": "2.4 km in 14 minutes"
    }
  },
  "examPattern": {
    "totalQuestions": 150,
    "totalMarks": 300,
    "duration": "2 Hours",
    "negativeMarking": "0.25 marks per wrong answer",
    "subjects": [
      {"name": "General Hindi", "questions": 37, "marks": 74},
      {"name": "General Knowledge", "questions": 38, "marks": 76}
    ]
  },
  "selectionProcess": [
    {"step": 1, "name": "Written Exam (CBT)", "description": "Computer Based Test - 150 Questions"},
    {"step": 2, "name": "Physical Standard Test", "description": "Height & Chest Measurement"}
  ],
  "howToApply": [
    "Visit the official website: https://uppbpb.gov.in",
    "Click on Apply Online link",
    "Register with valid Email ID and Mobile Number"
  ],
  "importantLinks": [
    {"label": "Apply Online", "url": "https://...", "type": "primary"},
    {"label": "Download Notification", "url": "https://...", "type": "secondary"}
  ],
  "faqs": [
    {"question": "What is the educational qualification?", "answer": "12th Pass from any recognized board"},
    {"question": "Is there negative marking?", "answer": "Yes, 0.25 marks for each wrong answer"}
  ]
}
';
