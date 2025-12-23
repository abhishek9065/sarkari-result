import { Pool } from 'pg';

import { config } from './config.js';

export const pool = new Pool({ connectionString: config.databaseUrl });

export const withClient = async <T>(fn: (client: Pool) => Promise<T>): Promise<T> => fn(pool);
