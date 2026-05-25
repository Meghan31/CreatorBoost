import Sidebar from '@/components/layout/sidebar';

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-[#080808] text-white">
			<Sidebar />
			<main className="ml-60 min-h-screen flex flex-col">{children}</main>
		</div>
	);
}
