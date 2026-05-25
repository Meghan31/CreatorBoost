import { Response } from 'express';
import { google } from 'googleapis';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authenticate';
import { createSyncNotification, checkAndCreateMilestoneNotifications } from '../services/notifications.service';

function buildOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.API_URL}/api/v1/youtube/callback`,
  );
}

const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
];

/** Returns the Google OAuth URL for the frontend to redirect to. */
export async function getConnectUrl(req: AuthRequest, res: Response): Promise<void> {
  const oauth2 = buildOAuth2Client();
  const state = Buffer.from(JSON.stringify({ userId: req.userId })).toString('base64url');
  const url = oauth2.generateAuthUrl({
    access_type: 'offline',
    scope: YOUTUBE_SCOPES,
    prompt: 'consent',
    state,
  });
  res.json({ url });
}

export async function youtubeCallback(req: AuthRequest, res: Response): Promise<void> {
  const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';
  try {
    const { code, state, error } = req.query as Record<string, string>;

    if (error || !code || !state) {
      res.redirect(`${FRONTEND}/dashboard?youtube=error`);
      return;
    }

    const { userId } = JSON.parse(Buffer.from(state, 'base64url').toString());
    const oauth2 = buildOAuth2Client();
    const { tokens } = await oauth2.getToken(code);
    oauth2.setCredentials(tokens);

    // Fetch channel info
    const yt = google.youtube({ version: 'v3', auth: oauth2 });
    const channelRes = await yt.channels.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      mine: true,
    });

    const ch = channelRes.data.items?.[0];
    if (!ch) {
      res.redirect(`${FRONTEND}/dashboard?youtube=no_channel`);
      return;
    }

    const channelId  = ch.id!;
    const title      = ch.snippet?.title ?? '';
    const handle     = ch.snippet?.customUrl ?? '';
    const avatar     = ch.snippet?.thumbnails?.default?.url ?? '';
    const banner     = ch.snippet?.thumbnails?.high?.url ?? null;
    const subs       = Number(ch.statistics?.subscriberCount ?? 0);
    const views      = Number(ch.statistics?.viewCount ?? 0);
    const videoCount = Number(ch.statistics?.videoCount ?? 0);

    // Upsert youtube_channels
    const { rows } = await pool.query(
      `INSERT INTO youtube_channels
         (user_id, youtube_channel_id, channel_name, handle,
          profile_image_url, banner_image_url,
          subscriber_count, view_count, video_count,
          access_token, refresh_token, token_expires_at,
          last_synced_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
               NOW() + INTERVAL '1 hour', NOW())
       ON CONFLICT (user_id, youtube_channel_id) DO UPDATE SET
         channel_name       = EXCLUDED.channel_name,
         handle             = EXCLUDED.handle,
         profile_image_url  = EXCLUDED.profile_image_url,
         banner_image_url   = EXCLUDED.banner_image_url,
         subscriber_count   = EXCLUDED.subscriber_count,
         view_count         = EXCLUDED.view_count,
         video_count        = EXCLUDED.video_count,
         access_token       = EXCLUDED.access_token,
         refresh_token      = COALESCE(EXCLUDED.refresh_token, youtube_channels.refresh_token),
         token_expires_at   = EXCLUDED.token_expires_at,
         last_synced_at     = NOW(),
         updated_at         = NOW()
       RETURNING id`,
      [userId, channelId, title, handle, avatar, banner,
       subs, views, videoCount,
       tokens.access_token, tokens.refresh_token ?? null],
    );

    // Mark user as having YouTube connected
    await pool.query(
      'UPDATE users SET has_youtube_connected = TRUE WHERE id = $1',
      [userId],
    );

    // Kick off a video sync in the background (don't await)
    syncVideos(userId, rows[0].id, oauth2).catch(console.error);

    // Insert a snapshot
    await pool.query(
      `INSERT INTO channel_snapshots
         (user_id, channel_id, snapshot_date,
          subscriber_count, view_count, video_count,
          subscriber_delta, view_delta)
       VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, 0, 0)
       ON CONFLICT (user_id, snapshot_date) DO UPDATE SET
         subscriber_count = EXCLUDED.subscriber_count,
         view_count       = EXCLUDED.view_count,
         video_count      = EXCLUDED.video_count`,
      [userId, rows[0].id, subs, views, videoCount],
    );

    res.redirect(`${FRONTEND}/dashboard?youtube=connected`);
  } catch (err) {
    console.error('youtubeCallback error:', err);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?youtube=error`);
  }
}

export async function getYouTubeStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { rows } = await pool.query(
      `SELECT youtube_channel_id, channel_name, handle,
              profile_image_url, subscriber_count, view_count,
              video_count, last_synced_at
       FROM youtube_channels WHERE user_id = $1 LIMIT 1`,
      [req.userId],
    );
    if (!rows[0]) {
      res.json({ connected: false });
      return;
    }
    res.json({ connected: true, channel: rows[0] });
  } catch (err) {
    console.error('getYouTubeStatus error:', err);
    res.status(500).json({ detail: 'Failed to get YouTube status.' });
  }
}

export async function syncYouTubeData(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM youtube_channels WHERE user_id = $1 LIMIT 1',
      [req.userId],
    );
    const channel = rows[0];
    if (!channel) {
      res.status(404).json({ detail: 'No YouTube channel connected.' });
      return;
    }

    const oauth2 = buildOAuth2Client();
    oauth2.setCredentials({
      access_token:  channel.access_token,
      refresh_token: channel.refresh_token,
    });

    // Refresh stats
    const yt = google.youtube({ version: 'v3', auth: oauth2 });
    const channelRes = await yt.channels.list({
      part: ['statistics'],
      id: [channel.youtube_channel_id],
    });
    const stats = channelRes.data.items?.[0]?.statistics;
    if (stats) {
      const subs  = Number(stats.subscriberCount ?? 0);
      const views = Number(stats.viewCount ?? 0);
      const vids  = Number(stats.videoCount ?? 0);

      await pool.query(
        `UPDATE youtube_channels SET
           subscriber_count = $1, view_count = $2,
           video_count = $3, last_synced_at = NOW()
         WHERE id = $4`,
        [subs, views, vids, channel.id],
      );

      await pool.query(
        `INSERT INTO channel_snapshots
           (user_id, channel_id, snapshot_date,
            subscriber_count, view_count, video_count,
            subscriber_delta, view_delta)
         VALUES ($1, $2, CURRENT_DATE, $3, $4, $5,
           $3 - COALESCE((SELECT subscriber_count FROM channel_snapshots
                          WHERE user_id=$1 AND snapshot_date < CURRENT_DATE
                          ORDER BY snapshot_date DESC LIMIT 1), $3),
           $4 - COALESCE((SELECT view_count FROM channel_snapshots
                          WHERE user_id=$1 AND snapshot_date < CURRENT_DATE
                          ORDER BY snapshot_date DESC LIMIT 1), $4))
         ON CONFLICT (user_id, snapshot_date) DO UPDATE SET
           subscriber_count = EXCLUDED.subscriber_count,
           view_count       = EXCLUDED.view_count,
           video_count      = EXCLUDED.video_count,
           subscriber_delta = EXCLUDED.subscriber_delta,
           view_delta       = EXCLUDED.view_delta`,
        [req.userId, channel.id, subs, views, vids],
      );
    }

    // Sync latest videos in background
    syncVideos(req.userId!, channel.id, oauth2).catch(console.error);

    res.json({ success: true, synced_at: new Date().toISOString() });
  } catch (err) {
    console.error('syncYouTubeData error:', err);
    res.status(500).json({ detail: 'Failed to sync YouTube data.' });
  }
}

/** Fetch up to 50 most recent videos and upsert into video_metrics. */
async function syncVideos(userId: number, channelId: number, oauth2: InstanceType<typeof google.auth.OAuth2>) {
  const yt = google.youtube({ version: 'v3', auth: oauth2 });

  const searchRes = await yt.search.list({
    part: ['id'],
    forMine: true,
    type: ['video'],
    maxResults: 50,
    order: 'date',
  });

  const videoIds = (searchRes.data.items ?? [])
    .map((i) => i.id?.videoId)
    .filter(Boolean) as string[];

  if (!videoIds.length) return;

  const videosRes = await yt.videos.list({
    part: ['snippet', 'statistics', 'contentDetails'],
    id: videoIds,
  });

  for (const v of videosRes.data.items ?? []) {
    const stats = v.statistics ?? {};
    const views    = Number(stats.viewCount   ?? 0);
    const likes    = Number(stats.likeCount   ?? 0);
    const comments = Number(stats.commentCount ?? 0);
    const engagement = views > 0
      ? Number(((likes + comments) / views * 100).toFixed(2))
      : 0;

    await pool.query(
      `INSERT INTO video_metrics
         (user_id, channel_id, youtube_video_id, title, thumbnail_url,
          published_at, view_count, like_count, comment_count,
          engagement_rate, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
       ON CONFLICT (user_id, youtube_video_id) DO UPDATE SET
         title           = EXCLUDED.title,
         thumbnail_url   = EXCLUDED.thumbnail_url,
         view_count      = EXCLUDED.view_count,
         like_count      = EXCLUDED.like_count,
         comment_count   = EXCLUDED.comment_count,
         engagement_rate = EXCLUDED.engagement_rate,
         updated_at      = NOW()`,
      [
        userId,
        channelId,
        v.id,
        v.snippet?.title ?? '',
        v.snippet?.thumbnails?.medium?.url ?? v.snippet?.thumbnails?.default?.url ?? '',
        v.snippet?.publishedAt ?? new Date().toISOString(),
        views, likes, comments, engagement,
      ],
    );
  }

  // Create sync notification and check milestones
  await createSyncNotification(userId, videoIds.length);

  const { rows: channelRows } = await pool.query(
    'SELECT subscriber_count FROM youtube_channels WHERE id = $1 LIMIT 1',
    [channelId],
  );
  if (channelRows[0]) {
    await checkAndCreateMilestoneNotifications(userId, channelId, Number(channelRows[0].subscriber_count));
  }
}
