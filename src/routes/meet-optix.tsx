import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  AlertTriangle,
  Database,
  MessageSquare,
  TrendingUp,
  FileText,
  Zap,
  LayoutDashboard,
  Send,
} from "lucide-react";
import optixProLogo from "@/assets/optixpro-transparent.png";
import claudeLogo from "@/assets/claude.webp.asset.json";
import chatgptLogo from "@/assets/chatgpt.webp.asset.json";
import geminiLogo from "@/assets/gemini.webp.asset.json";
import llamaLogo from "@/assets/llama.svg.asset.json";

export const Route = createFileRoute("/meet-optix")({
  head: () => ({
    meta: [
      { title: "Meet OptiX — End the spreadsheet grind" },
      {
        name: "description",
        content:
          "Why we built OptiX: to replace the manual Excel work options traders do every week with one unified, AI-powered view of their trades.",
      },
      { property: "og:title", content: "Meet OptiX — End the spreadsheet grind" },
      {
        property: "og:description",
        content:
          "Why we built OptiX: to replace the manual Excel work options traders do every week with one unified, AI-powered view of their trades.",
      },
    ],
  }),
  component: MeetOptixPage,
});

function MeetOptixPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-5 border-b border-slate-100">
        <Link to="/" className="flex items-center gap-3">
          <img src={optixProLogo} alt="OptiX" className="h-12 w-auto" />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </header>

      <article className="mx-auto max-w-3xl px-6 lg:px-0 py-16 lg:py-24">
        {/* Eyebrow + title */}
        <p className="text-[12px] font-semibold tracking-[0.2em] text-blue-600 uppercase">
          Meet OptiX · The story
        </p>
        <h1 className="mt-5 text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
          End the spreadsheet grind.
          <br />
          <span className="text-slate-500">Start understanding your trades.</span>
        </h1>
        <p className="mt-5 text-sm text-slate-500">Published June 5, 2026 · 4 min read</p>

        {/* Lead */}
        <p className="mt-10 text-lg leading-relaxed text-slate-700">
          OptiX is a unified options-trading dashboard with an AI co-pilot. Connect your
          brokers — Robinhood, Schwab, Fidelity, E*TRADE — and OptiX pulls every trade into one
          clean view. Then you can simply ask it:
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            "Why did this trade work?",
            "Why do I keep losing on Mondays?",
            "What kind of trader am I, really?",
          ].map((q) => (
            <div
              key={q}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm italic text-slate-700"
            >
              "{q}"
            </div>
          ))}
        </div>

        {/* The Excel problem */}
        <section className="mt-20">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase">The problem</span>
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">The Excel problem</h2>
          <p className="mt-4 text-slate-700 leading-relaxed">
            We built OptiX because we lived the alternative. Every serious retail options trader
            we knew kept some version of the same spreadsheet — and it always broke in the same
            ways.
          </p>

          {/* Messy spreadsheet mockup */}
          <MessySpreadsheet />

          <ul className="mt-8 space-y-3">
            {[
              "Statements exported from each broker, in different formats, every week.",
              "Manual columns for strike, expiry, leg type, opening cost, closing cost, P/L.",
              'Color-coded tabs for winners, losers, and "what was I thinking" trades.',
              "Pivot tables that broke the moment a broker added a column.",
            ].map((t) => (
              <li key={t} className="flex gap-3 text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-slate-700 leading-relaxed">
            It worked — until it didn't. The spreadsheet got slower, the data got messier, and
            the insight you actually wanted{" "}
            <span className="italic text-slate-900">
              (am I getting better? are my Friday 0DTEs bleeding me dry?)
            </span>{" "}
            always lived three formulas away from where you had time to look.
          </p>
        </section>

        {/* What OptiX does */}
        <section className="mt-20">
          <div className="flex items-center gap-2 text-blue-600">
            <Sparkles className="h-5 w-5" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase">The fix</span>
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">What OptiX does differently</h2>
          <p className="mt-4 text-slate-700 leading-relaxed">
            OptiX replaces the entire spreadsheet workflow with two things: a unified dashboard
            and a chat interface that understands your trades.
          </p>

          {/* Before → After visual */}
          <BeforeAfter />

          {/* Feature grid */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 hover:border-blue-300 hover:shadow-[0_8px_24px_-12px_rgba(37,99,235,0.25)] transition"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Built for traders */}
        <section className="mt-20">
          <h2 className="text-3xl font-bold tracking-tight">Built for traders, not accountants</h2>
          <p className="mt-4 text-slate-700 leading-relaxed">
            Existing portfolio trackers were built for buy-and-hold equity investors. They treat
            options as an afterthought — a single line item with no notion of legs, strikes, or
            expiration. OptiX was designed options-first from day one, so the dashboard speaks
            the language you already use: spreads, condors, rolls, assignments, theta decay.
          </p>
        </section>

        {/* Privacy */}
        <section className="mt-20">
          <h2 className="text-3xl font-bold tracking-tight">Your data, your models</h2>
          <p className="mt-4 text-slate-700 leading-relaxed">
            OptiX is privacy-first. Your trade data is encrypted and never used to train shared
            models. You bring your own LLM API key — Claude, ChatGPT, Gemini, or LLaMA — and
            OptiX uses it to power the chat. You stay in control of which model sees your trades
            and what it costs.
          </p>
        </section>

        {/* CTA */}
        <div className="mt-20 rounded-3xl bg-slate-900 text-white p-10 lg:p-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Stop wrangling spreadsheets.</h2>
          <p className="mt-3 text-slate-300 max-w-xl mx-auto">
            Connect your broker in a minute and let OptiX tell you what your trades have been
            trying to tell you.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white text-slate-900 px-6 py-3 text-sm font-semibold hover:bg-slate-100 transition"
          >
            Try OptiX
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </div>
  );
}

const FEATURES = [
  {
    icon: Database,
    title: "One source of truth",
    body: "Import broker statements (CSV, PDF, or direct connect). OptiX normalizes contracts, strikes, multi-leg structures, and assignments automatically.",
  },
  {
    icon: MessageSquare,
    title: "Ask your trades anything",
    body: "Plain-English chat over your full history. ‘Show my best NVDA spreads this quarter.’ ‘Why did I size up after losses?’",
  },
  {
    icon: TrendingUp,
    title: "Pattern detection",
    body: "OptiX surfaces behavioral patterns — revenge trades, FOMO entries, profitable setups — before you have to notice them yourself.",
  },
  {
    icon: FileText,
    title: "Tax-ready exports",
    body: "P/L by lot, wash-sale aware, ready for your accountant. No more reconciling broker 1099s by hand.",
  },
];

/* --------------------------------------------------------------- */
/* Messy spreadsheet illustration                                  */
/* --------------------------------------------------------------- */
function MessySpreadsheet() {
  const rows = [
    ["RH_2024-09-13.csv", "AAPL 09/20 180C", "1", "$2.41", "—", "?"],
    ["schwab_export.xlsx", "TSLA 9/22 240P x2", "", "$5.10", "$3.80", "??"],
    ["fidelity-aug.csv", "NVDA Iron Condor", "1", "", "+$120", "win"],
    ["etrade_q3.csv", "SPY 0DTE 445C", "3", "$0.88", "$0.00", "rip"],
    ["RH_2024-09-20.csv", "AAPL 180C close", "—1", "—", "$3.10", ""],
    ["manual_entry", "??? roll?", "", "", "", "fix me"],
  ];
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Title bar */}
      <div className="flex items-center justify-between bg-slate-100 px-4 py-2 border-b border-slate-200">
        <div className="flex items-center gap-2 text-slate-600">
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-medium">trades_master_v47_FINAL_final.xlsx</span>
        </div>
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
      </div>
      {/* Tabs */}
      <div className="flex gap-px bg-slate-200 px-3 pt-2 text-[10px] font-medium overflow-x-auto">
        {[
          { l: "RH", c: "bg-emerald-100 text-emerald-800" },
          { l: "Schwab", c: "bg-amber-100 text-amber-800" },
          { l: "Fidelity", c: "bg-blue-100 text-blue-800" },
          { l: "ETrade", c: "bg-violet-100 text-violet-800" },
          { l: "winners", c: "bg-emerald-200 text-emerald-900" },
          { l: "losers", c: "bg-rose-200 text-rose-900" },
          { l: "WTF", c: "bg-slate-300 text-slate-700" },
          { l: "pivot??", c: "bg-yellow-200 text-yellow-900" },
        ].map((t) => (
          <span key={t.l} className={`px-2 py-1 rounded-t ${t.c}`}>
            {t.l}
          </span>
        ))}
      </div>
      {/* Sheet */}
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] font-mono">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {["File", "Trade", "Qty", "Open", "Close", "Note"].map((h) => (
                <th key={h} className="border-b border-r border-slate-200 px-2 py-1.5 text-left font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={i % 2 ? "bg-white" : "bg-slate-50/40"}>
                {r.map((c, j) => {
                  const empty = c === "" || c === "—";
                  const flag = c === "?" || c === "??" || c === "rip" || c === "fix me";
                  return (
                    <td
                      key={j}
                      className={`border-b border-r border-slate-200 px-2 py-1.5 ${
                        empty ? "bg-rose-50" : flag ? "bg-amber-50 text-amber-700" : "text-slate-700"
                      }`}
                    >
                      {c || <span className="text-rose-400">#N/A</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="bg-rose-50">
              <td colSpan={6} className="px-2 py-1.5 text-[11px] font-mono text-rose-600">
                #REF! · =VLOOKUP(A2,Schwab!A:F,3,0) broke after Schwab renamed "Symbol" → "Underlying"
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="px-4 py-2 text-[11px] text-slate-400 italic border-t border-slate-200">
        Sunday night, every week. Sound familiar?
      </p>
    </div>
  );
}

/* --------------------------------------------------------------- */
/* Before → After visual                                           */
/* --------------------------------------------------------------- */
function BeforeAfter() {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-[1fr_auto_1fr] items-stretch">
      {/* Before */}
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5">
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-rose-600">Before</p>
        <p className="mt-2 font-semibold text-slate-900">4 brokers · 7 tabs · 0 answers</p>
        <div className="mt-4 space-y-1.5">
          {["RH.csv", "schwab.xlsx", "fidelity.csv", "etrade.csv", "manual_notes.txt"].map((f) => (
            <div
              key={f}
              className="flex items-center gap-2 rounded-md bg-white border border-rose-100 px-2.5 py-1.5 text-[11px] font-mono text-slate-600"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-rose-400" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Arrow */}
      <div className="hidden md:flex items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg">
          <Zap className="h-5 w-5" />
        </div>
      </div>

      {/* After */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5">
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-blue-600">After</p>
        <p className="mt-2 font-semibold text-slate-900">1 dashboard · 1 chat · every answer</p>
        <div className="mt-4 rounded-xl border border-blue-100 bg-white p-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="TRADES" value="482" />
            <Stat label="P/L" value="+$1.8k" />
            <Stat label="WIN" value="71%" />
          </div>
          <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-600">
            <span className="text-blue-600 font-semibold">You:</span> why am I down on Mondays?
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] tracking-widest text-slate-400">{label}</p>
      <p className="text-base font-bold text-blue-700">{value}</p>
    </div>
  );
}
