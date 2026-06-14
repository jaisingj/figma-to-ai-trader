// Build the analytics shape consumed by public/insights.html ("D") from the
// normalized rows returned by the Python /upload-csv endpoint. Pure JS — no
// backend changes needed.
//
// Expected row columns (Robinhood-style; case-insensitive match):
//   Activity Date | Trans Code | Description | Quantity | Amount
// Description format: "TICKER M/D/YYYY Call|Put $strike"

type Row = Record<string, unknown>;

type Trade = {
  ticker: string;
  date: Date;
  code: string; // STO, BTC, OASGN, OEXP, BTO, STC, ...
  type: "Call" | "Put";
  strike: number;
  exp: string; // M/D/YYYY
  qty: number;
  amt: number;
};

// Robinhood / Schwab style: "AAPL 6/20/2025 Call $200.00"
// Also tolerates: "AAPL 06/20/25 CALL 200" and 1-5 char tickers incl. dot.
const OPT_RE = /\b([A-Z][A-Z0-9.]{0,5})\s+(\d{1,2}\/\d{1,2}\/\d{2,4})\s+(Call|Put|CALL|PUT|call|put)\s+\$?([\d,.]+)/;

function pick(row: Row, ...names: string[]): unknown {
  const keys = Object.keys(row);
  for (const n of names) {
    const k = keys.find((x) => x.toLowerCase().trim() === n.toLowerCase());
    if (k) return row[k];
  }
  return undefined;
}

function parseDate(s: unknown): Date | null {
  if (typeof s !== "string") return null;
  const p = s.trim().split("/");
  if (p.length !== 3) return null;
  let y = +p[2];
  if (y < 100) y += 2000;
  const d = new Date(y, +p[0] - 1, +p[1]);
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

function parseRow(row: Row): Trade | null {
  const desc = pick(row, "Description", "Instrument", "Symbol Description");
  if (typeof desc !== "string") return null;
  const m = desc.match(OPT_RE);
  if (!m) return null;
  const date = parseDate(pick(row, "Activity Date", "Date", "Trade Date"));
  if (!date) return null;
  const code = String(pick(row, "Trans Code", "Code", "Action") ?? "").toUpperCase().trim();
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

export function buildInsights(rows: Row[]): { unmatched: number; matched: number; data: unknown } | null {
  const trades: Trade[] = [];
  let unmatched = 0;
  for (const r of rows) {
    const t = parseRow(r);
    if (t) trades.push(t);
    else if (pick(r, "Description", "Instrument")) unmatched++;
  }
  if (!trades.length) {
    console.warn(`[insights] No option trades parsed. ${unmatched} rows had a Description but didn't match.`);
    return null;
  }
  console.log(`[insights] Parsed ${trades.length} option trades from ${rows.length} rows (${unmatched} unmatched description rows).`);

  // Per-ticker aggregation
  const byTicker = new Map<string, Trade[]>();
  for (const t of trades) {
    if (!byTicker.has(t.ticker)) byTicker.set(t.ticker, []);
    byTicker.get(t.ticker)!.push(t);
  }

  const tickers = Array.from(byTicker.entries()).map(([ticker, ts]) => {
    const sto = ts.filter((t) => t.code === "STO");
    const btc = ts.filter((t) => t.code === "BTC");
    const credits = sto.reduce((a, t) => a + t.amt, 0);
    const debits = btc.reduce((a, t) => a + t.amt, 0);
    const calls = ts.filter((t) => t.type === "Call").length;
    const puts = ts.filter((t) => t.type === "Put").length;
    return {
      ticker,
      net: +(credits + debits).toFixed(2),
      credits: +credits.toFixed(2),
      legs: ts.length,
      sto: sto.length,
      btc: btc.length,
      calls,
      puts,
      trades: [...ts]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .map((t) => ({
          date: shortDate(t.date),
          code: t.code,
          desc: `${ticker} ${t.exp} ${t.type} $${t.strike.toFixed(2)}`,
          qty: t.qty,
          amt: t.code === "OASGN" || t.code === "OEXP" ? null : t.amt,
        })),
    };
  });
  tickers.sort((a, b) => b.net - a.net);

  // Monthly aggregation
  const byMonth = new Map<string, Trade[]>();
  for (const t of trades) {
    const k = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, "0")}`;
    if (!byMonth.has(k)) byMonth.set(k, []);
    byMonth.get(k)!.push(t);
  }
  const monthKeys = [...byMonth.keys()].sort();
  const monthly = monthKeys.map((k) => {
    const ts = byMonth.get(k)!;
    return { month: k, net: +ts.reduce((a, t) => a + t.amt, 0).toFixed(2), trades: ts.length };
  });

  // mrows shape consumed by renderMonthly() in insights.html
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const mrows = monthKeys.map((k) => {
    const ts = byMonth.get(k)!;
    const [y, m] = k.split("-");
    const label = `${monthNames[+m - 1]} ${y}`;
    const net = ts.reduce((a, t) => a + t.amt, 0);
    return {
      key: k,
      label,
      n: ts.length,
      sum_net_premium: +net.toFixed(2),
      sum_cashflow: +net.toFixed(2),
      sum_asgn_cash: 0,
      trades: ts.map((t) => ({
        tdate: shortDate(t.date),
        ticker: t.ticker,
        type: t.type,
        strike: t.strike,
        exp: t.exp,
        qty: t.qty,
        action: t.code === "STO" ? "STO" : t.code === "BTC" ? "BTC" : t.code,
        status:
          t.code === "OASGN"
            ? "Assigned"
            : t.code === "OEXP"
              ? "Expired"
              : t.code === "BTC"
                ? "Closed"
                : "Open",
        net_premium: t.amt,
        cashflow: t.amt,
        asgn_cash: 0,
        asgn: null as null,
      })),
    };
  });

  // Distribution + call/put split
  const totalNet = tickers.reduce((a, t) => a + t.net, 0) || 1;
  const dist = tickers.map((t) => ({
    ticker: t.ticker,
    net: t.net,
    pct: +((t.net / totalNet) * 100).toFixed(1),
    side: t.calls >= t.puts ? "Call" : "Put",
  }));

  const cp = { Call: { net: 0, count: 0 }, Put: { net: 0, count: 0 } };
  for (const t of trades) {
    cp[t.type].net += t.amt;
    cp[t.type].count += 1;
  }
  const call_put = [
    { OptType: "Call", net: +cp.Call.net.toFixed(2), count: cp.Call.count },
    { OptType: "Put", net: +cp.Put.net.toFixed(2), count: cp.Put.count },
  ];

  const stoTotal = tickers.reduce((a, t) => a + t.credits, 0);
  const btcTotal = tickers.reduce((a, t) => a + (t.net - t.credits), 0);
  const totals = {
    sto: +stoTotal.toFixed(2),
    btc: +btcTotal.toFixed(2),
    net_premium: +(stoTotal + btcTotal).toFixed(2),
    dividends: 0,
    interest: 0,
    fees: 0,
    total_trades: trades.length,
    buy_to_close: trades.filter((t) => t.code === "BTC").length,
    assignments: trades.filter((t) => t.code === "OASGN").length,
    expirations: trades.filter((t) => t.code === "OEXP").length,
    n_tickers: tickers.length,
  };

  return {
    matched: trades.length,
    unmatched,
    data: { totals, monthly, mrows, call_put, dist, tickers },
  };
}
