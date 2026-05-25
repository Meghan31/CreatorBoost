'use client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDashboard } from '@/hooks/useAnalytics';
import { format, parseISO } from 'date-fns';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-xs">
      <p className="text-white/40 mb-1">{label}</p>
      <p className="text-white font-semibold">{Number(payload[0]?.value ?? 0).toLocaleString()} views</p>
    </div>
  );
};

export default function ViewsBarChart({ days = 30 }: { days?: number }) {
  const { data, isLoading } = useDashboard(days);

  if (isLoading) {
    return (
      <Card className="bg-white/[0.03] border-white/5 p-5">
        <Skeleton className="h-4 w-32 mb-2 bg-white/5" />
        <Skeleton className="h-3 w-24 mb-5 bg-white/5" />
        <Skeleton className="h-[200px] w-full bg-white/5 rounded-lg" />
      </Card>
    );
  }

  const snapshots = data?.subscriber_growth ?? [];

  // Build daily view-delta bars from snapshots (view_delta = views gained that day)
  const chartData = snapshots
    .slice(-14)
    .map(s => ({
      date:  s.snapshot_date ? format(parseISO(s.snapshot_date), 'MMM d') : '',
      views: Math.max(0, Number(s.view_delta ?? 0)),
    }))
    .filter(d => d.date !== '');

  if (chartData.length === 0) {
    return (
      <Card className="bg-white/[0.03] border-white/5 p-5 flex flex-col">
        <p className="text-white font-semibold text-sm mb-1">Daily Views</p>
        <p className="text-white/30 text-xs mb-4">Last {days} days</p>
        <div className="flex-1 flex items-center justify-center h-[200px]">
          <p className="text-white/20 text-sm">No data yet — sync your channel.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/[0.03] border-white/5 p-5">
      <div className="mb-5">
        <p className="text-white font-semibold text-sm">Daily Views</p>
        <p className="text-white/30 text-xs mt-0.5">Views gained per day</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false}
            interval={Math.max(0, Math.floor(chartData.length / 6) - 1)} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="views" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
