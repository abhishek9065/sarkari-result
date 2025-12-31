-- Insert UP Police Constable 2026 Job
INSERT INTO announcements (
    title, 
    slug, 
    type, 
    category, 
    organization, 
    total_posts, 
    deadline, 
    application_fee, 
    min_qualification, 
    age_limit, 
    is_active, 
    posted_at
) VALUES (
    'UP Police Constable Recruitment 2026',
    'up-police-constable-2026',
    'job',
    'State Police',
    'UPPRPB',
    32679,
    '2026-02-28',
    '₹400',
    '12th Pass',
    '18-25 Years',
    true,
    NOW()
) ON CONFLICT (slug) DO NOTHING;
