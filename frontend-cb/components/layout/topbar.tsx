'use client';
import { Button } from '@/components/ui/button';
import { Bell, RefreshCw, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
}

export default function Topbar({ title, subtitle, onRefresh }: TopbarProps) {
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = () => {
    if (!onRefresh) return;
    setSpinning(true);
    onRefresh();
    setTimeout(() => setSpinning(false), 800);
  };

  return (
    <header className="h-16 border-b border-white/[0.06] flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h1 className="text-white font-semibold text-lg leading-none">{title}</h1>
        {subtitle && <p className="text-white/35 text-xs mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-white/30 hover:text-white w-8 h-8">
          <Search className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost" size="icon"
          className="text-white/30 hover:text-white w-8 h-8 disabled:opacity-40"
          onClick={handleRefresh}
          disabled={!onRefresh || spinning}
        >
          <RefreshCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
        </Button>
        <Button variant="ghost" size="icon" className="text-white/30 hover:text-white w-8 h-8 relative" asChild>
          <Link href="/notifications">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
