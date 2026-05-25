export interface ChannelSnapshot {
	id: number;
	channel_id: string;
	snapshot_date: string;
	subscriber_count: number;
	view_count: number;
	video_count: number;
	subscriber_delta: number;
	view_delta: number;
}

export interface VideoMetric {
	id: number;
	video_id: string;
	title: string;
	thumbnail_url: string;
	published_at: string;
	view_count: number;
	like_count: number;
	comment_count: number;
	avg_view_duration: number;
	click_through_rate: number;
	impressions: number;
	engagement_rate: number | string;
	last_synced: string;
}

export interface DashboardSummary {
	total_views: number;
	total_subscribers: number;
	total_videos: number;
	avg_engagement_rate: number | string;
	top_videos: VideoMetric[];
	subscriber_growth: ChannelSnapshot[];
	youtube_connected: boolean;
}

export interface Notification {
  id: number;
  type: 'milestone' | 'insight' | 'alert' | 'sync' | 'tip';
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  related_video_id: string | null;
  created_at: string;
}

export interface NotificationsResponse {
  results: Notification[];
  unread_count: number;
}

export interface GrowthKpiSummary {
  subscriber_growth: number;
  subscriber_growth_pct: string;
  total_view_growth: number;
  total_view_growth_pct: string;
  watch_time_hours: number;
  current_subscribers: number;
  current_views: number;
}

export interface MilestoneData {
  threshold: number;
  label: string;
  achieved: boolean;
}

export interface GrowthResponse {
  snapshots: ChannelSnapshot[];
  kpi_summary: GrowthKpiSummary | null;
  milestones: MilestoneData[] | null;
}
