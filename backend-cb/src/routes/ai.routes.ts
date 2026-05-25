import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import {
  getChannelSummary,
  generateChannelSummary,
  generateRecommendations,
  generateTitleSuggestions,
} from '../controllers/ai.controller';

const router = Router();

router.use(authenticate);

router.get('/summary',          getChannelSummary);
router.post('/summary',         generateChannelSummary);
router.post('/recommendations', generateRecommendations);
router.post('/titles',          generateTitleSuggestions);

export default router;
