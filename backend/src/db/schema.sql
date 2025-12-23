-- Database schema for SarkariResult clone

-- Create database (run this separately if needed)
-- CREATE DATABASE sarkari;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('job', 'result', 'admit-card', 'syllabus', 'answer-key', 'admission')),
    category VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    content TEXT,
    external_link VARCHAR(1000),
    location VARCHAR(255),
    deadline DATE,
    min_qualification VARCHAR(255),
    age_limit VARCHAR(100),
    application_fee VARCHAR(100),
    total_posts INTEGER,
    posted_by INTEGER REFERENCES users(id),
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

-- Many-to-many relationship between announcements and tags
CREATE TABLE IF NOT EXISTS announcement_tags (
    announcement_id INTEGER REFERENCES announcements(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (announcement_id, tag_id)
);

-- Important dates for exams
CREATE TABLE IF NOT EXISTS important_dates (
    id SERIAL PRIMARY KEY,
    announcement_id INTEGER REFERENCES announcements(id) ON DELETE CASCADE,
    event_name VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    description TEXT
);

-- Bookmarks table for users to save announcements
CREATE TABLE IF NOT EXISTS bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    announcement_id INTEGER NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, announcement_id)
);

-- Create index for faster bookmark lookups by user
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);

-- Create indexes for better query performance
CREATE INDEX idx_announcements_type ON announcements(type);
CREATE INDEX idx_announcements_category ON announcements(category);
CREATE INDEX idx_announcements_organization ON announcements(organization);
CREATE INDEX idx_announcements_posted_at ON announcements(posted_at DESC);
CREATE INDEX idx_announcements_deadline ON announcements(deadline);
CREATE INDEX idx_announcements_slug ON announcements(slug);

-- Full text search index
CREATE INDEX idx_announcements_search ON announcements USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '') || ' ' || organization || ' ' || category));

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();