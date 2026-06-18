## Goal
Build an admin-only RAG knowledge base so Optimus can answer options/strategy concept questions using passages from books you upload. Trade-data questions keep using the existing system prompt — RAG only fires for conceptual queries.

## Architecture

```text
[Admin upload UI] → [parse PDF/EPUB/TXT] → [chunk ~1000 chars, 150 overlap]
        ↓
[Lovable AI embeddings: google/gemini-embedding-001, 3072-dim]
        ↓
[Postgres + pgvector: kb_documents, kb_chunks]
        ↓
[Chat: classify question → if conceptual → embed query → top-5 chunks → inject as context → LLM]
```

## Database (migration)
- `kb_documents` — id, title, filename, pages, uploaded_by, created_at
- `kb_chunks` — id, document_id, chunk_index, content, embedding vector(3072), page_number
- `app_role` enum + `user_roles` table + `has_role()` SECURITY DEFINER function (admin gating)
- HNSW index on `kb_chunks.embedding` (cosine)
- `match_kb_chunks(query_embedding, match_count)` SQL function
- RLS: only admins INSERT/DELETE on kb tables; authenticated users SELECT (so bot can retrieve)
- Storage bucket `kb-books` (private), admin-only upload policy

## Backend (TanStack server functions)
- `ingestBook` (admin-only) — accepts uploaded file path, parses text by page, chunks, batch-embeds via Lovable AI Gateway, inserts rows
- `searchKnowledge` (authenticated) — embeds query, calls `match_kb_chunks`, returns top-5 passages with citations (book + page)
- `listBooks` / `deleteBook` (admin-only)

## Frontend
- New `/admin/knowledge` route (gated by `has_role('admin')`) — upload form, book list, delete, ingestion progress
- `AIChatWidget`: before calling LLM, run lightweight classifier (keyword + intent) — if conceptual, call `searchKnowledge`, prepend retrieved passages to the system prompt with citations, and instruct the model to cite source book + page in its answer

## Parsing
- PDF: `pdf-parse` (per-page text)
- EPUB: `epub2` 
- TXT/MD: read directly
- Chunking: ~1000 chars with 150-char overlap, respecting paragraph boundaries

## Admin bootstrap
You'll be granted the `admin` role via a one-time seed migration tied to your user id (I'll ask for your account email or grant on first login).

## Out of scope (this round)
- Per-user KBs
- Re-ranking (will add if retrieval quality is weak)
- Image/diagram extraction from books

## Open question before I build
What email did you sign up with? I'll seed the admin role for that account in the migration.
