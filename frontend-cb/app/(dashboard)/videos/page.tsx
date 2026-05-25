'use client';
import Topbar from '@/components/layout/topbar';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useVideos } from '@/hooks/useAnalytics';
import type { VideoMetric } from '@/types/analytics';
import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Eye, Video } from 'lucide-react';
import { useState } from 'react';

function engagementColor(rate: number) {
  if (rate >= 4.5) return 'text-green-400 bg-green-400/10';
  if (rate >= 3.5) return 'text-yellow-400 bg-yellow-400/10';
  return 'text-red-400 bg-red-400/10';
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function VideosPage() {
  const [sort, setSort] = useState('views');
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useVideos(sort);
  const videos: VideoMetric[] = data?.results ?? [];

  const handleRefresh = () => { refetch(); qc.invalidateQueries({ queryKey: ['videos'] }); };

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Videos" subtitle="Performance breakdown for all your videos" onRefresh={handleRefresh} />

      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-white/40 text-sm">
            {isLoading ? '—' : `${videos.length} video${videos.length !== 1 ? 's' : ''}`}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-xs">Sort by</span>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-36 bg-white/5 border-white/10 text-white text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                <SelectItem value="views">Views</SelectItem>
                <SelectItem value="likes">Likes</SelectItem>
                <SelectItem value="comments">Comments</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isError ? (
          <Card className="bg-white/[0.03] border-white/5 p-14 flex flex-col items-center gap-3">
            <p className="text-white/40 text-sm">Failed to load videos.</p>
            <button onClick={() => refetch()} className="text-xs text-red-400 hover:text-red-300 underline underline-offset-2">
              Try again
            </button>
          </Card>
        ) : (
          <Card className="bg-white/[0.03] border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['Video','Views','Likes','Comments','CTR','Engagement','Published'].map((h, i) => (
                      <th key={h} className={`text-white/25 text-[10px] font-semibold px-4 py-3 uppercase tracking-wider ${i === 0 ? 'text-left pl-5' : 'text-right'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? [...Array(6)].map((_, i) => (
                        <tr key={i} className="border-b border-white/[0.03]">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <Skeleton className="w-14 h-9 rounded bg-white/5 flex-shrink-0" />
                              <Skeleton className="h-3 w-48 bg-white/5" />
                            </div>
                          </td>
                          {[...Array(6)].map((_, j) => (
                            <td key={j} className="px-4 py-3">
                              <Skeleton className="h-3 w-10 ml-auto bg-white/5" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : videos.length === 0
                    ? (
                        <tr>
                          <td colSpan={7} className="py-16 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <Video className="w-8 h-8 text-white/10" />
                              <p className="text-white/25 text-sm">No videos synced yet.</p>
                            </div>
                          </td>
                        </tr>
                      )
                    : videos.map((v: VideoMetric) => (
                        <tr key={v.video_id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-9 rounded bg-white/5 flex-shrink-0 overflow-hidden">
                                {v.thumbnail_url
                                  ? <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" />
                                  : <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10" />}
                              </div>
                              <span className="text-white/70 text-xs font-medium group-hover:text-white transition-colors line-clamp-2 max-w-xs">
                                {v.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Eye className="w-3 h-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <span className="text-white/70 text-xs font-medium">{fmt(v.view_count)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-white/50 text-xs">{fmt(v.like_count)}</td>
                          <td className="px-4 py-3 text-right text-white/50 text-xs">{v.comment_count.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-white/50 text-xs">{v.click_through_rate}%</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${engagementColor(Number(v.engagement_rate))}`}>
                              {v.engagement_rate}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-white/25 text-xs whitespace-nowrap">
                            {formatDistanceToNow(parseISO(v.published_at), { addSuffix: true })}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
