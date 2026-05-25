import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { DashboardSummary, VideoMetric, GrowthResponse } from '@/types/analytics';

export const useDashboard = (days = 30) =>
  useQuery<DashboardSummary>({
    queryKey: ['dashboard', days],
    queryFn: () => api.get(`/analytics/dashboard/?days=${days}`).then(r => r.data),
    refetchInterval: 60000,
    staleTime: 30000,
  });

export const useVideos = (sort = 'views') =>
  useQuery<{ results: VideoMetric[] }>({
    queryKey: ['videos', sort],
    queryFn: () => api.get(`/analytics/videos/?sort=${sort}`).then(r => r.data),
    staleTime: 60000,
  });

export const useGrowth = (days = 30) =>
  useQuery<GrowthResponse>({
    queryKey: ['growth', days],
    queryFn: () => api.get(`/analytics/growth/?days=${days}`).then(r => r.data),
    refetchInterval: 60000,
    staleTime: 30000,
  });