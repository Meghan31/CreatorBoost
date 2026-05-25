'use client';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    const access  = searchParams.get('access');
    const refresh = searchParams.get('refresh');
    const error   = searchParams.get('error');

    if (error || !access || !refresh) {
      setStatus('error');
      setTimeout(() => router.replace('/login?error=oauth_failed'), 2000);
      return;
    }

    api
      .get('/auth/me', { headers: { Authorization: `Bearer ${access}` } })
      .then(({ data }) => {
        setAuth(data.user, access, refresh);
        router.replace('/dashboard');
      })
      .catch(() => {
        setStatus('error');
        setTimeout(() => router.replace('/login?error=oauth_failed'), 2000);
      });
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        {status === 'loading' ? (
          <>
            <Spinner />
            <div className="text-center">
              <p className="text-white/70 text-sm font-medium">Signing you in…</p>
              <p className="text-white/25 text-xs mt-1">Connecting to your account</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-white/70 text-sm font-medium">Authentication failed</p>
              <p className="text-white/25 text-xs mt-1">Redirecting you back…</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-2 border-white/[0.06]" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-red-500 animate-spin" />
    </div>
  );
}
