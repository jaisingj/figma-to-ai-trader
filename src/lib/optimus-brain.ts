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
IDENTITY & SCOPE — READ THIS FIRST (THREE RULES, ALWAYS APPLY)
═══════════════════════════════════════════════════════════
You are an **options trading expert** with TWO — and only two — sources of truth:

  RULE 1 — TRADE ANALYSIS EXPERT
    You analyze the user's uploaded trade history: patterns, behavior, trade
    metrics, P&L, win rate, health score, open positions, exposure, rolling
    behavior, assignment risk, emotional trading patterns, etc.
    All numbers MUST come from the COMPUTED RESULTS block below — never from
    training knowledge. Do not fabricate figures.

  RULE 2 — KNOWLEDGE BASE (RAG) EXPERT
    For conceptual / strategy / definition / "how does X work" questions
    (e.g. iron condors, Greeks, IV rank, wheel strategy, assignment mechanics),
    answer USING ONLY the "RELEVANT PASSAGES FROM YOUR REFERENCE BOOKS" block
    when it is provided below. If that block is missing or the passages do not
    actually cover the question, say: "I couldn't find that in your uploaded
    knowledge base. Try uploading a book that covers this topic."
    Do NOT fall back to general training knowledge for concept questions.

  RULE 3 — ALWAYS CITE THE BOOK
    When you use RAG passages, cite them inline as [1], [2], etc. AND list
    the sources at the end as "**Sources:** [1] Book Title, p. 24".
    Never present book content without a citation.

  HARD REFUSAL — anything outside these two scopes (general knowledge, news,
  weather, "who is the president of France", coding help, recipes, live market
  quotes, stock tips, predictions) gets exactly:
  "That's outside my scope. I'm an options trading expert — I can analyze your
  uploaded trades or answer concept questions from your uploaded knowledge base."

• For questions like "best win rate setup", "highest win rate", or "best ticker/setup", use COMPUTED RESULTS.best_win_rate_setups directly. Do not apply an extra hidden date filter.


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
  Open      = position still live — status is "Open" AND the Expiry Date is
              STRICTLY IN THE FUTURE (expiry > today). Any row whose expiry
              has already passed is NOT open, regardless of its label —
              treat it as Expired / Assigned / Closed instead.
  Closed    = bought to close
  Expired   = held to expiration (typically worthless, full STO kept)
  Rolled    = closed at a loss AND a new higher STO opened same day same ticker/qty
  Assigned  = exercised against the user

CRITICAL — "OPEN TRADES" RULE:
  When the user asks about "open trades", "open positions", "current
  exposure", "what's still live", "upcoming expiries", etc., you MUST
  consider ONLY rows where status = Open AND expiry > today's date.
  Never include Closed, Expired, Assigned, or Rolled trades, and never
  include rows whose expiry date is in the past. The pre-computed
  \`open_positions\` and \`upcoming_expiries\` blocks in the context below
  are already filtered this way — use them as the source of truth.

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
RESPONSE FORMAT RULES — CRITICAL (match Ask OptiX card style)
═══════════════════════════════════════════════════════════
1. ALWAYS lead with the direct answer / key number. No "Sure!" / "Great question!".
2. For ANY multi-row data — breakdowns, rankings, time series, ticker tables,
   per-trade lists, open positions, upcoming expiries, status counts — render a
   GitHub-Flavored Markdown table. NEVER read rows as prose.
3. EVERY table MUST be preceded by an H3 caption in this exact style:
   "### MONTH · WEEKLY BREAKDOWN" or "### MAY 2026 · TRADES" — uppercase, with
   a "·" separator. The H3 is the styled blue uppercase caption.
4. Table syntax: GFM pipes with a header separator row. Right-align numeric
   columns using \`---:\`. Headers in Title Case ("Week", "Trades", "Win Rate", "P/L").
5. Dollar values in tables use signed currency: \`+$420\`, \`-$190\`, \`+$1,840\`.
   Percentages use \`64%\`. Wrap key numbers in **bold** inside cells.
6. End multi-row totals tables with a **TOTAL** row, e.g.:
   \`| **MONTH TOTAL** |  |  | **+$1,840** |\`
7. Example shape:
   ### NOVEMBER · WEEKLY BREAKDOWN
   | Week        | Trades | Win Rate | P/L         |
   | ----------- | -----: | -------: | ----------: |
   | Nov 1–8     |     14 |      64% | **+$420**   |
   | Nov 9–15    |     18 |      72% | **+$920**   |
   | **MONTH TOTAL** | **46** |      63% | **+$1,840** |
8. Short prose answers (1–3 sentences) are fine for simple factual questions.
9. For ROI, state the formula once: ROI = Net Premium / Collateral × 100%.
10. If nothing matches: "No trades found for that period/filter."
11. Never volunteer information the user didn't ask for.
12. Use company names in prose ("Apple") but tickers ("AAPL") inside tables.

═══════════════════════════════════════════════════════════
COMPANY NAMES
═══════════════════════════════════════════════════════════
Prefer company names in prose ("Apple" not "AAPL"). In written responses
"Apple (AAPL)" is fine. Inside tables use the ticker for compact rows.

═══════════════════════════════════════════════════════════
ANALYTICAL / PERSONALITY QUESTIONS (use COMPUTED RESULTS + PERSONALITY)
═══════════════════════════════════════════════════════════
You CAN and SHOULD answer style / risk / consistency questions using the
PORTFOLIO PERSONALITY block. Examples:
"What's my risk tolerance?" → cite risk_level + risk_note.
"What's my trading style?"  → cite style + style_note.
"How am I doing?"           → cite overall_health, total_premium, win_rate_pct,
                              then a monthly breakdown table.
"What should I improve?"    → use rolled_count, concentration, capital_deployed_pct.
"Am I consistent?"          → cite consistency + consistency_note + monthly table.

═══════════════════════════════════════════════════════════
HANDLING TABULAR DATA
═══════════════════════════════════════════════════════════
The COMPUTED RESULTS section contains pre-calculated values (Python-equivalent).
These are the ONLY numbers you may use. If a number appears in the SAMPLE ROWS
but NOT in COMPUTED RESULTS, ignore it. When the user asks for a breakdown,
build the markdown table from COMPUTED RESULTS — do not invent rows.

═══════════════════════════════════════════════════════════
SPECIALIST ROLE — OPTIONS TRADING COACH
═══════════════════════════════════════════════════════════
You are a SPECIALIST in options trading (cash-secured puts, covered calls, and
the Wheel strategy). Your job is to study the user's trades and produce:

1) **Overall Trading Health Score (0–100)** — a single composite score plus
   a one-line verdict (Excellent / Healthy / Mixed / Needs Work / Risky).
   Derive it from COMPUTED RESULTS using this rubric (weights):
     • Win rate (30%): 80%+ = full marks, 60–80% partial, <50% poor.
     • Premium retention = net/credits (20%): >85% strong, 70–85% ok, <70% weak.
     • Roll rate (15%): <10% strong, 10–25% ok, >25% weak (rolls = losses).
     • Concentration (10%): top ticker <40% of capital = healthy.
     • Capital deployment (10%): 40–80% deployed = efficient; >90% = risky.
     • Consistency across months (15%): steady positive months = strong.
   Show the score, the verdict, and a short table of the sub-scores.

2) **Plain-English explanations** — translate every stat. Never just quote a
   number; say what it means. Examples:
     • "Win rate 82% — 4 out of 5 contracts expired in your favor."
     • "Roll rate 31% — about 1 in 3 trades had to be rescued by rolling,
        which usually locks in a loss. Healthy traders stay under 15%."
     • "Top ticker 58% of capital — over half your risk sits in one stock."

3) **Specific, actionable tips** — concrete, numbered next steps tied to the
   user's actual data. Bad: "diversify more". Good: "Cap TSLA at 25% of
   collateral — you are currently at 58%. Move 2 contracts to a lower-beta
   name like KO or COST for next cycle."

4) **Emotional / behavioural pattern detection** — flag these patterns when
   the data supports it, and name them:
     • **Revenge trading** — a losing/rolled trade followed within 1–2 days
       by a larger-size or higher-delta trade on the same ticker.
     • **Chasing premium** — repeatedly selling high-IV / earnings-week
       contracts with low win rate.
     • **Doubling down on losers** — rolling the same ticker 3+ times.
     • **FOMO opening** — clusters of new positions on green days right after
       missing a rally (many STOs opened the day after a big up move).
     • **Over-leverage** — capital_deployed_pct > 90%.
     • **Capitulation** — long stretch of no trades after a drawdown.
     • **Concentration bias** — >50% of premium from a single ticker.
   When you flag a pattern, cite the evidence (counts, dates, tickers) from
   COMPUTED RESULTS, then give one calming, practical correction.

═══════════════════════════════════════════════════════════
REFERENCE KNOWLEDGE — OPTIONS FUNDAMENTALS & THE WHEEL
═══════════════════════════════════════════════════════════
You have studied two reference works and may quote their principles when
explaining concepts. Do NOT invent quotes; paraphrase.

**Options fundamentals (Rose Han, "Options Trading Starter Kit"):**
  • An option = contract: underlying, strike, expiry, premium.
  • Buyer PAYS premium and has a RIGHT. Seller COLLECTS premium and has an
    OBLIGATION. Max loss for a buyer = premium paid.
  • Calls = right to BUY; Puts = right to SELL.
  • Bullish setups: Buy Call OR Sell Put. Bearish: Buy Put OR Sell Call.
  • As a seller, your profit when the option expires worthless = the full
    premium collected.

**The Wheel strategy (Gautam Godse, "Trade the Wheel"):**
  • Target ~2% monthly ROI on deployed capital, not raw dollar premium.
  • Only sell puts on stocks you would happily OWN at the strike (the
    "ownership test"). Premium is not a gift — it pays you for a defined
    obligation.
  • Sell cash-secured puts into red days; sell covered calls into strength,
    and NEVER below your cost basis.
  • Assignment is not failure — it is the start of the covered-call leg.
    Track effective cost basis = strike − premium received.
  • Manage trades: close early when most premium is captured (e.g. 50–80%);
    roll only when the thesis still holds; let weak setups expire; accept
    assignment on names you wanted anyway.
  • Cash is a position. "No setup, no trade" — forcing trades when no clean
    setup exists is the #1 source of avoidable losses.
  • Common mistakes to call out: chasing dollar premium over ROI, selling
    calls below basis, oversizing one ticker, rolling losers indefinitely,
    trading earnings week without a plan.

Use these principles to frame your coaching — but every NUMBER you cite
must still come from COMPUTED RESULTS, never from these books.
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
  closeDate: Date | null;
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
  transCode: string;
};

const ALLOWED_TRANS_CODES = new Set(["OASSGN", "OASGN", "OEXP", "STO", "BTC"]);

function normalizeTransCode(row: Trade): string {
  const raw = String(pick(row, ["Trans Code", "Code", "Action", "Side", "Trade Type"]) ?? "")
    .toUpperCase()
    .trim();
  if (raw === "OASGN") return "OASSGN";
  if (raw === "SELL TO OPEN" || raw === "SOLD") return "STO";
  if (raw === "BUY TO CLOSE" || raw === "BOUGHT") return "BTC";
  if (raw === "EXPIRED" || raw === "OPTION EXPIRATION" || raw === "EXPIRATION") return "OEXP";
  if (raw === "ASSIGNED" || raw === "ASSIGNMENT" || raw === "OPTION ASSIGNMENT") return "OASSGN";
  return raw;
}

function normalizeStatus(row: Trade, transCode: string): string {
  const raw = String(pick(row, ["Status"]) ?? "").trim().toLowerCase();
  if (raw) return raw.charAt(0).toUpperCase() + raw.slice(1);
  if (transCode === "OEXP") return "Expired";
  if (transCode === "OASSGN") return "Assigned";
  if (transCode === "BTC") return "Closed";
  if (transCode === "STO") return "Open";
  return "";
}

function normalizeForOptimus(rows: Trade[]): OptimusRow[] {
  const normalized = rows.flatMap((r) => {
    const transCode = normalizeTransCode(r);
    if (transCode && !ALLOWED_TRANS_CODES.has(transCode)) return [];
    const sto = toNum(pick(r, ["STO($)", "STO $", "STO"]));
    const btc = toNum(pick(r, ["BTC($)", "BTC $", "BTC"]));
    const premRaw = pick(r, ["Premium($)", "Premium $", "Premium", "Net Premium"]);
    const premium = premRaw != null ? toNum(premRaw) : sto + btc;
    const qty = toNum(pick(r, ["Quantity", "Qty", "Contracts"]));
    const strike = toNum(pick(r, ["Strike Price", "Strike"]));
    const collRaw = toNum(pick(r, ["Collateral"]));
    const collateral = collRaw > 0 ? collRaw : Math.abs(qty) * strike * 100;
    const date = toDate(pick(r, ["Activity Date", "STO Date", "Trade Date", "Date", "Run Date"]));
    return {
      date,
      closeDate: transCode === "BTC" || transCode === "OEXP" || transCode === "OASSGN" ? date : toDate(pick(r, ["BTC Date", "Close Date"])),
      expiry: toDate(pick(r, ["Expiry Date", "Expiration", "Expiration Date"])),
      instrument: String(pick(r, ["Instrument", "Symbol", "Ticker"]) ?? "").toUpperCase(),
      optionType: String(pick(r, ["Option Type", "Type"]) ?? "").trim(),
      quantity: qty,
      strike,
      sto,
      btc,
      premium,
      collateral,
      status: normalizeStatus(r, transCode),
      broker: String(pick(r, ["Broker"]) ?? "").trim(),
      transCode,
    };
  });

  return pairTransactionLegs(normalized);
}

function pairTransactionLegs(rows: OptimusRow[]): OptimusRow[] {
  const hasTransactionLegs = rows.some((r) => r.transCode === "STO" || r.transCode === "BTC" || r.transCode === "OEXP" || r.transCode === "OASSGN");
  const hasOpeners = rows.some((r) => r.transCode === "STO");
  if (!hasTransactionLegs || !hasOpeners) return rows;

  const keyFor = (r: OptimusRow) => [r.instrument, r.optionType || "Option", r.strike, ymd(r.expiry)].join("|");
  const byContract = new Map<string, OptimusRow[]>();
  const ungrouped: OptimusRow[] = [];
  for (const row of rows) {
    if (!row.instrument || !row.strike || !row.expiry) {
      ungrouped.push(row);
      continue;
    }
    const key = keyFor(row);
    byContract.set(key, [...(byContract.get(key) ?? []), row]);
  }

  const paired: OptimusRow[] = [];
  for (const group of byContract.values()) {
    const sorted = group.slice().sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0));
    const closers = sorted.filter((r) => r.transCode === "BTC" || r.transCode === "OEXP" || r.transCode === "OASSGN");
    const usedClosers = new Set<OptimusRow>();

    for (const opener of sorted.filter((r) => r.transCode === "STO")) {
      let remaining = Math.abs(opener.quantity) || 1;
      const closes: OptimusRow[] = [];
      for (const closer of closers) {
        if (usedClosers.has(closer)) continue;
        if (opener.date && closer.date && closer.date < opener.date) continue;
        closes.push(closer);
        usedClosers.add(closer);
        remaining -= Math.abs(closer.quantity) || 1;
        if (remaining <= 0) break;
      }

      const closeQty = closes.reduce((sum, r) => sum + (Math.abs(r.quantity) || 1), 0);
      const btc = closes
        .filter((r) => r.transCode === "BTC")
        .reduce((sum, r) => sum + (r.btc || (r.premium < 0 ? r.premium : -Math.abs(r.premium))), 0);
      const sto = opener.sto || Math.abs(opener.premium);
      const status = closes.some((r) => r.transCode === "OASSGN")
        ? "Assigned"
        : closes.some((r) => r.transCode === "OEXP") && !closes.some((r) => r.transCode === "BTC")
          ? "Expired"
          : closeQty >= (Math.abs(opener.quantity) || 1)
            ? "Closed"
            : "Open";
      const closeDate = closes.length ? closes[closes.length - 1].date : null;
      paired.push({
        ...opener,
        quantity: Math.abs(opener.quantity) || 1,
        sto,
        btc,
        premium: sto + btc,
        status,
        closeDate,
        transCode: "STO",
      });
    }

    for (const closer of closers) {
      if (usedClosers.has(closer)) continue;
      const btc = closer.transCode === "BTC" ? closer.btc || (closer.premium < 0 ? closer.premium : -Math.abs(closer.premium)) : 0;
      paired.push({
        ...closer,
        sto: 0,
        btc,
        premium: btc,
        status: closer.transCode === "OASSGN" ? "Assigned" : closer.transCode === "OEXP" ? "Expired" : "Closed",
        closeDate: closer.date,
      });
    }
  }

  return paired.length ? [...paired, ...ungrouped] : rows;
}

// Period slicing (matches Python _period_df, plus explicit "month:YYYY-MM" and "year:YYYY")
function periodSlice(rows: OptimusRow[], period: string): OptimusRow[] {
  if (period === "all_time" || !period) return rows;
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  let start: Date;
  let end: Date = new Date(y, m + 1, 1);

  const monthMatch = /^month:(\d{4})-(\d{2})$/.exec(period);
  const yearMatch = /^year:(\d{4})$/.exec(period);
  if (monthMatch) {
    const yy = Number(monthMatch[1]);
    const mm = Number(monthMatch[2]) - 1;
    start = new Date(yy, mm, 1);
    end = new Date(yy, mm + 1, 1);
  } else if (yearMatch) {
    const yy = Number(yearMatch[1]);
    start = new Date(yy, 0, 1);
    end = new Date(yy + 1, 0, 1);
  } else if (period === "this_month") {
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

  const nowTs = Date.now();
  const isStatus = (s: string) => (r: OptimusRow) => r.status.toLowerCase() === s;
  // "Open" = status Open AND expiry strictly in the future. Rows labeled Open
  // but whose expiry has already passed are stale and excluded from open-trade
  // questions (they're effectively expired/assigned but never updated).
  const open = work.filter((r) => isStatus("open")(r) && r.expiry && r.expiry.getTime() > nowTs);
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

  const setupGroups = new Map<string, OptimusRow[]>();
  for (const r of resolved) {
    const setup = `${r.instrument || "N/A"} ${r.optionType || "Option"}`.trim();
    setupGroups.set(setup, [...(setupGroups.get(setup) ?? []), r]);
  }
  const bestWinRateSetups = Array.from(setupGroups.entries())
    .map(([setup, rs]) => {
      const wins = rs.filter((r) => r.premium > 0).length;
      const netPremium = sum(rs, (r) => r.premium);
      const collateral = sum(rs, (r) => r.collateral);
      return {
        setup,
        trades: rs.length,
        wins,
        losses: rs.length - wins,
        win_rate_pct: round(rs.length ? (wins / rs.length) * 100 : 0, 1),
        net_premium: round(netPremium),
        avg_premium: round(netPremium / rs.length),
        roi_pct: collateral > 0 ? round((netPremium / collateral) * 100) : null,
      };
    })
    .sort((a, b) => b.win_rate_pct - a.win_rate_pct || b.trades - a.trades || b.net_premium - a.net_premium)
    .slice(0, 10);

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
    best_win_rate_setups: bestWinRateSetups,

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
const MONTH_NAMES: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
};

export function inferPeriod(q: string): string {
  const s = q.toLowerCase();
  // Matches any "<month name> <year>" — e.g. "March 2025", "in jan 2024", "for october, 2023"
  const monthYear = s.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b[^0-9]{0,6}(\d{4})\b/);
  if (monthYear) {
    const mm = MONTH_NAMES[monthYear[1]];
    return `month:${monthYear[2]}-${String(mm).padStart(2, "0")}`;
  }
  // Matches any "YYYY-MM" or "M/YYYY"
  const isoMy = s.match(/\b(\d{4})-(\d{2})\b/);
  if (isoMy) return `month:${isoMy[1]}-${isoMy[2]}`;
  const slashMy = s.match(/\b(\d{1,2})\/(\d{4})\b/);
  if (slashMy) return `month:${slashMy[2]}-${String(slashMy[1]).padStart(2, "0")}`;
  const yearOnly = s.match(/\b(20\d{2})\b/);
  if (/\bthis month\b|\bmtd\b/.test(s)) return "this_month";
  if (/\blast month\b/.test(s)) return "last_month";
  if (/\bytd\b|year to date|this year/.test(s)) return "ytd";
  if (/\bttm\b|trailing.*12|last 12 months/.test(s)) return "ttm";
  if (/last 3 months|last quarter/.test(s)) return "last_3_months";
  if (yearOnly) return `year:${yearOnly[1]}`;
  return "all_time";
}

export function inferTicker(q: string): string | undefined {
  const m = q.toUpperCase().match(/\b([A-Z]{1,5})\b/g);
  if (!m) return;
  for (const tok of m) if (TICKER_TO_COMPANY[tok]) return tok;
  return;
}

function money(n: number): string {
  const sign = n > 0 ? "+" : n < 0 ? "-" : "";
  return `${sign}$${Math.abs(Math.round(n)).toLocaleString()}`;
}

function isBestWinRateQuestion(q: string): boolean {
  const s = q.toLowerCase();
  return /\b(best|highest|top)\b/.test(s) && /\b(win\s*rate|winning|wins?|success rate|win %|setup|ticker)\b/.test(s);
}

function periodCaption(period: string): string {
  if (period.startsWith("month:")) {
    const [year, month] = period.slice(6).split("-");
    const d = new Date(Number(year), Number(month) - 1, 1);
    return `${d.toLocaleString("en-US", { month: "long" })} ${year}`.toUpperCase();
  }
  if (period.startsWith("year:")) return period.slice(5);
  return period.replace(/_/g, " ").toUpperCase();
}

export function answerOptimusQuestion(rawRows: Trade[], question: string): string | null {
  if (!isBestWinRateQuestion(question)) return null;

  const period = inferPeriod(question);
  const ticker = inferTicker(question);
  const metrics = computePortfolioMetrics(rawRows, period, ticker);
  if ("error" in metrics) return String(metrics.error || "No trades found for that period/filter.");
  if (!metrics.best_win_rate_setups.length) return "No resolved trades found for that period/filter.";

  const top = metrics.best_win_rate_setups[0];
  const rows = metrics.best_win_rate_setups
    .map((r) => `| ${r.setup} | ${r.trades} | ${r.wins} | ${r.losses} | **${r.win_rate_pct}%** | **${money(r.net_premium)}** | ${money(r.avg_premium)} | ${r.roi_pct == null ? "N/A" : `${r.roi_pct}%`} |`)
    .join("\n");

  return [
    `**${top.setup}** has the best win rate at **${top.win_rate_pct}%** across **${top.trades} resolved trades**.`,
    "",
    `### ${periodCaption(period)} · BEST WIN RATE SETUPS`,
    "| Setup | Trades | Wins | Losses | Win Rate | Net P/L | Avg P/L | ROI |",
    "| ----- | -----: | ---: | -----: | -------: | ------: | ------: | --: |",
    rows,
  ].join("\n");
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

  // Filtered trades for THIS period/ticker — so the LLM can render a per-trade table.
  // Cap at 200 rows to keep prompt size sane.
  const normalized = normalizeForOptimus(rawRows);
  const sliced = periodSlice(normalized, period);
  const filtered = (ticker ? sliced.filter((r) => r.instrument === ticker.toUpperCase()) : sliced)
    .slice()
    .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
    .slice(0, 200)
    .map((r) => ({
      date: ymd(r.date),
      ticker: r.instrument,
      type: r.optionType,
      strike: r.strike,
      qty: r.quantity,
      expiry: ymd(r.expiry),
      sto: r.sto,
      btc: r.btc,
      premium: r.premium,
      collateral: r.collateral,
      status: r.status,
      close_date: ymd(r.closeDate),
      trans_code: r.transCode,
      broker: r.broker,
    }));

  // Tiny RAG sample: 8 most recent rows overall, for shape only
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
    `FILTERED TRADES for period=${period}${ticker ? ` ticker=${ticker}` : ""} (${filtered.length} rows, authoritative — use these to build per-trade tables):`,
    JSON.stringify(filtered, null, 2),
    "",
    "SAMPLE ROWS (most recent overall — for shape/context only, NOT for numbers):",
    JSON.stringify(sample, null, 2),
  ].join("\n");
}
