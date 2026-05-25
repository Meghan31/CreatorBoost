import { BarChart2, Lightbulb, TrendingUp, Tv2 } from 'lucide-react';

const features = [
  { icon: BarChart2, text: 'Real-time YouTube analytics & insights' },
  { icon: Lightbulb, text: 'AI-generated growth recommendations' },
  { icon: TrendingUp, text: 'Subscriber milestone tracker' },
  { icon: Tv2,       text: 'Video title optimization with AI' },
];

const stats = [
  { value: '10K+',  label: 'Creators' },
  { value: '200M+', label: 'Views tracked' },
  { value: '98%',   label: 'Satisfaction' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#080808]">

      {/* ── LEFT BRAND PANEL (desktop only) ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-[54%] xl:w-[56%] relative flex-col justify-between p-14 overflow-hidden bg-[#060606]">

        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />

        {/* Red radial glow */}
        <div className="absolute top-[38%] left-[40%] w-[520px] h-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/10 blur-[110px] pointer-events-none" />

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#060606] to-transparent pointer-events-none" />

        {/* ── Top logo ── */}
        <div className="relative z-10 flex items-center gap-3">
          <LogoMark />
          <span className="text-white font-semibold text-lg tracking-tight">CreatorBoost</span>
        </div>

        {/* ── Main copy ── */}
        <div className="relative z-10 max-w-[420px]">
          <p className="text-[11px] font-semibold text-red-400 uppercase tracking-[0.2em] mb-4">
            AI-Powered Creator Platform
          </p>

          <h1 className="text-[2.75rem] font-bold leading-[1.08] tracking-tight text-white mb-5">
            Grow your channel<br />
            <span className="text-white/30">smarter with AI.</span>
          </h1>

          <p className="text-white/40 text-[0.95rem] leading-relaxed mb-11">
            Deep analytics, AI-generated strategies, and growth
            intelligence — everything a YouTube creator needs in one place.
          </p>

          <ul className="space-y-[18px]">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3.5">
                <div className="w-[34px] h-[34px] rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-[15px] h-[15px] text-red-400" strokeWidth={1.75} />
                </div>
                <span className="text-white/55 text-[0.875rem]">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Stats bar ── */}
        <div className="relative z-10">
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-8" />
          <div className="flex gap-10">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-[1.6rem] font-bold text-white tracking-tight leading-none">
                  {value}
                </p>
                <p className="text-white/30 text-[11px] mt-1.5 font-medium tracking-wide">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-[#080808]">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <LogoMark />
          <span className="text-white font-semibold text-lg tracking-tight">
            CreatorBoost
          </span>
        </div>

        <div className="w-full max-w-[360px]">{children}</div>

        <p className="mt-10 text-[11px] text-white/20 text-center">
          © {new Date().getFullYear()} CreatorBoost. All rights reserved.
        </p>
      </div>
    </div>
  );
}

function LogoMark() {
  return (
    <div className="w-[38px] h-[38px] rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-700/40 flex-shrink-0">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 13.5L8.25 6.75L11.25 10.5L13.5 7.5L15.75 13.5H3Z" fill="white" opacity="0.9" />
        <circle cx="13.5" cy="5.25" r="1.75" fill="white" />
      </svg>
    </div>
  );
}
