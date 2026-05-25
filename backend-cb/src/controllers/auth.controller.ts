import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import {
  deleteRefreshToken,
  deleteUserRefreshTokens,
  findRefreshToken,
  findUserById,
  saveRefreshToken,
  User,
} from '../models/user.model';
import { AuthRequest } from '../middleware/authenticate';

const ACCESS_EXPIRES = '2h';
const REFRESH_EXPIRES_DAYS = 30;

function generateTokens(userId: number) {
  const access = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: ACCESS_EXPIRES,
  });

  const refreshExpiresAt = new Date();
  refreshExpiresAt.setDate(refreshExpiresAt.getDate() + REFRESH_EXPIRES_DAYS);

  const refresh = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: `${REFRESH_EXPIRES_DAYS}d`,
  });

  return { access, refresh, refreshExpiresAt };
}

function serializeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    avatar_url: user.avatar_url,
    is_onboarded: user.is_onboarded,
    has_youtube_connected: user.has_youtube_connected,
  };
}

// Called after passport.authenticate('google') succeeds
export async function googleCallback(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  if (!user) {
    res.redirect(
      `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
    );
    return;
  }

  const { access, refresh, refreshExpiresAt } = generateTokens(user.id);
  await saveRefreshToken(user.id, refresh, refreshExpiresAt);

  // Redirect to frontend callback page with tokens
  const params = new URLSearchParams({ access, refresh });
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?${params}`);
}

// POST /auth/token/refresh/
export async function refreshToken(req: Request, res: Response): Promise<void> {
  const { refresh } = req.body as { refresh?: string };
  if (!refresh) {
    res.status(400).json({ detail: 'Refresh token required.' });
    return;
  }

  // Verify JWT signature first
  let payload: { userId: number };
  try {
    payload = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET!) as { userId: number };
  } catch {
    res.status(401).json({ detail: 'Refresh token is invalid or expired.' });
    return;
  }

  // Check it exists in DB (not revoked)
  const stored = await findRefreshToken(refresh);
  if (!stored || stored.expires_at < new Date()) {
    res.status(401).json({ detail: 'Refresh token is invalid or expired.' });
    return;
  }

  // Rotate: delete old, issue new
  await deleteRefreshToken(refresh);

  const newTokens = generateTokens(payload.userId);
  await saveRefreshToken(payload.userId, newTokens.refresh, newTokens.refreshExpiresAt);

  res.json({ access: newTokens.access, refresh: newTokens.refresh });
}

// GET /auth/me
export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  const user = await findUserById(req.userId!);
  if (!user) {
    res.status(404).json({ detail: 'User not found.' });
    return;
  }
  res.json({ user: serializeUser(user) });
}

// POST /auth/logout
export async function logout(req: AuthRequest, res: Response): Promise<void> {
  const { refresh } = req.body as { refresh?: string };
  if (refresh) {
    await deleteRefreshToken(refresh);
  }
  res.json({ detail: 'Logged out successfully.' });
}

// POST /auth/logout/all  — revoke all sessions
export async function logoutAll(req: AuthRequest, res: Response): Promise<void> {
  await deleteUserRefreshTokens(req.userId!);
  res.json({ detail: 'All sessions revoked.' });
}
