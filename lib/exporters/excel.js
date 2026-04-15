// lib/exporters/excel.js
// Exporta o conteúdo gerado como .xlsx com template ProntoProfe.
// Usa a lib `xlsx` / SheetJS (client-side, sem servidor).

export async function exportToExcel(content, title, meta = {}, options = {}) {
  const XLSX = await import('xlsx');

  const now    = new Date();
  const dateBR = now.toLocaleDateString('pt-BR');
  const timeBR = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const providerLabel = meta.provider
    ? meta.provider.charAt(0).toUpperCase() + meta.provider.slice(1)
    : null;

  // ── Montar linhas da planilha ───────────────────────────────────────────
  const rows = [];

  // Cabeçalho institucional
  rows.push(['ProntoProfe — Assistente do Professor · SESI']);
  rows.push([`Data: ${dateBR}   Hora: ${timeBR}${providerLabel ? `   IA: ${providerLabel}${meta.model ? ' · ' + meta.model : ''}` : ''}`]);
  rows.push([]); // linha em branco

  // Título do documento
  rows.push([title || 'Conteúdo Gerado']);
  rows.push([]); // linha em branco

  // Conteúdo — uma linha da planilha por linha de texto
  const contentLines = content.split('\n');
  for (const line of contentLines) {
    // Remove marcação markdown nos títulos para o Excel
    const clean = line.replace(/^#+\s*/, '').replace(/\*\*/g, '');
    rows.push([clean]);
  }

  rows.push([]); // linha em branco final
  rows.push(['Gerado automaticamente por ProntoProfe · Assistente do Professor SESI']);

  // ── Criar workbook ──────────────────────────────────────────────────────
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Largura da coluna A (120 caracteres)
  ws['!cols'] = [{ wch: 120 }];

  XLSX.utils.book_append_sheet(wb, ws, 'Conteúdo');

  // ── Gerar blob ──────────────────────────────────────────────────────────
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const MIME  = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const blob  = new Blob([wbout], { type: MIME });

  if (options.returnBlob) return blob;

  triggerDownload(blob, `pronto-profe-${isoDate(now)}.xlsx`, MIME);
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
