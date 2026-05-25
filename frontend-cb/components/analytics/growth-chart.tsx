'use client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import type { ChannelSnapshot } from '@/types/analytics';

interface Props { data?: ChannelSnapshot[]; loading?: boolean; period?: string; }

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; payload: { subscriber_delta: number } }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-xs">
      <p className="text-white/40 mb-1">{label}</p>
      <p className="text-white font-semibold">{payload[0]?.value?.toLocaleString()} subscribers</p>
      {payload[0]?.payload?.subscriber_delta !== 0 && (
        <p className={payload[0]?.payload?.subscriber_delta > 0 ? 'text-green-400' : 'text-red-400'}>
          {payload[0]?.payload?.subscriber_delta > 0 ? '+' : ''}{payload[0]?.payload?.subscriber_delta?.toLocaleString()} today
        </p>
      )}
    </div>
  );
};

export default function GrowthChart({ data = [], loading, period = 'Last 30 days' }: Props) {
  if (loading) return (
    <Card className="bg-white/[0.03] border-white/5 p-5 h-72">
      <Skeleton className="h-4 w-36 mb-6 bg-white/5" />
      <Skeleton className="h-48 w-full bg-white/5 rounded-lg" />
    </Card>
  );

  const chartData = data.map(s => ({
    date: format(parseISO(s.snapshot_date), 'MMM d'),
    subscribers: s.subscriber_count,
    subscriber_delta: s.subscriber_delta,
  }));

  if (chartData.length === 0) return (
    <Card className="bg-white/[0.03] border-white/5 p-5 h-72 flex flex-col">
      <p className="text-white font-semibold text-sm mb-1">Subscriber Growth</p>
      <p className="text-white/30 text-xs mb-4">{period}</p>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-white/20 text-sm">No data yet — sync your YouTube channel to see growth.</p>
      </div>
    </Card>
  );

  return (
    <Card className="bg-white/[0.03] border-white/5 p-5 h-72">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-white font-semibold text-sm">Subscriber Growth</p>
          <p className="text-white/30 text-xs mt-0.5">{period}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-white/30 text-xs">Subscribers</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="subGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
          <Area type="monotone" dataKey="subscribers" stroke="#ef4444" strokeWidth={2} fill="url(#subGradient)" dot={false} activeDot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
