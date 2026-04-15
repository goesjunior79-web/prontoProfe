// lib/exporters/word.js
// Exporta o conteúdo gerado como .docx com template ProntoProfe.
// Usa a lib `docx` (client-side, sem servidor).

export async function exportToWord(content, title, meta = {}, options = {}) {
  const {
    Document, Packer, Paragraph, TextRun,
    AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType,
  } = await import('docx');

  const now    = new Date();
  const dateBR = now.toLocaleDateString('pt-BR');
  const timeBR = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const PRIMARY = '0C447C';
  const GRAY    = '888888';

  const providerLabel = meta.provider
    ? meta.provider.charAt(0).toUpperCase() + meta.provider.slice(1)
    : null;

  const paragraphs = [];

  // ── Cabeçalho ──────────────────────────────────────────────────────────
  paragraphs.push(new Paragraph({
    children: [
      new TextRun({ text: 'ProntoProfe', bold: true, size: 28, color: PRIMARY }),
      new TextRun({ text: ' — Assistente do Professor · SESI', size: 22, color: PRIMARY }),
    ],
  }));

  paragraphs.push(new Paragraph({
    children: [
      new TextRun({ text: `Data: ${dateBR}   Hora: ${timeBR}`, size: 18, color: GRAY }),
      ...(providerLabel ? [new TextRun({ text: `   IA: ${providerLabel}${meta.model ? ' · ' + meta.model : ''}`, size: 18, color: GRAY })] : []),
    ],
  }));

  // Linha separadora visual (borda inferior)
  paragraphs.push(new Paragraph({
    text: '',
    border: { bottom: { color: PRIMARY, size: 6, style: BorderStyle.SINGLE } },
    spacing: { after: 200 },
  }));

  // ── Título do documento ─────────────────────────────────────────────────
  paragraphs.push(new Paragraph({
    children: [new TextRun({ text: title || 'Conteúdo Gerado', bold: true, size: 28, color: PRIMARY })],
    spacing: { after: 200 },
  }));

  // ── Conteúdo ────────────────────────────────────────────────────────────
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('# ')) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: line.replace(/^#+\s*/, ''), bold: true, size: 26, color: PRIMARY })],
        spacing: { before: 240, after: 80 },
      }));
      continue;
    }
    if (line.startsWith('## ') || line.startsWith('### ')) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: line.replace(/^#+\s*/, ''), bold: true, size: 22, color: PRIMARY })],
        spacing: { before: 200, after: 60 },
      }));
      continue;
    }

    // Linha com **negrito** inline
    if (line.includes('**')) {
      const runs = parseInlineBold(line, TextRun);
      paragraphs.push(new Paragraph({ children: runs, spacing: { after: 60 } }));
      continue;
    }

    if (line.trim() === '') {
      paragraphs.push(new Paragraph({ text: '', spacing: { after: 80 } }));
      continue;
    }

    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: line, size: 20 })],
      spacing: { after: 60 },
    }));
  }

  // ── Rodapé ──────────────────────────────────────────────────────────────
  paragraphs.push(new Paragraph({
    text: '',
    border: { top: { color: 'CCCCCC', size: 4, style: BorderStyle.SINGLE } },
    spacing: { before: 400 },
  }));
  paragraphs.push(new Paragraph({
    children: [new TextRun({
      text: 'Gerado automaticamente por ProntoProfe · Assistente do Professor SESI',
      size: 16, color: GRAY, italics: true,
    })],
  }));

  const doc  = new Document({ sections: [{ properties: {}, children: paragraphs }] });
  const blob = await Packer.toBlob(doc);
  if (options.returnBlob) return blob;
  triggerDownload(blob, `pronto-profe-${isoDate(now)}.docx`,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}

// Parseia **texto** dentro de uma linha, retorna array de TextRun
function parseInlineBold(line, TextRun) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map(part => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return new TextRun({ text: part.slice(2, -2), bold: true, size: 20 });
    }
    return new TextRun({ text: part, size: 20 });
  });
}

function triggerDownload(blob, fileName, mimeType) {
  const url = URL.createObjectURL(new Blob([blob], { type: mimeType }));
  const a   = document.createElement('a');
  a.href    = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function isoDate(date) {
  return date.toISOString().split('T')[0];
}
