import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plug, BrainCircuit, LineChart, TrendingUp, PieChart, DollarSign, BarChart3, KeyRound, ExternalLink, ChevronLeft, ChevronRight, Upload, Sparkles, FileSpreadsheet, MessageSquare, Check, ArrowUp, MousePointer2, Folder, FileText, ArrowLeft, Search } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import optixProLogo from "@/assets/optixpro-transparent.png";
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
  const [guideOpen, setGuideOpen] = useState(false);
  const [step, setStep] = useState(0);
  const openGuide = () => { setStep(0); setGuideOpen(true); };
  return (
    <div className="min-h-screen bg-white">
      <GettingStartedDialog open={guideOpen} onOpenChange={setGuideOpen} step={step} setStep={setStep} />

      {/* Nav — Claude-style minimal */}
      <header className="flex items-center justify-between px-8 lg:px-12 py-5">
        <img src={optixProLogo} alt="OptiXPro" className="h-44 w-auto" />

        <div className="flex items-center gap-6">
          <a href="/about" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition">
            About
          </a>
          <button onClick={openGuide} className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition">
            Sign up for free
          </button>
        </div>
      </header>

      {/* Horizontal scene ticker — stock-market style */}
      <DemoTicker />

      {/* Hero */}
      <section className="px-8 lg:px-12 pt-16 pb-24 max-w-3xl mx-auto flex flex-col items-center text-center">
        <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.05] tracking-tight">
          Raw data in.<br />AI powered insights out.
        </h1>
        <p className="mt-6 text-base text-slate-600 max-w-md">
          Drop a CSV from Robinhood, Schwab, or Fidelity — OptiX decodes your patterns instantly.
        </p>

        <div className="mt-10 w-full max-w-sm rounded-2xl border border-slate-200 bg-white/60 backdrop-blur p-5 shadow-sm">
          <button
            onClick={openGuide}
            className="w-full flex items-center justify-center gap-2.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 transition"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-4 text-[11px] text-slate-400">
            <span className="flex-1 h-px bg-slate-200" />OR<span className="flex-1 h-px bg-slate-200" />
          </div>

          <input
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
          />
          <button
            onClick={openGuide}
            className="mt-3 w-full rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            Continue with email
          </button>

          <p className="mt-4 text-[11px] text-slate-500 leading-relaxed">
            By continuing, you acknowledge OptiX's <a href="#" className="underline">Privacy Policy</a> and agree to receive occasional product updates.
          </p>
        </div>

        <a href="#plans" className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
          View plans
        </a>
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

      <ScrollingFeatureWall />
      <WhatOptixOffers />
    </div>
  );
}

const WALL_CARDS = [
  { tag: "WIN RATE", v: "71%", sub: "Last 30d", c: "text-emerald-600" },
  { tag: "TSLA", v: "+$640", sub: "Realized", c: "text-emerald-600" },
  { tag: "AAPL CALL", v: "STO · $4.41", sub: "11/15 $245", c: "text-slate-700" },
  { tag: "NVDA", v: "+$420", sub: "Weekly P/L", c: "text-emerald-600" },
  { tag: "SHARPE", v: "1.82", sub: "Risk-adj", c: "text-blue-600" },
  { tag: "DELTA", v: "+24", sub: "Net exposure", c: "text-violet-600" },
  { tag: "AMZN PUT", v: "BTC · $1.84", sub: "9/20 $190", c: "text-slate-700" },
  { tag: "REALIZED P/L", v: "+$1,860", sub: "MTD", c: "text-emerald-600" },
  { tag: "DIV INCOME", v: "+$56", sub: "Citigroup", c: "text-emerald-600" },
  { tag: "OPEN POS", v: "7", sub: "Active legs", c: "text-blue-600" },
];

function ScrollColumn({ direction, delay }: { direction: "up" | "down"; delay: string }) {
  const list = [...WALL_CARDS, ...WALL_CARDS];
  return (
    <div className="relative h-[420px] overflow-hidden">
      <div
        className={direction === "up" ? "animate-marquee-y" : "animate-marquee-y-reverse"}
        style={{ animationDelay: delay }}
      >
        {list.map((c, i) => (
          <div
            key={`${c.tag}-${i}`}
            className="mb-3 rounded-xl bg-white ring-1 ring-slate-200 shadow-[0_8px_24px_-12px_rgba(15,40,120,0.15)] p-4"
          >
            <p className="text-[9px] font-semibold tracking-widest text-slate-400">{c.tag}</p>
            <p className={`mt-1 text-lg font-bold ${c.c}`}>{c.v}</p>
            <p className="text-[10px] text-slate-500">{c.sub}</p>
          </div>
        ))}
      </div>
      {/* fade masks */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}

function ScrollingFeatureWall() {
  return (
    <section className="px-8 pb-20 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-xs font-semibold tracking-widest text-blue-600">LIVE INSIGHTS</p>
          <h2 className="mt-3 text-4xl font-bold text-slate-900 leading-tight">
            A living view of<br />your trading life.
          </h2>
          <p className="mt-4 text-slate-600 max-w-md">
            P/L, win rates, exposure, dividends, option legs — OptiX surfaces hundreds of signals from your CSV and keeps them fresh, automatically.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <ScrollColumn direction="up" delay="0s" />
          <ScrollColumn direction="down" delay="-6s" />
          <ScrollColumn direction="up" delay="-12s" />
        </div>
      </div>
    </section>
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


const API_PROVIDERS = [
  { name: "OpenAI", desc: "GPT-4, GPT-5 and o-series models.", url: "https://platform.openai.com/api-keys" },
  { name: "Anthropic Claude", desc: "Claude Sonnet, Opus and Haiku models.", url: "https://console.anthropic.com/settings/keys" },
  { name: "Google Gemini", desc: "Gemini 2.5 Pro and Flash models.", url: "https://aistudio.google.com/app/apikey" },
  { name: "Meta LLaMA", desc: "Access LLaMA models via Meta's API.", url: "https://llama.developer.meta.com/" },
  { name: "Perplexity", desc: "Sonar online and chat models.", url: "https://www.perplexity.ai/settings/api" },
];

function GettingStartedDialog({
  open, onOpenChange, step, setStep,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  step: number;
  setStep: (n: number) => void;
}) {
  const totalSteps = 2;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-slate-50 border-slate-200">
        <div className="p-8">
          <div className="flex items-center gap-3">
            {step === 0 ? (
              <img src={optixProLogo} alt="OptiX" className="h-10 w-auto" />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <KeyRound className="h-5 w-5 text-blue-600" />
              </div>
            )}
            <h2 className="text-2xl font-bold text-slate-900">
              {step === 0 ? "Welcome to OptiX!" : "Configure your LLM API key"}
            </h2>
          </div>

          {step === 0 ? (
            <>
              <p className="mt-6 text-slate-600 leading-relaxed">
                OptiX gives you a unified view of your options trading activity. This quick guide will walk you through everything you need to get started.
              </p>
              <div className="mt-6 rounded-xl bg-white ring-1 ring-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">What OptiX offers:</h3>
                <ul className="space-y-3 text-slate-700">
                  <li className="flex gap-3"><span className="text-slate-400 mt-1.5">•</span><span>A unified view of your trading data across brokers</span></li>
                  <li className="flex gap-3"><span className="text-slate-400 mt-1.5">•</span><span>AI-driven assessment of your trading behavior</span></li>
                  <li className="flex gap-3"><span className="text-slate-400 mt-1.5">•</span><span>Detailed transaction history with deep insights</span></li>
                  <li className="flex gap-3"><span className="text-slate-400 mt-1.5">•</span><span>Track your investment progress over time and more</span></li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <p className="mt-6 text-slate-600 leading-relaxed">
                OptiX uses your own LLM API key for AI analysis. Grab a key from any of the providers below — sign in, create a new API key, and paste it into OptiX settings.
              </p>
              <div className="mt-6 space-y-2">
                {API_PROVIDERS.map((p) => (
                  <a
                    key={p.name}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl bg-white ring-1 ring-slate-200 p-4 hover:ring-blue-400 hover:bg-blue-50/40 transition group"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{p.name}</p>
                      <p className="text-sm text-slate-500">{p.desc}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-8 py-4">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span key={i} className={`h-2 w-2 rounded-full ${i === step ? "bg-blue-600" : "bg-slate-300"}`} />
            ))}
            <span className="ml-3 text-sm text-slate-500">{step + 1} of {totalSteps}</span>
          </div>
          {step < totalSteps - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              Get started
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
   Demo Panel — narrated product walkthrough
   ========================================================= */

const DEMO_SCENES = [
  { key: "finder", label: "Import your trades" },
  { key: "transform", label: "CSV → structured trades" },
  { key: "dashboard", label: "Unified dashboard" },
  { key: "ai", label: "Ask AI about your trades" },
  { key: "checklist", label: "What OptiX can do" },
] as const;

const SCENE_DURATION = 7500;

function DemoPanel() {
  const [scene, setScene] = useState(0);
  const [tick, setTick] = useState(0); // forces scene re-mount to restart sub-animations
  useEffect(() => {
    const id = setInterval(() => {
      setScene((s) => (s + 1) % DEMO_SCENES.length);
      setTick((t) => t + 1);
    }, SCENE_DURATION);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hidden lg:flex relative w-full flex-col items-center bg-slate-50 rounded-3xl ring-1 ring-slate-200/70 px-6 py-8 shadow-[0_30px_80px_-40px_rgba(15,40,120,0.25)]">
      <div className="relative w-full h-[820px]">
        {DEMO_SCENES.map((s, i) => {
          const isActive = scene === i;
          return (
            <div
              key={s.key}
              className={`absolute inset-0 transition-all duration-700 ease-out ${
                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
              }`}
            >
              <div className="h-full w-full rounded-2xl bg-white ring-1 ring-slate-200 shadow-[0_40px_100px_-30px_rgba(15,40,120,0.25)] overflow-hidden flex flex-col">
                {i === 0 && <FinderScene key={`finder-${tick}`} active={isActive} />}
                {i === 1 && <CsvTransformScene key={`xform-${tick}`} active={isActive} />}
                {i === 2 && <DashboardScene key={`dash-${tick}`} active={isActive} />}
                {i === 3 && <AIScene key={`ai-${tick}`} active={isActive} />}
                {i === 4 && <ChecklistScene key={`check-${tick}`} active={isActive} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scene label + dots */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
          {DEMO_SCENES[scene].label}
        </p>
        <div className="flex items-center gap-2.5">
          {DEMO_SCENES.map((s, i) => (
            <button
              key={s.key}
              onClick={() => { setScene(i); setTick((t) => t + 1); }}
              aria-label={s.label}
              className={`h-2 rounded-full transition-all ${
                scene === i ? "w-8 bg-slate-900" : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


/* ---------- Scene 1: Finder picker ---------- */
function FinderScene({ active }: { active: boolean }) {
  // Timeline (ms): 0 cursor moves to Browse, 900 click, 1100 finder opens,
  // 2200 cursor to file, 3000 click file, 3300 file highlighted, 4000 Open click, 4500 success
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!active) return;
    const timers = [
      setTimeout(() => setPhase(1), 900),   // browse clicked
      setTimeout(() => setPhase(2), 1100),  // finder open
      setTimeout(() => setPhase(3), 3000),  // file selected
      setTimeout(() => setPhase(4), 4400),  // open clicked
      setTimeout(() => setPhase(5), 4700),  // success
    ];
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="relative h-full w-full bg-slate-100 p-8 flex flex-col items-center justify-center">
      {/* Upload card behind */}
      <div className="w-full max-w-[420px] rounded-2xl bg-white ring-1 ring-slate-200 p-8 shadow-sm">
        <p className="text-[11px] font-semibold tracking-widest text-slate-400">STEP 1 — IMPORT</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900">Upload your broker CSV</h3>
        <p className="mt-1.5 text-sm text-slate-500">We'll parse and normalize 482 trades in seconds.</p>

        <div className="mt-6 rounded-xl border-2 border-dashed border-slate-300 p-6 flex flex-col items-center text-center">
          <Upload className="h-7 w-7 text-slate-400" />
          <p className="mt-2 text-sm text-slate-600">Drag a file here, or</p>
          <button
            className={`relative mt-3 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              phase >= 1 ? "bg-slate-900 text-white scale-95" : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            Browse files
            {phase === 1 && (
              <span className="absolute inset-0 rounded-lg ring-4 ring-blue-400/40 animate-ping" />
            )}
          </button>
        </div>

        {phase >= 5 && (
          <div className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-50 ring-1 ring-emerald-200 px-3 py-2 text-[13px] font-medium text-emerald-700 animate-fade-in">
            <Check className="h-4 w-4" /> robinhood_options_2026.csv loaded
          </div>
        )}
      </div>

      {/* Mac Finder window */}
      {phase >= 2 && phase < 5 && (
        <div className="absolute left-1/2 top-1/2 w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white shadow-[0_30px_80px_-10px_rgba(0,0,0,0.35)] ring-1 ring-black/10 overflow-hidden animate-fade-in">
          {/* title bar */}
          <div className="h-9 bg-gradient-to-b from-slate-100 to-slate-200 border-b border-slate-300 flex items-center px-3 gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <div className="flex-1 flex items-center justify-center gap-2 text-[12px] font-semibold text-slate-700">
              <Folder className="h-3.5 w-3.5" /> Downloads
            </div>
          </div>
          {/* toolbar */}
          <div className="h-9 bg-slate-50 border-b border-slate-200 flex items-center px-3 gap-2">
            <ArrowLeft className="h-3.5 w-3.5 text-slate-400" />
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <div className="ml-auto flex items-center gap-1.5 rounded-md bg-white ring-1 ring-slate-200 px-2 py-1 text-[11px] text-slate-400">
              <Search className="h-3 w-3" /> Search
            </div>
          </div>
          {/* body */}
          <div className="flex h-[240px]">
            <div className="w-32 bg-slate-50 border-r border-slate-200 p-2 space-y-1 text-[11px]">
              {["AirDrop", "Recents", "Applications", "Desktop", "Documents", "Downloads"].map((it) => (
                <div key={it} className={`px-2 py-1 rounded ${it === "Downloads" ? "bg-blue-500 text-white" : "text-slate-600"}`}>{it}</div>
              ))}
            </div>
            <div className="flex-1 p-3 space-y-1">
              {[
                { n: "screenshot_2026.png", t: "PNG", sel: false },
                { n: "robinhood_options_2026.csv", t: "CSV · 1.2 MB", sel: true },
                { n: "tax_summary.pdf", t: "PDF", sel: false },
                { n: "schwab_export.xlsx", t: "Excel", sel: false },
              ].map((f) => {
                const highlighted = f.sel && phase >= 3;
                return (
                  <div
                    key={f.n}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-[12px] transition-colors ${
                      highlighted ? "bg-blue-500 text-white" : "text-slate-700"
                    }`}
                  >
                    <FileText className={`h-3.5 w-3.5 ${highlighted ? "text-white" : "text-slate-400"}`} />
                    <span className="flex-1 truncate">{f.n}</span>
                    <span className={`text-[10px] ${highlighted ? "text-white/80" : "text-slate-400"}`}>{f.t}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* footer */}
          <div className="h-11 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 px-3">
            <button className="rounded-md px-3 py-1 text-[12px] font-medium text-slate-700 ring-1 ring-slate-300 bg-white">Cancel</button>
            <button className={`relative rounded-md px-3 py-1 text-[12px] font-semibold text-white bg-blue-600 ${phase === 4 ? "scale-95" : ""}`}>
              Open
              {phase === 4 && <span className="absolute inset-0 rounded-md ring-4 ring-blue-400/40 animate-ping" />}
            </button>
          </div>
        </div>
      )}

      {/* Animated cursor */}
      <Cursor phase={phase} />
    </div>
  );
}

function Cursor({ phase }: { phase: number }) {
  // approximate target points in % of container
  const positions = [
    { x: 50, y: 64 },  // 0 — over Browse
    { x: 50, y: 64 },  // 1 — click Browse
    { x: 50, y: 50 },  // 2 — moving to finder
    { x: 56, y: 52 },  // 3 — on file (after selection)
    { x: 70, y: 78 },  // 4 — Open button
    { x: 70, y: 78 },  // 5 — done
  ];
  const p = positions[Math.min(phase, positions.length - 1)];
  return (
    <div
      className="absolute pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.4,0.2,0.2,1)] z-20"
      style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)" }}
    >
      <MousePointer2 className="h-6 w-6 text-slate-900 fill-white drop-shadow-md" />
    </div>
  );
}

/* ---------- Scene 2: CSV → Dashboard transformation ---------- */
function CsvTransformScene({ active }: { active: boolean }) {
  // Raw CSV rows (subset of user's file)
  const csvRows = [
    `"8/28/2024","COST","Buy","12","$892.51","($10,710.12)"`,
    `"8/27/2024","AAPL","STO","1","$4.41","$440.94"`,
    `"8/22/2024","NFLX","STO","1","$9.10","$909.93"`,
    `"8/22/2024","NVDA","STO","1","$2.99","$298.95"`,
    `"8/16/2024","TSLA","STO","1","$13.63","$1,362.92"`,
    `"8/16/2024","NVDA","STO","1","$3.95","$394.94"`,
    `"8/7/2024","NVDA","Buy","25","$99.66","($2,491.63)"`,
    `"8/5/2024","TSLA","STO","1","$6.02","$601.94"`,
  ];
  const parsed = [
    { d: "8/28", sym: "COST", side: "BUY",  qty: "12", px: "$892.51",  amt: "-$10,710", pos: false },
    { d: "8/27", sym: "AAPL", side: "STO",  qty: "1",  px: "$4.41",    amt: "+$441",    pos: true  },
    { d: "8/22", sym: "NFLX", side: "STO",  qty: "1",  px: "$9.10",    amt: "+$910",    pos: true  },
    { d: "8/22", sym: "NVDA", side: "STO",  qty: "1",  px: "$2.99",    amt: "+$299",    pos: true  },
    { d: "8/16", sym: "TSLA", side: "STO",  qty: "1",  px: "$13.63",   amt: "+$1,363",  pos: true  },
    { d: "8/16", sym: "NVDA", side: "STO",  qty: "1",  px: "$3.95",    amt: "+$395",    pos: true  },
    { d: "8/7",  sym: "NVDA", side: "BUY",  qty: "25", px: "$99.66",   amt: "-$2,492",  pos: false },
    { d: "8/5",  sym: "TSLA", side: "STO",  qty: "1",  px: "$6.02",    amt: "+$602",    pos: true  },
  ];

  // phase 0: csv only, 1: morphing, 2: dashboard preview
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!active) { setPhase(0); return; }
    const t1 = setTimeout(() => setPhase(1), 2200);
    const t2 = setTimeout(() => setPhase(2), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [active]);

  return (
    <div className="h-full w-full flex flex-col bg-slate-50">
      <div className="h-12 px-5 border-b border-slate-200 bg-white flex items-center gap-3">
        <FileSpreadsheet className="h-4 w-4 text-blue-600" />
        <p className="text-sm font-semibold text-slate-900">robinhood_options_2024.csv</p>
        <span className="ml-auto text-[10px] text-slate-500">Parsing · normalizing · enriching</span>
      </div>

      <div className="flex-1 p-5 grid grid-cols-2 gap-4 overflow-hidden">
        {/* Left: raw CSV */}
        <div className="rounded-xl bg-slate-900 ring-1 ring-slate-800 p-4 font-mono text-[10.5px] leading-relaxed text-slate-200 overflow-hidden">
          <p className="text-[9px] tracking-widest text-slate-500 mb-2">RAW CSV</p>
          <div className="text-amber-300 truncate">"Date","Symbol","Code","Qty","Price","Amount"</div>
          {csvRows.map((r, i) => (
            <div
              key={i}
              className="truncate text-slate-300 transition-all"
              style={{
                opacity: active ? 1 : 0,
                transform: phase >= 1 ? `translateX(${20 + i * 2}%) scale(0.96)` : "translateX(0)",
                filter: phase >= 1 ? "blur(0.5px)" : "none",
                transitionDelay: `${i * 60}ms`,
                transitionDuration: "900ms",
              }}
            >
              {r}
            </div>
          ))}
        </div>

        {/* Right: structured table emerging */}
        <div className="relative rounded-xl bg-white ring-1 ring-slate-200 p-4 overflow-hidden">
          <p className="text-[9px] tracking-widest text-slate-400 mb-2 font-semibold">STRUCTURED TRADES</p>
          <div className="grid grid-cols-[0.6fr_0.7fr_0.6fr_0.5fr_0.8fr_0.9fr] gap-2 text-[9px] text-slate-400 font-semibold uppercase tracking-wider pb-1.5 border-b border-slate-100">
            <span>Date</span><span>Sym</span><span>Side</span><span>Qty</span><span>Price</span><span className="text-right">Amount</span>
          </div>
          <div className="mt-1 text-[11px]">
            {parsed.map((t, i) => (
              <div
                key={i}
                className="grid grid-cols-[0.6fr_0.7fr_0.6fr_0.5fr_0.8fr_0.9fr] gap-2 items-center py-1 border-b border-slate-50 last:border-0 transition-all duration-700"
                style={{
                  opacity: phase >= 1 ? 1 : 0,
                  transform: phase >= 1 ? "translateY(0)" : "translateY(8px)",
                  transitionDelay: `${800 + i * 90}ms`,
                }}
              >
                <span className="text-slate-500">{t.d}</span>
                <span className="font-semibold text-slate-800">{t.sym}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold w-fit ${
                  t.side === "BUY" ? "bg-blue-50 text-blue-700" : "bg-violet-50 text-violet-700"
                }`}>{t.side}</span>
                <span className="text-slate-600">{t.qty}</span>
                <span className="text-slate-600">{t.px}</span>
                <span className={`text-right font-semibold ${t.pos ? "text-emerald-600" : "text-rose-600"}`}>{t.amt}</span>
              </div>
            ))}
          </div>

          {/* Dashboard preview overlay slides up at phase 2 */}
          <div
            className={`absolute inset-x-3 bottom-3 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white p-4 shadow-xl transition-all duration-700 ${
              phase >= 2 ? "translate-y-0 opacity-100" : "translate-y-[120%] opacity-0"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-semibold tracking-widest opacity-80">DASHBOARD READY</p>
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div><p className="text-[9px] opacity-70">TRADES</p><p className="font-bold">482</p></div>
              <div><p className="text-[9px] opacity-70">P/L</p><p className="font-bold">+$1,860</p></div>
              <div><p className="text-[9px] opacity-70">WIN</p><p className="font-bold">71%</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* arrow indicator */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-10 w-10 rounded-full bg-white ring-1 ring-slate-200 shadow-lg pointer-events-none transition-opacity duration-500"
        style={{ opacity: phase === 1 ? 1 : 0 }}
      >
        <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
      </div>
    </div>
  );
}

/* ---------- Scene 3: Slick dashboard ---------- */
function DashboardScene({ active }: { active: boolean }) {
  const kpis = [
    { tag: "REALIZED P/L", value: "+$1,860", sub: "+12.4% MTD", pos: true },
    { tag: "WIN RATE", value: "71%", sub: "vs 64% prior", pos: true },
    { tag: "SHARPE", value: "1.82", sub: "strong risk-adj.", pos: true },
    { tag: "OPEN POSITIONS", value: "7", sub: "net delta +24", pos: true },
  ];
  return (
    <div className="h-full w-full flex flex-col bg-white">
      {/* top bar */}
      <div className="h-12 px-5 border-b border-slate-200 flex items-center gap-3">
        <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600" />
        <p className="text-sm font-semibold text-slate-900">OptiX Dashboard</p>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Live · Robinhood
        </div>
      </div>

      <div className="flex-1 p-6 space-y-5 overflow-hidden">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          {kpis.map((k, i) => (
            <div
              key={k.tag}
              className={`rounded-xl ring-1 ring-slate-200 bg-white p-3.5 ${active ? "animate-fade-in" : ""}`}
              style={{ animationDelay: `${i * 120}ms`, animationFillMode: "both" }}
            >
              <p className="text-[9px] font-semibold tracking-widest text-slate-400">{k.tag}</p>
              <p className={`mt-1 text-lg font-bold ${k.pos ? "text-emerald-600" : "text-rose-600"}`}>{k.value}</p>
              <p className="text-[10px] text-slate-500">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Chart + side panel */}
        <div className="grid grid-cols-3 gap-3">
          <div className={`col-span-2 rounded-xl ring-1 ring-slate-200 bg-white p-4 ${active ? "animate-fade-in" : ""}`} style={{ animationDelay: "560ms", animationFillMode: "both" }}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold tracking-widest text-slate-400">EQUITY CURVE · 30D</p>
              <p className="text-[11px] text-emerald-600 font-semibold">↗ +12.4%</p>
            </div>
            <svg viewBox="0 0 300 90" className="mt-2 w-full h-24">
              <defs>
                <linearGradient id="dashGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,70 L30,62 L60,66 L90,48 L120,52 L150,36 L180,42 L210,26 L240,30 L270,14 L300,10 L300,90 L0,90 Z" fill="url(#dashGrad)" />
              <path
                d="M0,70 L30,62 L60,66 L90,48 L120,52 L150,36 L180,42 L210,26 L240,30 L270,14 L300,10"
                fill="none" stroke="#2563eb" strokeWidth="2"
                strokeDasharray="600" strokeDashoffset={active ? "0" : "600"}
                style={{ transition: "stroke-dashoffset 1.6s ease-out 0.6s" }}
              />
            </svg>
          </div>

          <div className={`rounded-xl ring-1 ring-slate-200 bg-white p-4 ${active ? "animate-fade-in" : ""}`} style={{ animationDelay: "720ms", animationFillMode: "both" }}>
            <p className="text-[10px] font-semibold tracking-widest text-slate-400">TOP SYMBOLS</p>
            <div className="mt-2 space-y-2">
              {[
                { s: "TSLA", v: "+$640", pos: true },
                { s: "NVDA", v: "+$420", pos: true },
                { s: "AAPL", v: "-$120", pos: false },
                { s: "SPY",  v: "+$310", pos: true },
              ].map((r) => (
                <div key={r.s} className="flex items-center justify-between text-[12px]">
                  <span className="font-medium text-slate-700">{r.s}</span>
                  <span className={r.pos ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* transactions detail table */}
        <div className={`rounded-xl ring-1 ring-slate-200 bg-white p-4 ${active ? "animate-fade-in" : ""}`} style={{ animationDelay: "880ms", animationFillMode: "both" }}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold tracking-widest text-slate-400">TRANSACTION DETAIL</p>
            <p className="text-[10px] text-slate-400">Last 30 days · 482 trades</p>
          </div>
          <div className="mt-2 grid grid-cols-[1.4fr_0.7fr_0.6fr_0.7fr_0.8fr_0.9fr] gap-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider pb-1.5 border-b border-slate-100">
            <span>Symbol</span><span>Type</span><span>Side</span><span>Qty</span><span>Price</span><span className="text-right">P/L</span>
          </div>
          <div className="mt-1 text-[11.5px]">
            {[
              { s: "TSLA 250C 12/20",  t: "CALL", d: "BUY",  q: "5",  p: "$3.45",  v: "+$240", pos: true },
              { s: "NVDA 900P 12/13",  t: "PUT",  d: "SELL", q: "3",  p: "$12.10", v: "+$180", pos: true },
              { s: "SPY 510C 01/17",   t: "CALL", d: "BUY",  q: "10", p: "$4.20",  v: "-$60",  pos: false },
              { s: "AAPL 200C 12/27",  t: "CALL", d: "STC",  q: "4",  p: "$2.80",  v: "+$112", pos: true },
              { s: "META 580P 01/10",  t: "PUT",  d: "BTO",  q: "2",  p: "$8.50",  v: "-$40",  pos: false },
              { s: "AMZN 220C 12/20",  t: "CALL", d: "STC",  q: "6",  p: "$1.95",  v: "+$96",  pos: true },
            ].map((t) => (
              <div key={t.s} className="grid grid-cols-[1.4fr_0.7fr_0.6fr_0.7fr_0.8fr_0.9fr] gap-2 items-center py-1.5 border-b border-slate-50 last:border-0">
                <span className="font-medium text-slate-800 truncate">{t.s}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold w-fit ${t.t === "CALL" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{t.t}</span>
                <span className="text-slate-600 font-medium">{t.d}</span>
                <span className="text-slate-600">{t.q}</span>
                <span className="text-slate-600">{t.p}</span>
                <span className={`text-right font-semibold ${t.pos ? "text-emerald-600" : "text-rose-600"}`}>{t.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Scene 3: AI chat ---------- */
function AIScene({ active }: { active: boolean }) {
  const messages = [
    { role: "user", model: "You", text: "Why did I lose money on TSLA puts last month?" },
    { role: "assistant", model: "Claude", text: "Looking at your 14 TSLA put trades in November: you opened most of them within 2 days of earnings, and held through IV crush. Average loss was -$310 per trade driven by vega decay, not direction — TSLA actually dropped 4%." },
    { role: "user", model: "You", text: "What should I do differently?" },
    { role: "assistant", model: "ChatGPT", text: "Three patterns to fix: 1) Avoid opening short-dated options 48h pre-earnings, 2) Your win rate on debit spreads is 73% vs 41% on naked puts — lean into spreads, 3) You exit winners too early (avg 22% of max profit). Want me to draft new trade rules?" },
  ];
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!active) { setShown(0); return; }
    let i = 0;
    setShown(1);
    const id = setInterval(() => {
      i += 1;
      setShown(i + 1);
      if (i + 1 >= messages.length) clearInterval(id);
    }, 1600);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div className="h-full w-full flex flex-col bg-white">
      <div className="h-12 px-5 border-b border-slate-200 flex items-center gap-3">
        <Sparkles className="h-4 w-4 text-violet-600" />
        <p className="text-sm font-semibold text-slate-900">OptiX AI</p>
        <div className="ml-auto flex items-center gap-1.5">
          {["Claude", "ChatGPT", "Gemini"].map((m) => (
            <span key={m} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200">{m}</span>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-8 py-6 space-y-4 bg-gradient-to-b from-slate-50/50 to-white">
        {/* Trader personality card */}
        <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-5 flex items-start gap-4 animate-fade-in">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold tracking-widest text-slate-400">YOUR TRADER PERSONALITY IS A</p>
            <h4 className="mt-1 text-lg font-bold text-slate-900">Reactive Optimizer</h4>
            <p className="mt-1 text-[12px] text-slate-600 leading-relaxed">
              You frequently adjust positions based on short-term signals rather than planned exits.
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600">
              <Sparkles className="h-3 w-3" /> <span className="underline">Deep dive</span>
            </div>
          </div>
          <img src={reactiveOptimizerImg} alt="Reactive Optimizer" className="h-20 w-auto shrink-0" />
        </div>

        {messages.slice(0, shown).map((m, i) => {
          const isUser = m.role === "user";
          const badgeColor = m.model === "Claude" ? "bg-orange-100 text-orange-700" : m.model === "ChatGPT" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700";
          return (
            <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
              <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1.5`}>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isUser ? "bg-blue-100 text-blue-700" : badgeColor}`}>
                  {m.model}
                </span>
                <div className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                  isUser ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white ring-1 ring-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
                }`}>
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}
        {shown < messages.length && (
          <div className="flex justify-start">
            <div className="bg-white ring-1 ring-slate-200 rounded-2xl px-4 py-3 flex gap-1">
              <span className="h-2 w-2 rounded-full bg-slate-300 animate-pulse" />
              <span className="h-2 w-2 rounded-full bg-slate-300 animate-pulse" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 rounded-full bg-slate-300 animate-pulse" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-slate-200">
        <div className="flex items-center gap-2 rounded-full bg-slate-50 ring-1 ring-slate-200 px-4 py-2.5">
          <MessageSquare className="h-4 w-4 text-slate-400" />
          <span className="text-[12px] text-slate-400 flex-1">Ask anything about your trading history…</span>
          <button className="h-7 w-7 rounded-full bg-slate-900 flex items-center justify-center">
            <ArrowUp className="h-3.5 w-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}


/* ---------- Scene 3: Checklist ---------- */
function ChecklistScene({ active }: { active: boolean }) {
  const items = [
    "Unified view of all your trading data",
    "AI-driven assessment of your strategy",
    "Detailed transaction history & filters",
    "Track investment progress over time",
    "Behaviour profile & personality insights",
    "Tax-ready P/L exports in one click",
  ];
  const [checked, setChecked] = useState(0);
  useEffect(() => {
    if (!active) { setChecked(0); return; }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setChecked(i);
      if (i >= items.length) clearInterval(id);
    }, 550);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div className="h-full w-full flex flex-col bg-white p-10">
      <p className="text-[11px] font-semibold tracking-widest text-slate-400">WHAT OPTIX CAN DO</p>
      <h3 className="mt-2 text-2xl font-semibold text-slate-900">Everything your portfolio needs</h3>
      <p className="mt-1.5 text-sm text-slate-500">One workspace for trades, insight, and progress.</p>

      <ul className="mt-6 space-y-3 flex-1">
        {items.map((label, i) => {
          const isChecked = i < checked;
          return (
            <li
              key={label}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 ring-1 transition-all duration-500 ${
                isChecked ? "ring-emerald-200 bg-emerald-50/60" : "ring-slate-200 bg-white"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-md ring-1 transition-all ${
                  isChecked ? "bg-emerald-600 ring-emerald-600" : "bg-white ring-slate-300"
                }`}
              >
                {isChecked && <Check className="h-4 w-4 text-white" />}
              </span>
              <span className={`text-sm font-medium transition-colors ${isChecked ? "text-slate-900" : "text-slate-500"}`}>
                {label}
              </span>
            </li>
          );
        })}
      </ul>

      {checked >= items.length && (
        <div className="mt-4 flex items-center gap-2 text-[13px] font-semibold text-blue-600 animate-fade-in">
          <Sparkles className="h-4 w-4" /> Ready when you are.
        </div>
      )}
    </div>
  );
}


