// lib/exporters/pdf.js
// Exporta o conteúdo gerado como PDF com template ProntoProfe.
// Usa jsPDF (client-side, sem servidor).

export async function exportToPDF(content, title, meta = {}, options = {}) {
  const { jsPDF } = await import('jspdf');

  const doc   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W     = 210;
  const H     = 297;
  const ML    = 15; // margem esquerda
  const MR    = 15; // margem direita
  const CW    = W - ML - MR; // largura útil
  const FOOTER_Y = H - 14;

  const now     = new Date();
  const dateBR  = now.toLocaleDateString('pt-BR');
  const timeBR  = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const PRIMARY = [12, 68, 124];   // #0C447C
  const WHITE   = [255, 255, 255];
  const DARK    = [30, 30, 30];
  const GRAY    = [120, 120, 120];

  // ── Cabeçalho colorido ──────────────────────────────────────────────────
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, W, 30, 'F');

  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('ProntoProfe', ML, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Assistente do Professor · SESI', ML, 21);

  doc.setFontSize(8);
  doc.text(`${dateBR}  ${timeBR}`, W - MR, 13, { align: 'right' });
  if (meta.provider) {
    const providerLabel = meta.provider.charAt(0).toUpperCase() + meta.provider.slice(1);
    doc.text(`IA: ${providerLabel}${meta.model ? ' · ' + meta.model : ''}`, W - MR, 21, { align: 'right' });
  }

  // ── Título do documento ─────────────────────────────────────────────────
  let y = 42;
  doc.setTextColor(...PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  const titleLines = doc.splitTextToSize(title || 'Conteúdo Gerado', CW);
  doc.text(titleLines, ML, y);
  y += titleLines.length * 6.5 + 3;

  // Linha separadora
  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.4);
  doc.line(ML, y, W - MR, y);
  y += 8;

  // ── Conteúdo ────────────────────────────────────────────────────────────
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const LH = 5.2; // line height

  const rawLines = content.split('\n');

  for (const rawLine of rawLines) {
    // Detectar títulos markdown simples para negrito
    const isH1 = rawLine.startsWith('# ');
    const isH2 = rawLine.startsWith('## ');
    const isBold = /^\*\*(.+)\*\*$/.test(rawLine.trim());

    if (isH1 || isH2) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(isH1 ? 11 : 10);
      const clean = rawLine.replace(/^#+\s*/, '');
      const wrapped = doc.splitTextToSize(clean, CW);
      for (const wl of wrapped) {
        if (y + LH > FOOTER_Y) { addFooter(doc, W, H, ML, MR); doc.addPage(); y = 20; }
        doc.text(wl, ML, y);
        y += LH + 1;
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      continue;
    }

    if (isBold) {
      doc.setFont('helvetica', 'bold');
      const clean = rawLine.trim().replace(/\*\*/g, '');
      const wrapped = doc.splitTextToSize(clean, CW);
      for (const wl of wrapped) {
        if (y + LH > FOOTER_Y) { addFooter(doc, W, H, ML, MR); doc.addPage(); y = 20; }
        doc.text(wl, ML, y);
        y += LH;
      }
      doc.setFont('helvetica', 'normal');
      continue;
    }

    if (rawLine.trim() === '') {
      y += LH * 0.5;
      continue;
    }

    const wrapped = doc.splitTextToSize(rawLine, CW);
    for (const wl of wrapped) {
      if (y + LH > FOOTER_Y) { addFooter(doc, W, H, ML, MR); doc.addPage(); y = 20; }
      doc.text(wl, ML, y);
      y += LH;
    }
  }

  addFooter(doc, W, H, ML, MR);

  if (options.returnBlob) {
    return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
  }
  doc.save(`pronto-profe-${isoDate(now)}.pdf`);
}

function addFooter(doc, W, H, ML, MR) {
  const FOOTER_Y = H - 14;
  const totalPages = doc.internal.getNumberOfPages();
  const currentPage = doc.internal.getCurrentPageInfo().pageNumber;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(ML, FOOTER_Y, W - MR, FOOTER_Y);

  doc.setTextColor(160, 160, 160);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Gerado automaticamente por ProntoProfe · Assistente do Professor SESI', ML, FOOTER_Y + 5);
  doc.text(`Página ${currentPage}`, W - MR, FOOTER_Y + 5, { align: 'right' });
}

function isoDate(date) {
  return date.toISOString().split('T')[0];
}
