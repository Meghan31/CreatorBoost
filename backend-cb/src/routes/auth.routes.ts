import { Router } from 'express';
import passport from 'passport';
import {
  getMe,
  googleCallback,
  logout,
  logoutAll,
  refreshToken,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Initiate Google OAuth flow
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  }),
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`,
  }),
  googleCallback,
);

// Token refresh
router.post('/token/refresh/', refreshToken);

// Current user
router.get('/me', authenticate, getMe);

// Logout
router.post('/logout', authenticate, logout);
router.post('/logout/all', authenticate, logoutAll);

export default router;
