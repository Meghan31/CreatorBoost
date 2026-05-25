import 'dotenv/config';
import pool from '../config/db';

async function migrate() {
  console.log('Running migrations...');

  // ─────────────────────────────────────────────────────────────────────────
  // 001 — Core auth tables (users + refresh_tokens)
  // ─────────────────────────────────────────────────────────────────────────

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id                    SERIAL          PRIMARY KEY,
      email                 VARCHAR(255)    UNIQUE NOT NULL,
      username              VARCHAR(100)    UNIQUE NOT NULL,
      first_name            VARCHAR(100)    NOT NULL DEFAULT '',
      last_name             VARCHAR(100)    NOT NULL DEFAULT '',
      avatar_url            TEXT            NOT NULL DEFAULT '',
      google_id             VARCHAR(255)    UNIQUE,
      is_onboarded          BOOLEAN         NOT NULL DEFAULT FALSE,
      has_youtube_connected BOOLEAN         NOT NULL DEFAULT FALSE,
      created_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
      updated_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id          SERIAL      PRIMARY KEY,
      user_id     INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token       TEXT        UNIQUE NOT NULL,
      expires_at  TIMESTAMPTZ NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token   ON refresh_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
  `);

  // ─────────────────────────────────────────────────────────────────────────
  // 002 — ENUM types
  // ─────────────────────────────────────────────────────────────────────────

  await pool.query(`
    DO $$ BEGIN
      CREATE TYPE notification_type AS ENUM (
        'milestone', 'insight', 'alert', 'sync', 'tip'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await pool.query(`
    DO $$ BEGIN
      CREATE TYPE milestone_threshold AS ENUM (
        '1K', '5K', '10K', '25K', '50K', '100K', '250K', '500K', '1M'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // ─────────────────────────────────────────────────────────────────────────
  // 003 — youtube_channels
  //   One row per connected YouTube channel.
  //   Denormalised counts for fast dashboard header display.
  //   OAuth tokens stored here (encrypt at app layer before write).
  // ─────────────────────────────────────────────────────────────────────────

  await pool.query(`
    CREATE TABLE IF NOT EXISTS youtube_channels (
      id                  SERIAL          PRIMARY KEY,
      user_id             INTEGER         NOT NULL
                              REFERENCES users(id) ON DELETE CASCADE,

      youtube_channel_id  VARCHAR(64)     NOT NULL,
      channel_name        VARCHAR(255)    NOT NULL DEFAULT '',
      handle              VARCHAR(100),
      profile_image_url   TEXT            NOT NULL DEFAULT '',
      banner_image_url    TEXT            NOT NULL DEFAULT '',
      description         TEXT            NOT NULL DEFAULT '',
      country             VARCHAR(10),

      -- Denormalised totals — updated on every sync
      subscriber_count    BIGINT          NOT NULL DEFAULT 0,
      view_count          BIGINT          NOT NULL DEFAULT 0,
      video_count         INTEGER         NOT NULL DEFAULT 0,

      -- YouTube Data API v3 OAuth credentials (AES-256 encrypt before write)
      access_token        TEXT,
      refresh_token       TEXT,
      token_expires_at    TIMESTAMPTZ,
      youtube_scope       TEXT,

      last_synced_at      TIMESTAMPTZ,
      sync_error          TEXT,

      created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
      updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uidx_youtube_channels_user_channel
      ON youtube_channels(user_id, youtube_channel_id);

    CREATE INDEX IF NOT EXISTS idx_youtube_channels_yt_channel_id
      ON youtube_channels(youtube_channel_id);
  `);

  // ─────────────────────────────────────────────────────────────────────────
  // 004 — channel_snapshots
  //   One row per (user, date). Written daily by the sync worker.
  //   Powers: /analytics/growth/, /analytics/dashboard/ subscriber_growth array.
  //   UNIQUE(user_id, snapshot_date) enables ON CONFLICT upserts.
  // ─────────────────────────────────────────────────────────────────────────

  await pool.query(`
    CREATE TABLE IF NOT EXISTS channel_snapshots (
      id                  SERIAL          PRIMARY KEY,
      user_id             INTEGER         NOT NULL
                              REFERENCES users(id) ON DELETE CASCADE,
      channel_id          INTEGER         NOT NULL
                              REFERENCES youtube_channels(id) ON DELETE CASCADE,

      snapshot_date       DATE            NOT NULL,

      subscriber_count    BIGINT          NOT NULL DEFAULT 0,
      view_count          BIGINT          NOT NULL DEFAULT 0,
      video_count         INTEGER         NOT NULL DEFAULT 0,
      -- Stored in hours (raw YouTube minutes ÷ 60) for Growth page "Watch Time" KPI
      watch_time_hours    NUMERIC(12, 2)  NOT NULL DEFAULT 0,

      -- Pre-computed deltas vs previous snapshot (NULL on first snapshot)
      subscriber_delta    INTEGER,
      view_delta          BIGINT,

      created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uidx_channel_snapshots_user_date
      ON channel_snapshots(user_id, snapshot_date);

    CREATE INDEX IF NOT EXISTS idx_channel_snapshots_user_date_range
      ON channel_snapshots(user_id, snapshot_date DESC);
  `);

  // ─────────────────────────────────────────────────────────────────────────
  // 005 — video_metrics
  //   One row per (user, YouTube video ID). Upserted on every sync.
  //   Pre-computed engagement_rate enables indexed sorting without live calc.
  //   Covering indexes for all five ?sort= options on /analytics/videos/.
  // ─────────────────────────────────────────────────────────────────────────

  await pool.query(`
    CREATE TABLE IF NOT EXISTS video_metrics (
      id                  SERIAL          PRIMARY KEY,
      user_id             INTEGER         NOT NULL
                              REFERENCES users(id) ON DELETE CASCADE,
      channel_id          INTEGER         NOT NULL
                              REFERENCES youtube_channels(id) ON DELETE CASCADE,

      youtube_video_id    VARCHAR(64)     NOT NULL,
      title               VARCHAR(500)    NOT NULL DEFAULT '',
      description         TEXT            NOT NULL DEFAULT '',
      thumbnail_url       TEXT            NOT NULL DEFAULT '',
      published_at        TIMESTAMPTZ     NOT NULL,

      -- Core engagement metrics
      view_count          BIGINT          NOT NULL DEFAULT 0,
      like_count          INTEGER         NOT NULL DEFAULT 0,
      comment_count       INTEGER         NOT NULL DEFAULT 0,
      share_count         INTEGER         NOT NULL DEFAULT 0,

      -- Advanced YouTube Analytics API metrics
      avg_view_duration   INTEGER         NOT NULL DEFAULT 0,   -- seconds
      click_through_rate  NUMERIC(5, 2)   NOT NULL DEFAULT 0,   -- percentage
      impressions         BIGINT          NOT NULL DEFAULT 0,
      watch_time_minutes  BIGINT          NOT NULL DEFAULT 0,

      -- Pre-computed: (likes + comments + shares) / views * 100
      engagement_rate     NUMERIC(6, 2)   NOT NULL DEFAULT 0,

      last_synced         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
      created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
      updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    -- Enables ON CONFLICT upserts in the sync worker
    CREATE UNIQUE INDEX IF NOT EXISTS uidx_video_metrics_user_video
      ON video_metrics(user_id, youtube_video_id);

    -- Covering indexes for each ?sort= option (index-only scans on list queries)
    CREATE INDEX IF NOT EXISTS idx_video_metrics_user_views
      ON video_metrics(user_id, view_count DESC)
      INCLUDE (youtube_video_id, title, thumbnail_url, published_at, engagement_rate, click_through_rate);

    CREATE INDEX IF NOT EXISTS idx_video_metrics_user_likes
      ON video_metrics(user_id, like_count DESC)
      INCLUDE (youtube_video_id, title, thumbnail_url, published_at, engagement_rate);

    CREATE INDEX IF NOT EXISTS idx_video_metrics_user_comments
      ON video_metrics(user_id, comment_count DESC)
      INCLUDE (youtube_video_id, title, thumbnail_url, published_at, engagement_rate);

    CREATE INDEX IF NOT EXISTS idx_video_metrics_user_engagement
      ON video_metrics(user_id, engagement_rate DESC)
      INCLUDE (youtube_video_id, title, thumbnail_url, published_at, view_count);

    CREATE INDEX IF NOT EXISTS idx_video_metrics_user_recent
      ON video_metrics(user_id, published_at DESC)
      INCLUDE (youtube_video_id, title, thumbnail_url, view_count, engagement_rate);

    CREATE INDEX IF NOT EXISTS idx_video_metrics_channel_id
      ON video_metrics(channel_id);
  `);

  // ─────────────────────────────────────────────────────────────────────────
  // 006 — notifications
  //   Partial index on is_read = FALSE keeps unread-badge queries fast even
  //   after millions of read notifications accumulate.
  // ─────────────────────────────────────────────────────────────────────────

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id                  SERIAL              PRIMARY KEY,
      user_id             INTEGER             NOT NULL
                              REFERENCES users(id) ON DELETE CASCADE,

      type                notification_type   NOT NULL,
      title               VARCHAR(500)        NOT NULL,
      message             TEXT                NOT NULL DEFAULT '',

      is_read             BOOLEAN             NOT NULL DEFAULT FALSE,
      read_at             TIMESTAMPTZ,

      -- Optional deep-link to a specific video; SET NULL if video is deleted
      related_video_id    INTEGER
                              REFERENCES video_metrics(id) ON DELETE SET NULL,

      created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_notifications_user_created
      ON notifications(user_id, created_at DESC);

    -- Partial index — only indexes unread rows, stays compact over time.
    -- Directly serves GET /notifications/?filter=unread and the badge count.
    CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
      ON notifications(user_id, created_at DESC)
      WHERE is_read = FALSE;
  `);

  // ─────────────────────────────────────────────────────────────────────────
  // 007 — ai_cache
  //   Append-only log of AI-generated content.
  //   Read pattern: ORDER BY created_at DESC LIMIT 1 for latest per user/type.
  //   cache_type: 'summary' | 'recommendations' | 'titles'
  //   content JSONB: { text } for summary/recommendations, { titles: [] } for titles.
  //   Prune rows older than 90 days via scheduled job.
  // ─────────────────────────────────────────────────────────────────────────

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_cache (
      id                  SERIAL      PRIMARY KEY,
      user_id             INTEGER     NOT NULL
                              REFERENCES users(id) ON DELETE CASCADE,

      cache_type          VARCHAR(50) NOT NULL
                              CHECK (cache_type IN ('summary', 'recommendations', 'titles')),

      -- For 'titles' only; NULL for summary/recommendations.
      -- Stored as raw YouTube video ID string (not an FK) because the video
      -- may not yet exist in video_metrics when the request arrives.
      youtube_video_id    VARCHAR(64),

      -- Flexible JSONB payload:
      --   summary/recommendations → { "text": "..." }
      --   titles                  → { "titles": ["...", "...", "...", "...", "..."] }
      content             JSONB       NOT NULL,

      -- Token usage for cost tracking
      prompt_tokens       INTEGER,
      completion_tokens   INTEGER,
      model_used          VARCHAR(100),

      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    -- Serves: SELECT ... WHERE user_id=$1 AND cache_type=$2 ORDER BY created_at DESC LIMIT 1
    CREATE INDEX IF NOT EXISTS idx_ai_cache_user_type_created
      ON ai_cache(user_id, cache_type, created_at DESC);

    -- Serves title lookups: WHERE user_id=$1 AND cache_type='titles' AND youtube_video_id=$2
    CREATE INDEX IF NOT EXISTS idx_ai_cache_user_type_video_created
      ON ai_cache(user_id, cache_type, youtube_video_id, created_at DESC);
  `);

  // ─────────────────────────────────────────────────────────────────────────
  // 008 — milestone_achievements
  //   Records when a channel crosses a subscriber threshold.
  //   UNIQUE(channel_id, threshold) → ON CONFLICT DO NOTHING in sync worker.
  //   Triggers a 'milestone' notification row upon first insert.
  // ─────────────────────────────────────────────────────────────────────────

  await pool.query(`
    CREATE TABLE IF NOT EXISTS milestone_achievements (
      id          SERIAL              PRIMARY KEY,
      user_id     INTEGER             NOT NULL
                      REFERENCES users(id) ON DELETE CASCADE,
      channel_id  INTEGER             NOT NULL
                      REFERENCES youtube_channels(id) ON DELETE CASCADE,

      threshold   milestone_threshold NOT NULL,
      achieved_at DATE                NOT NULL,

      -- Which snapshot confirmed this (for audit/debugging)
      snapshot_id INTEGER
                      REFERENCES channel_snapshots(id) ON DELETE SET NULL,

      created_at  TIMESTAMPTZ         NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uidx_milestone_achievements_channel_threshold
      ON milestone_achievements(channel_id, threshold);

    CREATE INDEX IF NOT EXISTS idx_milestone_achievements_user_id
      ON milestone_achievements(user_id);
  `);

  // ─────────────────────────────────────────────────────────────────────────
  // 009 — Idempotent column additions (safe to run on existing DBs)
  //   Uses ADD COLUMN IF NOT EXISTS so running migrate again never breaks.
  // ─────────────────────────────────────────────────────────────────────────

  // video_metrics — analytics columns added in v2
  await pool.query(`
    ALTER TABLE video_metrics
      ADD COLUMN IF NOT EXISTS avg_view_duration  INTEGER        NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS click_through_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS impressions        BIGINT        NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS watch_time_minutes BIGINT        NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS share_count        INTEGER       NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS engagement_rate    NUMERIC(6, 2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_synced        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW();
  `);

  // channel_snapshots — watch_time_hours added in v2
  await pool.query(`
    ALTER TABLE channel_snapshots
      ADD COLUMN IF NOT EXISTS watch_time_hours NUMERIC(12, 2) NOT NULL DEFAULT 0;
  `);

  // notifications — ensure read_at column exists
  await pool.query(`
    ALTER TABLE notifications
      ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;
  `);

  // youtube_channels — ensure all columns exist
  await pool.query(`
    ALTER TABLE youtube_channels
      ADD COLUMN IF NOT EXISTS banner_image_url TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS description      TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS country          VARCHAR(10),
      ADD COLUMN IF NOT EXISTS youtube_scope    TEXT,
      ADD COLUMN IF NOT EXISTS sync_error       TEXT,
      ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW();
  `);

  console.log('All migrations complete.');
  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
