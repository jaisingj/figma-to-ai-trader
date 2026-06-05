import { createFileRoute } from "@tanstack/react-router";
import { Plug, BrainCircuit, LineChart } from "lucide-react";
import optixProLogo from "@/assets/optixpro.jpeg.asset.json";
import featureConnect from "@/assets/feature-connect.jpg";
import featureInsights from "@/assets/feature-insights.jpg";
import featurePerformance from "@/assets/feature-performance.jpg";

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
      <header className="flex items-center justify-between px-8 py-3 border-b border-slate-200/60 bg-white/70 backdrop-blur">
        <img src={optixProLogo.url} alt="OptiXPro" className="h-32 w-auto" />
        <button className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition">
          Sign up for free
        </button>
      </header>

      {/* Hero */}
      <section className="grid lg:grid-cols-2 gap-10 px-8 lg:px-20 pt-16 pb-12 max-w-7xl mx-auto">
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

        {/* Endlessly shuffling feature cards */}
        <div className="relative hidden lg:grid grid-cols-2 gap-5 h-[560px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]">
          {(() => {
            const cards = [
              { tag: "PROFIT BY SYMBOL", body: (
                <>
                  <div className="mt-3 flex justify-center">
                    <div className="h-24 w-24 rounded-full border-[12px] border-blue-600 border-r-blue-300 border-b-blue-400" />
                  </div>
                  <div className="mt-3 flex gap-2 text-[10px] text-slate-500 justify-center flex-wrap">
                    <span>● AAPL</span><span>● TSLA</span><span>● NVDA</span><span>● NFLX</span>
                  </div>
                </>
              )},
              { tag: "WIN RATE", body: (
                <>
                  <p className="mt-2 text-4xl font-bold text-slate-900">71%</p>
                  <p className="mt-1 text-[11px] text-slate-500">Avg win: <span className="text-emerald-600 font-semibold">$240</span> · Loss: <span className="text-rose-600 font-semibold">-$410</span></p>
                </>
              )},
              { tag: "REALIZED P/L", body: (
                <>
                  <p className="mt-2 text-3xl font-bold text-emerald-600">+$1,860</p>
                  <p className="mt-1 text-[11px] text-slate-500">After Tax: <span className="text-emerald-600 font-semibold">+$1,720</span></p>
                </>
              )},
              { tag: "TRADER PERSONALITY", body: (
                <>
                  <p className="mt-2 text-xl font-bold text-slate-900">Reactive Optimizer</p>
                  <p className="mt-2 text-[11px] text-slate-600 leading-relaxed">Frequently adjusts positions based on short-term signals.</p>
                </>
              )},
              { tag: "PREMIUM COLLECTED", body: (
                <>
                  <p className="mt-2 text-3xl font-bold text-emerald-600">+$2,320</p>
                  <p className="mt-1 text-[11px] text-rose-600">↘ -10% <span className="text-slate-500">vs last week</span></p>
                </>
              )},
              { tag: "TOP SYMBOL", body: (
                <>
                  <p className="mt-2 text-2xl font-bold text-slate-900">AAPL</p>
                  <p className="mt-1 text-[11px] text-emerald-600 font-semibold">+$980 <span className="text-slate-500 font-normal">/ 16 trades</span></p>
                </>
              )},
              { tag: "EXPOSURE", body: (
                <>
                  <div className="mt-3 flex justify-center">
                    <div className="h-20 w-20 rounded-full border-[10px] border-blue-300 border-t-blue-600 border-r-blue-500" />
                  </div>
                </>
              )},
              { tag: "AI INSIGHT", body: (
                <>
                  <p className="mt-2 text-sm font-semibold text-slate-900">"You exit winners 2.3x faster than losers."</p>
                  <p className="mt-2 text-[11px] text-blue-600 font-semibold">Ask OptiX AI →</p>
                </>
              )},
              { tag: "SHARPE RATIO", body: (
                <>
                  <p className="mt-2 text-3xl font-bold text-slate-900">1.82</p>
                  <p className="mt-1 text-[11px] text-emerald-600">↗ Strong risk-adjusted return</p>
                </>
              )},
              { tag: "OPEN POSITIONS", body: (
                <>
                  <p className="mt-2 text-3xl font-bold text-slate-900">7</p>
                  <p className="mt-1 text-[11px] text-slate-500">Net delta: <span className="text-slate-900 font-semibold">+24</span></p>
                </>
              )},
            ];
            const col = (items: typeof cards) => (
              <div className="space-y-5">
                {items.map((c, i) => (
                  <div key={i} className="rounded-2xl bg-white p-5 ring-1 ring-black/5 shadow-[0_20px_40px_-22px_rgba(15,40,120,0.25)]">
                    <p className="text-[10px] font-semibold tracking-widest text-slate-400">{c.tag}</p>
                    {c.body}
                  </div>
                ))}
              </div>
            );
            const colA = cards.filter((_, i) => i % 2 === 0);
            const colB = cards.filter((_, i) => i % 2 === 1);
            return (
              <>
                <div className="flex flex-col animate-marquee-y will-change-transform">
                  {col(colA)}
                  <div className="h-5" />
                  {col(colA)}
                </div>
                <div className="flex flex-col animate-marquee-y-reverse will-change-transform mt-10">
                  {col(colB)}
                  <div className="h-5" />
                  {col(colB)}
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* How it works */}
      <section className="px-8 pt-4 pb-24 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-slate-900 text-center">How it works</h2>
        <p className="mt-4 text-slate-600 text-center max-w-3xl mx-auto">
          OptiX uses a US patent-pending algorithm to understand trades from Robinhood, Schwab, and Fidelity that can help you analyze your performance. Your data is safe and private.
        </p>

        <div className="mt-14 grid md:grid-cols-3 gap-7">
          {[
            {
              frontIcon: <Plug className="h-6 w-6 text-blue-600" />,
              frontIconBg: "from-blue-100 to-blue-50",
              title: "Connect your broker data",
              image: featureConnect,
              back: "Import your trading data by uploading a report from Robinhood, Fidelity, or Schwab — or link your broker account securely via SnapTrade. One-click sync keeps trades, fills, and option legs up to date automatically.",
            },
            {
              frontIcon: <BrainCircuit className="h-6 w-6 text-violet-600" />,
              frontIconBg: "from-violet-100 to-violet-50",
              title: "Uncover trading insights",
              image: featureInsights,
              back: "Get deeper insights into your trading. See patterns, exposure, and behaviour clearly. Ask OptiX AI why a strategy worked, spot recurring mistakes, and get personalized suggestions grounded in your real history.",
            },
            {
              frontIcon: <LineChart className="h-6 w-6 text-emerald-600" />,
              frontIconBg: "from-emerald-100 to-emerald-50",
              title: "Track performance over time",
              image: featurePerformance,
              back: "See how your trading performance evolves through clear trends, visual breakdowns, and deeper insights. Compare P/L, win rate, and exposure week-over-week. Spot your peak periods and drawdowns at a glance.",
            },
          ].map((c, i) => (
            <div key={i} className="perspective-1200 h-[520px] group">
              <div className="relative h-full w-full preserve-3d transition-transform duration-700 group-hover:rotate-y-180">
                {/* Front */}
                <div className="absolute inset-0 backface-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,40,120,0.10)] flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br ${c.frontIconBg} flex items-center justify-center ring-1 ring-white shadow-sm`}>
                      {c.frontIcon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 whitespace-nowrap">{c.title}</h3>
                  </div>
                  <div className="mt-5 flex-1 rounded-2xl overflow-hidden bg-slate-50/60">
                    <img src={c.image} alt={c.title} loading="lazy" width={1024} height={1024} className="h-full w-full object-contain p-1" />
                  </div>
                </div>
                {/* Back */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-blue-50/60 to-sky-100/70 p-7 shadow-[0_20px_50px_-20px_rgba(15,40,120,0.25)] flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br ${c.frontIconBg} flex items-center justify-center ring-1 ring-white shadow-sm`}>
                      {c.frontIcon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 whitespace-nowrap">{c.title}</h3>
                  </div>
                  <p className="mt-5 text-slate-700 leading-relaxed text-base">{c.back}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
