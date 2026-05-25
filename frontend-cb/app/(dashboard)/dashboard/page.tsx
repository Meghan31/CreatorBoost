'use client';
import GrowthChart from '@/components/analytics/growth-chart';
import StatCard from '@/components/analytics/stat-card';
import TopVideos from '@/components/analytics/top-videos';
import Topbar from '@/components/layout/topbar';
import { useDashboard } from '@/hooks/useAnalytics';
import api from '@/lib/axios';
import { useQueryClient } from '@tanstack/react-query';
import {
	ArrowRight,
	Eye,
	PlaySquare,
	RefreshCw,
	TrendingUp,
	Users,
	Video,
} from 'lucide-react';
import { useState } from 'react';

export default function DashboardPage() {
	const qc = useQueryClient();
	const { data, isLoading, isError, refetch } = useDashboard(30);
	const [connecting, setConnecting] = useState(false);

	const handleRefresh = () => {
		refetch();
		qc.invalidateQueries({ queryKey: ['dashboard'] });
	};

	const handleConnectYouTube = async () => {
		setConnecting(true);
		try {
			const {
				data: { url },
			} = await api.get('/youtube/connect-url');
			window.location.href = url;
		} catch {
			setConnecting(false);
		}
	};

	if (isError)
		return (
			<div className="flex flex-col flex-1">
				<Topbar
					title="Dashboard"
					subtitle="Your channel performance at a glance"
					onRefresh={handleRefresh}
				/>
				<div className="flex flex-1 items-center justify-center">
					<div className="text-center space-y-3">
						<p className="text-white/50 text-sm">
							Failed to load dashboard data.
						</p>
						<button
							onClick={() => refetch()}
							className="text-xs text-red-400 hover:text-red-300 underline underline-offset-2"
						>
							Try again
						</button>
					</div>
				</div>
			</div>
		);

	return (
		<div className="flex flex-col flex-1">
			<Topbar
				title="Dashboard"
				subtitle="Your channel performance at a glance"
				onRefresh={handleRefresh}
			/>
			<div className="p-6 space-y-4">
				{/* Connect YouTube banner */}
				{!isLoading && data?.youtube_connected === false && (
					<div className="rounded-xl bg-gradient-to-r from-red-950/50 to-red-900/20 border border-red-500/20 p-5 flex items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
								<PlaySquare className="w-5 h-5 text-red-400" />
							</div>
							<div>
								<p className="text-white font-semibold text-sm">
									Connect your YouTube channel
								</p>
								<p className="text-white/40 text-xs mt-0.5">
									Link your channel to see real analytics, growth data, and AI
									insights
								</p>
							</div>
						</div>
						<button
							onClick={handleConnectYouTube}
							disabled={connecting}
							className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex-shrink-0"
						>
							{connecting ? (
								<>
									<RefreshCw className="w-3.5 h-3.5 animate-spin" />
									Connecting…
								</>
							) : (
								<>
									<PlaySquare className="w-3.5 h-3.5" />
									Connect YouTube
									<ArrowRight className="w-3.5 h-3.5" />
								</>
							)}
						</button>
					</div>
				)}

				<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
					<StatCard
						title="Total Views"
						value={data?.total_views ?? 0}
						icon={Eye}
						color="blue"
						loading={isLoading}
					/>
					<StatCard
						title="Subscribers"
						value={data?.total_subscribers ?? 0}
						icon={Users}
						color="green"
						loading={isLoading}
					/>
					<StatCard
						title="Total Videos"
						value={data?.total_videos ?? 0}
						icon={Video}
						color="purple"
						loading={isLoading}
					/>
					<StatCard
						title="Avg Engagement"
						value={`${data?.avg_engagement_rate ?? 0}%`}
						icon={TrendingUp}
						color="red"
						loading={isLoading}
					/>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
					<div className="lg:col-span-2">
						<GrowthChart
							data={data?.subscriber_growth}
							loading={isLoading}
							period="Last 30 days"
						/>
					</div>
					<TopVideos videos={data?.top_videos} loading={isLoading} />
				</div>
			</div>
		</div>
	);
}
