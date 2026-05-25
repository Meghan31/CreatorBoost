'use client';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Inter } from 'next/font/google';
import { useState } from 'react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000,
						retry: 1,
					},
				},
			}),
	);

	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className} suppressHydrationWarning>
				<QueryClientProvider client={queryClient}>
					<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
						<TooltipProvider>{children}</TooltipProvider>
					</ThemeProvider>
				</QueryClientProvider>
			</body>
		</html>
	);
}
