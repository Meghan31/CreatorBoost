import pool from '../config/db';

type NotificationType = 'milestone' | 'insight' | 'alert' | 'sync' | 'tip';

export async function createNotification(
  userId: number,
  type: NotificationType,
  title: string,
  message: string,
  relatedVideoId?: string,
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, related_video_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, type, title, message, relatedVideoId ?? null],
    );
  } catch (err) {
    console.error('createNotification error:', err);
  }
}

export async function checkAndCreateMilestoneNotifications(
  userId: number,
  channelId: number,
  currentSubs: number,
): Promise<void> {
  const MILESTONES = [1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];

  for (const threshold of MILESTONES) {
    if (currentSubs >= threshold) {
      const label = threshold >= 1000000
        ? `${threshold / 1000000}M`
        : `${threshold / 1000}K`;

      // Check if we already notified for this milestone
      const { rows } = await pool.query(
        `SELECT id FROM notifications
         WHERE user_id = $1 AND type = 'milestone'
           AND title LIKE $2
         LIMIT 1`,
        [userId, `%${label}%`],
      );

      if (rows.length === 0) {
        await createNotification(
          userId,
          'milestone',
          `${label} Subscribers Milestone!`,
          `Congratulations! Your channel just crossed ${label} subscribers. Keep up the amazing work — your content is resonating with your audience!`,
        );
      }
    }
  }
}

export async function createSyncNotification(userId: number, videoCount: number): Promise<void> {
  await createNotification(
    userId,
    'sync',
    'YouTube Data Synced',
    `Successfully synced ${videoCount} videos and updated your channel statistics. All dashboards are now up to date.`,
  );
}
