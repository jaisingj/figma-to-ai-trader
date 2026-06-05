import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plug, BrainCircuit, LineChart, TrendingUp, PieChart, DollarSign, BarChart3, KeyRound, ExternalLink, ChevronLeft, ChevronRight, Upload, Sparkles, FileSpreadsheet, MessageSquare, Check, ArrowUp, MousePointer2, Folder, FileText, ArrowLeft, Search } from "lucide-react";
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
  const [guideOpen, setGuideOpen] = useState(false);
  const [step, setStep] = useState(0);
  const openGuide = () => { setStep(0); setGuideOpen(true); };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <GettingStartedDialog open={guideOpen} onOpenChange={setGuideOpen} step={step} setStep={setStep} />

      {/* Nav — Claude-style minimal */}
      <header className="flex items-center justify-between px-8 lg:px-12 py-5">
        <img src={optixProLogo.url} alt="OptiXPro" className="h-12 w-auto" />
        <div className="flex items-center gap-6">
          <a href="/about" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition">
            About
          </a>
          <button onClick={openGuide} className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition">
            Sign up for free
          </button>
        </div>
      </header>

      {/* Hero — Claude-style split layout */}
      <section className="grid lg:grid-cols-2 gap-12 px-8 lg:px-20 pt-20 pb-24 max-w-7xl mx-auto items-start">
        {/* Left: headline + signup card */}
        <div className="flex flex-col items-center text-center lg:pt-16">
          <h1 className="font-serif text-5xl lg:text-6xl text-slate-900 leading-[1.05] tracking-tight">
            Your trades,<br />decoded in seconds.
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
        </div>

        {/* Right: Claude-style demo panel with cycling feature scenes */}
        <DemoPanel />

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
              <img src={optixProLogo.url} alt="OptiX" className="h-10 w-auto" />
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
   Demo Panel — Claude-style cycling product demo
   ========================================================= */

const DEMO_SCENES = [
  { key: "upload", label: "Import broker CSV" },
  { key: "dashboard", label: "Unified dashboard" },
  { key: "ai", label: "Ask OptiX AI" },
  { key: "insight", label: "Behaviour insights" },
] as const;

function DemoPanel() {
  const [scene, setScene] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setScene((s) => (s + 1) % DEMO_SCENES.length), 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hidden lg:flex relative min-h-screen w-full items-center justify-center overflow-hidden border-l border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 px-8 py-16">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-32 -right-24 h-[460px] w-[460px] rounded-full bg-blue-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-[460px] w-[460px] rounded-full bg-violet-300/25 blur-3xl" />

      <div className="relative w-full max-w-[640px] aspect-[5/6]">
        {DEMO_SCENES.map((s, i) => {
          const isActive = scene === i;
          return (
            <div
              key={s.key}
              className={`absolute inset-0 transition-all ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isActive
                  ? "opacity-100 scale-100 duration-[1200ms]"
                  : "opacity-0 scale-[1.08] duration-700 pointer-events-none"
              }`}
            >
              <div
                className={`h-full w-full rounded-[2rem] bg-white ring-1 ring-slate-200/80 shadow-[0_50px_120px_-30px_rgba(15,40,120,0.35)] p-10 flex flex-col origin-center ${
                  isActive ? "animate-kenburns" : ""
                }`}
              >
                {i === 0 && <UploadScene active={isActive} />}
                {i === 1 && <DashboardScene active={isActive} />}
                {i === 2 && <AIScene active={isActive} />}
                {i === 3 && <InsightScene active={isActive} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-10">
        {DEMO_SCENES.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setScene(i)}
            aria-label={s.label}
            className={`h-2 rounded-full transition-all ${
              scene === i ? "w-8 bg-blue-600" : "w-2 bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ----- Scene 1: CSV upload ----- */
function UploadScene({ active }: { active: boolean }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    if (!active) { setPct(0); return; }
    let p = 0;
    const id = setInterval(() => {
      p = Math.min(100, p + 6);
      setPct(p);
      if (p >= 100) clearInterval(id);
    }, 90);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div className="flex flex-col h-full">
      <p className="text-xs font-semibold tracking-widest text-slate-400">STEP 1 — IMPORT</p>
      <h3 className="mt-1 text-lg font-semibold text-slate-900">Drop your broker CSV</h3>

      <div className="mt-5 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/50 p-6 flex flex-col items-center justify-center">
        <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
          <Upload className="h-5 w-5" />
        </div>
        <p className="mt-3 text-sm font-medium text-slate-700">robinhood_options_2026.csv</p>
        <p className="text-[11px] text-slate-500">1.2 MB · 482 trades</p>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex justify-between text-[11px] text-slate-500">
          <span>Parsing trades…</span>
          <span className="font-semibold text-slate-700">{pct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-blue-600 transition-all duration-150" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {["Robinhood", "Schwab", "Fidelity", "SnapTrade"].map((b) => (
          <span key={b} className="rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-[11px] font-medium text-slate-600 flex items-center gap-1.5">
            <FileSpreadsheet className="h-3 w-3 text-slate-400" /> {b}
          </span>
        ))}
      </div>

      {pct >= 100 && (
        <div className="mt-auto flex items-center gap-2 text-[12px] font-medium text-emerald-600 animate-fade-in">
          <Check className="h-4 w-4" /> 482 trades imported & normalized
        </div>
      )}
    </div>
  );
}

/* ----- Scene 2: Dashboard ----- */
function DashboardScene({ active }: { active: boolean }) {
  const kpis = [
    { tag: "REALIZED P/L", value: "+$1,860", sub: "after tax +$1,720", pos: true },
    { tag: "WIN RATE", value: "71%", sub: "vs 64% last month", pos: true },
    { tag: "SHARPE", value: "1.82", sub: "strong risk-adj.", pos: true },
    { tag: "OPEN POSITIONS", value: "7", sub: "net delta +24", pos: true },
  ];
  return (
    <div className="flex flex-col h-full">
      <p className="text-xs font-semibold tracking-widest text-slate-400">DASHBOARD</p>
      <h3 className="mt-1 text-lg font-semibold text-slate-900">Everything, unified</h3>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {kpis.map((k, i) => (
          <div
            key={k.tag}
            className={`rounded-xl bg-white ring-1 ring-slate-200 p-3 ${active ? "animate-fade-in" : ""}`}
            style={{ animationDelay: `${i * 120}ms`, animationFillMode: "both" }}
          >
            <p className="text-[9px] font-semibold tracking-widest text-slate-400">{k.tag}</p>
            <p className={`mt-1 text-xl font-bold ${k.pos ? "text-emerald-600" : "text-rose-600"}`}>{k.value}</p>
            <p className="text-[10px] text-slate-500">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* mini line chart */}
      <div className="mt-4 rounded-xl bg-white ring-1 ring-slate-200 p-3">
        <div className="flex justify-between items-center">
          <p className="text-[9px] font-semibold tracking-widest text-slate-400">EQUITY CURVE · 30D</p>
          <p className="text-[10px] text-emerald-600 font-semibold">↗ +12.4%</p>
        </div>
        <svg viewBox="0 0 200 60" className="mt-2 w-full h-16">
          <defs>
            <linearGradient id="gradLine" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,45 L20,40 L40,42 L60,30 L80,33 L100,22 L120,26 L140,16 L160,18 L180,10 L200,8 L200,60 L0,60 Z" fill="url(#gradLine)" />
          <path d="M0,45 L20,40 L40,42 L60,30 L80,33 L100,22 L120,26 L140,16 L160,18 L180,10 L200,8" fill="none" stroke="#2563eb" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}

/* ----- Scene 3: AI chat ----- */
function AIScene({ active }: { active: boolean }) {
  const fullAnswer = "You exit winners 2.3× faster than losers. On TSLA, your average winning trade lasted 38 min, while losers ran 4h 12m. Tightening your loss cutoff to 1.5× ATR could reclaim ~$640 over the last 30 days.";
  const [typed, setTyped] = useState("");
  useEffect(() => {
    if (!active) { setTyped(""); return; }
    let i = 0;
    const id = setInterval(() => {
      i += 3;
      setTyped(fullAnswer.slice(0, i));
      if (i >= fullAnswer.length) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div className="flex flex-col h-full">
      <p className="text-xs font-semibold tracking-widest text-slate-400">ASK OPTIX AI</p>
      <h3 className="mt-1 text-lg font-semibold text-slate-900">Talk to your trades</h3>

      <div className="mt-4 flex-1 space-y-3 overflow-hidden">
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-br-md bg-blue-600 text-white px-4 py-2.5 text-sm">
            Why am I losing on TSLA lately?
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-slate-50 ring-1 ring-slate-200 px-4 py-2.5 text-sm text-slate-700 leading-relaxed">
            {typed}
            <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-slate-400 align-middle animate-pulse" />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-full ring-1 ring-slate-200 bg-white px-3 py-2">
        <MessageSquare className="h-4 w-4 text-slate-400" />
        <span className="text-[12px] text-slate-400 flex-1">Ask about any symbol, strategy, or day…</span>
        <button className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center">
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ----- Scene 4: Behaviour insight ----- */
function InsightScene({ active }: { active: boolean }) {
  return (
    <div className="flex flex-col h-full">
      <p className="text-xs font-semibold tracking-widest text-slate-400">BEHAVIOUR</p>
      <h3 className="mt-1 text-lg font-semibold text-slate-900">Your trader personality</h3>

      <div className={`mt-4 rounded-2xl bg-gradient-to-br from-violet-50 to-blue-50 ring-1 ring-violet-200/60 p-5 ${active ? "animate-fade-in" : ""}`}>
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <BrainCircuit className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-violet-600">PROFILE</p>
            <p className="text-xl font-bold text-slate-900">Reactive Optimizer</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600 leading-relaxed">
          You frequently re-balance positions on short-term signals. Strong at capturing momentum, prone to overtrading on red days.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {[
          { l: "Discipline", v: 72, c: "bg-emerald-500" },
          { l: "Patience", v: 41, c: "bg-amber-500" },
          { l: "Risk Mgmt", v: 86, c: "bg-blue-500" },
        ].map((m, i) => (
          <div key={m.l} className={`rounded-xl bg-white ring-1 ring-slate-200 p-3 ${active ? "animate-fade-in" : ""}`} style={{ animationDelay: `${200 + i * 120}ms`, animationFillMode: "both" }}>
            <p className="text-[9px] font-semibold tracking-widest text-slate-400">{m.l.toUpperCase()}</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{m.v}</p>
            <div className="mt-1.5 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className={`h-full ${m.c}`} style={{ width: `${m.v}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-3 flex items-center gap-2 text-[11px] text-blue-600 font-semibold">
        <Sparkles className="h-3.5 w-3.5" /> Personalized to your last 482 trades
      </div>
    </div>
  );
}

