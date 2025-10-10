import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

console.log('Database connection configured:', {
  hasUrl: !!(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL),
  urlPrefix: (process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || '').substring(0, 20)
});

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return { rows: result.rows };
  } finally {
    client.release();
  }
}

export default pool;

