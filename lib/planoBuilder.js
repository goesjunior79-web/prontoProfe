import { safe } from './utils';

const RED = '#c00000';

const SECOES = [
  'HABILIDADES',
  'UNIDADES DO MATERIAL',
  'OBJETIVOS',
  'EVIDÊNCIAS DE APRENDIZAGEM', 'EVIDENCIAS DE APRENDIZAGEM',
  'AÇÕES A DESENVOLVER', 'ACOES A DESENVOLVER', 'ATIVIDADES DE APRENDIZAGEM',
  'INSERÇÃO DE SIMULADOS', 'INSERCAO DE SIMULADOS',
  'ESTRATÉGIA DE AVANÇO POR NÍVEL', 'ESTRATEGIA DE AVANCO POR NIVEL',
  'ESTRATÉGIA DE AVANÇO', 'ESTRATEGIA DE AVANCO',
  'PLANEJAMENTO INTEGRADO',
  'RECURSOS DIDÁTICOS', 'RECURSOS DIDATICOS',
  'PLANO DE AÇÃO AVALIA+', 'PLANO DE ACAO AVALIA+',
  'FLEXIBILIZAÇÃO DE ESTRATÉGIAS', 'FLEXIBILIZACAO DE ESTRATEGIAS',
  'PLANO DE AÇÃO', 'PLANO DE ACAO',
  'OBSERVAÇÃO', 'OBSERVACAO',
];

function isSecaoHeader(linha) {
  const t = linha.trim().toUpperCase().replace(/:$/, '').trimEnd();
  return SECOES.some(s => t === s || t.startsWith(s + ' ') || t.startsWith(s + ':') || t.startsWith(s + '\t'));
}

function parseSections(texto) {
  const linhas = texto.split('\n');
  const secoes = [];
  let atual = null;
  for (const linha of linhas) {
    if (isSecaoHeader(linha)) {
      if (atual) secoes.push(atual);
      atual = { titulo: linha.trim().replace(/:$/, '').trimEnd(), linhas: [] };
    } else if (atual) {
      atual.linhas.push(linha);
    }
  }
  if (atual) secoes.push(atual);
  return secoes;
}

function renderLinhas(linhas) {
  let html = '';
  let emLista = false;
  let bufNormal = [];

  const fecharLista = () => {
    if (emLista) { html += '</ul>'; emLista = false; }
  };

  const flushNormal = () => {
    if (!bufNormal.length) return;
    html += `<p style="margin:3px 0;line-height:1.5;font-size:12pt;text-align:justify">${safe(bufNormal.join(' '))}</p>`;
    bufNormal = [];
  };

  for (const linha of linhas) {
    const t = linha.trim();
    if (!t) {
      fecharLista();
      flushNormal();
      html += '<div style="height:4px"></div>';
      continue;
    }

    // Barra de data do Avalia+ (02/03/2026 – SEGUNDA-FEIRA)
    if (/^\d{2}\/\d{2}\/\d{4}\s*[–\-]/.test(t)) {
      fecharLista();
      flushNormal();
      html += `<div style="background:#AAAAAA;padding:2px 8px;margin:10px 0 4px;border-radius:1px">
        <span style="color:${RED};font-weight:700;font-size:12pt">${safe(t)}</span>
      </div>`;
      continue;
    }

    // Bullet
    if (/^[•\-\*]\s/.test(t)) {
      flushNormal();
      if (!emLista) { html += '<ul style="padding-left:20px;margin:3px 0">'; emLista = true; }
      html += `<li style="margin:2px 0;line-height:1.5;font-size:12pt">${safe(t.replace(/^[•\-\*]\s*/, ''))}</li>`;
      continue;
    }
    fecharLista();

    // Vermelho+negrito: Estação NX ou N1→N2 ou Matriz de Referência
    if (/^(Estação\s+N[1-4]|N[1-4]\s*[→\-]\s*N[1-4]|Matriz\s+de\s+Referência)/i.test(t)) {
      flushNormal();
      html += `<div style="font-weight:700;color:${RED};margin:8px 0 2px;font-size:12pt">${safe(t)}</div>`;
      continue;
    }

    // Markdown **texto** em negrito
    const mBold = t.match(/^\*\*(.+?)\*\*(.*)$/);
    if (mBold) {
      flushNormal();
      const resto = mBold[2].trim();
      html += `<div style="font-weight:700;margin:5px 0 2px;font-size:12pt">${safe(mBold[1])}${resto ? `<span style="font-weight:400"> ${safe(resto)}</span>` : ''}</div>`;
      continue;
    }

    // Negrito preto: sub-títulos reconhecidos
    if (/^(Instrumento\s+\d|Estratégia\b|Estrategias?:|Organização\b|Objetivo:|Objetivos:|Critérios\b|Disciplinas\s+envolvidas|Tema:|Ações\s+a\s+serem|Nome\(s\)|Observação:|Estratégias:|Estratégias\s+e\/ou|Parceria\b|Avaliação:)/i.test(t)) {
      flushNormal();
      html += `<div style="font-weight:700;margin:5px 0 2px;font-size:12pt">${safe(t)}</div>`;
      continue;
    }

    // Itens numerados
    if (/^\d+\.\s+\S/.test(t)) {
      flushNormal();
      html += `<div style="font-weight:700;padding-left:8px;margin:8px 0 2px;font-size:12pt">${safe(t)}</div>`;
      continue;
    }

    // Linha normal — acumula para justificar em bloco
    bufNormal.push(t);
  }

  flushNormal();
  fecharLista();
  return html;
}

export function buildPlanoHTML(titulo, conteudo, cfg, dadosProva) {
  const { disc, turma, etapa, serie, vigencia } = dadosProva;
  const d = new Date();
  const mesAno = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const serieLabel = turma
    ? serie.replace(/ano EF I$|ano EF II$| EF I| EF II| EM/, '').trim() + ' ' + turma
    : serie;

  // Preserva **negrito**, remove *italic* e __underline__ e # headers
  const limpo = conteudo
    .replace(/^#{1,4}\s+/gm, '')
    .replace(/(?<!\*)\*(?!\*)([^*\n]+?)(?<!\*)\*(?!\*)/g, '$1')
    .replace(/__([^_\n]+?)__/g, '$1');

  const secoes = parseSections(limpo);

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>${safe(titulo)}</title>
<style>
@page {
  size: A4 landscape;
  margin: 1.5cm 1.7cm 2cm 2.5cm;
}
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box }
html, body {
  font-family: Arial, sans-serif;
  font-size: 12pt;
  color: #000;
  background: #fff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* Cabeçalho: logo esquerda + logo SESI direita */
.ptd-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}
.ptd-logo-box {
  display: inline-block;
  border: 2px solid ${RED};
  padding: 2px 6px;
  font-weight: 900;
  font-size: 13pt;
  color: ${RED};
  letter-spacing: 2px;
}

/* Título principal */
.ptd-title {
  text-align: center;
  color: ${RED};
  font-size: 16pt;
  font-weight: bold;
  margin-bottom: 10px;
  letter-spacing: 0.3px;
}

/* Bloco de identificação */
.ptd-ident {
  font-size: 12pt;
  margin-bottom: 12px;
  line-height: 1.7;
}
.ptd-ident b { font-weight: bold }

/* Seção: borda completa, título vermelho em barra */
.ptd-sec {
  border: 1px solid #555;
  margin-bottom: 8px;
  break-inside: avoid;
  page-break-inside: avoid;
}
.ptd-sec-title {
  color: ${RED};
  font-weight: bold;
  font-size: 14pt;
  padding: 4px 10px;
  border-bottom: 1px solid #555;
  line-height: 1.4;
}
.ptd-sec-body {
  padding: 6px 12px 10px;
  font-size: 12pt;
  line-height: 1.5;
}
.ptd-sec-body ul { padding-left: 20px; margin: 3px 0 }
.ptd-sec-body li { margin: 2px 0; line-height: 1.5 }
.ptd-sec-body p  { text-align: justify }
</style>
</head>
<body>

<div class="ptd-header">
  <div>
    <svg width="48" height="48" viewBox="0 0 52 52">
      <polygon points="0,0 26,0 0,26" fill="${RED}"/>
      <polygon points="26,0 52,0 52,26" fill="#888"/>
      <polygon points="0,26 26,52 0,52" fill="#888"/>
    </svg>
  </div>
  <div>
    <img src="/logo_sesi.jpg" alt="SESI" style="max-height:44px;max-width:100px"
      onerror="this.style.display='none';document.getElementById('sesi-txt').style.display='inline-block'">
    <div id="sesi-txt" class="ptd-logo-box" style="display:none">≡SESI≡</div>
  </div>
</div>

<div class="ptd-title">PLANO DE TRABALHO DOCENTE – ${safe(etapa ? etapa.toUpperCase() : '1ª ETAPA')}</div>

<div class="ptd-ident">
  <div><b>Professora:</b> ${safe(cfg.nomeProfessora || '')}</div>
  <div><b>Componente Curricular:</b> ${safe(disc || '')}</div>
  <div><b>Turma/Ano:</b> ${safe(serieLabel)}</div>
  <div><b>Vigência:</b> ${safe(vigencia?.trim() || cfg.vigencia?.trim() || mesAno)}</div>
</div>

${secoes.length > 0
  ? secoes.map(sec => `
<div class="ptd-sec">
  <div class="ptd-sec-title">${safe(sec.titulo)}:</div>
  <div class="ptd-sec-body">${renderLinhas(sec.linhas)}</div>
</div>`).join('')
  : `<div class="ptd-sec"><div class="ptd-sec-body">${renderLinhas(limpo.split('\n'))}</div></div>`
}

</body></html>`;
}
