'use client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { VideoMetric } from '@/types/analytics';
import { Eye, ThumbsUp, Video } from 'lucide-react';

interface Props { videos?: VideoMetric[]; loading?: boolean; }

export default function TopVideos({ videos, loading }: Props) {
  if (loading) return (
    <Card className="bg-white/[0.03] border-white/5 p-5 h-72">
      <Skeleton className="h-4 w-24 mb-5 bg-white/5" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-3 mb-3">
          <Skeleton className="w-12 h-8 rounded bg-white/5 flex-shrink-0" />
          <div className="flex-1"><Skeleton className="h-3 w-full mb-1.5 bg-white/5" /><Skeleton className="h-2.5 w-20 bg-white/5" /></div>
        </div>
      ))}
    </Card>
  );

  const list = (videos ?? []).slice(0, 5);

  if (list.length === 0) return (
    <Card className="bg-white/[0.03] border-white/5 p-5 h-72 flex flex-col">
      <p className="text-white font-semibold text-sm mb-4">Top Videos</p>
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        <Video className="w-8 h-8 text-white/10" />
        <p className="text-white/20 text-xs text-center">No videos yet — sync your channel to see top performers.</p>
      </div>
    </Card>
  );

  return (
    <Card className="bg-white/[0.03] border-white/5 p-5 h-72 flex flex-col">
      <p className="text-white font-semibold text-sm mb-4">Top Videos</p>
      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-none">
        {list.map((v, i) => (
          <div key={v.video_id} className="flex items-start gap-3 group">
            <span className="text-white/20 text-xs font-mono w-4 flex-shrink-0 mt-0.5">{String(i+1).padStart(2,'0')}</span>
            <div className="w-12 h-8 rounded bg-white/5 flex-shrink-0 overflow-hidden">
              {v.thumbnail_url ? <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-xs font-medium truncate group-hover:text-white transition-colors">{v.title}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-white/30 text-xs"><Eye className="w-2.5 h-2.5" />{v.view_count >= 1000 ? `${(v.view_count/1000).toFixed(1)}k` : v.view_count}</span>
                <span className="flex items-center gap-1 text-white/30 text-xs"><ThumbsUp className="w-2.5 h-2.5" />{v.like_count >= 1000 ? `${(v.like_count/1000).toFixed(1)}k` : v.like_count}</span>
                <span className="text-white/20 text-xs">{v.engagement_rate}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
