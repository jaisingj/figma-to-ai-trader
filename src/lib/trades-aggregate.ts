import type { Trade, TradesData } from "./trades-store";

/** Field-name resolver: returns first non-null/empty value from candidate keys (case-insensitive). */
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

export type NormalizedTrade = {
  date: Date | null;
  symbol: string;
  side: string;       // BTO/STO/BTC/STC/BUY/SELL
  qty: number;
  price: number;
  amount: number;     // signed: positive = credit, negative = debit
  strike: number | null;
  optionType: string | null;
};

export function normalize(rows: Trade[]): NormalizedTrade[] {
  return rows.map((r) => {
    const sto = toNum(pick(r, ["STO($)", "STO $", "STO"]));
    const btc = toNum(pick(r, ["BTC($)", "BTC $", "BTC"]));
    const amount = toNum(pick(r, ["Amount", "Net Amount", "Proceeds", "Total"])) || (sto + btc);
    return {
      date: toDate(pick(r, ["Activity Date", "Trade Date", "Date", "Run Date"])),
      symbol: String(pick(r, ["Instrument", "Symbol", "Ticker"]) ?? "").toUpperCase(),
      side: String(pick(r, ["Trans Code", "Action", "Side", "Type"]) ?? "").toUpperCase(),
      qty: toNum(pick(r, ["Quantity", "Qty", "Shares", "Contracts"])),
      price: toNum(pick(r, ["Price", "Trade Price"])),
      amount,
      strike: (() => { const s = toNum(pick(r, ["Strike Price", "Strike"])); return s || null; })(),
      optionType: (pick(r, ["Option Type"]) as string | undefined)?.toString() ?? null,
    };
  });
}

export type KPIs = {
  trades: number;
  realizedPL: number;
  winRate: number; // 0-1
  openPositions: number;
};

export function computeKPIs(trades: NormalizedTrade[]): KPIs {
  const closed = trades.filter((t) => /BTC|STC|SELL|CLOSE|BOUGHT TO CLOSE|SOLD TO CLOSE/.test(t.side) || t.amount !== 0);
  const realized = trades.reduce((s, t) => s + t.amount, 0);
  // Group by symbol+strike+option to estimate wins/losses
  const groups = new Map<string, number>();
  for (const t of trades) {
    const key = `${t.symbol}|${t.strike ?? ""}|${t.optionType ?? ""}`;
    groups.set(key, (groups.get(key) ?? 0) + t.amount);
  }
  const settled = Array.from(groups.values()).filter((v) => Math.abs(v) > 0.0001);
  const wins = settled.filter((v) => v > 0).length;
  const winRate = settled.length ? wins / settled.length : 0;

  const openPositions = trades.filter((t) => /BTO|STO|OPEN/.test(t.side) && !/BTC|STC|CLOSE/.test(t.side)).length
    - trades.filter((t) => /BTC|STC|CLOSE/.test(t.side)).length;

  return {
    trades: trades.length,
    realizedPL: realized,
    winRate,
    openPositions: Math.max(0, openPositions),
  };
}

/** Equity curve: cumulative P/L by date, sampled into up to `points` evenly-spaced steps. */
export function equityCurve(trades: NormalizedTrade[], points = 24): { x: number; y: number; label: string }[] {
  const dated = trades.filter((t) => t.date).sort((a, b) => a.date!.getTime() - b.date!.getTime());
  if (!dated.length) return [];
  const byDay = new Map<string, number>();
  for (const t of dated) {
    const key = t.date!.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + t.amount);
  }
  const days = Array.from(byDay.entries()).sort(([a], [b]) => a.localeCompare(b));
  let cum = 0;
  const cumulative = days.map(([d, v]) => ({ d, y: (cum += v) }));
  // Down-sample
  const step = Math.max(1, Math.floor(cumulative.length / points));
  const sampled = cumulative.filter((_, i) => i % step === 0 || i === cumulative.length - 1);
  return sampled.map((p, i) => ({
    x: i / Math.max(1, sampled.length - 1),
    y: p.y,
    label: p.d,
  }));
}

/** Top symbols by absolute P/L contribution. */
export function topSymbols(trades: NormalizedTrade[], n = 4): { symbol: string; pl: number }[] {
  const m = new Map<string, number>();
  for (const t of trades) {
    if (!t.symbol) continue;
    m.set(t.symbol, (m.get(t.symbol) ?? 0) + t.amount);
  }
  return Array.from(m, ([symbol, pl]) => ({ symbol, pl }))
    .sort((a, b) => Math.abs(b.pl) - Math.abs(a.pl))
    .slice(0, n);
}

/** Win / Loss / Breakeven counts (grouped by position). */
export function winLossBreakdown(trades: NormalizedTrade[]): { wins: number; losses: number; breakeven: number } {
  const groups = new Map<string, number>();
  for (const t of trades) {
    const key = `${t.symbol}|${t.strike ?? ""}|${t.optionType ?? ""}`;
    groups.set(key, (groups.get(key) ?? 0) + t.amount);
  }
  let wins = 0, losses = 0, breakeven = 0;
  for (const v of groups.values()) {
    if (Math.abs(v) < 0.5) breakeven++;
    else if (v > 0) wins++;
    else losses++;
  }
  return { wins, losses, breakeven };
}

/** Most recent N transactions for the detail table. */
export function recentTransactions(trades: NormalizedTrade[], n = 8) {
  return [...trades]
    .filter((t) => t.symbol)
    .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
    .slice(0, n);
}

export function fmtCurrency(n: number, withSign = true): string {
  const sign = n > 0 ? "+" : n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const s = abs >= 1000 ? `$${(abs / 1000).toFixed(abs >= 10000 ? 1 : 2)}k` : `$${abs.toFixed(0)}`;
  return withSign ? `${sign}${s}` : s;
}

export function hasTrades(data: TradesData | null): boolean {
  return !!data && Array.isArray(data.rows) && data.rows.length > 0;
}
