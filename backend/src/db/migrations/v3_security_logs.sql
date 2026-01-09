-- Create security_logs table for audit and rate limit tracking
CREATE TABLE IF NOT EXISTS security_logs (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'rate_limit', 'auth_failure', 'suspicious_activity'
    endpoint VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip ON security_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_logs_type ON security_logs(event_type);
