'use client';
import EngagementChart from '@/components/analytics/engagement-chart';
import GrowthChart from '@/components/analytics/growth-chart';
import MetricsRow from '@/components/analytics/metrics-row';
import ViewsBarChart from '@/components/analytics/views-bar-chart';
import Topbar from '@/components/layout/topbar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboard } from '@/hooks/useAnalytics';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

const PERIODS = [['7','7D'],['30','30D'],['90','90D']] as const;

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useDashboard(days);

  const handleRefresh = () => { refetch(); qc.invalidateQueries({ queryKey: ['dashboard'] }); };

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Analytics" subtitle="Deep dive into your channel performance" onRefresh={handleRefresh} />

      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-white/40 text-sm">
            Showing data for the last <span className="text-white">{days} days</span>
          </p>
          <Tabs value={String(days)} onValueChange={v => setDays(Number(v))}>
            <TabsList className="bg-white/5 border border-white/[0.06]">
              {PERIODS.map(([v, l]) => (
                <TabsTrigger key={v} value={v}
                  className="text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/30">
                  {l}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {isError ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-3">
              <p className="text-white/40 text-sm">Failed to load analytics data.</p>
              <button onClick={() => refetch()} className="text-xs text-red-400 hover:text-red-300 underline underline-offset-2">
                Try again
              </button>
            </div>
          </div>
        ) : (
          <>
            <MetricsRow />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GrowthChart data={data?.subscriber_growth} loading={isLoading} period={`Last ${days} days`} />
              <ViewsBarChart days={days} />
            </div>
            <EngagementChart />
          </>
        )}
      </div>
    </div>
  );
}
