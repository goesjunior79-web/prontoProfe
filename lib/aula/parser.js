/**
 * Parser do horário semanal informado pela professora.
 *
 * Story: US-006 (FASE 2 — Aula Diária / Semanário)
 *
 * Formato esperado: "seg 2, ter 2, qua 2, sex 1" (ordem livre, vírgula ou
 * ponto-e-vírgula como separador, espaços flexíveis).
 *
 * Aceita:
 *   - "seg", "segunda", "segunda-feira" (case-insensitive, com/sem acentos)
 *   - quantidade após o dia (1-5)
 *   - separadores: "," ";" "/"
 */

const DIAS_MAP = {
  // Segunda
  'seg': 'segunda',
  'segunda': 'segunda',
  'segunda-feira': 'segunda',
  // Terça
  'ter': 'terca',
  'terca': 'terca',
  'terça': 'terca',
  'terca-feira': 'terca',
  'terça-feira': 'terca',
  // Quarta
  'qua': 'quarta',
  'quarta': 'quarta',
  'quarta-feira': 'quarta',
  // Quinta
  'qui': 'quinta',
  'quinta': 'quinta',
  'quinta-feira': 'quinta',
  // Sexta
  'sex': 'sexta',
  'sexta': 'sexta',
  'sexta-feira': 'sexta',
  // Sábado (raro mas possível)
  'sab': 'sabado',
  'sabado': 'sabado',
  'sábado': 'sabado',
};

const ORDEM = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

const NOMES_LONGOS = {
  segunda: 'Segunda-feira',
  terca: 'Terça-feira',
  quarta: 'Quarta-feira',
  quinta: 'Quinta-feira',
  sexta: 'Sexta-feira',
  sabado: 'Sábado',
};

/**
 * Parseia string de horário semanal.
 *
 * @param {string} input — ex: "seg 2, ter 2, qua 2, sex 1"
 * @returns {Array<{dia, nome, aulas}>} ordenado por dia da semana
 *
 * Lança erro se input inválido (zero entradas reconhecidas).
 */
export function parseHorarioSemanal(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('Horário semanal vazio');
  }

  // Separadores aceitos: "," ";" "/"
  const partes = input
    .split(/[,;/]/)
    .map(p => p.trim())
    .filter(Boolean);

  if (partes.length === 0) {
    throw new Error('Nenhum dia reconhecido no horário');
  }

  const result = {};
  for (const parte of partes) {
    // Tenta padrão: "[dia] [número]" (ex: "seg 2")
    // ou "[dia][:][número]" (ex: "seg:2")
    const match = parte.match(/^([a-záéíóúãõâêîôûç-]+)\s*[:\s]*\s*(\d+)$/i);
    if (!match) continue;

    const diaRaw = match[1].toLowerCase();
    const aulas = parseInt(match[2], 10);

    const diaCanon = DIAS_MAP[diaRaw];
    if (!diaCanon) continue;
    if (aulas < 1 || aulas > 10) continue; // sanity check

    result[diaCanon] = (result[diaCanon] || 0) + aulas;
  }

  if (Object.keys(result).length === 0) {
    throw new Error('Nenhum dia reconhecido no horário. Use formato: "seg 2, ter 2, qua 1"');
  }

  // Ordena por dia da semana
  return ORDEM
    .filter(d => result[d])
    .map(d => ({
      dia: d,
      nome: NOMES_LONGOS[d],
      aulas: result[d],
    }));
}

/**
 * Conta total de aulas na semana (soma de todos os dias).
 */
export function totalAulas(horarioParseado) {
  return (horarioParseado || []).reduce((acc, d) => acc + d.aulas, 0);
}

/**
 * Formata de volta em string canônica (ex: "seg 2, ter 2, qua 2, sex 1").
 */
export function formatHorarioSemanal(horarioParseado) {
  if (!horarioParseado?.length) return '';
  const map = {
    segunda: 'seg',
    terca: 'ter',
    quarta: 'qua',
    quinta: 'qui',
    sexta: 'sex',
    sabado: 'sab',
  };
  return horarioParseado.map(d => `${map[d.dia]} ${d.aulas}`).join(', ');
}
