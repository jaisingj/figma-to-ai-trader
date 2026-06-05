import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plug, BrainCircuit, LineChart, TrendingUp, PieChart, DollarSign, BarChart3, BookOpen, KeyRound, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import optixProLogo from "@/assets/optixpro.jpeg.asset.json";
import featureConnect from "@/assets/feature-connect.jpg";
import featureInsights from "@/assets/feature-insights.jpg";
import featurePerformance from "@/assets/feature-performance.jpg";
import reactiveOptimizerImg from "@/assets/reactive-optimizer.png";
import successAnalysis from "@/assets/success-analysis.png.asset.json";
import investmentAnalysis from "@/assets/investment-analysis.png.asset.json";
import aiAnalysis from "@/assets/ai-analysis.png.asset.json";


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
        <div className="flex items-center gap-6">
          <a href="/about" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition">
            About
          </a>
          <button className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition">
            Sign up for free
          </button>
        </div>
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
            <div key={i} className="perspective-1200 h-[460px] group">
              <div className="relative h-full w-full preserve-3d transition-transform duration-700 group-hover:rotate-y-180">
                {/* Front */}
                <div className="absolute inset-0 backface-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_-12px_rgba(15,40,120,0.10)] flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br ${c.frontIconBg} flex items-center justify-center ring-1 ring-white shadow-sm`}>
                      {c.frontIcon}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-600 whitespace-nowrap">{c.title}</h3>
                  </div>
                  <div className="mt-3 flex-1 rounded-2xl overflow-hidden bg-white">
                    <img src={c.image} alt={c.title} loading="lazy" width={1024} height={1024} className="h-full w-full object-contain scale-110" />
                  </div>
                </div>
                {/* Back */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_20px_50px_-20px_rgba(15,40,120,0.25)] flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br ${c.frontIconBg} flex items-center justify-center ring-1 ring-white shadow-sm`}>
                      {c.frontIcon}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-600 whitespace-nowrap">{c.title}</h3>
                  </div>
                  <p className="mt-5 text-slate-700 leading-relaxed text-base">{c.back}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <WhatOptixOffers />
    </div>
  );
}

const OFFERS = [
  {
    title: "Success and Progress Analysis",
    desc: "Track your growth with clear profit and performance insights.",
    icon: TrendingUp,
    iconBg: "from-emerald-400 to-emerald-600",
    dot: "bg-emerald-500",
  },
  {
    title: "Trading Activity Analysis",
    desc: "Get a detailed view of your trading behavior and execution.",
    icon: PieChart,
    iconBg: "from-blue-400 to-blue-600",
    dot: "bg-blue-500",
  },
  {
    title: "Investment Analysis",
    desc: "Keep track of open trades and overall capital utilization.",
    icon: DollarSign,
    iconBg: "from-amber-400 to-orange-500",
    dot: "bg-orange-500",
  },
  {
    title: "AI Driven Behaviour Analysis",
    desc: "Use AI insights to improve trading discipline and consistency.",
    icon: BarChart3,
    iconBg: "from-violet-400 to-violet-600",
    dot: "bg-violet-500",
  },
];

function WhatOptixOffers() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % OFFERS.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="px-8 pb-24 max-w-7xl mx-auto">
      <h2 className="text-4xl font-bold text-slate-900 text-center">What OptiX offers</h2>
      <p className="mt-4 text-slate-600 text-center max-w-3xl mx-auto">
        Comprehensive analytics to help you understand your performance, trading activity, and trading behavior.
      </p>

      <div className="mt-14 rounded-3xl bg-slate-50/80 ring-1 ring-slate-200/70 p-8 md:p-12">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left: timeline */}
          <div className="relative">
            <div className="absolute left-[22px] top-6 bottom-6 w-px bg-slate-200" />
            <ul className="space-y-10">
              {OFFERS.map((o, i) => {
                const isActive = i === active;
                const Icon = o.icon;
                return (
                  <li
                    key={o.title}
                    className="relative flex gap-5 cursor-pointer"
                    onClick={() => setActive(i)}
                  >
                    <div className="relative z-10 shrink-0">
                      <div
                        className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${o.iconBg} flex items-center justify-center shadow-sm ring-1 ring-white transition-transform ${isActive ? "scale-110" : "scale-100 opacity-90"}`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <span
                        className={`absolute -left-6 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full transition-all ${isActive ? o.dot : "bg-slate-300"}`}
                      />
                    </div>
                    <div className="pt-1">
                      <h3
                        className={`text-xl font-normal transition-colors ${isActive ? "text-slate-900" : "text-slate-400"}`}
                      >
                        {o.title}
                      </h3>
                      <p
                        className={`mt-2 max-w-md leading-relaxed transition-colors ${isActive ? "text-slate-600" : "text-slate-400"}`}
                      >
                        {o.desc}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right: rotating visuals */}
          <div className="relative min-h-[420px]">
            {OFFERS.map((_, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-all duration-700 ${active === i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
              >
                {i === 0 && <SuccessVisual />}
                {i === 1 && <TradingVisual />}
                {i === 2 && <InvestmentVisual />}
                {i === 3 && <AIVisual />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-[0_10px_30px_-18px_rgba(15,40,120,0.18)] p-4 ${className}`}>
      {children}
    </div>
  );
}

function SuccessVisual() {
  return (
    <img src={successAnalysis.url} alt="Success analysis dashboard" className="w-full h-auto rounded-2xl" />
  );
}

function TradingVisual() {
  const rows = [
    { sym: "NVDA $480 Put", status: "ASSIGNED", color: "bg-slate-100 text-slate-600", pl: "+$2,100", plColor: "text-emerald-600" },
    { sym: "AAPL $680 Call", status: "OPEN", color: "bg-amber-100 text-amber-700", pl: "-$1,500", plColor: "text-rose-600" },
    { sym: "AAPL $650 Call", status: "CLOSED", color: "bg-slate-100 text-slate-600", pl: "+$1,300", plColor: "text-emerald-600" },
    { sym: "TSLA $150 Put", status: "EXERCISED", color: "bg-blue-100 text-blue-700", pl: "+$14,400", plColor: "text-emerald-600" },
  ];
  return (
    <div className="space-y-4">
      <Card>
        <div className="space-y-2.5">
          {rows.map((r) => (
            <div key={r.sym} className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">{r.sym}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${r.color}`}>{r.status}</span>
              <span className={`font-semibold ${r.plColor}`}>{r.pl}</span>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-3 gap-3">
        {[
          { t: "BUYS VS SELLS", a: "Buys 12", b: "Sells 32", ring: "border-blue-500 border-r-blue-200 border-b-blue-200" },
          { t: "CALLS VS PUTS", a: "Calls 16", b: "Puts 20", ring: "border-blue-300 border-t-blue-600" },
          { t: "PROFIT BY SYMBOL", a: "AAPL", b: "+$980", ring: "border-blue-600 border-b-blue-300 border-l-blue-400" },
        ].map((c) => (
          <Card key={c.t}>
            <p className="text-[9px] font-semibold tracking-widest text-slate-400">{c.t}</p>
            <div className="mt-2 flex justify-center">
              <div className={`h-14 w-14 rounded-full border-[8px] ${c.ring}`} />
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-500">{c.a} · {c.b}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function InvestmentVisual() {
  return (
    <img src={investmentAnalysis.url} alt="Investment analysis dashboard" className="w-full h-auto rounded-2xl" />
  );
}

function AIVisual() {
  return (
    <img src={aiAnalysis.url} alt="AI driven behaviour analysis" className="w-full h-auto rounded-2xl" />
  );
}

