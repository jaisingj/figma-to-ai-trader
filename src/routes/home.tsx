import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  ClipboardList,
  FileUp,
  UserCircle2,
  LogOut,
  Download,
  Sparkles,
  Send,
  Calendar,
  ChevronDown,
  TrendingDown,
  FileText,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import optixLogo from "@/assets/optixpro-transparent.png";
import reactiveOptimizer from "@/assets/reactive-optimizer.png";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Insights — OptiX" },
      { name: "description", content: "Your OptiX trading insights dashboard." },
    ],
  }),
  component: HomePage,
});

type NavKey = "insights" | "trades" | "upload1" | "upload2" | "profile";

const NAV: { key: NavKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "insights", label: "Insights", icon: BarChart3 },
  { key: "trades", label: "Trades", icon: ClipboardList },
  { key: "upload1", label: "Upload CSV", icon: FileUp },
  { key: "upload2", label: "Upload CSV", icon: FileUp },
];

function HomePage() {
  const navigate = useNavigate();
  const [active, setActive] = useState<NavKey>("insights");
  const [taxRate, setTaxRate] = useState(0);
  const [period, setPeriod] = useState("This quarter");

  // Guard: redirect unauthenticated users to landing page
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted && !data.session) navigate({ to: "/" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/" });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className="w-[110px] shrink-0 border-r border-slate-200 flex flex-col items-center pt-6 pb-6 gap-2 sticky top-0 h-screen">
        <div className="mb-4">
          <img src={optixLogo} alt="OptiX" className="h-20 w-auto" />
        </div>
        <nav className="flex-1 flex flex-col gap-1 w-full px-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-3 transition ${
                  isActive
                    ? "bg-blue-50 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className={`text-xs ${isActive ? "font-semibold" : "font-medium"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
        <div className="w-full px-3 flex flex-col gap-1">
          <button
            onClick={() => setActive("profile")}
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-3 transition ${
              active === "profile" ? "bg-blue-50 text-slate-900" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <UserCircle2 className="h-5 w-5" />
            <span className="text-xs font-medium">Profile</span>
          </button>
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl py-3 text-slate-600 hover:bg-slate-50 transition"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-xs font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-10 py-5 border-b border-slate-100">
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <FileText className="h-4 w-4 text-slate-400" />
              <span>Data appears current and consistent</span>
            </div>
            <div className="text-slate-500">Last trade: May 1, 2026</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition min-w-[200px] justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                {period}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>
            <button className="text-slate-400 hover:text-slate-600 transition p-2">
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-10 py-8 max-w-[1500px] w-full">
          {/* Insights heading + Download */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-5xl font-bold text-slate-900 tracking-tight">Insights</h1>
            <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 transition shadow-sm">
              <Download className="h-5 w-5" />
              Download report
            </button>
          </div>

          {/* Top stats grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Trader personality card spans 1 col but tall */}
            <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-7 flex flex-col">
              <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
                Your trader personality is a
              </p>
              <div className="mt-4 flex items-start gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                    Reactive Optimizer
                  </h2>
                  <p className="mt-3 text-slate-600 text-[15px] leading-relaxed">
                    You frequently adjust positions based on short-term signals rather than planned
                    exits.
                  </p>
                </div>
                <img
                  src={reactiveOptimizer}
                  alt="Reactive Optimizer illustration"
                  className="h-28 w-28 object-contain"
                />
              </div>
              <div className="mt-auto pt-6 flex items-end justify-between">
                <button className="flex items-center gap-1.5 text-blue-600 font-semibold hover:text-blue-700 transition">
                  <Sparkles className="h-4 w-4" />
                  <span className="underline underline-offset-4">Deep dive</span>
                </button>
                <div className="flex items-center gap-3 text-slate-400">
                  <button className="hover:text-slate-600 transition">
                    <Download className="h-5 w-5" />
                  </button>
                  <button className="hover:text-slate-600 transition">
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right side: 2x2 stats */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <StatCard label="Realized P/L">
                <div className="text-4xl font-bold text-emerald-600">+$1,860</div>
                <div className="mt-2 text-sm text-slate-500">
                  After Tax: <span className="text-emerald-600 font-semibold ml-1">+$1,720</span>
                </div>
              </StatCard>
              <StatCard label="Premium">
                <div className="text-4xl font-bold text-emerald-600">+$2,320</div>
                <div className="mt-2 flex items-center gap-1.5 text-sm">
                  <TrendingDown className="h-4 w-4 text-rose-500" />
                  <span className="text-rose-500 font-semibold">10%</span>
                  <span className="text-slate-500">over the last week</span>
                </div>
              </StatCard>
              <StatCard label="12 Month ROI">
                <div className="text-4xl font-bold text-slate-900">59.9%</div>
              </StatCard>
              <StatCard label="Top Stock">
                <div className="text-4xl font-bold text-slate-900">AAPL</div>
                <div className="mt-2 text-sm">
                  <span className="text-emerald-600 font-semibold">+$980</span>
                  <span className="text-slate-500"> across 16 trades</span>
                </div>
              </StatCard>
            </div>
          </div>

          {/* Tax Rate + State */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
            <div>
              <label className="text-sm text-slate-500">Tax Rate (%)</label>
              <div className="mt-2 text-slate-700 text-sm">{taxRate}%</div>
              <input
                type="range"
                min={0}
                max={50}
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full mt-2 accent-blue-600"
              />
            </div>
            <div>
              <label className="text-sm text-slate-500">State</label>
              <button className="mt-2 w-full flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-slate-400 hover:bg-slate-50 transition">
                <span>Select</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Performance section */}
          <section className="mt-16">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Performance</h2>

            <p className="mt-8 text-xs font-semibold tracking-widest text-slate-400 uppercase">
              Month on month results
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <Th>Month</Th>
                    <Th>Trades</Th>
                    <Th align="right">Realized P/L</Th>
                    <Th align="right">Premium</Th>
                    <Th align="right">Premium after Tax</Th>
                    <Th align="right">Cashflow</Th>
                    <Th align="right">Fees</Th>
                    <Th />
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  <Tr>
                    <Td>Apr 2026</Td>
                    <Td>7</Td>
                    <Td align="right" className="text-emerald-600 font-semibold">+$2,000</Td>
                    <Td align="right" className="text-emerald-600 font-semibold">+$1,350</Td>
                    <Td align="right">$304</Td>
                    <Td align="right">-$45,696</Td>
                    <Td align="right">$34</Td>
                    <Td align="right"><ChevronDown className="h-4 w-4 text-slate-400 inline" /></Td>
                  </Tr>
                  <Tr>
                    <Td>May 2026</Td>
                    <Td>24</Td>
                    <Td align="right" className="text-emerald-600 font-semibold">+$1,100</Td>
                    <Td align="right" className="text-rose-500 font-semibold">-$80</Td>
                    <Td align="right">—</Td>
                    <Td align="right" className="text-emerald-600">+$1,020</Td>
                    <Td align="right">$50</Td>
                    <Td align="right"><ChevronDown className="h-4 w-4 text-slate-400 inline" /></Td>
                  </Tr>
                  <tr className="border-t-2 border-slate-200 font-bold text-slate-900">
                    <Td>Total</Td>
                    <Td>31</Td>
                    <Td align="right" className="text-emerald-600">+$3,100</Td>
                    <Td align="right" className="text-emerald-600">+$1,270</Td>
                    <Td align="right">$304</Td>
                    <Td align="right">-$44,676</Td>
                    <Td align="right">$84</Td>
                    <Td />
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-12 text-xs font-semibold tracking-widest text-slate-400 uppercase">
              Cumulative realized P/L
            </p>
            <div className="mt-4 h-[360px] w-full">
              <CumulativeChart />
            </div>
          </section>

          <div className="h-20" />
        </main>
      </div>

      {/* Floating AI button */}
      <button className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition flex items-center justify-center">
        <Sparkles className="h-5 w-5" />
      </button>
    </div>
  );
}

function StatCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">{label}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`py-3 px-4 text-${align} text-slate-700 font-semibold text-[13px]`}
      style={{ textAlign: align }}
    >
      {children}
    </th>
  );
}
function Tr({ children }: { children: React.ReactNode }) {
  return <tr className="border-b border-slate-100">{children}</tr>;
}
function Td({
  children,
  align = "left",
  className = "",
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={`py-4 px-4 ${className}`}
      style={{ textAlign: align }}
    >
      {children}
    </td>
  );
}

function CumulativeChart() {
  const data = useMemo(
    () => [
      { x: "W1", v: 0 },
      { x: "W2", v: -120 },
      { x: "W3", v: -80 },
      { x: "W4", v: 320 },
      { x: "W5", v: 460 },
      { x: "W6", v: 480 },
      { x: "W7", v: 900 },
      { x: "W8", v: 940 },
      { x: "W9", v: 1050 },
      { x: "W10", v: 1380 },
      { x: "W11", v: 1450 },
      { x: "W12", v: 1640 },
      { x: "W13", v: 1860 },
      { x: "W14", v: 2120 },
    ],
    []
  );
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="pos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d9488" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="x" tick={false} axisLine={false} />
        <YAxis
          domain={[0, 3000]}
          ticks={[0, 1000, 2000, 3000]}
          tick={{ fill: "#94a3b8", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            fontSize: 12,
          }}
          formatter={(v: number) => [`$${v.toLocaleString()}`, "P/L"]}
        />
        <ReferenceLine y={0} stroke="#cbd5e1" />
        <Area
          type="monotone"
          dataKey="v"
          stroke="#0d9488"
          strokeWidth={2.5}
          fill="url(#pos)"
          dot={{ r: 3, fill: "#0d9488" }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
