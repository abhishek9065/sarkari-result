import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { pool } from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrations() {
  try {
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    
    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}