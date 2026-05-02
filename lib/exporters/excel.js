// lib/exporters/excel.js
// Exporta o conteúdo gerado como .xlsx (ExcelJS).
// Migrado de SheetJS/xlsx (Fase 14 — CVE HIGH no xlsx@0.18.5).
// Mesma API pública: exportToExcel(content, title, meta?, options?).

export async function exportToExcel(content, title, meta = {}, options = {}) {
  const ExcelJS = (await import('exceljs')).default || (await import('exceljs'));

  const now    = new Date();
  const dateBR = now.toLocaleDateString('pt-BR');
  const timeBR = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const providerLabel = meta.provider
    ? meta.provider.charAt(0).toUpperCase() + meta.provider.slice(1)
    : null;

  const wb = new ExcelJS.Workbook();
  wb.creator = 'ProntoProfe';
  wb.created = now;
  const ws = wb.addWorksheet('Conteúdo');
  ws.columns = [{ width: 120 }];

  ws.addRow(['ProntoProfe — Assistente do Professor · SESI']);
  ws.addRow([`Data: ${dateBR}   Hora: ${timeBR}${providerLabel ? `   IA: ${providerLabel}${meta.model ? ' · ' + meta.model : ''}` : ''}`]);
  ws.addRow([]);

  ws.addRow([title || 'Conteúdo Gerado']);
  ws.addRow([]);

  const contentLines = content.split('\n');
  for (const line of contentLines) {
    const clean = line.replace(/^#+\s*/, '').replace(/\*\*/g, '');
    ws.addRow([clean]);
  }

  ws.addRow([]);
  ws.addRow(['Gerado automaticamente por ProntoProfe · Assistente do Professor SESI']);

  const buf = await wb.xlsx.writeBuffer();
  const MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const blob = new Blob([buf], { type: MIME });

  if (options.returnBlob) return blob;
  triggerDownload(blob, `pronto-profe-${isoDate(now)}.xlsx`, MIME);
}

function triggerDownload(blob, fileName, mimeType) {
  const url = URL.createObjectURL(new Blob([blob], { type: mimeType }));
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function isoDate(date) {
  return date.toISOString().split('T')[0];
}
