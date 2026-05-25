'use client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useVideos } from '@/hooks/useAnalytics';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-xs space-y-1">
      <p className="text-white/40 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {Number(p.value ?? 0).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

function truncate(s: string, n = 22) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

export default function EngagementChart() {
  const { data, isLoading } = useVideos('engagement');

  if (isLoading) {
    return (
      <Card className="bg-white/[0.03] border-white/5 p-5">
        <Skeleton className="h-4 w-40 mb-2 bg-white/5" />
        <Skeleton className="h-3 w-28 mb-5 bg-white/5" />
        <Skeleton className="h-[200px] w-full bg-white/5 rounded-lg" />
      </Card>
    );
  }

  const videos = (data?.results ?? []).slice(0, 8);

  if (videos.length === 0) {
    return (
      <Card className="bg-white/[0.03] border-white/5 p-5 flex flex-col">
        <p className="text-white font-semibold text-sm mb-1">Engagement Breakdown</p>
        <p className="text-white/30 text-xs mb-4">Likes · Comments by video</p>
        <div className="flex-1 flex items-center justify-center h-[200px]">
          <p className="text-white/20 text-sm">No video data yet — sync your channel.</p>
        </div>
      </Card>
    );
  }

  // One data point per video, showing likes and comments side by side
  const chartData = videos.map(v => ({
    name:     truncate(v.title),
    likes:    Number(v.like_count ?? 0),
    comments: Number(v.comment_count ?? 0),
  }));

  return (
    <Card className="bg-white/[0.03] border-white/5 p-5">
      <div className="mb-5">
        <p className="text-white font-semibold text-sm">Engagement Breakdown</p>
        <p className="text-white/30 text-xs mt-0.5">Likes · Comments — top videos by engagement</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="likes"    name="Likes"    stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
          <Line type="monotone" dataKey="comments" name="Comments" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-3">
        {[['Likes', '#ef4444'], ['Comments', '#3b82f6']].map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-white/30 text-xs">{label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
