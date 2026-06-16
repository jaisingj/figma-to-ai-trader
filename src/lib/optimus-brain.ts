/**
 * optimus-brain.ts
 * Port of the user's Python "Optimus" intelligence layer for the in-browser chatbot.
 *
 * Design principle (from the original): the LLM NEVER does arithmetic.
 * We pre-compute every metric in TypeScript and hand the model:
 *   1. A strict identity / behaviour system prompt
 *   2. A COMPUTED RESULTS block of verified numbers
 *   3. A PORTFOLIO PERSONALITY block for style/risk questions
 *   4. A small RAG-style sample of recent rows
 */

import type { Trade } from "./trades-store";

// ─────────────────────────────────────────────────────────────────────────────
// Ticker → Company map (subset of the Python file — voice/text uses names)
// ─────────────────────────────────────────────────────────────────────────────
export const TICKER_TO_COMPANY: Record<string, string> = {
  AAPL: "Apple", MSFT: "Microsoft", GOOGL: "Google", GOOG: "Google",
  AMZN: "Amazon", NVDA: "Nvidia", META: "Meta", TSLA: "Tesla",
  "BRK.B": "Berkshire", LLY: "Eli Lilly", V: "Visa", JPM: "JPMorgan",
  UNH: "UnitedHealth", XOM: "ExxonMobil", MA: "Mastercard", AVGO: "Broadcom",
  JNJ: "Johnson & Johnson", PG: "Procter & Gamble", HD: "Home Depot",
  COST: "Costco", MRK: "Merck", ABBV: "AbbVie", CVX: "Chevron", ORCL: "Oracle",
  BAC: "Bank of America", CRM: "Salesforce", AMD: "AMD", KO: "Coca-Cola",
  PEP: "PepsiCo", WMT: "Walmart", DIS: "Disney", PFE: "Pfizer", ADBE: "Adobe",
  NFLX: "Netflix", QCOM: "Qualcomm", INTC: "Intel", IBM: "IBM",
  SPY: "S&P 500 ETF", QQQ: "Nasdaq ETF", IWM: "Russell 2000 ETF",
  GLD: "Gold ETF", TLT: "Treasury Bond ETF", COIN: "Coinbase", HOOD: "Robinhood",
  PLTR: "Palantir", SHOP: "Shopify", SQ: "Block", PYPL: "PayPal",
  BA: "Boeing", F: "Ford", GM: "General Motors", SBUX: "Starbucks",
};

export function tickerToName(t: string): string {
  return TICKER_TO_COMPANY[t.toUpperCase()] ?? t.toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// Master system prompt — ported verbatim from optimus_brain.py
// ─────────────────────────────────────────────────────────────────────────────
export const OPTIMUS_SYSTEM_PROMPT = `
You are **Optimus**, an expert options trading portfolio analyst and coach.

═══════════════════════════════════════════════════════════
IDENTITY & SCOPE — READ THIS FIRST
═══════════════════════════════════════════════════════════
• You ONLY answer questions about the user's OWN trading data that has been uploaded.
• You do NOT give market predictions, stock tips, live quotes, or general financial advice.
• If a question is outside the uploaded data, respond: "I can only analyze your uploaded transaction history. That question requires live market data I don't have access to."
• You do NOT fabricate numbers. Every figure you state must come from COMPUTED RESULTS provided in this prompt — never from your training knowledge or from the sample rows.

═══════════════════════════════════════════════════════════
DATA MODEL — HOW THE USER'S DATA IS STRUCTURED
═══════════════════════════════════════════════════════════
Each row = one option contract lifecycle (STO → BTC or expiry/assignment).

Key columns:
  Activity Date / STO Date : date the position was opened
  Instrument               : stock ticker (AAPL, TSLA, etc.)
  Option Type              : "Put" or "Call"
  Quantity                 : number of contracts (1 contract = 100 shares)
  Strike Price             : the strike in dollars
  Expiry Date              : option expiration date
  STO($)                   : premium received when selling to open (positive)
  BTC($)                   : premium paid when buying to close (negative; 0 if expired/assigned)
  Status                   : Open | Closed | Expired | Rolled | Assigned
  Premium($)               : net premium = STO($) + BTC($)
                              • Closed (abs(BTC) < STO) → positive
                              • Rolled (abs(BTC) > STO) → NEGATIVE (loss on the roll)
                              • Open / Expired (no BTC)  → equals STO
  Collateral               : cash or share value securing the position
  Broker                   : Robinhood | Schwab | Fidelity

Status definitions:
  Open      = position still live
  Closed    = bought to close
  Expired   = held to expiration (typically worthless, full STO kept)
  Rolled    = closed at a loss AND a new higher STO opened same day same ticker/qty
  Assigned  = exercised against the user

═══════════════════════════════════════════════════════════
OPTIONS TRADING DOMAIN KNOWLEDGE
═══════════════════════════════════════════════════════════
Cash-Secured Put (CSP): user sells a Put. Collateral = Strike × 100 × Qty.
  ROI = Net Premium / Cash Collateral × 100%.
Covered Call (CC): user sells a Call against owned shares.
  Collateral = Stock Price × 100 × Qty.
Premium Income (general): collect premium by selling options.
  "Win" = closed/expired with positive net premium.
  "Loss" = rolled (negative premium) or assigned at a loss.
Rolling: BTC at a loss + simultaneous STO further-dated. Original row is Rolled
  with NEGATIVE Premium($); new STO appears as a separate Open row.

═══════════════════════════════════════════════════════════
RESPONSE FORMAT RULES — CRITICAL
═══════════════════════════════════════════════════════════
1. ALWAYS lead with the direct answer / key number. No "Sure!" / "Great question!".
2. Use **bold** for dollar amounts, percentages, and counts.
3. SHORT responses for simple factual questions (1–3 sentences).
4. NEVER read individual trade rows unless explicitly asked.
   WRONG: "Trade 1: Apple Jan 15 $150 Put $120. Trade 2: ..."
   RIGHT: "You made **5 trades** in January: **3 puts, 2 calls**. Average premium **$118**. **4 closed**, **1 still open**."
5. For lists ≤ 5, bullets are fine. For > 5, summarize (top 3 + "and N more").
6. Status breakdown only when relevant.
7. Say "You have X trades", not "I found X rows".
8. For ROI, always state the formula.
9. If nothing matches: "No trades found for that period/filter."
10. Never volunteer information the user didn't ask for.
11. Avoid markdown tables — voice-friendly prose.

═══════════════════════════════════════════════════════════
COMPANY NAMES
═══════════════════════════════════════════════════════════
Prefer company names in prose ("Apple" not "AAPL"). In written responses
"Apple (AAPL)" is fine.

═══════════════════════════════════════════════════════════
ANALYTICAL / PERSONALITY QUESTIONS (use COMPUTED RESULTS + PERSONALITY)
═══════════════════════════════════════════════════════════
You CAN and SHOULD answer style / risk / consistency questions using the
PORTFOLIO PERSONALITY block. Examples:
"What's my risk tolerance?" → cite risk_level + risk_note.
"What's my trading style?"  → cite style + style_note.
"How am I doing?"           → cite overall_health, total_premium, win_rate_pct.
"What should I improve?"    → use rolled_count, concentration, capital_deployed_pct.
"Am I consistent?"          → cite consistency + consistency_note.

═══════════════════════════════════════════════════════════
HANDLING TABULAR DATA
═══════════════════════════════════════════════════════════
The COMPUTED RESULTS section contains pre-calculated Python-equivalent values.
These are the ONLY numbers you may use. If a number appears in the SAMPLE ROWS
but NOT in COMPUTED RESULTS, ignore it.
`.trim();

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function pick(row: Trade, keys: string[]): unknown {
  const map = new Map<string, string>();
  for (const k of Object.keys(row)) map.set(k.toLowerCase(), k);
  for (const k of keys) {
    const real = map.get(k.toLowerCase());
    if (real == null) continue;
    const v = row[real];
    if (v != null && v !== "") return v;
  }
  return undefined;
}
function toNum(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const cleaned = v.replace(/[$,\s]/g, "").replace(/^\((.+)\)$/, "-$1");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}
function toDate(v: unknown): Date | null {
  if (!v) return null;
  const d = new Date(v as string);
  return isNaN(d.getTime()) ? null : d;
}
function ymd(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : "";
}
function monthKey(d: Date | null): string {
  return d ? d.toISOString().slice(0, 7) : "";
}

type OptimusRow = {
  date: Date | null;
  expiry: Date | null;
  instrument: string;
  optionType: string;
  quantity: number;
  strike: number;
  sto: number;
  btc: number;
  premium: number;
  collateral: number;
  status: string;
  broker: string;
};

function normalizeForOptimus(rows: Trade[]): OptimusRow[] {
  return rows.map((r) => {
    const sto = toNum(pick(r, ["STO($)", "STO $", "STO"]));
    const btc = toNum(pick(r, ["BTC($)", "BTC $", "BTC"]));
    const premRaw = pick(r, ["Premium($)", "Premium $", "Premium", "Net Premium"]);
    const premium = premRaw != null ? toNum(premRaw) : sto + btc;
    const qty = toNum(pick(r, ["Quantity", "Qty", "Contracts"]));
    const strike = toNum(pick(r, ["Strike Price", "Strike"]));
    const collRaw = toNum(pick(r, ["Collateral"]));
    const collateral = collRaw > 0 ? collRaw : Math.abs(qty) * strike * 100;
    return {
      date: toDate(pick(r, ["Activity Date", "STO Date", "Trade Date", "Date", "Run Date"])),
      expiry: toDate(pick(r, ["Expiry Date", "Expiration", "Expiration Date"])),
      instrument: String(pick(r, ["Instrument", "Symbol", "Ticker"]) ?? "").toUpperCase(),
      optionType: String(pick(r, ["Option Type", "Type"]) ?? "").trim(),
      quantity: qty,
      strike,
      sto,
      btc,
      premium,
      collateral,
      status: String(pick(r, ["Status"]) ?? "").trim(),
      broker: String(pick(r, ["Broker"]) ?? "").trim(),
    };
  });
}

// Period slicing (matches Python _period_df)
function periodSlice(rows: OptimusRow[], period: string): OptimusRow[] {
  if (period === "all_time" || !period) return rows;
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  let start: Date;
  let end: Date = new Date(y, m + 1, 1);
  if (period === "this_month") {
    start = new Date(y, m, 1);
  } else if (period === "last_month") {
    start = new Date(y, m - 1, 1);
    end = new Date(y, m, 1);
  } else if (period === "ytd") {
    start = new Date(y, 0, 1);
  } else if (period === "ttm") {
    start = new Date(y - 1, m, today.getDate());
    end = today;
  } else if (period === "last_3_months") {
    start = new Date(y, m - 3, 1);
  } else {
    return rows;
  }
  return rows.filter((r) => r.date && r.date >= start && r.date < end);
}

// ─────────────────────────────────────────────────────────────────────────────
// compute_portfolio_metrics — TS port
// ─────────────────────────────────────────────────────────────────────────────
export type PortfolioMetrics = ReturnType<typeof computePortfolioMetrics>;

export function computePortfolioMetrics(
  rawRows: Trade[],
  period: string = "all_time",
  ticker?: string,
) {
  if (!rawRows || rawRows.length === 0) {
    return { error: "No trading data available. Please upload your transactions." } as const;
  }
  let work = normalizeForOptimus(rawRows);
  work = periodSlice(work, period);
  if (ticker) work = work.filter((r) => r.instrument === ticker.toUpperCase());
  if (work.length === 0) {
    return { error: `No${ticker ? " " + ticker : ""} trades found for the selected period (${period}).` } as const;
  }

  const isStatus = (s: string) => (r: OptimusRow) => r.status.toLowerCase() === s;
  const open = work.filter(isStatus("open"));
  const closed = work.filter(isStatus("closed"));
  const expired = work.filter(isStatus("expired"));
  const rolled = work.filter(isStatus("rolled"));
  const assigned = work.filter(isStatus("assigned"));
  const puts = work.filter((r) => r.optionType.toLowerCase() === "put");
  const calls = work.filter((r) => r.optionType.toLowerCase() === "call");

  const sum = (a: OptimusRow[], f: (r: OptimusRow) => number) => a.reduce((s, r) => s + (Number.isFinite(f(r)) ? f(r) : 0), 0);
  const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

  const totalPremium = sum(work, (r) => r.premium);
  const resolved = [...closed, ...expired, ...rolled, ...assigned];
  const winners = resolved.filter((r) => r.premium > 0).length;
  const losers = resolved.length - winners;
  const winRate = resolved.length ? (winners / resolved.length) * 100 : 0;

  const positivePrems = work.map((r) => r.premium).filter((p) => p > 0);

  // Best / worst
  const sorted = [...work].sort((a, b) => b.premium - a.premium);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const trim = (r: OptimusRow) => ({
    instrument: r.instrument || "N/A",
    premium: round(r.premium),
    date: ymd(r.date),
    status: r.status || "N/A",
    option_type: r.optionType || "N/A",
    strike: r.strike,
  });

  // Collateral
  const totalCollateral = sum(work, (r) => r.collateral);
  const openCollateral = sum(open, (r) => r.collateral);
  const resolvedPremium = sum(resolved, (r) => r.premium);
  const resolvedColl = sum(resolved, (r) => r.collateral);
  const overallRoiPct = resolvedColl > 0 ? round((resolvedPremium / resolvedColl) * 100) : null;

  // Monthly buckets
  const monthlyPremium: Record<string, number> = {};
  const monthlyColl: Record<string, number> = {};
  for (const r of work) {
    const k = monthKey(r.date);
    if (!k) continue;
    monthlyPremium[k] = (monthlyPremium[k] ?? 0) + r.premium;
    monthlyColl[k] = (monthlyColl[k] ?? 0) + r.collateral;
  }
  const monthlyRoi: Record<string, { premium: number; roi_pct: number | null }> = {};
  for (const k of Object.keys(monthlyPremium)) {
    const p = monthlyPremium[k];
    const c = monthlyColl[k];
    monthlyRoi[k] = { premium: round(p), roi_pct: c > 0 ? round((p / c) * 100) : null };
  }

  // Top tickers (by net premium)
  const tickerMap = new Map<string, number>();
  for (const r of work) tickerMap.set(r.instrument, (tickerMap.get(r.instrument) ?? 0) + r.premium);
  const topTickers = Object.fromEntries(
    Array.from(tickerMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k, v]) => [k, round(v)]),
  );

  // Upcoming expiries (open within 30d)
  const today = new Date();
  const in30 = new Date(today.getTime() + 30 * 86400000);
  const upcoming = open
    .filter((r) => r.expiry && r.expiry >= today && r.expiry <= in30)
    .sort((a, b) => (a.expiry!.getTime() - b.expiry!.getTime()))
    .slice(0, 5)
    .map((r) => ({
      instrument: r.instrument,
      expiry: ymd(r.expiry),
      strike: r.strike,
      option_type: r.optionType,
      premium: round(r.premium),
    }));

  // Open positions detail (max 10)
  const openPositions = open.slice(0, 10).map((r) => ({
    instrument: r.instrument,
    option_type: r.optionType,
    strike: r.strike,
    expiry: ymd(r.expiry),
    premium: round(r.premium),
    collateral: round(r.collateral),
    date_opened: ymd(r.date),
  }));

  const dates = work.map((r) => r.date).filter((d): d is Date => !!d).sort((a, b) => a.getTime() - b.getTime());
  const dateRange = dates.length ? `${ymd(dates[0])} → ${ymd(dates[dates.length - 1])}` : "unknown";

  return {
    total_trades: work.length,
    open_count: open.length,
    closed_count: closed.length,
    expired_count: expired.length,
    rolled_count: rolled.length,
    assigned_count: assigned.length,
    put_count: puts.length,
    call_count: calls.length,

    total_premium: round(totalPremium),
    open_premium: round(sum(open, (r) => r.premium)),
    closed_premium: round(sum(closed, (r) => r.premium)),
    expired_premium: round(sum(expired, (r) => r.premium)),
    rolled_net_premium: round(sum(rolled, (r) => r.premium)),
    put_premium: round(sum(puts, (r) => r.premium)),
    call_premium: round(sum(calls, (r) => r.premium)),
    avg_premium_winners: round(positivePrems.length ? positivePrems.reduce((a, b) => a + b, 0) / positivePrems.length : 0),
    avg_premium_all: round(totalPremium / work.length),

    win_rate_pct: round(winRate, 1),
    winners_count: winners,
    losers_count: losers,
    best_trade: best ? trim(best) : {},
    worst_trade: worst ? trim(worst) : {},

    total_collateral: round(totalCollateral),
    open_collateral: round(openCollateral),
    overall_roi_pct: overallRoiPct,
    monthly_roi: monthlyRoi,
    monthly_premium: Object.fromEntries(Object.entries(monthlyPremium).map(([k, v]) => [k, round(v)])),

    top_tickers: topTickers,
    upcoming_expiries: upcoming,
    open_positions: openPositions,
    tickers_in_scope: Array.from(new Set(work.map((r) => r.instrument))).sort(),

    period,
    ticker_filter: ticker ?? null,
    data_date_range: dateRange,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// compute_portfolio_personality — TS port
// ─────────────────────────────────────────────────────────────────────────────
export function computePortfolioPersonality(m: PortfolioMetrics) {
  if ("error" in m) return null;
  const total = m.total_trades;
  const rolled = m.rolled_count;
  const winR = m.win_rate_pct;
  const puts = m.put_count;
  const calls = m.call_count;
  const prem = m.total_premium;
  const openCol = m.open_collateral;
  const totCol = m.total_collateral;
  const monthly = Object.values(m.monthly_premium);

  const rollRate = total > 0 ? (rolled / total) * 100 : 0;
  const colRatio = totCol > 0 ? (openCol / totCol) * 100 : 0;

  let risk_level: string, risk_note: string;
  if (rollRate > 20 || colRatio > 70) {
    risk_level = "Aggressive";
    risk_note = `You roll ${rollRate.toFixed(0)}% of your trades and have ${colRatio.toFixed(0)}% of capital deployed in open positions.`;
  } else if (rollRate > 8 || colRatio > 40) {
    risk_level = "Moderate";
    risk_note = `You roll about ${rollRate.toFixed(0)}% of trades and have ${colRatio.toFixed(0)}% of capital in open positions.`;
  } else {
    risk_level = "Conservative";
    risk_note = `Only ${rollRate.toFixed(0)}% of trades were rolled and ${colRatio.toFixed(0)}% of capital is currently deployed.`;
  }

  let style: string, style_note: string;
  if (puts + calls > 0) {
    const ratio = (puts / (puts + calls)) * 100;
    if (ratio > 70) { style = "CSP-focused income seller"; style_note = `${ratio.toFixed(0)}% puts — primarily selling cash-secured puts for income.`; }
    else if (ratio < 30) { style = "Covered call writer"; style_note = `${(100 - ratio).toFixed(0)}% calls — primarily selling covered calls.`; }
    else { style = "Wheel / balanced trader"; style_note = `Mix of ${puts} puts and ${calls} calls — likely running a wheel strategy.`; }
  } else {
    style = "Options seller"; style_note = "Option type data unavailable.";
  }

  let consistency: string, consistency_note: string;
  if (monthly.length >= 3) {
    const mean = monthly.reduce((a, b) => a + b, 0) / monthly.length;
    const variance = monthly.reduce((a, b) => a + (b - mean) ** 2, 0) / monthly.length;
    const stdev = Math.sqrt(variance);
    const cv = mean !== 0 ? (stdev / Math.abs(mean)) * 100 : 0;
    if (cv < 30) { consistency = "Very consistent"; consistency_note = `Monthly premium variance is low (CV ${cv.toFixed(0)}%).`; }
    else if (cv < 60) { consistency = "Moderately consistent"; consistency_note = `Some month-to-month variation (CV ${cv.toFixed(0)}%).`; }
    else { consistency = "Inconsistent / opportunistic"; consistency_note = `High month-to-month swings (CV ${cv.toFixed(0)}%) — trading when opportunities arise.`; }
  } else {
    consistency = "Insufficient data"; consistency_note = "Need more months of data to assess consistency.";
  }

  let concentration: string;
  const topEntries = Object.entries(m.top_tickers);
  if (topEntries.length && prem !== 0) {
    const [topT, topV] = topEntries[0];
    const topName = tickerToName(topT);
    const topShare = (topV / prem) * 100;
    if (topShare > 50) concentration = `Highly concentrated in ${topName} (${topShare.toFixed(0)}% of premium)`;
    else if (topShare > 30) concentration = `Moderately concentrated — ${topName} is top earner at ${topShare.toFixed(0)}%`;
    else concentration = `Well diversified across ${topEntries.length} tickers`;
  } else {
    concentration = "Diversification data unavailable";
  }

  const roi = m.overall_roi_pct ?? 0;
  let overall_health: string;
  if (winR >= 75 && roi >= 5) overall_health = "Strong";
  else if (winR >= 55 && roi >= 2) overall_health = "Good";
  else if (winR >= 40) overall_health = "Developing";
  else overall_health = "Needs attention";

  return {
    risk_level, risk_note,
    style, style_note,
    consistency, consistency_note,
    concentration, overall_health,
    roll_rate_pct: Math.round(rollRate * 10) / 10,
    capital_deployed_pct: Math.round(colRatio * 10) / 10,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Question → period inference (lightweight)
// ─────────────────────────────────────────────────────────────────────────────
export function inferPeriod(q: string): string {
  const s = q.toLowerCase();
  if (/\bthis month\b|\bmtd\b/.test(s)) return "this_month";
  if (/\blast month\b/.test(s)) return "last_month";
  if (/\bytd\b|year to date|this year/.test(s)) return "ytd";
  if (/\bttm\b|trailing.*12|last 12 months/.test(s)) return "ttm";
  if (/last 3 months|last quarter/.test(s)) return "last_3_months";
  return "all_time";
}

export function inferTicker(q: string): string | undefined {
  const m = q.toUpperCase().match(/\b([A-Z]{1,5})\b/g);
  if (!m) return;
  for (const tok of m) if (TICKER_TO_COMPANY[tok]) return tok;
  return;
}

// ─────────────────────────────────────────────────────────────────────────────
// Build the full prompt block: COMPUTED + PERSONALITY + SAMPLE
// ─────────────────────────────────────────────────────────────────────────────
export function buildOptimusContext(rawRows: Trade[], question: string): string {
  if (!rawRows || rawRows.length === 0) {
    return "COMPUTED RESULTS:\n(No trading data uploaded. Tell the user to upload their CSV.)";
  }
  const period = inferPeriod(question);
  const ticker = inferTicker(question);
  const metrics = computePortfolioMetrics(rawRows, period, ticker);
  const personality = "error" in metrics ? null : computePortfolioPersonality(metrics);

  // Tiny RAG sample: 8 most recent rows, lean columns
  const sample = rawRows
    .slice()
    .sort((a, b) => {
      const da = new Date(String(a["Activity Date"] ?? a["Date"] ?? "")).getTime();
      const db = new Date(String(b["Activity Date"] ?? b["Date"] ?? "")).getTime();
      return db - da;
    })
    .slice(0, 8)
    .map((r) => ({
      date: r["Activity Date"] ?? r["Date"] ?? null,
      ticker: r["Instrument"] ?? r["Symbol"] ?? null,
      type: r["Option Type"] ?? null,
      strike: r["Strike Price"] ?? r["Strike"] ?? null,
      expiry: r["Expiry Date"] ?? null,
      qty: r["Quantity"] ?? null,
      premium: r["Premium($)"] ?? null,
      status: r["Status"] ?? null,
    }));

  return [
    `USER QUESTION: ${question}`,
    `INFERRED PERIOD: ${period}${ticker ? `   TICKER: ${ticker}` : ""}`,
    "",
    "COMPUTED RESULTS (authoritative — use ONLY these numbers):",
    JSON.stringify(metrics, null, 2),
    "",
    "PORTFOLIO PERSONALITY (use for style/risk/health questions):",
    JSON.stringify(personality, null, 2),
    "",
    "SAMPLE ROWS (most recent — for shape/context only, NOT for numbers):",
    JSON.stringify(sample, null, 2),
  ].join("\n");
}
