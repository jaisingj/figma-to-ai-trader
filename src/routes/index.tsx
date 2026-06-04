import { createFileRoute } from "@tanstack/react-router";
import optixLogo from "@/assets/optix-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OptiX — Insight, Not Confusion" },
      { name: "description", content: "OptiX helps US options traders analyze performance and uncover behavioral insights from their trading activity." },
      { property: "og:title", content: "OptiX — Insight, Not Confusion" },
      { property: "og:description", content: "OptiX helps US options traders analyze performance and uncover behavioral insights from their trading activity." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="flex items-center justify-between px-10 py-4 border-b border-slate-200/70 bg-slate-50/60">
        <img src={optixLogo.url} alt="OptiX" className="h-12 w-auto" />
        <nav className="flex items-center gap-10">
          <a href="#signup" className="text-base font-medium text-blue-600 underline underline-offset-4 hover:text-blue-700">
            Sign up
          </a>
          <a href="#login" className="text-base font-medium text-blue-600 underline underline-offset-4 hover:text-blue-700">
            Login
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Blue radial gradient blob on the right */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-[720px] w-[70%] opacity-80"
          style={{
            background:
              "radial-gradient(ellipse 55% 60% at 70% 45%, rgba(147, 197, 253, 0.55), rgba(191, 219, 254, 0.35) 40%, rgba(255,255,255,0) 70%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-10 pt-32 pb-40">
          <div className="max-w-2xl">
            <h1 className="text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.05]">
              Insight, Not Confusion.
            </h1>
            <p className="mt-8 text-xl text-slate-500 max-w-xl leading-relaxed">
              OptiX helps US options traders analyze performance and uncover behavioral insights from their trading activity.
            </p>
            <div className="mt-12 flex items-center gap-8">
              <button className="rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white hover:bg-blue-700 transition shadow-sm">
                Try Optix for free
              </button>
              <a href="#plans" className="text-base font-semibold text-blue-600 hover:text-blue-700">
                View plans
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-10 py-24 max-w-7xl mx-auto text-center">
        <h2 className="text-5xl font-bold text-slate-900">How it works</h2>
        <p className="mt-6 text-slate-600">Coming next — upload, analyze, ask AI.</p>
      </section>
    </div>
  );
}
