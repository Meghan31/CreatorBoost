import { useMutation, useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'

export const useChannelSummary = () => ({
  query: useQuery({
    queryKey: ['ai-summary'],
    queryFn: () => api.get('/ai/summary/').then(r => r.data),
  }),
  generate: useMutation({
    mutationFn: () => api.post('/ai/summary/').then(r => r.data),
  }),
})

export const useRecommendations = () =>
  useMutation({
    mutationFn: () => api.post('/ai/recommendations/').then(r => r.data),
  })

export const useTitleSuggestions = () =>
  useMutation({
    mutationFn: (video_id: string) =>
      api.post('/ai/titles/', { video_id }).then(r => r.data),
  })