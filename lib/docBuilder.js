import { safe, formatConteudo, textoSemGabarito } from './utils';

export function buildDocHTML(titulo, conteudo, cfg, dadosProva) {
  const d = new Date();
  const { disc, turma, etapa, serie, criterios, valorInstrumento } = dadosProva;

  const ensino = serie.includes('EF I') && !serie.includes('EF II')
    ? 'Fundamental I'
    : serie.includes('EF II') || serie.includes('ano EF')
    ? 'Fundamental II'
    : serie.includes('EM') ? 'Médio' : '';

  const docCode = cfg.docCode || 'CE-228';
  const tipoDoc  = cfg.tipoDoc  || 'Prova Objetiva';

  const criteriosHTML = criterios
    ? criterios.split('\n').filter(c => c.trim())
        .map(c => `<li>${safe(c.replace(/^[-•*]\s*/, ''))}</li>`).join('')
    : '<li>&nbsp;</li><li>&nbsp;</li><li>&nbsp;</li>';

  const serieLabel = turma
    ? serie.replace(/ano EF I$|ano EF II$| EF I| EF II| EM/, '').trim() + ' ' + turma
    : serie;

  const ck = (v) => v ? '&#10003;' : '&nbsp;';

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>${safe(titulo)}</title>
<style>
@page { size: A4 portrait; margin: 1.5cm 1.8cm 1.5cm 1cm }
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box }
html, body {
  font-family: Arial, sans-serif;
  font-size: 10.5pt;
  color: #000;
  background: #fff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Sidebar fixa ──────────────────────────────────────────────────── */
.faixa {
  position: fixed;
  left: 0; top: 0; height: 100%;
  width: 20px;
  border-right: 1px solid #bbb;
  background: #fff;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
}
.faixa span {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  white-space: nowrap;
  font-size: 8pt;
  letter-spacing: 1.5px;
}
.faixa .fc { font-weight: bold; color: #cc0000; font-size: 8.5pt; letter-spacing: 2px; }
.faixa .ft { color: #444; }

/* ── Corpo ─────────────────────────────────────────────────────────── */
.corpo { margin-left: 24px; padding: 0 6px 12px 4px; }

/* ── Cabeçalho ─────────────────────────────────────────────────────── */
.hdr { width: 100%; border-collapse: collapse; margin-bottom: 5px; table-layout: fixed; }
.hdr td { border: 1px solid #000; padding: 4px 7px; vertical-align: middle; font-size: 10pt; }
.hdr .c-logo { width: 130px; text-align: center; padding: 4px 6px; }
.hdr .c-logo img { max-width: 118px; max-height: 52px; display: block; margin: 0 auto; }
.hdr .c-logo .cidade { font-size: 7pt; font-weight: bold; margin-top: 3px; }

/* campos sublinhados */
.ul    { display: inline-block; border-bottom: 1px solid #000; height: 13px; vertical-align: bottom; }
.ul-lg { min-width: 155px; }
.ul-sm { min-width: 28px; }
/* checkbox */
.cb { display: inline-block; width: 10px; height: 10px; border: 1px solid #000;
      vertical-align: middle; margin: 0 2px 0 5px; font-size: 7pt;
      text-align: center; line-height: 10px; }
.etapa-label { float: right; font-weight: bold; }

/* ── Box de critérios / nota ───────────────────────────────────────── */
.avaliado { display: flex; border: 1px solid #aaa; margin: 5px 0; }
.crit-box { flex: 1; padding: 5px 8px; font-size: 8.5pt; line-height: 1.45; }
.crit-box b { display: block; margin-bottom: 3px; }
.crit-box ul { padding-left: 14px; }
.crit-box li { margin-bottom: 2px; }
.nota-box {
  width: 108px; flex-shrink: 0;
  border-left: 1px solid #aaa;
  padding: 5px 8px;
  background: #e8e8e8;
  display: flex; flex-direction: column; justify-content: space-between;
  font-size: 8.5pt;
}
.nota-box .vl { font-size: 14pt; font-weight: bold; text-align: center; margin-top: 4px; }
.nota-box .nf { padding-top: 4px; margin-top: 8px; }
.nota-box .nl { display: inline-block; border-bottom: 1px solid #000; width: 54px; height: 12px; }

/* ── Conteúdo ──────────────────────────────────────────────────────── */
.orient  { font-size: 10pt; margin: 5px 0 2px; }
.divisor { border-bottom: 1.5px solid #000; margin: 2px 0 8px; }

/* Questão — nunca corta entre páginas */
.questao { break-inside: avoid; page-break-inside: avoid; margin-bottom: 2px; }
.qbar { background: #595959; color: #fff; font-weight: bold; font-size: 10pt;
        padding: 3px 8px; margin: 10px 0 4px; }
.opcao  { font-size: 10pt; padding: 1px 0 1px 16px; line-height: 1.65; }
.ptexto { font-size: 10pt; line-height: 1.75; margin: 2px 0; }
.espaco { height: 5px; }

/* ── Observações ───────────────────────────────────────────────────── */
.obs { margin-top: 14px; break-inside: avoid; page-break-inside: avoid; }
.obs b { font-size: 10pt; display: block; margin-bottom: 4px; }
.obs-line { border-bottom: 1px solid #000; height: 19px; margin-bottom: 3px; }
.pgnum { text-align: right; font-size: 7.5pt; color: #cc0000; margin-top: 8px; }
</style>
</head>
<body>

<div class="faixa">
  <span class="fc">${safe(docCode)}</span>
  <span class="ft">${safe(tipoDoc)}</span>
</div>

<div class="corpo">

  <table class="hdr">
    <colgroup>
      <col style="width:130px">
      <col>
    </colgroup>
    <tr>
      <td class="c-logo" rowspan="3">
        <img src="/logo_sesi.jpg" alt="SESI">
        <div class="cidade">${safe(cfg.cidade || 'BOTUCATU')}</div>
      </td>
      <td style="padding:0">
        <div style="display:table;width:100%;padding:4px 7px;box-sizing:border-box">
          <div style="display:table-cell;vertical-align:middle">
            <b>Nome:</b>&nbsp;<span class="ul ul-lg"></span>
            &nbsp;&nbsp;<b>N&ordm;</b>&nbsp;<span class="ul ul-sm"></span>
          </div>
          <div style="display:table-cell;vertical-align:middle;text-align:right;white-space:nowrap;font-weight:bold">
            ${safe(serieLabel)}
          </div>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:0">
        <div style="display:table;width:100%;padding:4px 7px;box-sizing:border-box">
          <div style="display:table-cell;vertical-align:middle">
            <b>Ensino:</b>
            <span class="cb">${ck(ensino === 'Fundamental I')}</span>&nbsp;Fundamental I
            <span class="cb">${ck(ensino === 'Fundamental II')}</span>&nbsp;Fundamental II
            <span class="cb">${ck(ensino === 'Médio')}</span>&nbsp;M&eacute;dio
          </div>
          <div style="display:table-cell;vertical-align:middle;text-align:right;white-space:nowrap;font-weight:bold">
            ${safe(etapa || '1ª Etapa')}
          </div>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:0">
        <div style="display:table;width:100%;padding:4px 7px;box-sizing:border-box">
          <div style="display:table-cell;vertical-align:middle;white-space:nowrap">
            <b>Data:</b>&nbsp;____/____/${d.getFullYear()}
          </div>
          <div style="display:table-cell;vertical-align:middle;white-space:nowrap;padding:0 6px">
            <b><u>CC:</u></b>&nbsp;${safe(disc || '')}
          </div>
          <div style="display:table-cell;vertical-align:middle;text-align:right;white-space:nowrap">
            <b>Professora:</b>&nbsp;${safe(cfg.nomeProfessora || '')}
          </div>
        </div>
      </td>
    </tr>
  </table>

  <div class="avaliado">
    <div class="crit-box">
      <b>O que ser&aacute; avaliado? (Crit&eacute;rios de Avalia&ccedil;&atilde;o)</b>
      <ul>${criteriosHTML}</ul>
    </div>
    <div class="nota-box">
      <div>
        <div>Valor do instrumento:</div>
        <div class="vl">${safe(valorInstrumento || '10,0')}</div>
      </div>
      <div class="nf">
        <div>Nota Final:</div>
      </div>
    </div>
  </div>

  <div class="orient"><b>ORIENTA&Ccedil;&Otilde;ES:</b>&nbsp; REALIZAR COM AUTONOMIA.</div>
  <div class="divisor"></div>

  ${formatConteudo(textoSemGabarito(conteudo))}

  <div class="obs">
    <b>OBSERVA&Ccedil;&Otilde;ES DA PROFESSORA:</b>
    <div class="obs-line"></div>
    <div class="obs-line"></div>
    <div class="obs-line"></div>
    <div class="obs-line"></div>
  </div>
  <div class="pgnum">Page 1</div>

</div>
</body></html>`;
}
