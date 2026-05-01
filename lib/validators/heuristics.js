/**
 * Heurísticas de validação para outputs específicos.
 *
 * Funções puras que verificam características esperadas (verbos no infinitivo,
 * terceira pessoa, pergunta interativa, etc).
 *
 * Heurísticas têm falsos positivos/negativos — usam regex em PT-BR e podem
 * errar em casos limite. Combinam-se com PROMPT 6 (validador LLM) que captura
 * casos sutis.
 *
 * Story: US-002 (FASE 0 Bedrock)
 */

/**
 * Verbos irregulares no infinitivo que não terminam em -ar/-er/-ir.
 */
const VERBOS_IRREGULARES = [
  'ser', 'estar', 'ir', 'vir', 'ter', 'pôr', 'por', 'ler', 'rir',
  'crer', 'ver', 'dar', 'caber', 'haver', 'saber', 'querer', 'poder',
  'fazer', 'dizer', 'trazer',
];

/**
 * Heurística: a primeira palavra de uma linha é verbo no infinitivo?
 *
 * Útil para validar OBJETIVOS DE APRENDIZAGEM (PTD, atividade) e
 * CRITÉRIOS (relatório).
 *
 * Estratégia: ignora marcadores (-, *, •, números), pega primeira palavra,
 * checa se termina em -ar/-er/-ir/-or ou está na lista de irregulares.
 */
export function startsWithInfinitiveVerb(line) {
  const cleaned = line.trim().replace(/^[\-•\*\d.]+\s*/, '');
  const firstWord = cleaned.split(/\s+/)[0];
  if (!firstWord) return false;

  const lower = firstWord.toLowerCase();
  if (VERBOS_IRREGULARES.includes(lower)) return true;

  // Termina em -ar, -er, -ir, -or (raros)
  return /^[a-záéíóúâêîôûãõç]+(?:ar|er|ir|or)$/i.test(lower);
}

/**
 * Heurística: o texto está em terceira pessoa?
 *
 * Detecta marcadores de PRIMEIRA pessoa que são incompatíveis com o
 * Relatório em terceira pessoa.
 */
export function isThirdPerson(text) {
  // Verbos comuns em primeira pessoa do singular
  const firstPersonHints = /\b(observei|verifiquei|notei|percebi|considerei|avaliei|registrei|presenciei|identifiquei|constatei|achei|gostei|fiz|disse|falei|trabalhei|apliquei)\b/i;
  return !firstPersonHints.test(text);
}

/**
 * Verifica se o texto contém a pergunta interativa final obrigatória da
 * Observação ("Deseja sugestão de atividade para trabalhar com o aluno?").
 */
export function hasInteractiveFinalQuestion(text) {
  return /Deseja sugest[ãa]o de atividade para trabalhar com o aluno\??/i.test(text);
}

/**
 * Verifica se contém a assinatura esperada (geralmente nos últimos 200 chars).
 */
export function hasSignature(text, expected = 'Professora Sheila Goes') {
  // Procura nos últimos 500 chars (rodapé esperado)
  const tail = text.slice(-500);
  return tail.includes(expected);
}

/**
 * Conta palavras (separadas por whitespace).
 */
export function countWords(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Heurística de limite de páginas.
 *
 * Aproximação: 1 página A4 com fonte 12pt comporta ~400-500 palavras de texto
 * corrido. Usa 500 como teto generoso.
 */
export function withinPageLimit(text, maxPages = 1, wordsPerPage = 500) {
  return countWords(text) <= maxPages * wordsPerPage;
}

/**
 * Verifica se o texto contém pelo menos uma das opções (case insensitive).
 */
export function containsAny(text, options) {
  const lower = text.toLowerCase();
  return options.some(opt => lower.includes(opt.toLowerCase()));
}

/**
 * Heurística para detectar "tom positivo" ao final do texto.
 *
 * Procura nos últimos 300 chars por palavras-chave de avanço/positividade.
 */
export function endsPositively(text) {
  const positiveTerms = [
    'avanço', 'avanços', 'avançar', 'avançou',
    'evolução', 'evoluiu', 'evoluindo',
    'progresso', 'progrediu',
    'capacidade', 'potencial',
    'crescimento', 'desenvolveu', 'desenvolvendo',
    'continua', 'segue', 'caminho',
    'parabéns', 'conquistas',
  ];
  const tail = text.slice(-300).toLowerCase();
  return positiveTerms.some(t => tail.includes(t));
}

/**
 * Detecta uma seção pela presença de palavra-chave em um trecho do texto.
 * Útil pra checar "tem seção CARTÃO-RESPOSTA?" sem parser estruturado.
 */
export function hasSection(text, sectionName) {
  const upper = text.toUpperCase();
  const target = sectionName.toUpperCase();
  return upper.includes(target);
}
