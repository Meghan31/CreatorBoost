'use client';
import { useState } from 'react';
import Topbar from '@/components/layout/topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, Sparkles, TrendingUp, Type, RefreshCw, Zap, ChevronRight } from 'lucide-react';
import { useChannelSummary, useRecommendations, useTitleSuggestions } from '@/hooks/useInsights';
import { useQueryClient } from '@tanstack/react-query';

// Safe bold-text renderer — no dangerouslySetInnerHTML
function BoldText({ text }: { text: string }) {
  return (
    <div className="space-y-3">
      {text.split('\n\n').map((para, i) => (
        <p key={i} className="text-white/60 text-sm leading-relaxed">
          {para.split(/(\*\*.*?\*\*)/).map((chunk, j) =>
            chunk.startsWith('**') && chunk.endsWith('**')
              ? <strong key={j} className="text-white font-semibold">{chunk.slice(2, -2)}</strong>
              : chunk
          )}
        </p>
      ))}
    </div>
  );
}

function InsightCard({ icon: Icon, title, badge, children, onGenerate, loading, color = 'red' }: {
  icon: React.ElementType; title: string; badge: string; children: React.ReactNode;
  onGenerate?: () => void; loading?: boolean; color?: 'red' | 'blue' | 'purple';
}) {
  const colors = { red: 'bg-red-500/10 text-red-400', blue: 'bg-blue-500/10 text-blue-400', purple: 'bg-purple-500/10 text-purple-400' };
  return (
    <Card className="bg-white/[0.03] border-white/5 p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{title}</p>
            <Badge variant="outline" className="text-white/20 border-white/10 text-xs mt-0.5">{badge}</Badge>
          </div>
        </div>
        {onGenerate && (
          <Button size="sm" variant="ghost" onClick={onGenerate} disabled={loading}
            className="text-white/30 hover:text-white text-xs h-7 px-2 gap-1.5">
            {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {loading ? 'Generating…' : 'Generate'}
          </Button>
        )}
      </div>
      {children}
    </Card>
  );
}

const DEMO_VIDEO_ID = 'dQw4w9WgXcQ';

export default function InsightsPage() {
  const qc = useQueryClient();
  const { query: summaryQuery, generate: summaryMutation } = useChannelSummary();
  const recsMutation   = useRecommendations();
  const titlesMutation = useTitleSuggestions();

  const summary         = summaryMutation.data?.summary ?? summaryQuery.data?.summary ?? null;
  const recommendations = recsMutation.data?.recommendations ?? null;
  const titleList: string[] = titlesMutation.data?.titles ?? [];

  const handleRefresh = () => qc.invalidateQueries({ queryKey: ['ai-summary'] });

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="AI Insights" subtitle="OpenAI-powered analysis and recommendations" onRefresh={handleRefresh} />

      <div className="p-6 space-y-4">
        {/* Banner */}
        <div className="rounded-xl bg-gradient-to-r from-red-950/40 to-purple-950/40 border border-red-500/10 p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">AI-Powered Creator Intelligence</p>
              <p className="text-white/40 text-xs mt-0.5">Powered by GPT-4o-mini · Connect your YouTube channel for personalised insights</p>
            </div>
          </div>
          <Badge className="bg-red-500/20 text-red-400 border-red-500/20 text-xs flex-shrink-0">Beta</Badge>
        </div>

        {/* Summary + Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InsightCard icon={Lightbulb} title="Channel Summary" badge="AI Generated" color="red"
            onGenerate={() => summaryMutation.mutate()} loading={summaryMutation.isPending}>
            {summaryMutation.isPending || summaryQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-3 w-full bg-white/5" />
                <Skeleton className="h-3 w-5/6 bg-white/5" />
                <Skeleton className="h-3 w-4/6 bg-white/5" />
              </div>
            ) : summaryMutation.isError || summaryQuery.isError ? (
              <p className="text-red-400/70 text-xs">Failed to generate. Please try again.</p>
            ) : summary ? (
              <p className="text-white/60 text-sm leading-relaxed">{summary}</p>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <Lightbulb className="w-8 h-8 text-white/10" />
                <p className="text-white/20 text-xs">Click Generate to analyse your channel</p>
              </div>
            )}
          </InsightCard>

          <InsightCard icon={TrendingUp} title="Growth Recommendations" badge="Top 3 Actions" color="blue"
            onGenerate={() => recsMutation.mutate()} loading={recsMutation.isPending}>
            {recsMutation.isPending ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <Skeleton className="w-4 h-4 rounded-full bg-white/5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-full bg-white/5" />
                      <Skeleton className="h-3 w-4/5 bg-white/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recsMutation.isError ? (
              <p className="text-red-400/70 text-xs">Failed to generate. Please try again.</p>
            ) : recommendations ? (
              <BoldText text={recommendations} />
            ) : (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <TrendingUp className="w-8 h-8 text-white/10" />
                <p className="text-white/20 text-xs">Click Generate for personalised recommendations</p>
              </div>
            )}
          </InsightCard>
        </div>

        {/* Title Suggestions */}
        <InsightCard icon={Type} title="Title Suggestions" badge="SEO Optimised" color="purple"
          onGenerate={() => titlesMutation.mutate(DEMO_VIDEO_ID)} loading={titlesMutation.isPending}>
          {titlesMutation.isPending ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg bg-white/5" />)}
            </div>
          ) : titlesMutation.isError ? (
            <p className="text-red-400/70 text-xs">Failed to generate. Please try again.</p>
          ) : titleList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {titleList.map((title, i) => (
                <div key={i} className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-lg p-3 cursor-pointer transition-all group">
                  <span className="text-white/20 text-xs font-mono block mb-1.5">0{i + 1}</span>
                  <p className="text-white/60 text-xs leading-relaxed group-hover:text-white transition-colors">{title}</p>
                  <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-white/40 mt-2 transition-colors" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <Type className="w-8 h-8 text-white/10" />
              <p className="text-white/20 text-xs">Generate AI-optimised title variations for your top video</p>
            </div>
          )}
        </InsightCard>
      </div>
    </div>
  );
}
