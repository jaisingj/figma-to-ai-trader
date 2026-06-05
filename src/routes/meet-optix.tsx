import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import optixProLogo from "@/assets/optixpro-transparent.png";

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

      {/* Article */}
      <article className="mx-auto max-w-3xl px-6 lg:px-0 py-16 lg:py-24">
        <p className="text-[13px] font-semibold tracking-widest text-blue-600 uppercase">
          Meet OptiX · The story
        </p>
        <h1 className="mt-4 text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
          End the spreadsheet grind. Start understanding your trades.
        </h1>
        <p className="mt-4 text-sm text-slate-500">Published June 5, 2026 · 4 min read</p>

        {/* Hero card replacement for image */}
        <div className="mt-10 rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-slate-50 p-10 lg:p-14">
          <div className="flex items-center gap-2 text-blue-600">
            <Sparkles className="h-5 w-5" />
            <span className="text-xs font-semibold tracking-widest uppercase">Why OptiX exists</span>
          </div>
          <p className="mt-4 text-2xl lg:text-3xl font-semibold leading-snug text-slate-900">
            Most options traders still spend their Sundays in Excel — copy-pasting fills from four
            brokers, fixing date columns, and trying to remember what they were thinking when they
            opened that trade.
          </p>
          <p className="mt-6 text-slate-600">
            OptiX exists to give that time back, and to turn those raw fills into something a
            trader can actually learn from.
          </p>
        </div>

        {/* Body */}
        <div className="prose prose-slate mt-12 max-w-none prose-headings:tracking-tight prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-12 prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700">
          <p className="text-lg leading-relaxed text-slate-700">
            OptiX is a unified options-trading dashboard with an AI co-pilot. You connect your
            brokers — Robinhood, Schwab, Fidelity, E*TRADE — and OptiX pulls every trade into one
            clean view. Then you can simply ask it: <em>why did this trade work?</em>{" "}
            <em>why do I keep losing on Mondays?</em> <em>what kind of trader am I, really?</em>
          </p>

          <h2>The Excel problem</h2>
          <p>
            We built OptiX because we lived the alternative. Every serious retail options trader we
            knew kept some version of the same spreadsheet:
          </p>
          <ul>
            <li>Statements exported from each broker, in different formats, every week.</li>
            <li>Manual columns for strike, expiry, leg type, opening cost, closing cost, P/L.</li>
            <li>Color-coded tabs for winners, losers, "what was I thinking" trades.</li>
            <li>Pivot tables that broke the moment a new broker added a column.</li>
          </ul>
          <p>
            It worked — until it didn't. The spreadsheet got slower, the data got messier, and the
            insight you actually wanted (am I getting better? are my Friday 0DTEs bleeding me dry?)
            always lived three formulas away from where you had time to look.
          </p>

          <h2>What OptiX does differently</h2>
          <p>
            OptiX replaces that entire workflow with two things: a unified dashboard and a chat
            interface that understands your trades.
          </p>
          <div className="not-prose mt-6 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "One source of truth",
                body: "Import broker statements (CSV, PDF, or direct connect). OptiX normalizes contracts, strikes, multi-leg structures, and assignments automatically.",
              },
              {
                title: "Ask your trades anything",
                body: "Plain-English chat over your full history. ‘Show my best NVDA spreads this quarter.’ ‘Why did I size up after losses?’",
              },
              {
                title: "Pattern detection",
                body: "OptiX surfaces behavioral patterns — revenge trades, FOMO entries, profitable setups — before you have to notice them yourself.",
              },
              {
                title: "Tax-ready exports",
                body: "P/L by lot, wash-sale aware, ready for your accountant. No more reconciling broker 1099s by hand.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 hover:border-blue-200 hover:shadow-sm transition"
              >
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">{f.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{f.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2>Built for traders, not accountants</h2>
          <p>
            Existing portfolio trackers were built for buy-and-hold equity investors. They treat
            options as an afterthought — a single line item with no notion of legs, strikes, or
            expiration. OptiX was designed options-first from day one, so the dashboard speaks the
            language you already use: spreads, condors, rolls, assignments, theta decay.
          </p>

          <h2>Your data, your models</h2>
          <p>
            OptiX is privacy-first. Your trade data is encrypted and never used to train shared
            models. You bring your own LLM API key — Claude, ChatGPT, Gemini, or LLaMA — and OptiX
            uses it to power the chat. You stay in control of which model sees your trades and
            what it costs.
          </p>

          <h2>What's next</h2>
          <p>
            We're rolling out OptiX Pro for active traders, OptiX Mobile for on-the-go review, and
            OptiX for Teams for trading groups and prop desks. The goal stays the same: take the
            grunt work out of trading review so you can actually get better at the trade.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-3xl bg-slate-900 text-white p-10 lg:p-14 text-center">
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
          </Link>
        </div>
      </article>
    </div>
  );
}
