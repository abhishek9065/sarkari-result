-- V2 Migration: User Profiles and Analytics
-- Run this migration to add V2 features

-- User Profiles table for saved preferences
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Preference arrays
    preferred_categories TEXT[] DEFAULT '{}',
    preferred_qualifications TEXT[] DEFAULT '{}',
    preferred_locations TEXT[] DEFAULT '{}',
    preferred_organizations TEXT[] DEFAULT '{}',
    
    -- Personal info for matching
    age_group VARCHAR(50),  -- '18-25', '25-30', '30-35', '35-40', '40+'
    education_level VARCHAR(100),  -- '10th', '12th', 'Graduate', 'Post-Graduate', 'PhD'
    experience_years INTEGER DEFAULT 0,
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    notification_frequency VARCHAR(20) DEFAULT 'daily',  -- 'instant', 'daily', 'weekly'
    
    -- Profile completion
    profile_complete BOOLEAN DEFAULT false,
    onboarding_completed BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast user lookup
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Analytics events table for tracking
CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,  -- 'view', 'apply', 'bookmark', 'search', 'login'
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    announcement_id INTEGER REFERENCES announcements(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_announcement_id ON analytics_events(announcement_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at DESC);

-- Job recommendations cache for performance
CREATE TABLE IF NOT EXISTS job_recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    announcement_id INTEGER NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    match_score DECIMAL(5,2) NOT NULL,  -- 0.00 to 100.00
    match_reasons JSONB DEFAULT '{}',  -- {"category": 40, "qualification": 30, ...}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 day'),
    UNIQUE(user_id, announcement_id)
);

CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON job_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_score ON job_recommendations(match_score DESC);

-- Trigger for profile updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create profile when user registers
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_profile_on_user_insert
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();
