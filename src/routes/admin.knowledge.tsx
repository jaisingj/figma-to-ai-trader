import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Upload, Trash2, BookOpen, ShieldCheck, ArrowLeft } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  checkAdminStatus,
  claimFirstAdmin,
  createBook,
  ingestChunks,
  finalizeBook,
  listBooks,
  deleteBook,
} from "@/lib/kb.functions";
import { extractPdfPages, extractTextFile, chunkPages, type Chunk } from "@/lib/pdf-extract";

export const Route = createFileRoute("/admin/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge Base — OptiX Admin" },
      { name: "description", content: "Upload reference books for the OptiX AI bot." },
    ],
  }),
  component: AdminKnowledgePage,
});

type Book = {
  id: string;
  title: string;
  filename: string;
  page_count: number | null;
  chunk_count: number | null;
  status: string;
  error: string | null;
  created_at: string;
};

const BATCH_SIZE = 20;

function AdminKnowledgePage() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [admin, setAdmin] = useState<{ isAdmin: boolean; adminCount: number } | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const fnCheck = useServerFn(checkAdminStatus);
  const fnClaim = useServerFn(claimFirstAdmin);
  const fnCreate = useServerFn(createBook);
  const fnIngest = useServerFn(ingestChunks);
  const fnFinalize = useServerFn(finalizeBook);
  const fnList = useServerFn(listBooks);
  const fnDelete = useServerFn(deleteBook);

  const refresh = useCallback(async () => {
    try {
      const s = await fnCheck();
      setAdmin({ isAdmin: s.isAdmin, adminCount: s.adminCount });
      if (s.isAdmin) {
        const list = await fnList();
        setBooks(list as Book[]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [fnCheck, fnList]);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      setSignedIn(!!data.session);
      setAuthChecked(true);
      if (!data.session) {
        navigate({ to: "/" });
        return;
      }
      await refresh();
    });
    return () => {
      alive = false;
    };
  }, [navigate, refresh]);

  async function onClaim() {
    setBusy(true);
    setError(null);
    try {
      await fnClaim();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const titleInput = form.elements.namedItem("title") as HTMLInputElement;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) return;
    const title = titleInput.value.trim() || file.name.replace(/\.[^.]+$/, "");

    setBusy(true);
    setError(null);
    setProgress(`Reading ${file.name}…`);

    let documentId: string | null = null;
    try {
      const isPdf = file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";
      let chunks: Chunk[];
      let pageCount = 0;

      if (isPdf) {
        setProgress("Extracting PDF text…");
        const pages = await extractPdfPages(file);
        pageCount = pages.length;
        chunks = chunkPages(pages);
      } else {
        setProgress("Reading text…");
        chunks = await extractTextFile(file);
      }

      if (chunks.length === 0) throw new Error("No text could be extracted from this file.");

      setProgress(`Creating book record…`);
      const { id } = await fnCreate({ data: { title, filename: file.name, pageCount } });
      documentId = id;

      for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE);
        setProgress(`Embedding chunks ${i + 1}–${i + batch.length} of ${chunks.length}…`);
        await fnIngest({ data: { documentId: id, chunks: batch } });
      }

      setProgress("Finalizing…");
      await fnFinalize({ data: { documentId: id, status: "ready" } });
      setProgress(`✓ Indexed "${title}" — ${chunks.length} passages`);
      form.reset();
      await refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      if (documentId) {
        try {
          await fnFinalize({ data: { documentId, status: "failed", error: msg.slice(0, 500) } });
        } catch {}
      }
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this book and all its passages?")) return;
    try {
      await fnDelete({ data: { id } });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }
  if (!signedIn) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link to="/home" className="text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 text-sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#2962ff]" /> Knowledge Base
          </h1>
          {admin?.isAdmin && (
            <span className="ml-auto inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full">
              <ShieldCheck className="h-3 w-3" /> Admin
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 text-red-700 text-sm p-3">{error}</div>
        )}

        {admin && !admin.isAdmin && admin.adminCount === 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
            <h2 className="font-semibold mb-1">No admin set up yet</h2>
            <p className="text-sm text-slate-700 mb-3">
              Claim admin access for this knowledge base. (One-time — only the first user can do this.)
            </p>
            <Button onClick={onClaim} disabled={busy} className="bg-[#2962ff] hover:bg-[#1e4fd1]">
              {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
              Claim admin
            </Button>
          </div>
        )}

        {admin && !admin.isAdmin && admin.adminCount > 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-700">
              You don't have admin access. Ask the existing admin to grant you the <code>admin</code> role.
            </p>
          </div>
        )}

        {admin?.isAdmin && (
          <>
            <form onSubmit={onUpload} className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
              <h2 className="font-semibold">Upload a reference book</h2>
              <div className="space-y-2">
                <Label htmlFor="title">Title (optional)</Label>
                <Input id="title" name="title" placeholder="e.g. Options as a Strategic Investment" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">File (PDF, TXT, MD)</Label>
                <Input id="file" name="file" type="file" accept=".pdf,.txt,.md" required />
              </div>
              <Button type="submit" disabled={busy} className="bg-[#2962ff] hover:bg-[#1e4fd1]">
                {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                Upload & index
              </Button>
              {progress && <p className="text-xs text-slate-500">{progress}</p>}
              <p className="text-[11px] text-slate-400">
                PDFs are parsed in your browser, then passages are embedded and stored. Large books may take a few minutes.
              </p>
            </form>

            <section className="rounded-lg border border-slate-200 bg-white">
              <header className="px-5 py-3 border-b border-slate-200 font-semibold">
                Indexed books ({books.length})
              </header>
              {books.length === 0 ? (
                <p className="px-5 py-8 text-sm text-slate-500 text-center">No books yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {books.map((b) => (
                    <li key={b.id} className="px-5 py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{b.title}</div>
                        <div className="text-xs text-slate-500 truncate">
                          {b.filename} · {b.page_count ?? "?"} pages · {b.chunk_count ?? 0} passages ·{" "}
                          <span
                            className={
                              b.status === "ready"
                                ? "text-emerald-600"
                                : b.status === "failed"
                                ? "text-red-600"
                                : "text-amber-600"
                            }
                          >
                            {b.status}
                          </span>
                          {b.error ? ` — ${b.error}` : ""}
                        </div>
                      </div>
                      <button
                        onClick={() => onDelete(b.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
