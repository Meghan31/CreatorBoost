import pool from '../config/db';

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  google_id: string | null;
  is_onboarded: boolean;
  has_youtube_connected: boolean;
}

interface GoogleProfile {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
}

export async function findOrCreateGoogleUser(profile: GoogleProfile): Promise<User> {
  const { googleId, email, firstName, lastName, avatarUrl } = profile;

  // Try to find existing user by google_id or email
  const existing = await pool.query<User>(
    'SELECT * FROM users WHERE google_id = $1 OR email = $2 LIMIT 1',
    [googleId, email],
  );

  if (existing.rows.length > 0) {
    const user = existing.rows[0];
    // Update google_id if missing (user previously registered by email)
    if (!user.google_id) {
      const updated = await pool.query<User>(
        'UPDATE users SET google_id = $1, avatar_url = $2 WHERE id = $3 RETURNING *',
        [googleId, avatarUrl || user.avatar_url, user.id],
      );
      return updated.rows[0];
    }
    return user;
  }

  // Generate username from email
  const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
  const username = await ensureUniqueUsername(baseUsername);

  const result = await pool.query<User>(
    `INSERT INTO users (email, username, first_name, last_name, avatar_url, google_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [email, username, firstName, lastName, avatarUrl, googleId],
  );

  return result.rows[0];
}

async function ensureUniqueUsername(base: string): Promise<string> {
  let username = base;
  let counter = 1;

  while (true) {
    const result = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) return username;
    username = `${base}${counter++}`;
  }
}

export async function findUserById(id: number): Promise<User | null> {
  const result = await pool.query<User>('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function saveRefreshToken(userId: number, token: string, expiresAt: Date): Promise<void> {
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt],
  );
}

export async function findRefreshToken(token: string): Promise<{ user_id: number; expires_at: Date } | null> {
  const result = await pool.query<{ user_id: number; expires_at: Date }>(
    'SELECT user_id, expires_at FROM refresh_tokens WHERE token = $1',
    [token],
  );
  return result.rows[0] || null;
}

export async function deleteRefreshToken(token: string): Promise<void> {
  await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
}

export async function deleteUserRefreshTokens(userId: number): Promise<void> {
  await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
}
