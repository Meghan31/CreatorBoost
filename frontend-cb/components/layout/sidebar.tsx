'use client';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useNotifications } from '@/hooks/useNotifications';
import {
  BarChart2, Bell, LayoutDashboard, Lightbulb,
  LogOut, Settings, TrendingUp, Video,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const nav = [
  { label: 'Dashboard',     href: '/dashboard',     icon: LayoutDashboard },
  { label: 'Analytics',     href: '/analytics',     icon: BarChart2 },
  { label: 'Videos',        href: '/videos',        icon: Video },
  { label: 'Growth',        href: '/growth',        icon: TrendingUp },
  { label: 'AI Insights',   href: '/insights',      icon: Lightbulb },
  { label: 'Notifications', href: '/notifications', icon: Bell },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuthStore();
  const { data: notifData } = useNotifications();

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0d0d0d] border-r border-white/[0.06] flex flex-col z-50">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-[18px] border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-md shadow-red-700/30 flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
            <path d="M3 13.5L8.25 6.75L11.25 10.5L13.5 7.5L15.75 13.5H3Z" fill="white" opacity="0.9"/>
            <circle cx="13.5" cy="5.25" r="1.75" fill="white"/>
          </svg>
        </div>
        <span className="text-white font-semibold text-sm tracking-wide">CreatorBoost</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                active
                  ? 'bg-white/[0.08] text-white font-medium'
                  : 'text-white/40 hover:text-white hover:bg-white/[0.05]',
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {label === 'Notifications' && (notifData?.unread_count ?? 0) > 0 && (
                <span className="bg-red-500 text-white text-[10px] min-w-[16px] h-4 rounded-full flex items-center justify-center font-semibold px-1">
                  {(notifData?.unread_count ?? 0) > 99 ? '99+' : notifData?.unread_count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings + Logout */}
      <div className="px-3 py-3 border-t border-white/[0.06] space-y-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/[0.05] transition-all"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-500/[0.07] transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">
              {user?.username ?? 'Creator'}
            </p>
            <p className="text-white/30 text-xs truncate">{user?.email ?? ''}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
