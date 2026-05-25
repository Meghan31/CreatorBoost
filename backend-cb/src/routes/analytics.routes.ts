import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { getDashboard, getVideos, getGrowth } from '../controllers/analytics.controller';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboard);
router.get('/videos',   getVideos);
router.get('/growth',   getGrowth);

export default router;
