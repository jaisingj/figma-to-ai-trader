import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, Loader2, Check, AlertCircle, ArrowRight, X } from "lucide-react";
import { setTrades } from "@/lib/trades-store";
import { buildInsights } from "@/lib/insights-aggregate";
import { supabase } from "@/integrations/supabase/client";


export const Route = createFileRoute("/upload")({
  component: UploadPage,
  head: () => ({
    meta: [
      { title: "Upload broker CSV — OptiX" },
      { name: "description", content: "Upload broker CSV or Excel files and get normalized trades back." },
    ],
  }),
});

type ParseResult = {
  filename: string;
  row_count: number;
  columns: string[];
  rows: Record<string, unknown>[];
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string | undefined;

function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [insightsMsg, setInsightsMsg] = useState<string | null>(null);

  async function handleUpload() {
    if (!files.length) return;
    if (!BACKEND_URL) {
      setError("VITE_BACKEND_URL is not configured.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      for (const f of files) fd.append("files", f);
      const res = await fetch(`${BACKEND_URL}/upload-csv`, { method: "POST", body: fd });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }
      const data = (await res.json()) as ParseResult;
      setResult(data);
      setTrades({
        filename: data.filename,
        columns: data.columns,
        rows: data.rows,
        uploadedAt: new Date().toISOString(),
      });

      try {
        const out = buildInsights(data.rows);
        if (out && out.matched > 0) {
          const json = JSON.stringify(out.data);
          sessionStorage.setItem("optix.insights.v1", json);
          localStorage.setItem("optix.insights.v1", json);
          setInsightsMsg(
            `Dashboard updated: ${out.matched} option trades parsed` +
              (out.unmatched ? ` · ${out.unmatched} description rows didn't match the expected option format` : "")
          );
        } else {
          sessionStorage.removeItem("optix.insights.v1");
          localStorage.removeItem("optix.insights.v1");
          setInsightsMsg(
            `No option trades recognized in ${data.row_count} rows. /home will show demo data. ` +
              `Share the CSV header + a few sample Description rows and I'll teach the parser your broker's format.`
          );
        }
      } catch (err) {
        console.warn("insights aggregation failed", err);
        setInsightsMsg("Aggregation failed: " + (err instanceof Error ? err.message : String(err)));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-foreground">Upload broker CSV</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Drop one or more CSV/Excel exports from Robinhood, Schwab, Fidelity, or E*TRADE. We'll normalize and merge them.
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 p-10 text-center hover:bg-muted/50">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {files.length
              ? `${files.length} file${files.length === 1 ? "" : "s"} selected`
              : "Click to choose one or more CSV / XLS / XLSX files"}
          </span>
          <span className="text-xs text-muted-foreground">Hold ⌘/Ctrl or Shift to select multiple</span>
          <input
            type="file"
            accept=".csv,.xls,.xlsx"
            multiple
            className="hidden"
            onChange={(e) => {
              const picked = Array.from(e.target.files ?? []);
              setFiles((prev) => {
                const seen = new Set(prev.map((f) => `${f.name}:${f.size}`));
                const merged = [...prev];
                for (const f of picked) {
                  const k = `${f.name}:${f.size}`;
                  if (!seen.has(k)) {
                    merged.push(f);
                    seen.add(k);
                  }
                }
                return merged;
              });
              setResult(null);
              setError(null);
              setInsightsMsg(null);
              e.target.value = "";
            }}
          />
        </label>

        {files.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${f.size}-${i}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs"
              >
                <span className="truncate text-foreground">{f.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Remove ${f.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={handleUpload}
          disabled={!files.length || loading}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {loading ? "Parsing…" : `Upload & parse${files.length > 1 ? ` (${files.length})` : ""}`}
        </button>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {insightsMsg && !error && (
          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3 text-sm text-foreground">
            {insightsMsg}
          </div>
        )}
      </div>

      {result && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Check className="h-4 w-4 text-green-600" />
              Parsed <strong>{result.row_count}</strong> rows from <strong>{result.filename}</strong>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
            >
              View on dashboard <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  {result.columns.map((c) => (
                    <th key={c} className="px-2 py-2 font-medium">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.slice(0, 25).map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {result.columns.map((c) => (
                      <td key={c} className="px-2 py-1.5 text-foreground">
                        {row[c] == null ? "" : String(row[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {result.rows.length > 25 && (
              <p className="mt-2 text-xs text-muted-foreground">Showing first 25 of {result.rows.length} rows.</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
