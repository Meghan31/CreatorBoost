import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import {
  getConnectUrl,
  youtubeCallback,
  getYouTubeStatus,
  syncYouTubeData,
} from '../controllers/youtube.controller';

const router = Router();

// Returns the Google OAuth URL — requires auth so we know which user to attach the channel to
router.get('/connect-url', authenticate, getConnectUrl);
// /callback: Google redirects here; userId is encoded in state param (no Bearer token yet)
router.get('/callback', youtubeCallback as any);
router.get('/status',   authenticate, getYouTubeStatus);
router.post('/sync',    authenticate, syncYouTubeData);

export default router;
