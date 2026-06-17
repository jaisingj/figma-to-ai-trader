import { useEffect, useRef, useState, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, KeyRound, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OPTIMUS_SYSTEM_PROMPT, buildOptimusContext } from "@/lib/optimus-brain";
import { getTrades } from "@/lib/trades-store";


type Provider = "openai" | "anthropic" | "gemini";

const PROVIDERS: Record<
  Provider,
  { label: string; model: string; keyHint: string; keyUrl: string }
> = {
  openai: {
    label: "ChatGPT (OpenAI)",
    model: "gpt-4o-mini",
    keyHint: "sk-...",
    keyUrl: "https://platform.openai.com/api-keys",
  },
  anthropic: {
    label: "Claude (Anthropic)",
    model: "claude-3-5-sonnet-latest",
    keyHint: "sk-ant-...",
    keyUrl: "https://console.anthropic.com/settings/keys",
  },
  gemini: {
    label: "Gemini (Google)",
    model: "gemini-2.0-flash",
    keyHint: "AIza...",
    keyUrl: "https://aistudio.google.com/apikey",
  },
};

const SHORTCUTS = [
  "What was my best trade this month?",
  "Profile my trading persona & habits",
  "Which tickers lose me the most money?",
  "Summarize my P&L by month",
];

type ChatMessage = { role: "user" | "assistant"; content: string };

const LS_KEYS = "optix.chat.keys.v1";
const LS_PROVIDER = "optix.chat.provider.v1";

function loadKeys(): Partial<Record<Provider, string>> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LS_KEYS) || "{}");
  } catch {
    return {};
  }
}

function saveKeys(k: Partial<Record<Provider, string>>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEYS, JSON.stringify(k));
}

/** Build the per-turn system prompt: Optimus identity + computed metrics for this question. */
function buildSystemPromptFor(question: string): string {
  const trades = getTrades();
  const rows = trades?.rows ?? [];
  const ctx = buildOptimusContext(rows, question);
  return `${OPTIMUS_SYSTEM_PROMPT}\n\n${ctx}`;
}

async function callOpenAI(key: string, messages: ChatMessage[], system: string) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: PROVIDERS.openai.model,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI: ${res.status} ${await res.text()}`);
  const j = await res.json();
  return j.choices?.[0]?.message?.content ?? "(no response)";
}

async function callAnthropic(key: string, messages: ChatMessage[], system: string) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: PROVIDERS.anthropic.model,
      max_tokens: 1024,
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) throw new Error(`Anthropic: ${res.status} ${await res.text()}`);
  const j = await res.json();
  return j.content?.[0]?.text ?? "(no response)";
}

async function callGemini(key: string, messages: ChatMessage[], system: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${PROVIDERS.gemini.model}:generateContent?key=${encodeURIComponent(
      key,
    )}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      }),
    },
  );
  if (!res.ok) throw new Error(`Gemini: ${res.status} ${await res.text()}`);
  const j = await res.json();
  return j.candidates?.[0]?.content?.parts?.[0]?.text ?? "(no response)";
}

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<Provider>(
    () =>
      (typeof window !== "undefined"
        ? (localStorage.getItem(LS_PROVIDER) as Provider)
        : null) || "openai",
  );
  const [keys, setKeys] = useState<Partial<Record<Provider, string>>>(() => loadKeys());
  const [keyInput, setKeyInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hasKey = !!keys[provider];

  useEffect(() => {
    localStorage.setItem(LS_PROVIDER, provider);
  }, [provider]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open && hasKey) inputRef.current?.focus();
  }, [open, hasKey, provider]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const key = keys[provider];
    if (!key) {
      setError("Please add an API key for the selected model.");
      return;
    }
    setError(null);
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      // Build a fresh system prompt for THIS question so metrics are scoped
      // to the right period / ticker (inferred inside buildOptimusContext).
      const systemPrompt = buildSystemPromptFor(content);
      let reply = "";
      if (provider === "openai") reply = await callOpenAI(key, next, systemPrompt);
      else if (provider === "anthropic") reply = await callAnthropic(key, next, systemPrompt);
      else reply = await callGemini(key, next, systemPrompt);
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  function saveKey() {
    const trimmed = keyInput.trim();
    if (!trimmed) return;
    const updated = { ...keys, [provider]: trimmed };
    setKeys(updated);
    saveKeys(updated);
    setKeyInput("");
    setError(null);
  }

  function clearKey() {
    const updated = { ...keys };
    delete updated[provider];
    setKeys(updated);
    saveKeys(updated);
  }

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open AI chat"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Side panel */}
      {open && (
        <div className="fixed top-0 right-0 z-50 h-screen w-full sm:w-[420px] bg-background border-l shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-2 p-3 border-b">
            <Select value={provider} onValueChange={(v) => setProvider(v as Provider)}>
              <SelectTrigger className="h-9 flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PROVIDERS) as Provider[]).map((p) => (
                  <SelectItem key={p} value={p}>
                    {PROVIDERS[p].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* API key gate */}
          {!hasKey ? (
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              <div className="flex items-center gap-2 text-sm font-medium">
                <KeyRound className="h-4 w-4" /> Add your {PROVIDERS[provider].label} API key
              </div>
              <p className="text-xs text-muted-foreground">
                Stored in your browser only. Get a key at{" "}
                <a
                  href={PROVIDERS[provider].keyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {PROVIDERS[provider].keyUrl}
                </a>
                .
              </p>
              <Input
                type="password"
                value={keyInput}
                placeholder={PROVIDERS[provider].keyHint}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveKey()}
              />
              <Button onClick={saveKey} className="w-full">
                Save key
              </Button>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          ) : (
            <>
              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    Ask anything about your trades. Your data is sent to {PROVIDERS[provider].label}.
                  </div>
                )}
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={
                      m.role === "user"
                        ? "ml-auto max-w-[85%] rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm whitespace-pre-wrap"
                        : "max-w-[90%] text-sm whitespace-pre-wrap text-foreground"
                    }
                  >
                    {m.content}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                  </div>
                )}
                {error && <div className="text-xs text-destructive">{error}</div>}
              </div>

              {/* Shortcuts */}
              <div className="px-3 pt-2 flex flex-wrap gap-1.5 border-t">
                {SHORTCUTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    disabled={loading}
                    className="text-xs px-2 py-1 rounded-full border bg-muted hover:bg-accent disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Composer */}
              <div className="p-3 border-t flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  rows={2}
                  placeholder="Ask about your trades..."
                  className="flex-1 resize-none rounded-md border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <Button size="icon" onClick={() => send(input)} disabled={loading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="px-3 pb-2 flex justify-end">
                <button
                  onClick={clearKey}
                  className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" /> Remove API key
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
