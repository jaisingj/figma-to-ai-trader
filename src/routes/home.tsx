import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AIChatWidget } from "@/components/AIChatWidget";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Insights — OptiX" },
      { name: "description", content: "Your OptiX trading insights dashboard." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();

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

  const backend = import.meta.env.VITE_BACKEND_URL as string | undefined;
  const src = backend
    ? `/insights.html?backend=${encodeURIComponent(backend)}`
    : "/insights.html";
  return (
    <div className="relative w-screen h-screen">
      <iframe
        src={src}
        title="OptiX Insights"
        className="w-full h-full border-0 block"
      />
      <AIChatWidget />
    </div>
  );
}
