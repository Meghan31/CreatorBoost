import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notifications.controller';

const router = Router();
router.use(authenticate);

router.get('/', getNotifications);
router.patch('/mark-all-read', markAllNotificationsRead);  // MUST be before /:id/read
router.patch('/:id/read', markNotificationRead);

export default router;
