import { MESES } from './constants';

export function getType(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'word';
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'img';
  return 'txt';
}

export function fmtSize(bytes) {
  return bytes < 1048576
    ? (bytes / 1024).toFixed(0) + ' KB'
    : (bytes / 1048576).toFixed(1) + ' MB';
}

export function safe(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function stripMarkdown(texto) {
  return texto
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/^---+$/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .trim();
}

export function extrairGabarito(texto) {
  const limpo = stripMarkdown(texto);
  const linhas = limpo.split('\n');
  const gab = {};
  let dentro = false;
  for (const l of linhas) {
    if (/^GABARITO/i.test(l.replace(/[*_]/g, '').trim())) { dentro = true; continue; }
    if (dentro) {
      const m = l.match(/(\d+)\s*[-.:]\s*([A-D])/i);
      if (m) gab[m[1].padStart(2, '0')] = m[2].toUpperCase();
      else if (l.trim() === '' && Object.keys(gab).length > 0) break;
    }
  }
  return gab;
}

export function textoSemGabarito(texto) {
  const limpo = stripMarkdown(texto);
  const linhas = limpo.split('\n');
  let dentro = false;
  const out = [];
  for (const l of linhas) {
    if (/^GABARITO/i.test(l.trim())) { dentro = true; continue; }
    if (dentro && /^QUEST[ÃA]O/i.test(l.trim())) dentro = false;
    if (!dentro) out.push(l);
  }
  while (out.length > 0 && out[out.length - 1].trim() === '') out.pop();
  return out.join('\n');
}

export function formatConteudo(texto) {
  const linhas = texto.split('\n');
  let html = '';
  let emQuestao = false;
  let blocoHtml = '';

  const fecharQuestao = () => {
    if (emQuestao && blocoHtml) {
      html += `<div class="questao">${blocoHtml}</div>`;
      blocoHtml = '';
      emQuestao = false;
    }
  };

  for (const l of linhas) {
    const s = safe(l);
    const trim = l.trim();
    if (/^QUEST[ÃA]O\s+\d+/i.test(trim)) {
      fecharQuestao();
      emQuestao = true;
      blocoHtml = `<div class="qbar">${s}</div>`;
    } else if (emQuestao) {
      if (/^[A-D]\s*[\)\.]/i.test(trim)) blocoHtml += `<p class="opcao">${s}</p>`;
      else if (trim === '') blocoHtml += '<div class="espaco"></div>';
      else blocoHtml += `<p class="ptexto">${s}</p>`;
    } else {
      if (trim === '') html += '<div class="espaco"></div>';
      else html += `<p class="ptexto">${s}</p>`;
    }
  }
  fecharQuestao();
  return html;
}

export function extrairRubrica(texto) {
  const linhas = stripMarkdown(texto).split('\n');
  const rubrica = [];
  let atual = null;
  let dentro = false;

  for (const l of linhas) {
    const t = l.trim();
    if (!dentro) {
      if (/^RUBRICA/i.test(t)) { dentro = true; continue; }
      continue;
    }
    const mQ = t.match(/^Quest[aã]o\s+(\d+)\s*\(([0-9,\.]+)\s*pontos?\)/i);
    if (mQ) {
      if (atual) rubrica.push(atual);
      atual = { num: mQ[1].padStart(2, '0'), peso: parseFloat(mQ[2].replace(',', '.')), criterios: [] };
      continue;
    }
    if (atual) {
      const mC = t.match(/^[-•]\s*(.+?)\s*\((\d+)%\):\s*(.+)/);
      if (mC) atual.criterios.push({ nome: mC[1].trim(), pct: parseInt(mC[2]), descricao: mC[3].trim() });
    }
  }
  if (atual) rubrica.push(atual);
  return rubrica;
}

export function getFileName(tab, plano, prova, atividade) {
  const d = new Date();
  const tipo = tab === 'plano' ? 'Plano' : tab === 'prova' ? 'Prova' : 'Atividade';
  const disc = (tab === 'plano' ? plano.disciplina : tab === 'prova' ? prova.disciplina : atividade.disciplina) || 'Material';
  const serie = (tab === 'plano' ? plano.serie : tab === 'prova' ? prova.serie : atividade.serie) || '';
  const turma = (tab === 'plano' ? plano.turma : tab === 'prova' ? prova.turma : atividade.turma) || '';
  const serieCode = serie.match(/(\d+º)/)?.[0] ?? '';
  const partes = [disc, serieCode, turma].filter(Boolean).join('_').replace(/\s+/g, '_');
  return `${tipo}_${partes}_${String(d.getDate()).padStart(2, '0')}-${MESES[d.getMonth()].slice(0, 3)}-${d.getFullYear()}`;
}
