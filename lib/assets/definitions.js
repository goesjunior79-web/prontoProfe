/**
 * Definições puras (sem `fs`) dos assets institucionais.
 *
 * Separado de `registry.js` para ser importável no client (pages/config.js).
 * O registry.js (server-only) reexporta esse mapa.
 *
 * Story: US-013 (FASE 4 Polimento)
 */

export const ASSET_DEFINITIONS = {
  catalogo_descritores_avalia: {
    name: 'Catálogo Descritores AVALIA',
    files: [
      '01-descritores-avalia-oficial.json',
      '01-descritores-avalia-oficial.csv',
      '01-descritores-avalia-oficial.xlsx',
      '01-descritores-avalia-oficial.pdf',
    ],
    affects: ['avaliacao_capitulo', 'simulado'],
    fallback: 'omitir descritores nas questões + aviso na UI',
    severity: 'high',
  },
  template_word_prova: {
    name: 'Template Word de Prova (CE-228)',
    files: ['02-template-word-sesi-prova.docx'],
    affects: ['avaliacao_capitulo', 'simulado'],
    fallback: 'usar layout HTML do docBuilder.js (~80% fiel)',
    severity: 'medium',
  },
  template_word_ptd: {
    name: 'Template Word de PTD',
    files: ['02b-template-word-sesi-plano.docx'],
    affects: ['PTD'],
    fallback: 'usar layout HTML do planoBuilder.js refatorado',
    severity: 'medium',
  },
  logo_sesi: {
    name: 'Logo SESI institucional',
    files: ['03-logo-sesi.jpeg', '03-logo-sesi-simplificada.jpg'],
    affects: ['todos os documentos com cabeçalho'],
    fallback: 'placeholder cinza com texto "[LOGO SESI]"',
    severity: 'low',
  },
  brasao_escola: {
    name: 'Brasão da escola/unidade',
    files: ['04-brasao-escola.png', '04-brasao-escola.jpg', '04-brasao-escola.svg'],
    affects: ['cabeçalhos institucionais'],
    fallback: 'usar logo SESI completa como brasão alternativo',
    severity: 'low',
  },
  cartao_resposta: {
    name: 'Modelo de cartão-resposta oficial',
    files: ['05-cartao-resposta-modelo.docx', '05-cartao-resposta-modelo.pdf'],
    affects: ['simulado'],
    fallback: 'cartão-resposta genérico (linha por questão A/B/C/D)',
    severity: 'medium',
  },
  modelo_relatorio: {
    name: 'Modelo de relatório final aceito pela escola',
    files: ['06-relatorio-final-modelo.docx'],
    affects: ['relatorio'],
    fallback: 'template inferido das 4 seções da spec + assinatura',
    severity: 'low',
  },
};
