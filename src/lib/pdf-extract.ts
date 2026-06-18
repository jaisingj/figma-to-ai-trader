// Client-side PDF text extraction using pdfjs-dist (legacy build for broad compat).

export type PageText = { page: number; text: string };

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;
async function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const mod = await import("pdfjs-dist");
      // Use the worker from the same package via Vite's ?url import.
      const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
      mod.GlobalWorkerOptions.workerSrc = workerUrl;
      return mod;
    })();
  }
  return pdfjsPromise;
}

export async function extractPdfPages(file: File): Promise<PageText[]> {
  const pdfjs = await getPdfjs();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const out: PageText[] = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    const text = tc.items
      .map((it: any) => ("str" in it ? it.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    out.push({ page: p, text });
  }
  return out;
}

export type Chunk = { index: number; page?: number; content: string };

/** Split pages into ~targetChars chunks with overlap, preserving page numbers. */
export function chunkPages(
  pages: PageText[],
  targetChars = 1000,
  overlap = 150,
): Chunk[] {
  const chunks: Chunk[] = [];
  let idx = 0;
  for (const { page, text } of pages) {
    if (!text) continue;
    if (text.length <= targetChars) {
      chunks.push({ index: idx++, page, content: text });
      continue;
    }
    let start = 0;
    while (start < text.length) {
      const end = Math.min(text.length, start + targetChars);
      // try to break on sentence boundary near `end`
      let cut = end;
      if (end < text.length) {
        const slice = text.slice(start, end);
        const lastDot = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
        if (lastDot > targetChars * 0.5) cut = start + lastDot + 1;
      }
      chunks.push({ index: idx++, page, content: text.slice(start, cut).trim() });
      if (cut >= text.length) break;
      start = cut - overlap;
      if (start < 0) start = 0;
    }
  }
  return chunks;
}

export async function extractTextFile(file: File): Promise<Chunk[]> {
  const text = await file.text();
  return chunkPages([{ page: 1, text }]);
}
