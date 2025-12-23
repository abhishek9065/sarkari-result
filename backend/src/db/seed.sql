-- Sarkari Result Database Seed Data
-- Run this after schema.sql to populate initial announcements

-- Insert sample announcements
INSERT INTO announcements (title, slug, type, category, organization, content, external_link, location, deadline, min_qualification, age_limit, application_fee, total_posts, is_active)
VALUES 
-- JOBS
('UPSC Civil Services 2024 - IAS/IPS/IFS Recruitment', 'upsc-civil-services-2024', 'job', 'Central Government', 'Union Public Service Commission', 'Applications invited for Civil Services Examination 2024 for various Group A services including IAS, IPS, IFS.', 'https://upsc.gov.in', 'All India', '2024-03-15', 'Graduate from recognized university', '21-32 years (relaxation as per rules)', '₹100 (Exempted for SC/ST/PH/Female)', 1056, true),

('SSC CGL 2024 - Combined Graduate Level Examination', 'ssc-cgl-2024', 'job', 'Central Government', 'Staff Selection Commission', 'SSC CGL 2024 notification for recruitment to Group B and C posts in various ministries.', 'https://ssc.nic.in', 'All India', '2024-02-28', 'Bachelor Degree from recognized university', '18-27 years (relaxation as per rules)', '₹100 (Exempted for Female/SC/ST/PH)', 8000, true),

('IBPS PO 2024 - Probationary Officer Recruitment', 'ibps-po-2024', 'job', 'Banking', 'Institute of Banking Personnel Selection', 'IBPS PO XIV recruitment for Probationary Officers in participating banks.', 'https://ibps.in', 'All India', '2024-03-20', 'Graduate in any discipline', '20-30 years', '₹850 (₹175 for SC/ST/PH)', 4500, true),

('Indian Army Agniveer Rally 2024', 'indian-army-agniveer-2024', 'job', 'Defence', 'Indian Army', 'Agniveer recruitment rally for young candidates to serve in the Indian Army.', 'https://joinindianarmy.nic.in', 'Multiple States', '2024-03-10', '10th/12th Pass', '17.5-23 years', 'Nil', 25000, true),

('Railway RRB NTPC 2024 Recruitment', 'rrb-ntpc-2024', 'job', 'Railways', 'Railway Recruitment Board', 'RRB NTPC recruitment for Non-Technical Popular Categories posts.', 'https://rrbcdg.gov.in', 'All India', '2024-04-15', '12th/Graduate (post-wise)', '18-33 years', '₹500 (Refundable)', 35000, true),

('SBI PO 2024 - Probationary Officer', 'sbi-po-2024', 'job', 'Banking', 'State Bank of India', 'SBI PO 2024 recruitment for Probationary Officers.', 'https://sbi.co.in/careers', 'All India', '2024-03-25', 'Graduate in any discipline', '21-30 years', '₹750 (₹125 for SC/ST/PH)', 2000, true),

-- RESULTS
('UPSC CSE 2023 Final Result Declared', 'upsc-cse-2023-result', 'result', 'Central Government', 'UPSC', 'UPSC Civil Services Examination 2023 final result has been declared.', 'https://upsc.gov.in', 'All India', NULL, NULL, NULL, NULL, NULL, true),

('SSC CGL Tier-1 Result 2024 (Out)', 'ssc-cgl-tier1-result-2024', 'result', 'Central Government', 'Staff Selection Commission', 'SSC CGL Tier-1 2024 result declared with marks and scorecard.', 'https://ssc.nic.in', 'All India', NULL, NULL, NULL, NULL, NULL, true),

('IBPS RRB Prelims Result 2024', 'ibps-rrb-prelims-result-2024', 'result', 'Banking', 'IBPS', 'IBPS RRB Office Assistant and Officer Scale prelims result available.', 'https://ibps.in', 'All India', NULL, NULL, NULL, NULL, NULL, true),

('RRB NTPC CBT-2 Result 2024', 'rrb-ntpc-cbt2-result-2024', 'result', 'Railways', 'Railway Recruitment Board', 'RRB NTPC CBT-2 result declared for various zones.', 'https://rrbcdg.gov.in', 'All India', NULL, NULL, NULL, NULL, NULL, true),

-- ADMIT CARDS
('NEET UG 2024 Admit Card Released', 'neet-ug-2024-admit-card', 'admit-card', 'Medical', 'National Testing Agency', 'NEET UG 2024 admit card has been released. Download from official website.', 'https://neet.nta.nic.in', 'All India', '2024-05-05', NULL, NULL, NULL, NULL, true),

('SSC GD Constable Admit Card 2024', 'ssc-gd-constable-admit-2024', 'admit-card', 'Central Government', 'Staff Selection Commission', 'SSC GD Constable 2024 CBT admit card released for all regions.', 'https://ssc.nic.in', 'All India', '2024-02-20', NULL, NULL, NULL, NULL, true),

('IBPS Clerk Mains Admit Card 2024', 'ibps-clerk-mains-admit-2024', 'admit-card', 'Banking', 'IBPS', 'IBPS Clerk Mains 2024 call letter available for download.', 'https://ibps.in', 'All India', '2024-02-25', NULL, NULL, NULL, NULL, true),

-- ANSWER KEYS
('JEE Main 2024 Answer Key Released', 'jee-main-2024-answer-key', 'answer-key', 'Engineering', 'National Testing Agency', 'JEE Main 2024 Session 1 answer key released. Raise objections by deadline.', 'https://jeemain.nta.nic.in', 'All India', '2024-02-05', NULL, NULL, NULL, NULL, true),

('SSC CHSL 2024 Answer Key', 'ssc-chsl-2024-answer-key', 'answer-key', 'Central Government', 'Staff Selection Commission', 'SSC CHSL Tier-1 2024 answer key released for all shifts.', 'https://ssc.nic.in', 'All India', '2024-03-01', NULL, NULL, NULL, NULL, true),

-- ADMISSIONS
('DU Admissions 2024 - UG Programs', 'du-admissions-2024', 'admission', 'University', 'Delhi University', 'Delhi University undergraduate admissions 2024 through CUET.', 'https://admission.uod.ac.in', 'Delhi', '2024-06-30', '12th Pass (stream-wise)', '17+ years', 'Variable', NULL, true),

('JEE Main 2024 Registration', 'jee-main-2024-registration', 'admission', 'Engineering', 'National Testing Agency', 'JEE Main 2024 registration for engineering admissions.', 'https://jeemain.nta.nic.in', 'All India', '2024-01-15', '12th Pass with PCM', 'No age limit', '₹650-₹1300', NULL, true),

-- SYLLABUS
('UPSC CSE 2024 Syllabus - Prelims & Mains', 'upsc-cse-2024-syllabus', 'syllabus', 'Central Government', 'UPSC', 'Complete UPSC Civil Services 2024 syllabus for Prelims and Mains examination.', 'https://upsc.gov.in', 'All India', NULL, NULL, NULL, NULL, NULL, true),

('SSC CGL 2024 Syllabus & Exam Pattern', 'ssc-cgl-2024-syllabus', 'syllabus', 'Central Government', 'Staff Selection Commission', 'SSC CGL 2024 detailed syllabus and exam pattern for all tiers.', 'https://ssc.nic.in', 'All India', NULL, NULL, NULL, NULL, NULL, true),

('GATE 2024 Syllabus - All Subjects', 'gate-2024-syllabus', 'syllabus', 'Engineering', 'IIT Delhi', 'GATE 2024 complete syllabus for all 29 subjects.', 'https://gate2024.iisc.ac.in', 'All India', NULL, NULL, NULL, NULL, NULL, true);

-- Add some tags
INSERT INTO tags (name, slug) VALUES
('UPSC', 'upsc'),
('SSC', 'ssc'),
('Banking', 'banking'),
('Railway', 'railway'),
('Defence', 'defence'),
('NTA', 'nta'),
('JEE', 'jee'),
('NEET', 'neet'),
('GATE', 'gate'),
('State PSC', 'state-psc');

-- Link tags to announcements
INSERT INTO announcement_tags (announcement_id, tag_id)
SELECT a.id, t.id FROM announcements a, tags t 
WHERE a.slug = 'upsc-civil-services-2024' AND t.slug = 'upsc';

INSERT INTO announcement_tags (announcement_id, tag_id)
SELECT a.id, t.id FROM announcements a, tags t 
WHERE a.slug = 'ssc-cgl-2024' AND t.slug = 'ssc';

INSERT INTO announcement_tags (announcement_id, tag_id)
SELECT a.id, t.id FROM announcements a, tags t 
WHERE a.slug = 'ibps-po-2024' AND t.slug = 'banking';

INSERT INTO announcement_tags (announcement_id, tag_id)
SELECT a.id, t.id FROM announcements a, tags t 
WHERE a.slug = 'rrb-ntpc-2024' AND t.slug = 'railway';

INSERT INTO announcement_tags (announcement_id, tag_id)
SELECT a.id, t.id FROM announcements a, tags t 
WHERE a.slug = 'indian-army-agniveer-2024' AND t.slug = 'defence';
