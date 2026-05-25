import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authenticate';

export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { rows } = await pool.query(
      `SELECT id, type, title, message, is_read, read_at, related_video_id, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.userId],
    );
    const unread_count = rows.filter((n: { is_read: boolean }) => !n.is_read).length;
    res.json({ results: rows, unread_count });
  } catch (err) {
    console.error('getNotifications error:', err);
    res.status(500).json({ detail: 'Failed to load notifications.' });
  }
}

export async function markNotificationRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await pool.query(
      `UPDATE notifications SET is_read = TRUE, read_at = NOW()
       WHERE id = $1 AND user_id = $2`,
      [id, req.userId],
    );
    res.json({ success: true });
  } catch (err) {
    console.error('markNotificationRead error:', err);
    res.status(500).json({ detail: 'Failed to mark notification as read.' });
  }
}

export async function markAllNotificationsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    await pool.query(
      `UPDATE notifications SET is_read = TRUE, read_at = NOW()
       WHERE user_id = $1 AND is_read = FALSE`,
      [req.userId],
    );
    res.json({ success: true });
  } catch (err) {
    console.error('markAllNotificationsRead error:', err);
    res.status(500).json({ detail: 'Failed to mark all notifications as read.' });
  }
}
