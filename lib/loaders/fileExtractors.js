/**
 * Loaders unificados para pdf.js e mammoth — substituem CDN tags em <Head>.
 *
 * Audit 2026-05-02 (Performance 2): pdf.js (~330 KB) + mammoth (~750 KB)
 * eram baixados em TODA abertura de `/`, mesmo sem upload. Vinham via
 * cdnjs.cloudflare.com. Agora vão como deps npm com import dinâmico.
 *
 * Uso:
 *   import { extractFromPdf, extractFromDocx } from '@/lib/loaders/fileExtractors';
 *   const text = await extractFromPdf(file);
 *   const text = await extractFromDocx(file);
 */

let pdfjsLibPromise = null;
let mammothPromise = null;

async function loadPdfjs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = (async () => {
      const pdfjs = await import('pdfjs-dist/build/pdf');
      // Worker via dynamic URL (Vite/Webpack/Turbopack resolvem)
      const workerSrc = (await import('pdfjs-dist/build/pdf.worker.min.js?url')).default
        || 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
      return pdfjs;
    })().catch(e => {
      pdfjsLibPromise = null;
      throw e;
    });
  }
  return pdfjsLibPromise;
}

async function loadMammoth() {
  if (!mammothPromise) {
    mammothPromise = import('mammoth').then(m => m.default || m).catch(e => {
      mammothPromise = null;
      throw e;
    });
  }
  return mammothPromise;
}

/**
 * Extrai texto plano de um File/Blob PDF.
 */
export async function extractFromPdf(file, { from, to } = {}) {
  const pdfjs = await loadPdfjs();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const start = Math.max(1, from || 1);
  const end = Math.min(pdf.numPages, to || pdf.numPages);
  let texto = '';
  for (let i = start; i <= end; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    texto += content.items.map(it => it.str).join(' ') + '\n';
  }
  return { texto, totalPages: pdf.numPages, from: start, to: end };
}

/**
 * Apenas conta páginas de um PDF (sem extrair texto).
 */
export async function countPdfPages(file) {
  const pdfjs = await loadPdfjs();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  return pdf.numPages;
}

/**
 * Extrai texto plano de um File/Blob DOCX.
 */
export async function extractFromDocx(file) {
  const mammoth = await loadMammoth();
  const buf = await file.arrayBuffer();
  const r = await mammoth.extractRawText({ arrayBuffer: buf });
  return r.value;
}
