import { pool } from '../db.js';

export interface SecurityEvent {
    ip_address: string;
    event_type: 'rate_limit' | 'auth_failure' | 'suspicious_activity';
    endpoint: string;
    metadata?: any;
}

export class SecurityLogger {
    private static initialized = false;

    static async init() {
        if (this.initialized) return;

        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS security_logs (
                    id SERIAL PRIMARY KEY,
                    ip_address VARCHAR(45) NOT NULL,
                    event_type VARCHAR(50) NOT NULL,
                    endpoint VARCHAR(255),
                    metadata JSONB DEFAULT '{}',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at DESC);
                CREATE INDEX IF NOT EXISTS idx_security_logs_ip ON security_logs(ip_address);
            `);
            this.initialized = true;
            console.log('Security logs table initialized');
        } catch (error) {
            console.error('Failed to init security logs:', error);
        }
    }

    static async log(event: SecurityEvent) {
        try {
            await this.init(); // Ensure table exists

            await pool.query(
                `INSERT INTO security_logs (ip_address, event_type, endpoint, metadata)
                 VALUES ($1, $2, $3, $4)`,
                [event.ip_address, event.event_type, event.endpoint, JSON.stringify(event.metadata || {})]
            );
        } catch (error) {
            console.error('Failed to log security event:', error);
        }
    }

    static async getRecentLogs(limit = 50) {
        try {
            await this.init();
            const result = await pool.query(
                `SELECT * FROM security_logs ORDER BY created_at DESC LIMIT $1`,
                [limit]
            );
            return result.rows;
        } catch (error) {
            console.error('Failed to fetch security logs:', error);
            return [];
        }
    }
}
