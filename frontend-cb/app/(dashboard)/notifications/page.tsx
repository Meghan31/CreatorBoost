'use client';
import { useState } from 'react';
import Topbar from '@/components/layout/topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Trophy, Lightbulb, AlertCircle, RefreshCw, TrendingUp, CheckCheck, Bell, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useNotifications';
import { useQueryClient } from '@tanstack/react-query';

const typeConfig = {
  milestone: { icon: Trophy,      color: 'text-yellow-400', bg: 'bg-yellow-400/10', badge: 'Milestone' },
  insight:   { icon: Lightbulb,   color: 'text-blue-400',   bg: 'bg-blue-400/10',   badge: 'AI Insight' },
  alert:     { icon: AlertCircle, color: 'text-red-400',    bg: 'bg-red-400/10',    badge: 'Alert' },
  sync:      { icon: RefreshCw,   color: 'text-green-400',  bg: 'bg-green-400/10',  badge: 'Sync' },
  tip:       { icon: TrendingUp,  color: 'text-purple-400', bg: 'bg-purple-400/10', badge: 'Tip' },
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.results ?? [];
  const unreadCount = data?.unread_count ?? 0;
  const displayed = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications;

  const handleRefresh = () => {
    refetch();
    qc.invalidateQueries({ queryKey: ['notifications'] });
  };

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Notifications" subtitle="Stay on top of your channel activity" onRefresh={handleRefresh} />

      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {(['all', 'unread'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn('text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5',
                  filter === f ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white hover:bg-white/5')}>
                {f === 'all' ? 'All' : 'Unread'}
                {f === 'unread' && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="text-white/30 hover:text-white text-xs h-7 gap-1.5">
              {markAllRead.isPending
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <CheckCheck className="w-3.5 h-3.5" />}
              Mark all read
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
          </div>
        )}

        {isError && (
          <Card className="bg-white/[0.03] border-white/5 p-8 flex flex-col items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-400/50" />
            <p className="text-white/30 text-sm">Failed to load notifications.</p>
            <Button variant="ghost" size="sm" onClick={() => refetch()} className="text-white/30 hover:text-white text-xs">
              Retry
            </Button>
          </Card>
        )}

        {!isLoading && !isError && displayed.length === 0 && (
          <Card className="bg-white/[0.03] border-white/5 p-14 flex flex-col items-center justify-center gap-3">
            <Bell className="w-10 h-10 text-white/10" />
            <p className="text-white/25 text-sm">
              {filter === 'unread'
                ? 'All caught up! No unread notifications.'
                : 'No notifications yet. Sync your YouTube data to get started.'}
            </p>
          </Card>
        )}

        {!isLoading && !isError && displayed.length > 0 && (
          <div className="space-y-2">
            {displayed.map(n => {
              const cfg = typeConfig[n.type as keyof typeof typeConfig] ?? typeConfig.insight;
              const Icon = cfg.icon;
              return (
                <Card key={n.id}
                  onClick={() => !n.is_read && markRead.mutate(n.id)}
                  className={cn('border-white/5 p-4 transition-all hover:border-white/[0.09]',
                    n.is_read
                      ? 'bg-white/[0.02] cursor-default'
                      : 'bg-white/[0.04] border-l-2 border-l-red-500/50 cursor-pointer')}>
                  <div className="flex items-start gap-4">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5', cfg.bg)}>
                      <Icon className={cn('w-4 h-4', cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={cn('text-sm font-medium', n.is_read ? 'text-white/55' : 'text-white')}>
                            {n.title}
                          </p>
                          <Badge variant="outline" className={cn('text-xs border-0', cfg.bg, cfg.color)}>
                            {cfg.badge}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                          <span className="text-white/20 text-xs whitespace-nowrap">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <p className={cn('text-xs leading-relaxed', n.is_read ? 'text-white/25' : 'text-white/40')}>
                        {n.message}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
