// Build the analytics shape consumed by public/insights.html ("D") from the
// normalized rows returned by the Python /upload-csv endpoint.
//
// Each STO leg is paired with its closing legs (BTC / OEXP / OASGN) on the
// same contract key (ticker + type + strike + expiry) so we surface ONE row
// per logical trade with: open date, gross premium (STO), close cost (BTC),
// net premium, and a proper status (Open / Closed / Expired / Assigned).
//
// Expected row columns (case-insensitive):
//   Activity Date | Trans Code | Description | Quantity | Amount
// Description: "TICKER M/D/YYYY Call|Put $strike"

type Row = Record<string, unknown>;

type Leg = {
  ticker: string;
  date: Date;
  code: string; // STO BTC OEXP OASGN BTO STC ...
  type: "Call" | "Put";
  strike: number;
  exp: string;
  qty: number;
  amt: number;
};

type Trade = {
  ticker: string;
  type: "Call" | "Put";
  strike: number;
  exp: string;
  openDate: Date;
  closeDate: Date | null;
  qty: number;
  sto: number; // gross premium (credit) — STO sum, positive
  btc: number; // close cost — BTC sum, negative
  net: number; // sto + btc
  status: "Open" | "Closed" | "Expired" | "Assigned";
  legs: Leg[];
};

const OPT_RE =
  /\b([A-Z][A-Z0-9.]{0,5})\s+(\d{1,2}\/\d{1,2}\/\d{2,4})\s+(Call|Put|CALL|PUT|call|put)\s+\$?([\d,.]+)/;

function pick(row: Row, ...names: string[]): unknown {
  const keys = Object.keys(row);
  for (const n of names) {
    const k = keys.find((x) => x.toLowerCase().trim() === n.toLowerCase());
    if (k) return row[k];
  }
  return undefined;
}

function parseDate(s: unknown): Date | null {
  if (s instanceof Date) return isNaN(s.getTime()) ? null : s;
  if (typeof s !== "string") return null;
  const str = s.trim();
  if (!str) return null;
  let m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) {
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    return isNaN(d.getTime()) ? null : d;
  }
  m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (m) {
    let y = +m[3];
    if (y < 100) y += 2000;
    const d = new Date(y, +m[1] - 1, +m[2]);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function parseAmount(s: unknown): number {
  if (typeof s === "number") return s;
  if (typeof s !== "string") return 0;
  const cleaned = s.replace(/[$,\s]/g, "").replace(/^\((.*)\)$/, "-$1");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function shortDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(-2)}`;
}

function parseLeg(row: Row): Leg | null {
  const desc = pick(row, "Description", "Instrument", "Symbol Description");
  if (typeof desc !== "string") return null;
  const m = desc.match(OPT_RE);
  if (!m) return null;
  const date = parseDate(pick(row, "Activity Date", "Date", "Trade Date"));
  if (!date) return null;
  const code = String(pick(row, "Trans Code", "Code", "Action") ?? "")
    .toUpperCase()
    .trim();
  if (!code) return null;
  const qty = Number(pick(row, "Quantity", "Qty")) || 0;
  const amt = parseAmount(pick(row, "Amount", "Net Amount", "Amt"));
  return {
    ticker: m[1].toUpperCase(),
    exp: m[2],
    type: (m[3][0].toUpperCase() + m[3].slice(1).toLowerCase()) as "Call" | "Put",
    strike: parseFloat(m[4].replace(/,/g, "")),
    date,
    code,
    qty,
    amt,
  };
}

/** Pair STO legs with their closing legs (BTC/OEXP/OASGN) per contract key. */
function pairLegs(legs: Leg[]): Trade[] {
  const key = (l: Leg) =>
    `${l.ticker}|${l.type}|${l.strike.toFixed(4)}|${l.exp}`;
  const byKey = new Map<string, Leg[]>();
  for (const l of legs) {
    if (!byKey.has(key(l))) byKey.set(key(l), []);
    byKey.get(key(l))!.push(l);
  }

  const trades: Trade[] = [];
  for (const [, group] of byKey) {
    group.sort((a, b) => a.date.getTime() - b.date.getTime());

    // FIFO queue of open STO lots and a separate queue for BTO if you ever
    // long an option (we still group long legs the same way).
    type Lot = { leg: Leg; remaining: number };
    const openLots: Lot[] = [];
    // Track contracts that left via assignment or expiration so we can mark
    // a STO trade as Assigned / Expired even when qty matches them.
    const closingEvents: { date: Date; type: "BTC" | "OEXP" | "OASGN"; qty: number; amt: number; leg: Leg }[] = [];

    // First pass: collect openers and closers.
    for (const l of group) {
      if (l.code === "STO" || l.code === "BTO") {
        openLots.push({ leg: l, remaining: Math.max(1, l.qty) });
      } else if (l.code === "BTC" || l.code === "STC" || l.code === "OEXP" || l.code === "OASGN") {
        const norm = l.code === "STC" ? "BTC" : (l.code as "BTC" | "OEXP" | "OASGN");
        closingEvents.push({ date: l.date, type: norm, qty: Math.max(1, l.qty), amt: l.amt, leg: l });
      }
    }

    // For each opener (in chronological order) emit one Trade and consume
    // matching close-leg quantity FIFO.
    for (const lot of openLots) {
      const opener = lot.leg;
      let needed = lot.remaining;
      const closes: typeof closingEvents = [];
      while (needed > 0 && closingEvents.length) {
        const c = closingEvents[0];
        if (c.qty <= needed) {
          closes.push({ ...c });
          needed -= c.qty;
          closingEvents.shift();
        } else {
          // Partial — split the closing event proportionally.
          const ratio = needed / c.qty;
          closes.push({ ...c, qty: needed, amt: +(c.amt * ratio).toFixed(2) });
          c.qty -= needed;
          c.amt = +(c.amt * (1 - ratio)).toFixed(2);
          needed = 0;
        }
      }

      const sto = opener.code === "STO" ? opener.amt : 0;
      const btc = closes
        .filter((c) => c.type === "BTC")
        .reduce((a, c) => a + c.amt, 0);
      const hasAsgn = closes.some((c) => c.type === "OASGN");
      const hasExp = closes.some((c) => c.type === "OEXP");
      const hasBtc = closes.some((c) => c.type === "BTC");
      const closedQty = closes.reduce((a, c) => a + c.qty, 0);
      const fullyClosed = closedQty >= Math.max(1, opener.qty);

      let status: Trade["status"];
      if (hasAsgn) status = "Assigned";
      else if (hasExp && !hasBtc) status = "Expired";
      else if (fullyClosed) status = "Closed";
      else status = "Open";

      const closeDate = closes.length ? closes[closes.length - 1].date : null;

      trades.push({
        ticker: opener.ticker,
        type: opener.type,
        strike: opener.strike,
        exp: opener.exp,
        openDate: opener.date,
        closeDate,
        qty: opener.qty,
        sto: +sto.toFixed(2),
        btc: +btc.toFixed(2),
        net: +(sto + btc).toFixed(2),
        status,
        legs: [opener, ...closes.map((c) => c.leg)],
      });
    }

    // Any leftover closing events without a matching opener (data only goes
    // back so far) — emit as standalone "Closed" rows so the totals stay honest.
    for (const c of closingEvents) {
      trades.push({
        ticker: c.leg.ticker,
        type: c.leg.type,
        strike: c.leg.strike,
        exp: c.leg.exp,
        openDate: c.leg.date,
        closeDate: c.leg.date,
        qty: c.leg.qty,
        sto: 0,
        btc: c.type === "BTC" ? +c.amt.toFixed(2) : 0,
        net: c.type === "BTC" ? +c.amt.toFixed(2) : 0,
        status: c.type === "OASGN" ? "Assigned" : c.type === "OEXP" ? "Expired" : "Closed",
        legs: [c.leg],
      });
    }
  }

  return trades;
}

export function buildInsights(
  rows: Row[],
): { unmatched: number; matched: number; data: unknown } | null {
  const legs: Leg[] = [];
  let unmatched = 0;
  for (const r of rows) {
    const l = parseLeg(r);
    if (l) legs.push(l);
    else if (pick(r, "Description", "Instrument")) unmatched++;
  }
  if (!legs.length) {
    console.warn(
      `[insights] No option legs parsed. ${unmatched} description rows didn't match.`,
    );
    return null;
  }

  const trades = pairLegs(legs);
  console.log(
    `[insights] ${legs.length} legs → ${trades.length} paired trades (${unmatched} unmatched description rows).`,
  );

  // ─── Per-ticker ─────────────────────────────────────────────
  const byTicker = new Map<string, Trade[]>();
  for (const t of trades) {
    if (!byTicker.has(t.ticker)) byTicker.set(t.ticker, []);
    byTicker.get(t.ticker)!.push(t);
  }

  const tickers = Array.from(byTicker.entries())
    .map(([ticker, ts]) => {
      const credits = ts.reduce((a, t) => a + t.sto, 0);
      const net = ts.reduce((a, t) => a + t.net, 0);
      const calls = ts.filter((t) => t.type === "Call").length;
      const puts = ts.filter((t) => t.type === "Put").length;
      return {
        ticker,
        net: +net.toFixed(2),
        credits: +credits.toFixed(2),
        legs: ts.reduce((a, t) => a + t.legs.length, 0),
        sto: ts.filter((t) => t.sto > 0).length,
        btc: ts.filter((t) => t.btc !== 0).length,
        calls,
        puts,
        trades: [...ts]
          .sort((a, b) => b.openDate.getTime() - a.openDate.getTime())
          .flatMap((t) =>
            t.legs.map((l) => ({
              date: shortDate(l.date),
              code: l.code,
              desc: `${t.ticker} ${t.exp} ${t.type} $${t.strike.toFixed(2)}`,
              qty: l.qty,
              amt: l.code === "OASGN" || l.code === "OEXP" ? null : l.amt,
            })),
          ),
      };
    })
    .sort((a, b) => b.net - a.net);

  // ─── Monthly (by OPEN date) ─────────────────────────────────
  const byMonth = new Map<string, Trade[]>();
  for (const t of trades) {
    const k = `${t.openDate.getFullYear()}-${String(t.openDate.getMonth() + 1).padStart(2, "0")}`;
    if (!byMonth.has(k)) byMonth.set(k, []);
    byMonth.get(k)!.push(t);
  }
  const monthKeys = [...byMonth.keys()].sort();
  const monthly = monthKeys.map((k) => {
    const ts = byMonth.get(k)!;
    return {
      month: k,
      net: +ts.reduce((a, t) => a + t.net, 0).toFixed(2),
      trades: ts.length,
    };
  });

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const mrows = monthKeys.map((k) => {
    const ts = byMonth.get(k)!;
    const [y, m] = k.split("-");
    const label = `${monthNames[+m - 1]} ${y}`;
    const net = ts.reduce((a, t) => a + t.net, 0);
    return {
      key: k,
      label,
      n: ts.length,
      sum_net_premium: +net.toFixed(2),
      sum_cashflow: +net.toFixed(2),
      sum_asgn_cash: 0,
      trades: ts.map((t) => ({
        tdate: shortDate(t.openDate),
        ticker: t.ticker,
        type: t.type,
        strike: t.strike,
        exp: t.exp,
        qty: t.qty,
        action: t.sto > 0 ? "STO" : "BTC",
        status: t.status,
        sto: +t.sto.toFixed(2),
        btc: +t.btc.toFixed(2),
        net_premium: +t.net.toFixed(2),
        cashflow: +t.net.toFixed(2),
        asgn_cash: 0,
        asgn: null as null,
      })),
    };
  });

  // ─── Distribution + call/put split ──────────────────────────
  const totalNet = tickers.reduce((a, t) => a + t.net, 0) || 1;
  const dist = tickers.map((t) => ({
    ticker: t.ticker,
    net: t.net,
    pct: +((t.net / totalNet) * 100).toFixed(1),
    side: t.calls >= t.puts ? "Call" : "Put",
  }));

  const cp = { Call: { net: 0, count: 0 }, Put: { net: 0, count: 0 } };
  for (const t of trades) {
    cp[t.type].net += t.net;
    cp[t.type].count += 1;
  }
  const call_put = [
    { OptType: "Call", net: +cp.Call.net.toFixed(2), count: cp.Call.count },
    { OptType: "Put", net: +cp.Put.net.toFixed(2), count: cp.Put.count },
  ];

  const stoTotal = trades.reduce((a, t) => a + t.sto, 0);
  const btcTotal = trades.reduce((a, t) => a + t.btc, 0);
  const totals = {
    sto: +stoTotal.toFixed(2),
    btc: +btcTotal.toFixed(2),
    net_premium: +(stoTotal + btcTotal).toFixed(2),
    dividends: 0,
    interest: 0,
    fees: 0,
    total_trades: trades.length,
    buy_to_close: trades.filter((t) => t.status === "Closed").length,
    assignments: trades.filter((t) => t.status === "Assigned").length,
    expirations: trades.filter((t) => t.status === "Expired").length,
    n_tickers: tickers.length,
  };

  return {
    matched: trades.length,
    unmatched,
    data: { totals, monthly, mrows, call_put, dist, tickers },
  };
}
