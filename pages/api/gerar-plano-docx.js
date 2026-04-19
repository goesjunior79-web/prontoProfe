import fs from 'fs';
import path from 'path';

const RED = 'C00000';

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ── Primitivos OOXML (fontes, tamanhos e espaçamento do modelo original) ───────

const FONT = `<w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>`;

function rpr({ bold, color, sz = 24 } = {}) {
  return `<w:rPr>${FONT}${bold ? '<w:b/><w:bCs/>' : ''}`
    + `${color ? `<w:color w:val="${color}"/>` : ''}`
    + `<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr>`;
}

function run(text, opts = {}) {
  return `<w:r>${rpr(opts)}<w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;
}

// Parágrafo de identificação: bold label + valor normal (sz=24, espaçamento 276)
function identPara(label, value) {
  return `<w:p><w:pPr><w:spacing w:after="0" w:line="276" w:lineRule="auto"/>`
    + `<w:jc w:val="both"/></w:pPr>`
    + run(label, { bold: true })
    + run(value)
    + `</w:p>`;
}

// ── Renderizador de linhas do conteúdo das seções ─────────────────────────────
// Bullet real do Word (PargrafodaLista + numId=46, exatamente como no modelo)
function bullet(text) {
  return `<w:p><w:pPr>`
    + `<w:pStyle w:val="PargrafodaLista"/>`
    + `<w:numPr><w:ilvl w:val="0"/><w:numId w:val="46"/></w:numPr>`
    + `<w:spacing w:line="360" w:lineRule="auto"/>`
    + `<w:rPr>${FONT}<w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr>`
    + `</w:pPr>`
    + run(text)
    + `</w:p>`;
}

// Parágrafo normal (sz=24, jc=both, 1.5x)
function pNormal(text, { bold, color, indent, shd } = {}) {
  const ind = indent ? `<w:ind w:left="${indent}"/>` : '';
  const shdXml = shd ? `<w:shd w:val="clear" w:color="auto" w:fill="${shd}"/>` : '';
  return `<w:p><w:pPr>`
    + `<w:spacing w:line="360" w:lineRule="auto"/>`
    + `<w:jc w:val="both"/>`
    + ind + shdXml
    + `</w:pPr>`
    + run(text, { bold, color })
    + `</w:p>`;
}

function isSpecialLine(t) {
  if (!t) return true;
  if (/^\d{2}\/\d{2}\/\d{4}\s*[–\-]/.test(t)) return true;
  if (/^[•\-\*]\s/.test(t)) return true;
  if (/^(Estação\s+N[1-4]|N[1-4]\s*[→\-]\s*N[1-4]|Matriz\s+de\s+Referência)/i.test(t)) return true;
  if (/^\*\*(.+?)\*\*/.test(t)) return true;
  if (/^(Instrumento\s+\d|Estratégia\b|Organização\b|Objetivo(s)?:|Critérios\b|Disciplinas\s+envolvidas|Tema:|Ações\s+a\s+serem|Nome\(s\)|Observação:|Estratégias[:\s]|Parceria\b|Avaliação:|Estratégias\s+e)/i.test(t)) return true;
  if (/^\d+\.\s+\S/.test(t)) return true;
  return false;
}

function renderSecXml(linhas) {
  let xml = '';
  let bufNormal = []; // acumula linhas normais para juntar em 1 parágrafo

  const flushNormal = () => {
    if (!bufNormal.length) return;
    xml += pNormal(bufNormal.join(' '));
    bufNormal = [];
  };

  for (const l of linhas) {
    const t = l.trim();

    // Linha vazia: fecha buffer e emite parágrafo vazio
    if (!t) {
      flushNormal();
      xml += `<w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:p>`;
      continue;
    }

    // Barra de data Avalia+ (02/03/2026 – SEGUNDA-FEIRA)
    if (/^\d{2}\/\d{2}\/\d{4}\s*[–\-]/.test(t)) {
      flushNormal();
      xml += pNormal(t, { bold: true, color: RED, shd: 'AAAAAA' });
      continue;
    }

    // Bullet (•, -, *)
    if (/^[•\-\*]\s/.test(t)) {
      flushNormal();
      xml += bullet(t.replace(/^[•\-\*]\s*/, ''));
      continue;
    }

    // Vermelho+negrito: Estação NX, N1→N2, Matriz de Referência
    if (/^(Estação\s+N[1-4]|N[1-4]\s*[→\-]\s*N[1-4]|Matriz\s+de\s+Referência)/i.test(t)) {
      flushNormal();
      xml += pNormal(t, { bold: true, color: RED });
      continue;
    }

    // Markdown **negrito** — com ou sem texto após
    const mBold = t.match(/^\*\*(.+?)\*\*(.*)$/);
    if (mBold) {
      flushNormal();
      const r1 = mBold[1];
      const r2 = mBold[2].trim();
      if (r2) {
        xml += `<w:p><w:pPr><w:spacing w:line="360" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr>`
          + run(r1, { bold: true })
          + run(' ' + r2)
          + `</w:p>`;
      } else {
        xml += pNormal(r1, { bold: true });
      }
      continue;
    }

    // Negrito preto: sub-títulos reconhecidos
    if (/^(Instrumento\s+\d|Estratégia\b|Organização\b|Objetivo(s)?:|Critérios\b|Disciplinas\s+envolvidas|Tema:|Ações\s+a\s+serem|Nome\(s\)|Observação:|Estratégias[:\s]|Parceria\b|Avaliação:|Estratégias\s+e)/i.test(t)) {
      flushNormal();
      xml += pNormal(t, { bold: true });
      continue;
    }

    // Itens numerados (1. Leitura do Dia:, 2. Questão Objetiva:)
    if (/^\d+\.\s+\S/.test(t)) {
      flushNormal();
      xml += pNormal(t, { bold: true, indent: 180 });
      continue;
    }

    // Linha normal: acumula no buffer (vai virar 1 parágrafo justificado)
    bufNormal.push(t);
  }

  flushNormal();
  return xml;
}

// ── Tabela de seção — igual ao modelo (Tabelacomgrade, sz=28 no título) ───────
// Landscape A4: w=16838, margens 2cm cada lado → largura disponível = 16838 - 2*1134 = 14570 twips
const COL_W = 14570;

function secBox(titulo, conteudoXml) {
  return `<w:p><w:pPr><w:spacing w:before="120" w:after="0"/></w:pPr></w:p>`
  + `<w:tbl>`
  + `<w:tblPr>`
  + `<w:tblStyle w:val="Tabelacomgrade"/>`
  + `<w:tblW w:w="${COL_W}" w:type="dxa"/>`
  + `<w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/>`
  + `</w:tblPr>`
  + `<w:tblGrid><w:gridCol w:w="${COL_W}"/></w:tblGrid>`
  // Row 1: título em vermelho sz=28 (igual ao modelo)
  + `<w:tr><w:trPr><w:trHeight w:val="268"/></w:trPr>`
  + `<w:tc><w:tcPr><w:tcW w:w="${COL_W}" w:type="dxa"/></w:tcPr>`
  + `<w:p><w:pPr>`
  + `<w:spacing w:line="360" w:lineRule="auto"/>`
  + `<w:jc w:val="both"/>`
  + `</w:pPr>`
  + `<w:r><w:rPr>${FONT}<w:b/><w:bCs/><w:color w:val="${RED}"/>`
  + `<w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr>`
  + `<w:t>${esc(titulo)}</w:t></w:r>`
  + `</w:p></w:tc></w:tr>`
  // Row 2: conteúdo
  + `<w:tr><w:tc><w:tcPr><w:tcW w:w="${COL_W}" w:type="dxa"/></w:tcPr>`
  + conteudoXml
  + `</w:tc></w:tr>`
  + `</w:tbl>`;
}

// ── Parser de seções ──────────────────────────────────────────────────────────
const SECOES = [
  'HABILIDADES', 'UNIDADES DO MATERIAL', 'OBJETIVOS',
  'EVIDÊNCIAS DE APRENDIZAGEM', 'EVIDENCIAS DE APRENDIZAGEM',
  'AÇÕES A DESENVOLVER', 'ACOES A DESENVOLVER', 'ATIVIDADES DE APRENDIZAGEM',
  'INSERÇÃO DE SIMULADOS', 'INSERCAO DE SIMULADOS',
  'ESTRATÉGIA DE AVANÇO POR NÍVEL', 'ESTRATEGIA DE AVANCO POR NIVEL',
  'ESTRATÉGIA DE AVANÇO', 'ESTRATEGIA DE AVANCO',
  'PLANEJAMENTO INTEGRADO', 'RECURSOS DIDÁTICOS', 'RECURSOS DIDATICOS',
  'PLANO DE AÇÃO AVALIA+', 'PLANO DE ACAO AVALIA+',
  'FLEXIBILIZAÇÃO DE ESTRATÉGIAS', 'FLEXIBILIZACAO DE ESTRATEGIAS',
  'PLANO DE AÇÃO', 'PLANO DE ACAO', 'OBSERVAÇÃO', 'OBSERVACAO',
];

function isHeader(linha) {
  const t = linha.trim().toUpperCase().replace(/:$/, '').trimEnd();
  return SECOES.some(s => t === s || t.startsWith(s + ' ') || t.startsWith(s + ':') || t.startsWith(s + '\t'));
}

function parseSections(texto) {
  const linhas = texto.split('\n');
  const secoes = []; let atual = null;
  for (const l of linhas) {
    if (isHeader(l)) {
      if (atual) secoes.push(atual);
      atual = { titulo: l.trim().replace(/:$/, '').trimEnd(), linhas: [] };
    } else if (atual) { atual.linhas.push(l); }
  }
  if (atual) secoes.push(atual);
  return secoes;
}

// ── Monta document.xml completo ───────────────────────────────────────────────
function buildDocXml(bodyXml) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<w:body>
${bodyXml}
<w:sectPr>
  <w:footerReference w:type="default" r:id="rId7"/>
  <w:headerReference w:type="first" r:id="rId8"/>
  <w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>
  <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>
  <w:cols w:space="708"/>
  <w:titlePg/>
  <w:docGrid w:linePitch="360"/>
</w:sectPr>
</w:body>
</w:document>`;
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const PizZip = (await import('pizzip')).default;
    const { conteudo, cfg, dadosProva } = req.body;
    const { disc, turma, etapa, serie, vigencia } = dadosProva;

    const serieLabel = turma
      ? serie.replace(/ano EF I$|ano EF II$| EF I| EF II| EM/, '').trim() + ' ' + turma
      : serie;

    const d = new Date();
    const mesAno = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    // Limpa markdown: preserva **negrito**, remove *itálico*, __underline__, # headers
    const limpo = conteudo
      .replace(/^#{1,4}\s+/gm, '')
      .replace(/(?<!\*)\*(?!\*)([^*\n]+?)(?<!\*)\*(?!\*)/g, '$1')
      .replace(/__([^_\n]+?)__/g, '$1');

    const secoes = parseSections(limpo);

    let body = '';

    // Título centralizado em vermelho sz=32 (igual ao modelo)
    body += `<w:p><w:pPr>`
      + `<w:spacing w:after="0" w:line="276" w:lineRule="auto"/>`
      + `<w:jc w:val="center"/>`
      + `</w:pPr>`
      + `<w:r><w:rPr>${FONT}<w:b/><w:bCs/><w:color w:val="${RED}"/>`
      + `<w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr>`
      + `<w:t>PLANO DE TRABALHO DOCENTE \u2013 ${esc((etapa || '1\u00AA ETAPA').toUpperCase())}</w:t></w:r>`
      + `</w:p>`;

    // Linha vazia após o título (igual ao modelo)
    body += `<w:p><w:pPr><w:spacing w:after="0" w:line="276" w:lineRule="auto"/></w:pPr></w:p>`;

    // Identificação (sz=24, espaçamento 276, bold label + normal valor)
    body += identPara('Professora: ', cfg.nomeProfessora || '');
    body += identPara('Componente Curricular: ', disc || '');
    body += identPara('Turma/Ano: ', serieLabel);
    body += identPara('Vigência: ', vigencia?.trim() || cfg.vigencia?.trim() || mesAno);

    // Espaço antes das seções
    body += `<w:p><w:pPr><w:spacing w:after="0" w:line="276" w:lineRule="auto"/></w:pPr></w:p>`;

    // Seções em caixas com borda (Tabelacomgrade)
    if (secoes.length > 0) {
      for (const sec of secoes) {
        body += secBox(sec.titulo + ':', renderSecXml(sec.linhas));
      }
    } else {
      body += secBox('CONTEÚDO:', renderSecXml(limpo.split('\n')));
    }

    const docXml = buildDocXml(body);

    // Carrega o modelo original como template (mantém styles, numbering, header, logo)
    const modelPath = path.join(process.cwd(), 'public', 'modelo_plano.docx');
    const modelBuf = fs.readFileSync(modelPath);
    const zip = new PizZip(modelBuf);

    // Substitui APENAS o document.xml — todo o resto (styles, numbering, header, logo) é preservado
    zip.file('word/document.xml', docXml);

    const output = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="plano_prontoProfe.docx"');
    res.send(output);
  } catch (e) {
    console.error('ERRO plano-docx:', e.message, e.stack);
    res.status(500).json({ error: e.message });
  }
}

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };
