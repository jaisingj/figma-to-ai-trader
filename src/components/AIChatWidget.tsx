import { useEffect, useRef, useState, useCallback } from "react";
import {
  MessageCircle,
  X,
  ArrowUp,
  Loader2,
  KeyRound,
  Trash2,
  Maximize2,
  Minimize2,
  PenLine,
  ChevronDown,
  Check,
  Paperclip,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OPTIMUS_SYSTEM_PROMPT, answerOptimusQuestion, buildOptimusContext } from "@/lib/optimus-brain";
import { getTrades } from "@/lib/trades-store";
import optixLogo from "@/assets/optixpro.jpeg.asset.json";

type Provider = "openai" | "anthropic" | "gemini";

const PROVIDERS: Record<
  Provider,
  { label: string; model: string; keyHint: string; keyUrl: string }
> = {
  openai: {
    label: "ChatGPT",
    model: "gpt-4o-mini",
    keyHint: "sk-...",
    keyUrl: "https://platform.openai.com/api-keys",
  },
  anthropic: {
    label: "Claude",
    model: "claude-3-5-sonnet-latest",
    keyHint: "sk-ant-...",
    keyUrl: "https://console.anthropic.com/settings/keys",
  },
  gemini: {
    label: "Gemini",
    model: "gemini-2.0-flash",
    keyHint: "AIza...",
    keyUrl: "https://aistudio.google.com/apikey",
  },
};

const SHORTCUTS: { label: string; emoji: string; prompt: string }[] = [
  { emoji: "🩺", label: "Health score", prompt: "Give me my overall trading health score (0–100) with a sub-score table, a plain-English explanation of each stat, 3 specific actionable tips, and flag any emotional trading patterns you detect." },
  { emoji: "📊", label: "Summarize my month", prompt: "Summarize my trading month with a weekly breakdown table." },
  { emoji: "🎯", label: "Best win rate setup", prompt: "Which ticker / setup gave me the best win rate? Show a table." },
  { emoji: "⚠️", label: "Riskiest open positions", prompt: "List my riskiest open positions in a table." },
  { emoji: "💡", label: "Suggest better exits", prompt: "Suggest better exits based on my trade history." },
];

const STARTERS = [
  "Which trades contributed the most to my overall performance?",
  "How are my sell vs buy strategies performing?",
  "What is the impact of assignments and exercises on my cashflow?",
  "What is my current exposure from open positions?",
];

type ChatMessage = { role: "user" | "assistant"; content: string };
type AttachedFile = { name: string; size: number; mime: string; kind: "image" | "text" | "binary"; text?: string; dataUrl?: string };

const ACCEPT = ".csv,.docx,.jpg,.jpeg,.xls,.xlsx";
const MAX_FILE_BYTES = 5 * 1024 * 1024;

function classifyFile(f: File): AttachedFile["kind"] {
  const n = f.name.toLowerCase();
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image";
  if (n.endsWith(".csv")) return "text";
  return "binary"; // docx, xls, xlsx — opaque in-browser
}

function readAsText(f: File) { return f.text(); }
function readAsDataURL(f: File) {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(f);
  });
}

const LS_KEYS = "optix.chat.keys.v1";
const LS_PROVIDER = "optix.chat.provider.v1";
const LS_WIDTH = "optix.chat.width.v1";

function loadKeys(): Partial<Record<Provider, string>> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(LS_KEYS) || "{}"); } catch { return {}; }
}
function saveKeys(k: Partial<Record<Provider, string>>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEYS, JSON.stringify(k));
}

function buildSystemPromptFor(question: string): string {
  const trades = getTrades();
  const rows = trades?.rows ?? [];
  const ctx = buildOptimusContext(rows, question);
  return `${OPTIMUS_SYSTEM_PROMPT}\n\n${ctx}`;
}

async function callOpenAI(key: string, messages: ChatMessage[], system: string) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
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
      max_tokens: 2048,
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
    `https://generativelanguage.googleapis.com/v1beta/models/${PROVIDERS.gemini.model}:generateContent?key=${encodeURIComponent(key)}`,
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
  const [expanded, setExpanded] = useState(false);
  const [provider, setProvider] = useState<Provider>(
    () => (typeof window !== "undefined" ? (localStorage.getItem(LS_PROVIDER) as Provider) : null) || "openai",
  );
  const [keys, setKeys] = useState<Partial<Record<Provider, string>>>(() => loadKeys());
  const [keyInput, setKeyInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(() => {
    if (typeof window === "undefined") return 480;
    const saved = Number(localStorage.getItem(LS_WIDTH));
    return saved >= 360 && saved <= 1400 ? saved : 480;
  });
  const draggingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);

  async function handleFiles(list: FileList | null) {
    if (!list) return;
    const next: AttachedFile[] = [];
    for (const f of Array.from(list)) {
      if (f.size > MAX_FILE_BYTES) { setError(`${f.name} exceeds 5MB limit.`); continue; }
      const kind = classifyFile(f);
      try {
        if (kind === "image") next.push({ name: f.name, size: f.size, mime: f.type || "image/jpeg", kind, dataUrl: await readAsDataURL(f) });
        else if (kind === "text") next.push({ name: f.name, size: f.size, mime: f.type || "text/csv", kind, text: (await readAsText(f)).slice(0, 200_000) });
        else next.push({ name: f.name, size: f.size, mime: f.type || "application/octet-stream", kind });
      } catch { setError(`Could not read ${f.name}`); }
    }
    if (next.length) { setAttachments((a) => [...a, ...next]); setError(null); }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }
  function removeAttachment(i: number) { setAttachments((a) => a.filter((_, idx) => idx !== i)); }

  const hasKey = !!keys[provider];
  const effectiveWidth = expanded ? Math.max(width, 760) : width;

  useEffect(() => { localStorage.setItem(LS_PROVIDER, provider); }, [provider]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);
  useEffect(() => { if (open && hasKey) inputRef.current?.focus(); }, [open, hasKey, provider]);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);
  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!draggingRef.current) return;
      const next = Math.min(1400, Math.max(360, window.innerWidth - e.clientX));
      setWidth(next);
    }
    function onUp() {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      localStorage.setItem(LS_WIDTH, String(width));
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [width]);

  async function send(text: string) {
    const content = text.trim();
    if ((!content && attachments.length === 0) || loading) return;
    const key = keys[provider];
    if (!key) { setError("Please add an API key for the selected model."); return; }
    setError(null);

    // Build a display message that shows attachments to the user
    const attachLines = attachments.map((a) => `📎 ${a.name} (${Math.round(a.size / 1024)} KB)`).join("\n");
    const displayContent = [content, attachLines].filter(Boolean).join("\n\n");

    // Build the content sent to the LLM: append text-file contents inline, note other files
    const fileBlocks = attachments.map((a) => {
      if (a.kind === "text" && a.text) return `\n\n--- File: ${a.name} ---\n\`\`\`\n${a.text}\n\`\`\``;
      if (a.kind === "image") return `\n\n[Attached image: ${a.name}]`;
      return `\n\n[Attached file: ${a.name} — content not readable in browser; please export to CSV for analysis.]`;
    }).join("");
    const llmContent = (content || "Please analyze the attached file(s).") + fileBlocks;

    const sentAttachments = attachments;
    const next = [...messages, { role: "user" as const, content: displayContent || llmContent }];
    setMessages(next);
    setInput("");
    setAttachments([]);
    setLoading(true);
    try {
      if (sentAttachments.length === 0) {
        const deterministicReply = answerOptimusQuestion(getTrades()?.rows ?? [], content);
        if (deterministicReply) {
          setMessages([...next, { role: "assistant", content: deterministicReply }]);
          return;
        }
      }
      const systemPrompt = buildSystemPromptFor(content);
      const singleTurn: ChatMessage[] = [{ role: "user", content: llmContent }];
      let reply = "";
      if (provider === "openai") reply = await callOpenAI(key, singleTurn, systemPrompt);
      else if (provider === "anthropic") reply = await callAnthropic(key, singleTurn, systemPrompt);
      else reply = await callGemini(key, singleTurn, systemPrompt);
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
    setKeys(updated); saveKeys(updated); setKeyInput(""); setError(null);
  }
  function clearKey() {
    const updated = { ...keys }; delete updated[provider];
    setKeys(updated); saveKeys(updated);
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Ask OptiX"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#2962ff] text-white shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div
          className="fixed top-0 right-0 z-50 h-screen bg-white border-l border-slate-200 shadow-2xl flex flex-col text-slate-900"
          style={{ width: `min(100vw, ${effectiveWidth}px)` }}
        >
          {/* drag handle */}
          <div
            onMouseDown={onDragStart}
            title="Drag to resize"
            className="absolute top-0 left-0 h-full w-1.5 cursor-col-resize hover:bg-[#2962ff]/30 active:bg-[#2962ff]/50 z-10"
          />

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
            <img src={optixLogo.url} alt="OptiX" className="h-9 w-9 rounded-md object-cover" />
            <h2 className="text-2xl font-extrabold tracking-tight">Ask OptiX</h2>
            <div className="ml-auto flex items-center gap-1">
              <Select value={provider} onValueChange={(v) => setProvider(v as Provider)}>
                <SelectTrigger className="h-9 min-w-[120px] rounded-lg border-slate-300 bg-white text-slate-900 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PROVIDERS) as Provider[]).map((p) => (
                    <SelectItem key={p} value={p}>{PROVIDERS[p].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                onClick={() => setExpanded((e) => !e)}
                className="p-2 rounded-md text-slate-500 hover:bg-slate-100"
                aria-label={expanded ? "Collapse" : "Expand"}
              >
                {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-md text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* API key gate */}
          {!hasKey ? (
            <div className="p-6 space-y-3 flex-1 overflow-y-auto">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <KeyRound className="h-4 w-4" /> Connect {PROVIDERS[provider].label}
              </div>
              <p className="text-xs text-slate-500">
                Your key is stored only in this browser. Get one at{" "}
                <a href={PROVIDERS[provider].keyUrl} target="_blank" rel="noreferrer" className="text-[#2962ff] underline">
                  {PROVIDERS[provider].keyUrl}
                </a>.
              </p>
              <Input
                type="password"
                value={keyInput}
                placeholder={PROVIDERS[provider].keyHint}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveKey()}
                className="rounded-lg"
              />
              <Button onClick={saveKey} className="w-full bg-[#2962ff] hover:bg-[#1e4fd1]">
                Save key
              </Button>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          ) : (
            <>
              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-5 bg-gradient-to-b from-white to-slate-50">
                {messages.length === 0 ? (
                  <div className="flex flex-col h-full min-h-[60vh]">
                    <div className="flex-1 flex items-center justify-center">
                      <h3 className="text-3xl font-extrabold text-center text-[#2962ff] leading-tight tracking-tight max-w-sm">
                        Deep dive into your trading insights
                      </h3>
                    </div>
                    <div className="space-y-2 pt-6">
                      <div className="text-xs text-slate-400 font-medium">Try asking:</div>
                      {STARTERS.map((s) => (
                        <button
                          key={s}
                          onClick={() => send(s)}
                          disabled={loading}
                          className="w-full text-left text-sm px-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-slate-700 transition disabled:opacity-50"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((m, i) =>
                    m.role === "user" ? (
                      <div key={i} className="flex flex-col items-end gap-1">
                        <span className="text-xs text-[#2962ff] font-medium pr-1">You</span>
                        <div className="max-w-[85%] rounded-2xl bg-[#2962ff] text-white px-4 py-2.5 text-sm font-medium shadow-sm whitespace-pre-wrap">
                          {m.content}
                        </div>
                      </div>
                    ) : (
                      <div key={i} className="optix-md max-w-full text-[15px] text-slate-800">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                      </div>
                    ),
                  )
                )}

                {loading && (
                  <div className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-200 bg-white">
                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" />
                  </div>
                )}
                {error && <div className="text-xs text-destructive">{error}</div>}
              </div>

              {/* Shortcut chips */}
              <div className="px-5 pt-3 pb-2 border-t border-slate-200 bg-white">
                <div className="flex flex-wrap gap-2">
                  {SHORTCUTS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => send(s.prompt)}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-[#2962ff] hover:text-white hover:border-[#2962ff] transition-colors disabled:opacity-50"
                    >
                      <span aria-hidden>{s.emoji}</span> {s.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2 pl-1">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    <Check className="h-3 w-3" /> {PROVIDERS[provider].label} connected
                  </span>
                  <button
                    onClick={clearKey}
                    className="text-[11px] text-slate-400 hover:text-destructive inline-flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> Remove key
                  </button>
                </div>
              </div>

              {/* Composer */}
              <div className="px-5 pb-5 pt-2 bg-white">
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {attachments.map((a, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 text-xs bg-slate-100 border border-slate-200 text-slate-700 pl-2 pr-1 py-1 rounded-full max-w-[220px]">
                        {a.kind === "image" ? <ImageIcon className="h-3 w-3 shrink-0" /> : <FileText className="h-3 w-3 shrink-0" />}
                        <span className="truncate">{a.name}</span>
                        <button onClick={() => removeAttachment(i)} className="h-4 w-4 rounded-full hover:bg-slate-300 flex items-center justify-center shrink-0" aria-label="Remove">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-end gap-2 rounded-full border border-slate-300 bg-white pl-2 pr-2 py-2 shadow-sm focus-within:border-[#2962ff] focus-within:ring-2 focus-within:ring-[#2962ff]/15">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT}
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    aria-label="Attach file"
                    title="Attach CSV, DOCX, JPG, or XLS"
                    className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-[#2962ff] flex items-center justify-center transition disabled:opacity-50 shrink-0"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
                    }}
                    rows={1}
                    placeholder="Ask OptiX AI"
                    className="flex-1 resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-slate-400 max-h-32 py-1"
                  />
                  <button
                    onClick={() => send(input)}
                    disabled={loading || (!input.trim() && attachments.length === 0)}
                    aria-label="Send"
                    className="h-8 w-8 rounded-full bg-slate-100 hover:bg-[#2962ff] hover:text-white text-slate-700 flex items-center justify-center transition disabled:opacity-50 disabled:hover:bg-slate-100 disabled:hover:text-slate-700"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 mt-1.5 pl-2">Accepts: CSV, DOCX, JPG, XLS · 5MB max</div>
              </div>

            </>
          )}
        </div>
      )}
    </>
  );
}
