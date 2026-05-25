'use client';
import { useState } from 'react';
import Topbar from '@/components/layout/topbar';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Users, Eye, Loader2 } from 'lucide-react';
import { useGrowth } from '@/hooks/useAnalytics';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-xs space-y-1">
      <p className="text-white/40 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="font-medium" style={{ color: p.color }}>
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function GrowthPage() {
  const [days, setDays] = useState(30);
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useGrowth(days);

  const handleRefresh = () => {
    refetch();
    qc.invalidateQueries({ queryKey: ['growth'] });
  };

  const snapshots = data?.snapshots ?? [];
  const kpi = data?.kpi_summary;
  const milestones = data?.milestones ?? [];
  const hasData = snapshots.length > 0;

  const chartData = snapshots.map(s => ({
    date: format(new Date(s.snapshot_date), 'MMM d'),
    subscribers: s.subscriber_count,
    views: s.view_count,
  }));

  const barData = chartData.slice(-Math.min(14, days));

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Growth" subtitle="Track your channel growth over time" onRefresh={handleRefresh} />

      <div className="p-6 space-y-4">

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-white/40 text-sm">
            Showing <span className="text-white">{days}-day</span> growth trend
            {hasData && <span className="ml-2 text-green-400/60 text-xs">● Live data</span>}
          </p>
          <Tabs value={String(days)} onValueChange={v => setDays(Number(v))}>
            <TabsList className="bg-white/5 border border-white/[0.06]">
              {[['7', '7D'], ['30', '30D'], ['90', '90D']].map(([v, l]) => (
                <TabsTrigger key={v} value={v}
                  className="text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/30">
                  {l}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
          </div>
        )}

        {!isLoading && (
          <>
            {/* KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <Card className="bg-white/[0.03] border-white/5 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/30 text-xs">Subscriber Growth</p>
                  <Users className="w-3.5 h-3.5 text-green-400" />
                </div>
                <p className="text-white font-bold text-xl mb-1">
                  {kpi ? (kpi.subscriber_growth >= 0 ? '+' : '') + formatNum(kpi.subscriber_growth) : '—'}
                </p>
                {kpi ? (
                  <div className="flex items-center gap-1">
                    {Number(kpi.subscriber_growth_pct) >= 0
                      ? <TrendingUp className="w-3 h-3 text-green-400" />
                      : <TrendingDown className="w-3 h-3 text-red-400" />}
                    <span className={`text-xs font-medium ${Number(kpi.subscriber_growth_pct) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {kpi.subscriber_growth_pct}% in period
                    </span>
                  </div>
                ) : <p className="text-white/20 text-xs">No data yet</p>}
              </Card>

              <Card className="bg-white/[0.03] border-white/5 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/30 text-xs">View Growth</p>
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <p className="text-white font-bold text-xl mb-1">
                  {kpi ? (kpi.total_view_growth >= 0 ? '+' : '') + formatNum(kpi.total_view_growth) : '—'}
                </p>
                {kpi ? (
                  <div className="flex items-center gap-1">
                    {Number(kpi.total_view_growth_pct) >= 0
                      ? <TrendingUp className="w-3 h-3 text-green-400" />
                      : <TrendingDown className="w-3 h-3 text-red-400" />}
                    <span className={`text-xs font-medium ${Number(kpi.total_view_growth_pct) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {kpi.total_view_growth_pct}% in period
                    </span>
                  </div>
                ) : <p className="text-white/20 text-xs">No data yet</p>}
              </Card>

              <Card className="bg-white/[0.03] border-white/5 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/30 text-xs">Current Subscribers</p>
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <p className="text-white font-bold text-xl mb-1">
                  {kpi ? formatNum(kpi.current_subscribers) : '—'}
                </p>
                <p className="text-white/30 text-xs">Total channel subscribers</p>
              </Card>

              <Card className="bg-white/[0.03] border-white/5 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/30 text-xs">Total Channel Views</p>
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <p className="text-white font-bold text-xl mb-1">
                  {kpi ? formatNum(kpi.current_views) : '—'}
                </p>
                <p className="text-white/30 text-xs">All-time views</p>
              </Card>
            </div>

            {isError && (
              <div className="text-center py-4">
                <p className="text-white/30 text-sm">
                  Could not load growth data.{' '}
                  <button onClick={() => refetch()} className="text-red-400 underline">Retry</button>
                </p>
              </div>
            )}

            {!hasData && !isError && (
              <Card className="bg-white/[0.03] border-white/5 p-8 text-center">
                <p className="text-white/30 text-sm">
                  No growth data yet. Sync your YouTube channel to start tracking.
                </p>
              </Card>
            )}

            {hasData && (
              <>
                <Card className="bg-white/[0.03] border-white/5 p-5">
                  <div className="mb-4">
                    <p className="text-white font-semibold text-sm">Subscriber Growth</p>
                    <p className="text-white/30 text-xs mt-0.5">Cumulative subscribers over {days} days</p>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false}
                        interval={Math.max(0, Math.floor(chartData.length / 6) - 1)} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false}
                        tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)' }} />
                      <Area type="monotone" dataKey="subscribers" name="Subscribers" stroke="#22c55e" strokeWidth={2}
                        fill="url(#g1)" dot={false} activeDot={{ r: 3, fill: '#22c55e', strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="bg-white/[0.03] border-white/5 p-5">
                  <div className="mb-4">
                    <p className="text-white font-semibold text-sm">View Count Over Time</p>
                    <p className="text-white/30 text-xs mt-0.5">Total views per snapshot</p>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false}
                        interval={Math.max(0, Math.floor(barData.length / 5) - 1)} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false}
                        tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Bar dataKey="views" name="Total Views" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </>
            )}

            {milestones.length > 0 && (
              <Card className="bg-white/[0.03] border-white/5 p-5">
                <p className="text-white font-semibold text-sm mb-5">Subscriber Milestones</p>
                <div className="flex items-center">
                  {milestones.slice(0, 5).map((m, i) => (
                    <div key={m.label} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mb-2 ${
                          m.achieved ? 'bg-green-500 border-green-500' : 'border-white/20 bg-transparent'
                        }`}>
                          {m.achieved && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <p className={`text-xs font-medium text-center ${m.achieved ? 'text-white' : 'text-white/30'}`}>
                          {m.label}
                        </p>
                        <p className={`text-[10px] mt-0.5 ${m.achieved ? 'text-green-400' : 'text-white/20'}`}>
                          {m.achieved ? '✓ Reached' : 'Not yet'}
                        </p>
                      </div>
                      {i < milestones.slice(0, 5).length - 1 && (
                        <div className={`h-0.5 flex-1 mx-1 ${m.achieved ? 'bg-green-500/50' : 'bg-white/5'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
