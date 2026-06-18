import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [chat, setChat] = useState<{ open: boolean; width: number }>({ open: false, width: 0 });

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

  // Listen for chat open/close + width changes
  useEffect(() => {
    function onChat(e: Event) {
      const ce = e as CustomEvent<{ open: boolean; width: number }>;
      setChat({ open: !!ce.detail?.open, width: ce.detail?.width ?? 0 });
    }
    window.addEventListener("optix-chat", onChat as EventListener);
    return () => window.removeEventListener("optix-chat", onChat as EventListener);
  }, []);

  // Notify the embedded insights doc whenever chat state changes
  useEffect(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    try {
      win.postMessage({ type: "optix-chat", open: chat.open }, "*");
    } catch {
      /* noop */
    }
  }, [chat.open]);

  const backend = import.meta.env.VITE_BACKEND_URL as string | undefined;
  const src = backend
    ? `/insights.html?backend=${encodeURIComponent(backend)}`
    : "/insights.html";

  const iframeStyle: React.CSSProperties = chat.open
    ? { width: `calc(100% - ${chat.width}px)` }
    : { width: "100%" };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <iframe
        ref={iframeRef}
        src={src}
        title="OptiX Insights"
        onLoad={() => {
          // sync state on iframe (re)load
          try {
            iframeRef.current?.contentWindow?.postMessage(
              { type: "optix-chat", open: chat.open },
              "*",
            );
          } catch {
            /* noop */
          }
        }}
        className="h-full border-0 block transition-[width] duration-200"
        style={iframeStyle}
      />
      <AIChatWidget />
    </div>
  );
}
