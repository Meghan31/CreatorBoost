'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogle = () => {
    setLoading(true);
    const base =
      process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ||
      'http://localhost:8000';
    window.location.href = `${base}/api/v1/auth/google`;
  };

  return (
    <div>
      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-[1.5rem] font-semibold text-white tracking-tight">
          Welcome back
        </h2>
        <p className="text-white/35 text-sm mt-1.5">
          Sign in to your CreatorBoost account
        </p>
      </div>

      {/* Google button */}
      <button
        onClick={handleGoogle}
        disabled={loading}
        className="w-full h-11 flex items-center justify-center gap-2.5 rounded-xl bg-white hover:bg-white/90 active:bg-white/80 text-[#111] text-sm font-medium transition-all duration-150 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#555]" />
        ) : (
          <>
            <GoogleIcon />
            Continue with Google
          </>
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-7">
        <div className="flex-1 h-px bg-white/[0.07]" />
        <span className="text-white/20 text-xs">secure · fast · free</span>
        <div className="flex-1 h-px bg-white/[0.07]" />
      </div>

      {/* Info note */}
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3.5 flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-2.5 h-2.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-white/35 text-xs leading-relaxed">
          We only use Google to verify your identity. We never post on your behalf.
        </p>
      </div>

      {/* Footer */}
      <p className="text-white/25 text-xs text-center mt-8">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-white/60 hover:text-white transition-colors underline underline-offset-2"
        >
          Create one for free
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.705 17.64 9.2z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
