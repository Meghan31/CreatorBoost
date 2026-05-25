import { Pool } from 'pg';

// Strip sslmode from the URL so the Pool ssl option below takes full control.
// Supabase uses a self-signed certificate chain, so rejectUnauthorized must be false.
const rawUrl = process.env.DATABASE_URL || '';
const connectionString = rawUrl
  .replace(/([?&])sslmode=[^&]*/g, '$1')
  .replace(/[?&]$/, '');

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

export default pool;
