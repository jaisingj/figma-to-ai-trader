import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const EMBED_MODEL = "openai/text-embedding-3-small";
const EMBED_DIMS = 1536;

async function embed(texts: string[]): Promise<number[][]> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model: EMBED_MODEL,
      input: texts,
      dimensions: EMBED_DIMS,
    }),
  });
  if (!res.ok) throw new Error(`Embed failed: ${res.status} ${await res.text()}`);
  const j = (await res.json()) as { data: { embedding: number[] }[] };
  return j.data.map((d) => d.embedding);
}

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

/** Returns whether the current user is admin and whether any admin exists. */
export const checkAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    return { isAdmin: !!isAdmin, adminCount: count ?? 0, userId };
  });

/** If no admin exists yet, grant admin to the current user. One-time bootstrap. */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) throw new Error("An admin already exists. Ask the existing admin to grant you access.");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const CreateBookInput = z.object({
  title: z.string().min(1).max(300),
  filename: z.string().min(1).max(300),
  pageCount: z.number().int().nonnegative().optional(),
  storagePath: z.string().min(1).max(500).optional(),
});

export const createBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CreateBookInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("kb_documents")
      .insert({
        title: data.title,
        filename: data.filename,
        page_count: data.pageCount,
        storage_path: data.storagePath ?? null,
        uploaded_by: userId,
        status: "ingesting",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

const IngestChunksInput = z.object({
  documentId: z.string().uuid(),
  chunks: z
    .array(
      z.object({
        index: z.number().int().nonnegative(),
        page: z.number().int().positive().optional(),
        content: z.string().min(1).max(8000),
      }),
    )
    .min(1)
    .max(50),
});

export const ingestChunks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => IngestChunksInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const vectors = await embed(data.chunks.map((c) => c.content));
    const rows = data.chunks.map((c, i) => ({
      document_id: data.documentId,
      chunk_index: c.index,
      page_number: c.page ?? null,
      content: c.content,
      embedding: vectors[i] as unknown as string,
    }));
    const { error } = await supabaseAdmin.from("kb_chunks").insert(rows);
    if (error) throw new Error(error.message);
    return { inserted: rows.length };
  });

const FinalizeBookInput = z.object({
  documentId: z.string().uuid(),
  status: z.enum(["ready", "failed"]),
  error: z.string().optional(),
});

export const finalizeBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => FinalizeBookInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("kb_chunks")
      .select("*", { count: "exact", head: true })
      .eq("document_id", data.documentId);
    const { error } = await supabaseAdmin
      .from("kb_documents")
      .update({ status: data.status, chunk_count: count ?? 0, error: data.error ?? null })
      .eq("id", data.documentId);
    if (error) throw new Error(error.message);
    return { ok: true, chunks: count ?? 0 };
  });

export const listBooks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("kb_documents")
      .select("id, title, filename, page_count, chunk_count, status, error, storage_path, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const DeleteBookInput = z.object({ id: z.string().uuid() });
export const deleteBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => DeleteBookInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: doc } = await supabaseAdmin
      .from("kb_documents")
      .select("storage_path")
      .eq("id", data.id)
      .maybeSingle();
    if (doc?.storage_path) {
      await supabaseAdmin.storage.from("kb-books").remove([doc.storage_path]);
    }
    const { error } = await supabaseAdmin.from("kb_documents").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const SearchInput = z.object({
  query: z.string().min(1).max(2000),
  matchCount: z.number().int().min(1).max(10).default(5),
});

export const searchKnowledge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SearchInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const [vec] = await embed([data.query]);
    const { data: matches, error } = await supabase.rpc("match_kb_chunks", {
      query_embedding: vec as unknown as string,
      match_count: data.matchCount,
    });
    if (error) throw new Error(error.message);
    return (matches ?? []) as Array<{
      id: string;
      document_id: string;
      document_title: string;
      page_number: number | null;
      content: string;
      similarity: number;
    }>;
  });
