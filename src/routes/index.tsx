import { createFileRoute } from "@tanstack/react-router";
import { Link2, Sparkles, PresentationIcon } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OptiX — Your trades, decoded in seconds" },
      { name: "description", content: "OptiX unifies your options trading activity across brokers and lets you ask AI why you trade the way you do." },
      { property: "og:title", content: "OptiX — Your trades, decoded in seconds" },
      { property: "og:description", content: "OptiX unifies your options trading activity across brokers and lets you ask AI why you trade the way you do." },
    ],
  }),
  component: Index,
});

type CardProps = {
  className?: string;
  delay: string;
  children: React.ReactNode;
};

function FloatCard({ className = "", delay, children }: CardProps) {
  return (
    <div
      className={`absolute rounded-2xl bg-white shadow-[0_20px_50px_-20px_rgba(15,40,120,0.25)] ring-1 ring-black/5 p-5 opacity-0 animate-slide-in-card ${className}`}
      style={{ animationDelay: delay, animationFillMode: "forwards" }}
    >
      {children}
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Nav */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-slate-200/60 bg-white/70 backdrop-blur">
        <div className="text-2xl font-semibold tracking-tight text-slate-900">OptiX</div>
        <button className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition">
          Sign up for free
        </button>
      </header>

      {/* Hero */}
      <section className="grid lg:grid-cols-2 gap-10 px-8 lg:px-20 pt-20 pb-32 max-w-7xl mx-auto">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-medium text-slate-500 mb-4">For US Options Traders</p>
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.05]">
            Your trades,<br />decoded in seconds.
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-lg leading-relaxed">
            Drop a CSV from Robinhood, Schwab, or Fidelity. OptiX unifies your activity, surfaces the patterns behind your P/L, and lets you ask AI why you trade the way you do.
          </p>
          <div className="mt-10 flex items-center gap-6">
            <button className="rounded-full bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
              Try OptiX for free
            </button>
            <a href="#plans" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              View plans
            </a>
          </div>
        </div>

        {/* Floating cards */}
        <div className="relative h-[560px] hidden lg:block">
          <FloatCard delay="0.05s" className="top-0 right-20 w-72 rotate-[-6deg]">
            <p className="text-[10px] font-semibold tracking-widest text-slate-400">PROFIT BY SYMBOL</p>
            <div className="mt-3 flex justify-center">
              <div className="h-28 w-28 rounded-full border-[14px] border-blue-600 border-r-blue-300 border-b-blue-400" />
            </div>
            <div className="mt-3 flex gap-2 text-[10px] text-slate-500 justify-center flex-wrap">
              <span>● AAPL</span><span>● TSLA</span><span>● NVDA</span><span>● NFLX</span>
            </div>
          </FloatCard>

          <FloatCard delay="0.15s" className="top-44 right-0 w-60 rotate-[5deg]">
            <p className="text-[10px] font-semibold tracking-widest text-slate-400">WIN RATE</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">71%</p>
            <p className="mt-1 text-[11px] text-slate-500">Avg win: <span className="text-emerald-600 font-semibold">$240</span> · Avg loss: <span className="text-rose-600 font-semibold">-$410</span></p>
          </FloatCard>

          <FloatCard delay="0.25s" className="top-44 left-0 w-56 rotate-[-4deg]">
            <p className="text-[10px] font-semibold tracking-widest text-slate-400">REALIZED P/L</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">+$1,860</p>
            <p className="mt-1 text-[11px] text-slate-500">After Tax: <span className="text-emerald-600 font-semibold">+$1,720</span></p>
          </FloatCard>

          <FloatCard delay="0.35s" className="top-60 left-36 w-80 z-10">
            <p className="text-[10px] font-semibold tracking-widest text-slate-400">YOUR TRADER PERSONALITY IS A</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">Reactive Optimizer</p>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">You frequently adjust positions based on short-term signals rather than planned exits.</p>
            <a className="mt-3 inline-block text-xs font-semibold text-blue-600">Deep dive →</a>
          </FloatCard>

          <FloatCard delay="0.45s" className="bottom-20 left-0 w-56 rotate-[-5deg]">
            <p className="text-[10px] font-semibold tracking-widest text-slate-400">PREMIUM</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">+$2,320</p>
            <p className="mt-1 text-[11px] text-rose-600">↘ -10% <span className="text-slate-500">over the last week</span></p>
          </FloatCard>

          <FloatCard delay="0.55s" className="bottom-24 right-2 w-60 rotate-[4deg]">
            <p className="text-[10px] font-semibold tracking-widest text-slate-400">TOP SYMBOL</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">AAPL</p>
            <p className="mt-1 text-[11px] text-emerald-600 font-semibold">+$980 <span className="text-slate-500 font-normal">across 16 trades</span></p>
          </FloatCard>

          <FloatCard delay="0.65s" className="bottom-0 right-24 w-72 rotate-[3deg]">
            <p className="text-[10px] font-semibold tracking-widest text-slate-400">EXPOSURE DISTRIBUTION</p>
            <div className="mt-3 flex justify-center">
              <div className="h-24 w-24 rounded-full border-[12px] border-blue-300 border-t-blue-600 border-r-blue-500" />
            </div>
            <div className="mt-3 flex gap-2 text-[10px] text-slate-500 justify-center">
              <span>● AAPL</span><span>● TSLA</span><span>● NVDA</span>
            </div>
          </FloatCard>
        </div>
      </section>

      {/* How it works placeholder */}
      <section className="px-8 py-24 max-w-7xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-slate-900">How it works</h2>
        <p className="mt-4 text-slate-600">Coming next — upload, analyze, ask AI.</p>
      </section>
    </div>
  );
}
