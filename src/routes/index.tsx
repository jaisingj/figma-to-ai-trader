import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Plug, BrainCircuit, LineChart, TrendingUp, PieChart, DollarSign, BarChart3, KeyRound, ExternalLink, ChevronLeft, ChevronRight, ChevronDown, Upload, Sparkles, FileSpreadsheet, MessageSquare, Check, ArrowUp, MousePointer2, Folder, FileText, ArrowLeft, Search } from "lucide-react";
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

function NavDropdown({ label, content, panelClassName = "" }: { label: string; content: React.ReactNode; panelClassName?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-1 px-4 py-2 text-base font-medium text-slate-700 hover:text-slate-900 transition rounded-full">
        {label}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className={`absolute left-1/2 top-full z-50 pt-3 ${panelClassName}`}>
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-[0_30px_80px_-20px_rgba(15,40,120,0.25)] overflow-hidden animate-fade-in">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}

function DropdownGroup({ title, items }: { title: string; items: { label: string; external?: boolean; to?: string }[] }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-3">{title}</p>
      <ul className="space-y-2.5">
        {items.map((it) => (
          <li key={it.label}>
            {it.to ? (
              <Link to={it.to} className="group inline-flex items-center gap-1.5 text-[17px] font-medium text-slate-900 hover:text-blue-600 transition">
                {it.label}
              </Link>
            ) : (
              <a href="#" className="group inline-flex items-center gap-1.5 text-[17px] font-medium text-slate-900 hover:text-blue-600 transition">
                {it.label}
                {it.external && <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DropdownLink({ label, external = false }: { label: string; external?: boolean }) {
  return (
    <a href="#" className="group flex items-center justify-between rounded-lg px-3 py-2 text-[17px] font-medium text-slate-900 hover:bg-slate-50 hover:text-blue-600 transition">
      <span>{label}</span>
      {external && <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />}
    </a>
  );
}

function Index() {
  const [guideOpen, setGuideOpen] = useState(false);
  const [step, setStep] = useState(0);
  const openGuide = () => { setStep(0); setGuideOpen(true); };
  return (
    <div className="min-h-screen bg-white">
      <GettingStartedDialog open={guideOpen} onOpenChange={setGuideOpen} step={step} setStep={setStep} />

      {/* Nav — Claude-style with dropdowns */}
      <header className="flex items-center justify-between px-8 lg:px-12 py-1">
        <img src={optixProLogo} alt="OptiXPro" className="h-60 w-auto" />

        <nav className="hidden lg:flex items-center gap-1">
          <NavDropdown
            label="Meet OptiX"
            panelClassName="w-[720px] -translate-x-1/4"
            content={
              <div className="grid grid-cols-3 gap-10 p-7">
                <DropdownGroup title="Products" items={[
                  { label: "OptiX", to: "/meet-optix" },
                  { label: "OptiX Pro", to: "/meet-optix" },
                  { label: "OptiX Mobile", to: "/meet-optix" },
                  { label: "OptiX for Teams", to: "/meet-optix" },
                ]} />
                <DropdownGroup title="Features" items={[
                  { label: "Broker import" },
                  { label: "Unified dashboard" },
                  { label: "AI trade chat" },
                  { label: "Trader personality" },
                ]} />
                <DropdownGroup title="AI Models" items={[
                  { label: "Claude", external: true },
                  { label: "ChatGPT", external: true },
                  { label: "Gemini", external: true },
                  { label: "LLaMA", external: true },
                ]} />
              </div>
            }
          />
          <NavDropdown
            label="Platform"
            panelClassName="w-[260px]"
            content={
              <div className="p-5 space-y-1">
                <DropdownLink label="Overview" />
                <DropdownLink label="Integrations" external />
                <DropdownLink label="Pricing" />
                <div className="my-2 border-t border-slate-200" />
                <DropdownLink label="Dashboard login" external />
              </div>
            }
          />
          <NavDropdown
            label="Solutions"
            panelClassName="w-[860px] -translate-x-1/2"
            content={
              <div className="grid grid-cols-4 gap-8 p-7">
                <DropdownGroup title="Trader type" items={[
                  { label: "Options traders" },
                  { label: "Day traders" },
                  { label: "Swing traders" },
                ]} />
                <DropdownGroup title="Experience" items={[
                  { label: "Beginners" },
                  { label: "Active retail" },
                  { label: "Power users" },
                ]} />
                <DropdownGroup title="Brokers" items={[
                  { label: "Robinhood" },
                  { label: "Schwab" },
                  { label: "Fidelity" },
                  { label: "E*TRADE" },
                ]} />
                <DropdownGroup title="Use cases" items={[
                  { label: "Performance review" },
                  { label: "Behavior coaching" },
                  { label: "Tax reporting" },
                ]} />
              </div>
            }
          />
          <NavDropdown
            label="Pricing"
            panelClassName="w-[220px]"
            content={
              <div className="p-5 space-y-1">
                <DropdownLink label="Overview" />
                <DropdownLink label="Compare plans" />
                <div className="my-2 border-t border-slate-200" />
                <p className="text-[11px] uppercase tracking-widest text-slate-400 px-3 pt-1 pb-2">Plans</p>
                <DropdownLink label="Free" />
                <DropdownLink label="Pro" />
                <DropdownLink label="Teams" />
                <DropdownLink label="Enterprise" />
              </div>
            }
          />
          <NavDropdown
            label="Resources"
            panelClassName="w-[820px] -translate-x-3/4"
            content={
              <div className="grid grid-cols-4 gap-8 p-7">
                <DropdownGroup title="Insights" items={[
                  { label: "Blog" },
                  { label: "Trader stories" },
                  { label: "OptiX news", external: true },
                ]} />
                <DropdownGroup title="Learn" items={[
                  { label: "OptiX Academy", external: true },
                  { label: "Guides", external: true },
                  { label: "Tutorials" },
                  { label: "Use cases" },
                ]} />
                <DropdownGroup title="Tools" items={[
                  { label: "Broker connectors" },
                  { label: "CSV templates" },
                ]} />
                <DropdownGroup title="Connect" items={[
                  { label: "Community" },
                  { label: "Events", external: true },
                ]} />
              </div>
            }
          />

          <a href="#contact" className="ml-3 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50 transition">
            Contact sales
          </a>
          <button onClick={openGuide} className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition">
            Try OptiX
          </button>
        </nav>

        {/* Mobile fallback */}
        <div className="flex lg:hidden items-center gap-3">
          <button onClick={openGuide} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Try OptiX
          </button>
        </div>
      </header>

      {/* Hero — Claude-style split layout */}
      <section className="grid lg:grid-cols-2 gap-10 px-8 lg:px-12 pt-2 pb-20 max-w-[1600px] mx-auto items-start">
        {/* Left: headline + carousel + signup card */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.05] tracking-tight">
            Your trades,<br />decoded in seconds.
          </h1>
          <p className="mt-6 text-base text-slate-600 max-w-md">
            Import your broker data — OptiX decodes your patterns instantly across Robinhood, Schwab, Etrade and Fidelity into fresh AI-powered trading insights.
          </p>

          <div className="mt-8 w-full max-w-md">
            <HeroReveal />
          </div>

          <div className="mt-8 w-full max-w-sm rounded-2xl border border-slate-200 bg-white/60 backdrop-blur p-5 shadow-sm">
            <Link
              to="/demo"
              className="w-full flex items-center justify-center gap-2.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 transition"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </Link>

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
        <div className="lg:-mt-10 lg:translate-x-6"><DemoPanel /></div>


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
              title: "Import your Broker data",
              image: featureConnect,
              back: [
                "Upload reports from Robinhood, Fidelity, or Schwab",
                "Link your broker securely via SnapTrade",
                "One-click sync keeps trades and fills up to date",
                "Option legs and assignments auto-normalized",
              ],
            },
            {
              frontIcon: <BrainCircuit className="h-6 w-6 text-violet-600" />,
              frontIconBg: "from-violet-100 to-violet-50",
              title: "Uncover trading insights",
              image: featureInsights,
              back: [
                "See patterns, exposure, and behaviour clearly",
                "Ask OptiX AI why a strategy worked",
                "Spot recurring mistakes across your history",
                "Get personalized suggestions grounded in real trades",
              ],
            },
            {
              frontIcon: <LineChart className="h-6 w-6 text-emerald-600" />,
              frontIconBg: "from-emerald-100 to-emerald-50",
              title: "Track performance over time",
              image: featurePerformance,
              back: [
                "Clear trends and visual breakdowns of every period",
                "Compare P/L, win rate, and exposure week-over-week",
                "Spot peak periods and drawdowns at a glance",
                "Benchmark current results against your prior self",
              ],
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
                  <ul className="mt-5 space-y-3 text-slate-700 leading-relaxed text-[15px]">
                    {c.back.map((b) => (
                      <li key={b} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>

      
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

function ScrollColumn({ direction, delay, compact = false }: { direction: "up" | "down"; delay: string; compact?: boolean }) {
  const list = [...WALL_CARDS, ...WALL_CARDS];
  return (
    <div className={`relative overflow-hidden ${compact ? "h-[260px]" : "h-[420px]"}`}>
      <div
        className={direction === "up" ? "animate-marquee-y" : "animate-marquee-y-reverse"}
        style={{ animationDelay: delay }}
      >
        {list.map((c, i) => (
          <div
            key={`${c.tag}-${i}`}
            className={`mb-2 rounded-xl bg-white ring-1 ring-slate-200 shadow-[0_8px_24px_-12px_rgba(15,40,120,0.15)] ${compact ? "p-2" : "p-4"}`}
          >
            <p className={`font-semibold tracking-widest text-slate-400 ${compact ? "text-[8px]" : "text-[9px]"}`}>{c.tag}</p>
            <p className={`mt-0.5 font-bold ${c.c} ${compact ? "text-sm" : "text-lg"}`}>{c.v}</p>
            <p className={`text-slate-500 ${compact ? "text-[9px]" : "text-[10px]"}`}>{c.sub}</p>
          </div>
        ))}
      </div>
      {/* fade masks */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}



import geminiLogo from "@/assets/gemini.webp.asset.json";
import chatgptLogo from "@/assets/chatgpt.webp.asset.json";
import perplexityLogo from "@/assets/perplexity.webp.asset.json";
import claudeLogo from "@/assets/claude.webp.asset.json";
import llamaLogo from "@/assets/llama.svg.asset.json";

// cx/cy = converged position around center (in px). z controls stacking.
const AI_LOGOS = [
  { name: "ChatGPT",    src: chatgptLogo.url,    rot:  6, tx:  280, ty: -140, cx:  150, cy:   10, z: 30 },
  { name: "Gemini",     src: geminiLogo.url,     rot: -5, tx: -300, ty:  180, cx: -150, cy:   10, z: 30 },
  { name: "LLaMA",      src: llamaLogo.url,      rot:  9, tx:  290, ty:  190, cx:   80, cy:   85, z: 20 },
  { name: "Perplexity", src: perplexityLogo.url, rot: -7, tx:    0, ty: -260, cx:  -80, cy:   85, z: 20 },
  // Claude rendered last so it sits on top
  { name: "Claude",     src: claudeLogo.url,     rot: -4, tx: -260, ty: -160, cx:    0, cy:  -70, z: 50 },
];

// Typewriter timing
const LINE1 = "Scattered trades in.";
const LINE2 = "OptiX AI insights out.";
const TYPE_MS_PER_CHAR = 55;
const LINE1_MS = LINE1.length * TYPE_MS_PER_CHAR;          // ~1100ms
const LINE2_MS = LINE2.length * TYPE_MS_PER_CHAR;          // ~1210ms
const LINE_GAP = 250;
const TYPE_DURATION = LINE1_MS + LINE_GAP + LINE2_MS;      // ~2560ms

function HeroReveal() {
  return (
    <div className="relative h-[260px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white">
      <div className="absolute inset-0 grid grid-cols-2 gap-2 p-3">
        <ScrollColumn direction="up" delay="0s" compact />
        <ScrollColumn direction="down" delay="-6s" compact />
      </div>
    </div>
  );
}

/* ---------- Scene 0: Tagline + AI logos burst ---------- */
function TaglineLogosScene({ active }: { active: boolean }) {
  // 0: typing
  // 1: logos mounted at far corners (hidden) — about to converge
  // 2: logos converged in center fan, Claude on top
  // 3: logos disperse slowly back to where they came from
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!active) { setPhase(0); return; }
    const timers = [
      setTimeout(() => setPhase(1), TYPE_DURATION),               // mount at corners
      setTimeout(() => setPhase(2), TYPE_DURATION + 80),          // trigger converge transition
      setTimeout(() => setPhase(3), TYPE_DURATION + 80 + 2400),   // hold longer, then disperse
    ];
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
      {/* Tagline */}
      <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 px-8 transition-opacity duration-500 ${phase >= 2 ? "opacity-0" : "opacity-100"}`}>
        <span
          className="typewriter text-slate-700 text-3xl font-bold"
          style={{
            width: `${LINE1.length}ch`,
            animation: `tw-type ${LINE1_MS}ms steps(${LINE1.length}, end) both, tw-caret 700ms steps(1, end) ${LINE1_MS}ms 2`,
          }}
        >
          {LINE1}
        </span>
        <span
          className="typewriter text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"
          style={{
            width: `${LINE2.length}ch`,
            animation: `tw-type ${LINE2_MS}ms steps(${LINE2.length}, end) ${LINE1_MS + LINE_GAP}ms both, tw-caret 700ms steps(1, end) ${LINE1_MS + LINE_GAP + LINE2_MS}ms infinite`,
          }}
        >
          {LINE2}
        </span>
      </div>

      {/* Logos — converge in then disperse slowly */}
      {phase >= 1 && (
        <div className="absolute inset-0">
          {AI_LOGOS.map((logo) => {
            const atCorner =
              `translate(calc(-50% + ${logo.tx}px), calc(-50% + ${logo.ty}px)) scale(0.35) rotate(${logo.rot}deg)`;
            const atCenter =
              `translate(calc(-50% + ${logo.cx}px), calc(-50% + ${logo.cy}px)) scale(1) rotate(${logo.rot}deg)`;
            const isCenter = phase === 2;
            return (
              <div
                key={logo.name}
                className="absolute left-1/2 top-1/2"
                style={{
                  zIndex: logo.z,
                  // slower disperse than converge so all logos stay visible
                  transition: isCenter
                    ? "transform 950ms cubic-bezier(0.22, 1, 0.36, 1), opacity 500ms ease"
                    : "transform 1600ms cubic-bezier(0.5, 0, 0.2, 1), opacity 1200ms ease",
                  transform: isCenter ? atCenter : atCorner,
                  opacity: isCenter ? 1 : 0,
                }}
              >
                <div className="flex items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200 shadow-2xl px-8 py-5">
                  <img src={logo.src} alt={logo.name} className="h-24 w-auto max-w-[240px] object-contain" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .typewriter {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 2px solid currentColor;
          max-width: 100%;
        }
        @keyframes tw-type { from { width: 0; } }
        @keyframes tw-caret {
          0%, 50% { border-right-color: currentColor; }
          51%, 100% { border-right-color: transparent; }
        }
      `}</style>
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
  { key: "tagline", label: "Scattered trades in, AI insights out" },
  { key: "finder", label: "Import your trades" },
  { key: "transform", label: "CSV → structured trades" },
  { key: "dashboard", label: "Unified dashboard" },
  { key: "ai", label: "Ask AI about your trades" },
  { key: "checklist", label: "What OptiX can do" },
] as const;

const SCENE_DURATIONS = [7600, 5500, 11500, 3500, 10000, 5500];

function DemoPanel() {
  const [scene, setScene] = useState(0);
  const [tick, setTick] = useState(0); // forces scene re-mount to restart sub-animations
  useEffect(() => {
    const id = setTimeout(() => {
      setScene((s) => (s + 1) % DEMO_SCENES.length);
      setTick((t) => t + 1);
    }, SCENE_DURATIONS[scene]);
    return () => clearTimeout(id);
  }, [scene]);

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
                {i === 0 && <TaglineLogosScene key={`tag-${tick}`} active={isActive} />}
                {i === 1 && <FinderScene key={`finder-${tick}`} active={isActive} />}
                {i === 2 && <CsvTransformScene key={`xform-${tick}`} active={isActive} />}
                {i === 3 && <DashboardScene key={`dash-${tick}`} active={isActive} />}
                {i === 4 && <AIScene key={`ai-${tick}`} active={isActive} />}
                {i === 5 && <ChecklistScene key={`check-${tick}`} active={isActive} />}
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
    <div className="relative h-full w-full bg-slate-100 px-8 pt-4 pb-8 flex flex-col items-center justify-start">
      {/* Upload card behind */}
      <div className="w-full max-w-[600px] rounded-2xl bg-white ring-1 ring-slate-200 p-10 pb-12 shadow-sm">
        <p className="text-[11px] font-semibold tracking-widest text-slate-400">STEP 1 — IMPORT</p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-900">Upload your broker CSV</h3>
        <p className="mt-2 text-sm text-slate-500">We'll parse and normalize 482 trades in seconds.</p>

        <div className="mt-7 rounded-xl border-2 border-dashed border-slate-300 px-10 py-16 flex flex-col items-center text-center">
          <Upload className="h-12 w-12 text-slate-400" />
          <p className="mt-4 text-base text-slate-600">Drag a file here, or</p>
          <button
            className={`relative mt-5 rounded-lg px-7 py-3 text-base font-semibold transition-all ${
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
          <div className="mt-6 space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 ring-1 ring-emerald-200 px-3 py-2.5 text-sm font-medium text-emerald-700">
              <Check className="h-4 w-4" /> robinhood_options_2026.csv loaded
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 ring-1 ring-emerald-200 px-3 py-2.5 text-sm font-medium text-emerald-700">
              <Check className="h-4 w-4" /> schwab_export.csv loaded
            </div>
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
                { n: "schwab_export.csv", t: "CSV · 0.9 MB", sel: true },
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

/* ---------- Excel-style spreadsheet ---------- */
function ExcelSheet({
  name, tabColor, headers, rows, faded, visible,
}: {
  name: string;
  tabColor: "emerald" | "sky";
  headers: string[];
  rows: string[][];
  faded: boolean;
  visible: boolean;
}) {
  const colLetters = ["A", "B", "C", "D", "E", "F", "G"];
  const tabColorClass = tabColor === "emerald" ? "bg-emerald-600" : "bg-sky-600";
  return (
    <div
      className="flex-1 rounded-lg bg-white ring-1 ring-slate-300 shadow-sm overflow-hidden flex flex-col transition-all duration-700"
      style={{
        opacity: visible ? (faded ? 0.4 : 1) : 0,
        transform: visible ? (faded ? "scale(0.97)" : "translateY(0)") : "translateY(20px)",
      }}
    >
      {/* Excel-like title bar */}
      <div className={`h-6 ${tabColorClass} text-white flex items-center px-2.5 text-[9px] font-semibold tracking-wider`}>
        <FileSpreadsheet className="h-3 w-3 mr-1.5" />
        {name}
      </div>
      {/* Formula bar */}
      <div className="h-5 bg-slate-50 border-b border-slate-200 flex items-center px-2 gap-1.5 text-[8px] text-slate-500 font-mono">
        <span className="px-1 rounded bg-white ring-1 ring-slate-200">A1</span>
        <span className="italic text-slate-400">fx</span>
        <span className="truncate">{headers[0]}</span>
      </div>
      {/* Grid */}
      <div className="flex-1 overflow-hidden">
        {/* Column header row */}
        <div className="grid bg-slate-100 border-b border-slate-300" style={{ gridTemplateColumns: `20px repeat(${headers.length}, minmax(0, 1fr))` }}>
          <div className="text-[8px] text-slate-500 text-center border-r border-slate-300 py-0.5"></div>
          {headers.map((_, i) => (
            <div key={i} className="text-[8px] text-slate-600 font-semibold text-center border-r border-slate-300 py-0.5">{colLetters[i]}</div>
          ))}
        </div>
        {/* Header data row */}
        <div className="grid bg-slate-50 border-b border-slate-200" style={{ gridTemplateColumns: `20px repeat(${headers.length}, minmax(0, 1fr))` }}>
          <div className="text-[8px] text-slate-500 text-center bg-slate-100 border-r border-slate-300 py-0.5">1</div>
          {headers.map((h, i) => (
            <div key={i} className="text-[9px] font-bold text-slate-800 px-1.5 py-0.5 border-r border-slate-200 truncate">{h}</div>
          ))}
        </div>
        {/* Data rows */}
        {rows.map((row, r) => (
          <div key={r} className="grid border-b border-slate-100" style={{ gridTemplateColumns: `20px repeat(${headers.length}, minmax(0, 1fr))` }}>
            <div className="text-[8px] text-slate-500 text-center bg-slate-100 border-r border-slate-300 py-0.5">{r + 2}</div>
            {row.map((cell, c) => (
              <div key={c} className="text-[9px] text-slate-700 px-1.5 py-0.5 border-r border-slate-200 truncate font-mono">{cell}</div>
            ))}
          </div>
        ))}
      </div>
      {/* Sheet tabs */}
      <div className="h-4 bg-slate-100 border-t border-slate-300 flex items-center px-1 gap-0.5">
        <span className="px-1.5 text-[7px] font-semibold text-slate-700 bg-white rounded-sm border border-slate-300 border-b-0 leading-3">Sheet1</span>
        <span className="px-1.5 text-[7px] text-slate-500 leading-3">Sheet2</span>
      </div>
    </div>
  );
}

/* ---------- Doughnut chart ---------- */
function Doughnut({ data, total, centerLabel, centerValue }: {
  data: { label: string; value: number; color: string }[];
  total: number;
  centerLabel: string;
  centerValue: string;
}) {
  const R = 32, r = 20, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0">
        <svg viewBox="-40 -40 80 80" className="h-24 w-24 -rotate-90">
          <circle cx="0" cy="0" r={R} fill="none" stroke="#f1f5f9" strokeWidth={R - r} />
          {data.map((d, i) => {
            const len = (d.value / total) * C;
            const dash = `${len} ${C - len}`;
            const dashoffset = -offset;
            offset += len;
            return (
              <circle key={i} cx="0" cy="0" r={R} fill="none"
                stroke={d.color} strokeWidth={R - r}
                strokeDasharray={dash} strokeDashoffset={dashoffset} />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[8px] text-slate-400 font-semibold tracking-wider">{centerLabel}</p>
          <p className="text-sm font-bold text-slate-900">{centerValue}</p>
        </div>
      </div>
      <div className="flex-1 space-y-1 min-w-0">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[10px]">
            <span className="h-2 w-2 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-slate-600 truncate flex-1">{d.label}</span>
            <span className="text-slate-800 font-semibold">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Scene 2: CSV → Dashboard transformation ---------- */

function CsvTransformScene({ active }: { active: boolean }) {
  // Two broker CSVs are rendered as Excel sheets below

  const unified = [
    { d: "8/28", sym: "COST",  side: "BUY", qty: "12", px: "$892.51", amt: "-$10,710", pos: false, br: "RH" },
    { d: "8/27", sym: "AAPL",  side: "STO", qty: "1",  px: "$4.41",   amt: "+$441",    pos: true,  br: "RH" },
    { d: "8/26", sym: "MSFT",  side: "STO", qty: "2",  px: "$6.85",   amt: "+$1,370",  pos: true,  br: "SC" },
    { d: "8/22", sym: "NFLX",  side: "STO", qty: "1",  px: "$9.10",   amt: "+$910",    pos: true,  br: "RH" },
    { d: "8/21", sym: "AMZN",  side: "BUY", qty: "10", px: "$178.40", amt: "-$1,784",  pos: false, br: "SC" },
    { d: "8/16", sym: "TSLA",  side: "STO", qty: "1",  px: "$13.63",  amt: "+$1,363",  pos: true,  br: "RH" },
    { d: "8/15", sym: "SPY",   side: "BTC", qty: "3",  px: "$2.10",   amt: "-$630",    pos: false, br: "SC" },
    { d: "8/12", sym: "GOOGL", side: "SELL",qty: "5",  px: "$164.20", amt: "+$821",    pos: true,  br: "SC" },
    { d: "8/07", sym: "NVDA",  side: "BUY", qty: "25", px: "$99.66",  amt: "-$2,492",  pos: false, br: "RH" },
    { d: "8/04", sym: "META",  side: "STO", qty: "1",  px: "$9.40",   amt: "+$940",    pos: true,  br: "SC" },
  ];

  // 0: RH only, 1: Schwab dropped in, 2: unifying, 3: dashboard preview
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!active) { setPhase(0); return; }
    const t1 = setTimeout(() => setPhase(1), 1500);
    const t2 = setTimeout(() => setPhase(2), 3400);
    const t3 = setTimeout(() => setPhase(3), 5600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [active]);

  return (
    <div className="h-full w-full flex flex-col bg-slate-50">
      <div className="h-12 px-5 border-b border-slate-200 bg-white flex items-center gap-3">
        <FileSpreadsheet className="h-4 w-4 text-blue-600" />
        <p className="text-sm font-semibold text-slate-900">Importing from 2 brokers</p>
        <span className="ml-auto text-[10px] text-slate-500">Parsing · normalizing · unifying</span>
      </div>

      <div className="flex-1 p-5 grid grid-cols-2 gap-4 overflow-hidden">
        {/* Left column: two CSVs stacked */}
        <div className="flex flex-col gap-3 min-h-0">
          {/* Robinhood CSV - Excel style */}
          <ExcelSheet
            name="ROBINHOOD.CSV"
            tabColor="emerald"
            headers={["Date", "Symbol", "Code", "Qty", "Price", "Amount"]}
            rows={[
              ["8/28/2024", "COST", "Buy", "12", "$892.51", "($10,710.12)"],
              ["8/27/2024", "AAPL", "STO", "1", "$4.41", "$440.94"],
              ["8/22/2024", "NFLX", "STO", "1", "$9.10", "$909.93"],
              ["8/16/2024", "TSLA", "STO", "1", "$13.63", "$1,362.92"],
              ["8/07/2024", "NVDA", "Buy", "25", "$99.66", "($2,491.63)"],
            ]}
            faded={phase >= 2}
            visible
          />
          {/* Schwab CSV - drops in at phase 1 */}
          <ExcelSheet
            name="SCHWAB_EXPORT.CSV"
            tabColor="sky"
            headers={["Date", "Action", "Description", "Qty", "Price", "Amount"]}
            rows={[
              ["08/26/24", "SELL_TO_OPEN", "MSFT 09/20 420C", "2", "6.85", "+1370.00"],
              ["08/21/24", "BUY", "AMZN", "10", "178.40", "-1784.00"],
              ["08/15/24", "BUY_TO_CLOSE", "SPY 08/30 545P", "3", "2.10", "-630.00"],
              ["08/12/24", "SELL", "GOOGL", "5", "164.20", "+821.00"],
              ["08/04/24", "SELL_TO_OPEN", "META 09/06 500P", "1", "9.40", "+940.00"],
            ]}
            faded={phase >= 2}
            visible={phase >= 1}
          />

        </div>

        {/* Right: unified table emerging */}
        <div className="relative rounded-xl bg-white ring-1 ring-slate-200 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] tracking-widest text-slate-400 font-semibold">UNIFIED TRADES</p>
            <div className="flex items-center gap-1 text-[8px] font-semibold">
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">RH</span>
              <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700">SC</span>
            </div>
          </div>
          <div className="grid grid-cols-[0.5fr_0.7fr_0.55fr_0.4fr_0.75fr_0.85fr_0.3fr] gap-1.5 text-[9px] text-slate-400 font-semibold uppercase tracking-wider pb-1.5 border-b border-slate-100">
            <span>Date</span><span>Sym</span><span>Side</span><span>Qty</span><span>Price</span><span className="text-right">Amount</span><span></span>
          </div>
          <div className="mt-1 text-[10.5px]">
            {unified.map((t, i) => (
              <div
                key={i}
                className="grid grid-cols-[0.5fr_0.7fr_0.55fr_0.4fr_0.75fr_0.85fr_0.3fr] gap-1.5 items-center py-1 border-b border-slate-50 last:border-0 transition-all duration-700"
                style={{
                  opacity: phase >= 2 ? 1 : 0,
                  transform: phase >= 2 ? "translateY(0)" : "translateY(8px)",
                  transitionDelay: `${i * 70}ms`,
                }}
              >
                <span className="text-slate-500">{t.d}</span>
                <span className="font-semibold text-slate-800">{t.sym}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold w-fit ${
                  t.side === "BUY" || t.side === "BTC" ? "bg-blue-50 text-blue-700"
                  : t.side === "SELL" ? "bg-amber-50 text-amber-700"
                  : "bg-violet-50 text-violet-700"
                }`}>{t.side}</span>
                <span className="text-slate-600">{t.qty}</span>
                <span className="text-slate-600">{t.px}</span>
                <span className={`text-right font-semibold ${t.pos ? "text-emerald-600" : "text-rose-600"}`}>{t.amt}</span>
                <span className={`text-[8px] font-bold text-center rounded ${t.br === "RH" ? "text-emerald-600" : "text-sky-600"}`}>{t.br}</span>
              </div>
            ))}
          </div>

          {/* Dashboard preview overlay slides up at phase 3 */}
          <div
            className={`absolute inset-x-6 top-[65%] -translate-y-1/2 rounded-2xl bg-white ring-1 ring-blue-200 text-slate-900 p-6 shadow-[0_20px_50px_-12px_rgba(37,99,235,0.4)] transition-all duration-700 ${
              phase >= 3 ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-semibold tracking-widest text-blue-600">UNIFIED DASHBOARD READY</p>
              <Sparkles className="h-5 w-5 text-blue-500" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="min-w-0"><p className="text-[10px] text-slate-400">TRADES</p><p className="text-base font-bold text-blue-700 truncate">482</p></div>
              <div className="min-w-0"><p className="text-[10px] text-slate-400">P/L</p><p className="text-base font-bold text-blue-700 truncate">+$1,860</p></div>
              <div className="min-w-0"><p className="text-[10px] text-slate-400">WIN</p><p className="text-base font-bold text-blue-700 truncate">71%</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* unify pulse indicator */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-10 w-10 rounded-full bg-white ring-1 ring-slate-200 shadow-lg pointer-events-none transition-opacity duration-500"
        style={{ opacity: phase === 2 ? 1 : 0 }}
      >
        <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
      </div>
    </div>
  );
}

/* ---------- Scene 3: Slick dashboard ---------- */
function DashboardScene({ active }: { active: boolean }) {
  const kpis = [
    { tag: "REALIZED P/L", value: "+$1,860", sub: "+12.4% MTD" },
    { tag: "WIN RATE",     value: "71%",     sub: "vs 64% prior" },
    { tag: "SHARPE",       value: "1.82",    sub: "strong risk-adj." },
    { tag: "OPEN POS",     value: "7",       sub: "net delta +24" },
  ];
  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-b from-blue-50/40 to-white">
      {/* top bar — slimmer */}
      <div className="h-28 px-6 border-b border-blue-100 bg-white flex items-center gap-4">
        <img src={optixProLogo} alt="OptiX" className="h-24 w-auto" />
        <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Live · Robinhood
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-hidden">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-2.5">
          {kpis.map((k, i) => (
            <div
              key={k.tag}
              className={`rounded-xl ring-1 ring-blue-100 bg-white p-3 ${active ? "animate-fade-in" : ""}`}
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
            >
              <p className="text-[9px] font-semibold tracking-widest text-slate-400">{k.tag}</p>
              <p className="mt-0.5 text-lg font-bold text-blue-700">{k.value}</p>
              <p className="text-[10px] text-slate-500">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Chart + top symbols */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className={`col-span-2 rounded-xl ring-1 ring-blue-100 bg-white p-3.5 ${active ? "animate-fade-in" : ""}`} style={{ animationDelay: "480ms", animationFillMode: "both" }}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold tracking-widest text-slate-400">EQUITY CURVE · 30D</p>
              <p className="text-[11px] text-blue-600 font-semibold">↗ +12.4%</p>
            </div>
            <svg viewBox="0 0 300 80" className="mt-1.5 w-full h-20">
              <defs>
                <linearGradient id="dashGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,60 L30,54 L60,58 L90,42 L120,46 L150,30 L180,36 L210,22 L240,26 L270,12 L300,8 L300,80 L0,80 Z" fill="url(#dashGrad)" />
              <path
                d="M0,60 L30,54 L60,58 L90,42 L120,46 L150,30 L180,36 L210,22 L240,26 L270,12 L300,8"
                fill="none" stroke="#2563eb" strokeWidth="2"
                strokeDasharray="600" strokeDashoffset={active ? "0" : "600"}
                style={{ transition: "stroke-dashoffset 1.6s ease-out 0.5s" }}
              />
            </svg>
          </div>

          <div className={`rounded-xl ring-1 ring-blue-100 bg-white p-3.5 ${active ? "animate-fade-in" : ""}`} style={{ animationDelay: "620ms", animationFillMode: "both" }}>
            <p className="text-[10px] font-semibold tracking-widest text-slate-400">TOP SYMBOLS</p>
            <div className="mt-1.5 space-y-1.5">
              {[
                { s: "TSLA", v: "+$640" },
                { s: "NVDA", v: "+$420" },
                { s: "AAPL", v: "+$310" },
                { s: "SPY",  v: "+$210" },
              ].map((r) => (
                <div key={r.s} className="flex items-center justify-between text-[12px]">
                  <span className="font-medium text-slate-700">{r.s}</span>
                  <span className="text-blue-700 font-semibold">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* transactions detail table */}
        <div className={`flex-1 rounded-xl ring-1 ring-blue-100 bg-white p-3.5 flex flex-col min-h-0 ${active ? "animate-fade-in" : ""}`} style={{ animationDelay: "760ms", animationFillMode: "both" }}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold tracking-widest text-slate-400">TRANSACTION DETAIL</p>
            <p className="text-[10px] text-slate-400">Last 30 days · 482 trades</p>
          </div>
          <div className="mt-1.5 grid grid-cols-[1.4fr_0.6fr_0.6fr_0.7fr_0.5fr_0.7fr_0.9fr] gap-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider pb-1 border-b border-blue-100">
            <span>Symbol</span><span>Type</span><span>Trade</span><span>Strike</span><span>Qty</span><span>Price</span><span className="text-right">P/L</span>
          </div>
          <div className="mt-1 text-[11.5px] flex-1 overflow-hidden">
            {[
              { s: "TSLA 12/20",  t: "CALL", d: "STO", k: "$250", q: "5",  p: "$3.45",  v: "+$240" },
              { s: "NVDA 12/13",  t: "PUT",  d: "BTC", k: "$900", q: "3",  p: "$12.10", v: "+$180" },
              { s: "SPY 01/17",   t: "CALL", d: "BTO", k: "$510", q: "10", p: "$4.20",  v: "+$140" },
              { s: "AAPL 12/27",  t: "CALL", d: "STC", k: "$200", q: "4",  p: "$2.80",  v: "+$112" },
              { s: "AMZN 12/20",  t: "CALL", d: "STC", k: "$220", q: "6",  p: "$1.95",  v: "+$96"  },
              { s: "MSFT 01/03",  t: "CALL", d: "BTO", k: "$410", q: "3",  p: "$5.60",  v: "+$84"  },
              { s: "GOOGL 12/27", t: "PUT",  d: "STO", k: "$175", q: "4",  p: "$1.85",  v: "+$72"  },
              { s: "META 01/10",  t: "CALL", d: "BTC", k: "$580", q: "2",  p: "$9.40",  v: "+$60"  },
            ].map((t) => (
              <div key={t.s} className="grid grid-cols-[1.4fr_0.6fr_0.6fr_0.7fr_0.5fr_0.7fr_0.9fr] gap-2 items-center py-1.5 border-b border-blue-50 last:border-0">
                <span className="font-medium text-slate-800 truncate">{t.s}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold w-fit bg-blue-50 text-blue-700">{t.t}</span>
                <span className="text-slate-600 font-medium">{t.d}</span>
                <span className="text-slate-600">{t.k}</span>
                <span className="text-slate-600">{t.q}</span>
                <span className="text-slate-600">{t.p}</span>
                <span className="text-right font-semibold text-blue-700">{t.v}</span>
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
  const SHORTCUTS = [
    "📊 Summarize my month",
    "🎯 Best win rate setup",
    "⚠️ Riskiest open positions",
    "💡 Suggest better exits",
  ];
  const PICKED_SHORTCUT = SHORTCUTS[0];
  const TYPED_QUESTION = "Which stock gave me the best win rate?";

  type TableData = {
    title: string;
    headers: string[];
    rows: (string | { v: string; pos?: boolean })[][];
    footer?: { label: string; value: string; pos?: boolean };
  };
  type Msg = { role: "user" | "assistant"; model: string; text?: string; table?: TableData };
  const ANSWER_1: Msg = {
    role: "assistant",
    model: "Claude",
    text: "Here's your November snapshot — 62 trades, +$1,840 realized, 58% win rate.",
    table: {
      title: "November · weekly breakdown",
      headers: ["Week", "Trades", "Win rate", "P/L"],
      rows: [
        ["Nov 1–8",   "14", "64%", { v: "+$420", pos: true }],
        ["Nov 9–15",  "18", "72%", { v: "+$920", pos: true }],
        ["Nov 16–22", "16", "50%", { v: "+$310", pos: true }],
        ["Nov 23–30", "14", "43%", { v: "+$190", pos: true }],
      ],
      footer: { label: "Month total", value: "+$1,840", pos: true },
    },
  };
  const ANSWER_2: Msg = {
    role: "assistant",
    model: "ChatGPT",
    text: "NVDA leads with a 78% win rate over 18 trades (+$1,120). Your edge: selling premium into IV spikes around earnings — STO/BTC cycles closed in under 5 days averaged 82% wins. Worst: TSLA at 41%.",
  };

  // Timeline (ms)
  const T_CURSOR_MOVE = 200;   // cursor begins traveling to shortcut
  const T_HIGHLIGHT   = 1400;  // cursor arrives + click ring
  const T_MSG1        = 1900;
  const T_TYPING1     = 2100;
  const T_ANSWER1     = 3100;
  const T_TYPE_START  = 3800;
  const T_TYPE_END    = T_TYPE_START + TYPED_QUESTION.length * 28;
  const T_MSG2        = T_TYPE_END + 200;
  const T_TYPING2     = T_MSG2 + 200;
  const T_ANSWER2     = T_TYPING2 + 1100;

  const [highlight, setHighlight] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [inputChars, setInputChars] = useState(0);
  const [cursorAt, setCursorAt] = useState<"rest" | "shortcut" | "gone">("rest");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, typing]);

  useEffect(() => {
    if (!active) {
      setHighlight(false);
      setMessages([]);
      setTyping(false);
      setInputChars(0);
      setCursorAt("rest");
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setCursorAt("shortcut"), T_CURSOR_MOVE));
    timers.push(setTimeout(() => setHighlight(true), T_HIGHLIGHT));
    timers.push(setTimeout(() => {
      setHighlight(false);
      setCursorAt("gone");
      setMessages([{ role: "user", model: "You", text: PICKED_SHORTCUT }]);
    }, T_MSG1));
    timers.push(setTimeout(() => setTyping(true), T_TYPING1));
    timers.push(setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, ANSWER_1]);
    }, T_ANSWER1));

    // typewriter in input
    const typeIv = setTimeout(() => {
      let n = 0;
      const id = setInterval(() => {
        n += 1;
        setInputChars(n);
        if (n >= TYPED_QUESTION.length) clearInterval(id);
      }, 28);
      timers.push(setTimeout(() => clearInterval(id), TYPED_QUESTION.length * 28 + 100));
    }, T_TYPE_START);
    timers.push(typeIv);

    timers.push(setTimeout(() => {
      setInputChars(0);
      setMessages((m) => [...m, { role: "user", model: "You", text: TYPED_QUESTION }]);
    }, T_MSG2));
    timers.push(setTimeout(() => setTyping(true), T_TYPING2));
    timers.push(setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, ANSWER_2]);
    }, T_ANSWER2));

    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="relative h-full w-full flex flex-col bg-white">
      {/* Traveling cursor — slowly glides to the shortcut */}
      <div
        className="absolute pointer-events-none z-30"
        style={{
          left: cursorAt === "rest" ? "55%" : cursorAt === "shortcut" ? "14%" : "14%",
          top: cursorAt === "rest" ? "94%" : cursorAt === "shortcut" ? "78%" : "78%",
          opacity: cursorAt === "gone" ? 0 : 1,
          transform: "translate(-50%, -50%)",
          transition: "left 1100ms cubic-bezier(0.4,0.2,0.2,1), top 1100ms cubic-bezier(0.4,0.2,0.2,1), opacity 300ms ease",
        }}
      >
        <MousePointer2 className="h-6 w-6 text-slate-900 fill-white drop-shadow-md" />
      </div>
      <div className="h-24 px-5 border-b border-slate-200 flex items-center gap-3">
        <img src={optixProLogo} alt="OptiX" className="h-20 w-auto" />
        <p className="text-3xl font-semibold tracking-tight text-slate-900">Ask OptiX</p>
        <div className="ml-auto flex items-center gap-1.5">
          {["Claude", "ChatGPT", "Gemini"].map((m) => (
            <span key={m} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200">{m}</span>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-4 bg-gradient-to-b from-slate-50/50 to-white scroll-smooth">
        {/* Trader personality card — fades out once chat fills up */}
        {messages.length < 2 && (
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-5 flex items-center gap-5 animate-fade-in">
            <img src={reactiveOptimizerImg} alt="Reactive Optimizer" className="h-32 w-32 rounded-xl object-cover shrink-0 ring-1 ring-slate-200" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold tracking-widest text-slate-400">YOUR TRADER PERSONALITY IS A</p>
              <h4 className="mt-1 text-xl font-bold text-slate-900">Reactive Optimizer</h4>
              <p className="mt-1.5 text-[12.5px] text-slate-600 leading-relaxed">
                You frequently adjust positions based on short-term signals rather than planned exits.
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600">
                <Sparkles className="h-3 w-3" /> <span className="underline">Deep dive</span>
              </div>
            </div>
          </div>
        )}

        {messages.map((m, i) => {
          const isUser = m.role === "user";
          const badgeColor = m.model === "Claude" ? "bg-orange-100 text-orange-700" : m.model === "ChatGPT" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700";
          return (
            <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
              <div className={`max-w-[82%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1.5`}>
                <span className={`text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full ${isUser ? "bg-blue-100 text-blue-700" : badgeColor}`}>
                  {m.model}
                </span>
                <div className={`rounded-2xl px-4 py-3 text-[13.5px] leading-[1.55] tracking-[-0.005em] font-[450] ${
                  isUser
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm shadow-[0_8px_24px_-12px_rgba(37,99,235,0.5)]"
                    : "bg-white ring-1 ring-slate-200/80 text-slate-800 rounded-tl-sm shadow-[0_6px_20px_-12px_rgba(15,40,120,0.18)]"
                }`}>
                  {m.text && <p className={m.table ? "mb-3" : ""}>{m.text}</p>}
                  {m.table && (
                    <div className="rounded-xl ring-1 ring-blue-100 overflow-hidden bg-gradient-to-b from-blue-50/60 to-white">
                      <div className="px-3 py-2 text-[10px] font-semibold tracking-widest text-blue-700 uppercase border-b border-blue-100 bg-white">
                        {m.table.title}
                      </div>
                      <table className="w-full text-[12px]">
                        <thead>
                          <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500 bg-white">
                            {m.table.headers.map((h, hi) => (
                              <th key={hi} className={`px-3 py-1.5 font-semibold ${hi === m.table!.headers.length - 1 ? "text-right" : ""}`}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {m.table.rows.map((row, ri) => (
                            <tr key={ri} className="border-t border-blue-100/70">
                              {row.map((cell, ci) => {
                                const isObj = typeof cell !== "string";
                                const text = isObj ? cell.v : cell;
                                const isLast = ci === row.length - 1;
                                return (
                                  <td
                                    key={ci}
                                    className={`px-3 py-1.5 ${isLast ? "text-right font-semibold text-blue-700" : "text-slate-700"}`}
                                  >
                                    {text}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                        {m.table.footer && (
                          <tfoot>
                            <tr className="border-t border-blue-200 bg-blue-50/70">
                              <td colSpan={m.table.headers.length - 1} className="px-3 py-2 text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                                {m.table.footer.label}
                              </td>
                              <td className="px-3 py-2 text-right text-[13px] font-bold text-blue-700">
                                {m.table.footer.value}
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {typing && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white ring-1 ring-slate-200 rounded-2xl px-4 py-3 flex gap-1">
              <span className="h-2 w-2 rounded-full bg-slate-300 animate-pulse" />
              <span className="h-2 w-2 rounded-full bg-slate-300 animate-pulse" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 rounded-full bg-slate-300 animate-pulse" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-slate-200 space-y-3">
        <div className="flex flex-wrap gap-2">
          {SHORTCUTS.map((p) => {
            const isPicked = highlight && p === PICKED_SHORTCUT;
            return (
              <button
                key={p}
                 className={`relative text-sm font-medium px-4 py-2 rounded-full ring-1 transition-all ${
                   isPicked
                     ? "bg-blue-600 text-white ring-blue-600 scale-105 shadow-[0_8px_24px_-8px_rgba(37,99,235,0.6)]"
                     : "bg-white text-slate-600 ring-slate-200"
                 }`}
              >
                {p}
                {isPicked && (
                  <span className="absolute inset-0 rounded-full ring-4 ring-blue-400/40 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 rounded-full bg-slate-50 ring-1 ring-slate-200 px-4 py-2.5">
          <MessageSquare className="h-4 w-4 text-slate-400" />
          <span className={`text-sm flex-1 ${inputChars > 0 ? "text-slate-900" : "text-slate-400"}`}>
            {inputChars > 0 ? (
              <>
                {TYPED_QUESTION.slice(0, inputChars)}
                <span className="inline-block w-px h-4 align-middle bg-slate-900 ml-px animate-pulse" />
              </>
            ) : (
              "Ask anything about your trading history…"
            )}
          </span>
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
    }, 320);
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


