import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { LucideIcon, Minus, TrendingDown, TrendingUp } from 'lucide-react';

interface StatCardProps {
	title: string;
	value: string | number;
	delta?: number;
	deltaLabel?: string;
	icon: LucideIcon;
	loading?: boolean;
	color?: 'red' | 'blue' | 'green' | 'purple';
}

const colors = {
	red: 'bg-red-500/10 text-red-400',
	blue: 'bg-blue-500/10 text-blue-400',
	green: 'bg-green-500/10 text-green-400',
	purple: 'bg-purple-500/10 text-purple-400',
};

export default function StatCard({
	title,
	value,
	delta,
	deltaLabel,
	icon: Icon,
	loading,
	color = 'red',
}: StatCardProps) {
	if (loading) {
		return (
			<Card className="bg-white/[0.03] border-white/5 p-5">
				<Skeleton className="h-4 w-24 mb-4 bg-white/5" />
				<Skeleton className="h-8 w-32 mb-2 bg-white/5" />
				<Skeleton className="h-3 w-20 bg-white/5" />
			</Card>
		);
	}

	const isPositive = delta && delta > 0;
	const isNegative = delta && delta < 0;

	return (
		<Card className="bg-white/[0.03] border-white/5 p-5 hover:bg-white/[0.05] transition-colors">
			<div className="flex items-start justify-between mb-4">
				<p className="text-white/40 text-xs font-medium uppercase tracking-wider">
					{title}
				</p>
				<div
					className={cn(
						'w-8 h-8 rounded-lg flex items-center justify-center',
						colors[color],
					)}
				>
					<Icon className="w-4 h-4" />
				</div>
			</div>

			<p className="text-white text-2xl font-bold tracking-tight mb-1.5">
				{typeof value === 'number' ? value.toLocaleString() : value}
			</p>

			{delta !== undefined && (
				<div className="flex items-center gap-1">
					{isPositive && <TrendingUp className="w-3 h-3 text-green-400" />}
					{isNegative && <TrendingDown className="w-3 h-3 text-red-400" />}
					{!isPositive && !isNegative && (
						<Minus className="w-3 h-3 text-white/30" />
					)}
					<span
						className={cn(
							'text-xs font-medium',
							isPositive
								? 'text-green-400'
								: isNegative
									? 'text-red-400'
									: 'text-white/30',
						)}
					>
						{isPositive ? '+' : ''}
						{delta?.toLocaleString()}
					</span>
					{deltaLabel && (
						<span className="text-white/30 text-xs">{deltaLabel}</span>
					)}
				</div>
			)}
		</Card>
	);
}
