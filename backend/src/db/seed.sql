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

('GATE 2024 Syllabus - All Subjects', 'gate-2024-syllabus', 'syllabus', 'Engineering', 'IIT Delhi', 'GATE 2024 complete syllabus for all 29 subjects.', 'https://gate2024.iisc.ac.in', 'All India', NULL, NULL, NULL, NULL, NULL, true),

-- MORE JOBS (State PSC, Police, etc.)
('BPSC 70th Combined Competitive Exam 2024', 'bpsc-70th-cce-2024', 'job', 'State Government', 'Bihar Public Service Commission', 'BPSC 70th CCE for recruitment to various state services in Bihar.', 'https://bpsc.bih.nic.in', 'Bihar', '2024-04-30', 'Graduate from recognized university', '20-37 years', '₹600', 2000, true),

('UP Police Constable 2024', 'up-police-constable-2024', 'job', 'Police', 'Uttar Pradesh Police Recruitment Board', 'UP Police Constable recruitment for 52000+ vacancies.', 'https://uppbpb.gov.in', 'Uttar Pradesh', '2024-03-28', '12th Pass', '18-25 years', '₹400', 52000, true),

('Delhi Police Head Constable 2024', 'delhi-police-hc-2024', 'job', 'Police', 'Staff Selection Commission', 'Delhi Police Head Constable (AWO/TPO) recruitment.', 'https://ssc.nic.in', 'Delhi', '2024-03-15', '12th Pass', '18-27 years', '₹100', 1500, true),

('RBI Assistant 2024 Recruitment', 'rbi-assistant-2024', 'job', 'Banking', 'Reserve Bank of India', 'RBI Assistant recruitment for various offices across India.', 'https://rbi.org.in', 'All India', '2024-04-10', 'Graduate', '20-28 years', '₹450', 450, true),

('CISF Constable Fire 2024', 'cisf-constable-fire-2024', 'job', 'Defence', 'Central Industrial Security Force', 'CISF Constable Fire recruitment 2024.', 'https://cisfrectt.in', 'All India', '2024-04-05', '12th Pass with Science', '18-23 years', '₹100', 1130, true),

('UPPSC PCS 2024 - Combined State Services', 'uppsc-pcs-2024', 'job', 'State Government', 'Uttar Pradesh Public Service Commission', 'UPPSC Combined State/Upper Subordinate Services Exam 2024.', 'https://uppsc.up.nic.in', 'Uttar Pradesh', '2024-05-15', 'Graduate', '21-40 years', '₹125', 411, true),

('MPPSC State Service Exam 2024', 'mppsc-sse-2024', 'job', 'State Government', 'Madhya Pradesh Public Service Commission', 'MPPSC State Service Examination 2024 notification.', 'https://mppsc.nic.in', 'Madhya Pradesh', '2024-04-20', 'Graduate', '21-40 years', '₹500', 350, true),

('UGC NET December 2024', 'ugc-net-dec-2024', 'job', 'Teaching', 'National Testing Agency', 'UGC NET for JRF and Assistant Professor eligibility.', 'https://ugcnet.nta.nic.in', 'All India', '2024-05-10', 'Post Graduate', 'No age limit for AP, 30 for JRF', '₹1100', NULL, true),

-- MORE RESULTS
('IBPS PO Final Result 2024', 'ibps-po-final-result-2024', 'result', 'Banking', 'IBPS', 'IBPS PO XIV final result and provisional allotment.', 'https://ibps.in', 'All India', NULL, NULL, NULL, NULL, NULL, true),

('SBI Clerk Mains Result 2024', 'sbi-clerk-mains-result-2024', 'result', 'Banking', 'State Bank of India', 'SBI Clerk Mains result declared with marks.', 'https://sbi.co.in', 'All India', NULL, NULL, NULL, NULL, NULL, true),

('UPPSC PCS Prelims Result 2024', 'uppsc-pcs-prelims-result-2024', 'result', 'State Government', 'UPPSC', 'UPPSC PCS Preliminary examination result declared.', 'https://uppsc.up.nic.in', 'Uttar Pradesh', NULL, NULL, NULL, NULL, NULL, true),

-- MORE ADMIT CARDS
('RBI Assistant Prelims Admit Card 2024', 'rbi-assistant-admit-2024', 'admit-card', 'Banking', 'Reserve Bank of India', 'RBI Assistant Prelims call letter released.', 'https://ibpsonline.ibps.in', 'All India', '2024-04-01', NULL, NULL, NULL, NULL, true),

('UPSC CAPF AC Admit Card 2024', 'upsc-capf-admit-2024', 'admit-card', 'Defence', 'UPSC', 'UPSC CAPF Assistant Commandant admit card released.', 'https://upsc.gov.in', 'All India', '2024-03-08', NULL, NULL, NULL, NULL, true),

-- MORE ANSWER KEYS
('UPSC CSE Prelims Answer Key 2024', 'upsc-cse-prelims-answer-key-2024', 'answer-key', 'Central Government', 'UPSC', 'UPSC Civil Services Prelims 2024 answer key.', 'https://upsc.gov.in', 'All India', NULL, NULL, NULL, NULL, NULL, true),

('IBPS PO Prelims Answer Key 2024', 'ibps-po-prelims-answer-key-2024', 'answer-key', 'Banking', 'IBPS', 'IBPS PO Prelims 2024 provisional answer key.', 'https://ibps.in', 'All India', NULL, NULL, NULL, NULL, NULL, true);

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
