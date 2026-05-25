import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authenticate';

/** Return the youtube_channel row for the authed user, or null. */
async function getUserChannel(userId: number) {
  const { rows } = await pool.query(
    'SELECT * FROM youtube_channels WHERE user_id = $1 LIMIT 1',
    [userId],
  );
  return rows[0] ?? null;
}

export async function getDashboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const days = Math.min(Math.max(Number(req.query.days ?? 30), 7), 365);
    const channel = await getUserChannel(req.userId!);

    if (!channel) {
      res.json({
        total_views: 0,
        total_subscribers: 0,
        total_videos: 0,
        avg_engagement_rate: '0.00',
        top_videos: [],
        subscriber_growth: [],
        youtube_connected: false,
      });
      return;
    }

    // ── Aggregated channel stats (LEFT JOIN so result is always 1 row) ──
    const statsRow = await pool.query(
      `SELECT
         COALESCE(SUM(v.view_count), 0)       AS total_views,
         COALESCE(MAX(c.subscriber_count), 0) AS total_subscribers,
         COUNT(v.id)                          AS total_videos,
         COALESCE(AVG(v.engagement_rate), 0)  AS avg_engagement_rate
       FROM youtube_channels c
       LEFT JOIN video_metrics v ON v.channel_id = c.id
       WHERE c.id = $1`,
      [channel.id],
    );

    // ── Top 5 videos by views ─────────────────────────────────────────────
    const topVideos = await pool.query(
      `SELECT
         youtube_video_id                              AS video_id,
         title,
         COALESCE(thumbnail_url, '')                  AS thumbnail_url,
         published_at,
         COALESCE(view_count, 0)                      AS view_count,
         COALESCE(like_count, 0)                      AS like_count,
         COALESCE(comment_count, 0)                   AS comment_count,
         COALESCE(avg_view_duration, 0)               AS avg_view_duration,
         COALESCE(click_through_rate, 0)              AS click_through_rate,
         COALESCE(impressions, 0)                     AS impressions,
         COALESCE(engagement_rate, 0)                 AS engagement_rate,
         COALESCE(updated_at, created_at, NOW())      AS last_synced
       FROM video_metrics
       WHERE channel_id = $1
       ORDER BY view_count DESC
       LIMIT 5`,
      [channel.id],
    );

    // ── Subscriber growth snapshots filtered by requested period ─────────
    const growth = await pool.query(
      `SELECT
         id,
         $1::text                              AS channel_id,
         TO_CHAR(snapshot_date, 'YYYY-MM-DD') AS snapshot_date,
         COALESCE(subscriber_count, 0)        AS subscriber_count,
         COALESCE(view_count, 0)              AS view_count,
         COALESCE(video_count, 0)             AS video_count,
         COALESCE(subscriber_delta, 0)        AS subscriber_delta,
         COALESCE(view_delta, 0)              AS view_delta
       FROM channel_snapshots
       WHERE user_id = $2
         AND snapshot_date >= CURRENT_DATE - ($3 || ' days')::interval
       ORDER BY snapshot_date
       LIMIT 90`,
      [channel.youtube_channel_id, req.userId, days],
    );

    const stats = statsRow.rows[0];
    res.json({
      total_views:         Number(stats.total_views),
      total_subscribers:   Number(stats.total_subscribers),
      total_videos:        Number(stats.total_videos),
      avg_engagement_rate: Number(stats.avg_engagement_rate).toFixed(2),
      top_videos:          topVideos.rows,
      subscriber_growth:   growth.rows,
      youtube_connected:   true,
    });
  } catch (err: any) {
    console.error('getDashboard error:', err?.message ?? err);
    res.status(500).json({ detail: 'Failed to load dashboard data.', error: err?.message });
  }
}

export async function getVideos(req: AuthRequest, res: Response): Promise<void> {
  try {
    const channel = await getUserChannel(req.userId!);
    if (!channel) {
      res.json({ results: [], youtube_connected: false });
      return;
    }

    const ALLOWED_SORTS: Record<string, string> = {
      views:      'view_count DESC',
      likes:      'like_count DESC',
      comments:   'comment_count DESC',
      engagement: 'engagement_rate DESC',
      recent:     'published_at DESC',
    };
    const sortKey = String(req.query.sort ?? 'views');
    const orderBy = ALLOWED_SORTS[sortKey] ?? ALLOWED_SORTS.views;

    const { rows } = await pool.query(
      `SELECT
         youtube_video_id                              AS video_id,
         title,
         COALESCE(thumbnail_url, '')                  AS thumbnail_url,
         published_at,
         COALESCE(view_count, 0)                      AS view_count,
         COALESCE(like_count, 0)                      AS like_count,
         COALESCE(comment_count, 0)                   AS comment_count,
         COALESCE(avg_view_duration, 0)               AS avg_view_duration,
         COALESCE(click_through_rate, 0)              AS click_through_rate,
         COALESCE(impressions, 0)                     AS impressions,
         COALESCE(engagement_rate, 0)                 AS engagement_rate,
         COALESCE(updated_at, created_at, NOW())      AS last_synced
       FROM video_metrics
       WHERE channel_id = $1
       ORDER BY ${orderBy}
       LIMIT 50`,
      [channel.id],
    );

    res.json({ results: rows, youtube_connected: true });
  } catch (err: any) {
    console.error('getVideos error:', err?.message ?? err);
    res.status(500).json({ detail: 'Failed to load videos.', error: err?.message });
  }
}

export async function getGrowth(req: AuthRequest, res: Response): Promise<void> {
  try {
    const days = Math.min(Math.max(Number(req.query.days ?? 30), 7), 365);
    const channel = await getUserChannel(req.userId!);

    const { rows } = await pool.query(
      `SELECT
         id,
         (SELECT youtube_channel_id FROM youtube_channels WHERE user_id = $1 LIMIT 1) AS channel_id,
         TO_CHAR(snapshot_date, 'YYYY-MM-DD') AS snapshot_date,
         COALESCE(subscriber_count, 0)        AS subscriber_count,
         COALESCE(view_count, 0)              AS view_count,
         COALESCE(video_count, 0)             AS video_count,
         COALESCE(subscriber_delta, 0)        AS subscriber_delta,
         COALESCE(view_delta, 0)              AS view_delta,
         COALESCE(watch_time_hours, 0)        AS watch_time_hours
       FROM channel_snapshots
       WHERE user_id = $1
         AND snapshot_date >= CURRENT_DATE - ($2 || ' days')::interval
       ORDER BY snapshot_date`,
      [req.userId, days],
    );

    // Compute KPI summary from snapshots
    let kpiSummary = null;
    if (rows.length >= 2) {
      const oldest = rows[0];
      const newest = rows[rows.length - 1];

      const subGrowth    = Number(newest.subscriber_count) - Number(oldest.subscriber_count);
      const subGrowthPct = Number(oldest.subscriber_count) > 0
        ? ((subGrowth / Number(oldest.subscriber_count)) * 100).toFixed(1)
        : '0.0';

      const viewGrowth    = Number(newest.view_count) - Number(oldest.view_count);
      const viewGrowthPct = Number(oldest.view_count) > 0
        ? ((viewGrowth / Number(oldest.view_count)) * 100).toFixed(1)
        : '0.0';

      const totalWatchTime = rows.reduce((sum: number, r: any) => sum + Number(r.watch_time_hours ?? 0), 0);

      kpiSummary = {
        subscriber_growth:      subGrowth,
        subscriber_growth_pct:  subGrowthPct,
        total_view_growth:      viewGrowth,
        total_view_growth_pct:  viewGrowthPct,
        watch_time_hours:       Math.round(totalWatchTime),
        current_subscribers:    Number(newest.subscriber_count),
        current_views:          Number(newest.view_count),
      };
    } else if (channel) {
      kpiSummary = {
        subscriber_growth:      0,
        subscriber_growth_pct:  '0.0',
        total_view_growth:      0,
        total_view_growth_pct:  '0.0',
        watch_time_hours:       0,
        current_subscribers:    Number(channel.subscriber_count),
        current_views:          Number(channel.view_count),
      };
    }

    // Milestone data from channel subscriber count
    let milestones = null;
    if (channel) {
      const subs = Number(channel.subscriber_count);
      const THRESHOLDS = [10000, 25000, 50000, 100000, 250000, 500000, 1000000];
      milestones = THRESHOLDS.map(t => ({
        threshold: t,
        label:     t >= 1_000_000 ? `${t / 1_000_000}M` : `${t / 1_000}K`,
        achieved:  subs >= t,
      }));
    }

    res.json({ snapshots: rows, kpi_summary: kpiSummary, milestones });
  } catch (err: any) {
    console.error('getGrowth error:', err?.message ?? err);
    res.status(500).json({ detail: 'Failed to load growth data.', error: err?.message });
  }
}
