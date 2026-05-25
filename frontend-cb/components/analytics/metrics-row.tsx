'use client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboard } from '@/hooks/useAnalytics';

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function MetricsRow() {
  const { data, isLoading } = useDashboard(30);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="bg-white/[0.03] border-white/5 px-4 py-3">
            <Skeleton className="h-3 w-20 mb-2 bg-white/5" />
            <Skeleton className="h-6 w-16 mb-2 bg-white/5" />
            <Skeleton className="h-3 w-12 bg-white/5" />
          </Card>
        ))}
      </div>
    );
  }

  const videos     = data?.top_videos ?? [];
  const totalViews = Number(data?.total_views ?? 0);

  const avgCTR = videos.length
    ? (videos.reduce((s, v) => s + Number(v.click_through_rate ?? 0), 0) / videos.length).toFixed(2)
    : '0.00';

  const avgDurationSecs = videos.length
    ? Math.round(videos.reduce((s, v) => s + Number(v.avg_view_duration ?? 0), 0) / videos.length)
    : 0;

  const totalImpressions = videos.reduce((s, v) => s + Number(v.impressions ?? 0), 0);

  const metrics = [
    { label: 'Total Views',       value: fmt(totalViews) },
    { label: 'Total Impressions', value: fmt(totalImpressions) },
    { label: 'Avg Click-Through', value: `${avgCTR}%` },
    { label: 'Avg View Duration', value: avgDurationSecs > 0 ? fmtDuration(avgDurationSecs) : '—' },
    { label: 'Avg Engagement',    value: `${data?.avg_engagement_rate ?? '0.00'}%` },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
      {metrics.map(({ label, value }) => (
        <Card key={label} className="bg-white/[0.03] border-white/5 px-4 py-3">
          <p className="text-white/30 text-xs mb-2">{label}</p>
          <p className="text-white font-bold text-lg leading-none mb-1.5">{value}</p>
          <p className="text-green-400/50 text-xs">● Live data</p>
        </Card>
      ))}
    </div>
  );
}
