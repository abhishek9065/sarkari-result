-- Add scraped_from column to track where jobs were scraped from
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS scraped_from VARCHAR(100);

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_announcements_scraped_from ON announcements(scraped_from);
