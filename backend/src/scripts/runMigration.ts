import { pool } from '../db.js';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    try {
        const sqlPath = path.join(process.cwd(), 'src/db/migrations/add_up_police_job.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration...');
        await pool.query(sql);
        console.log('Migration successful: UP Police job added.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
