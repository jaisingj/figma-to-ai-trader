import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "OptiX Demo — Coming Soon" },
      { name: "description", content: "The OptiX demo is coming soon." },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Sparkles className="h-6 w-6" />
      </div>
      <h1 className="mt-6 text-5xl lg:text-6xl font-bold tracking-tight text-slate-900">
        Coming Soon
      </h1>
      <p className="mt-4 max-w-md text-slate-600">
        The OptiX demo is on its way. Check back shortly to take it for a spin.
      </p>
      <Link
        to="/"
        className="mt-10 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>
    </div>
  );
}
