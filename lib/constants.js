export const PLAN_LIMITS = { free: 10, pro: 150, school: Infinity };

export const PROVIDER_ACCESS = {
  claude:  ['free', 'pro', 'school'],
  openai:  ['pro', 'school'],
  gemini:  ['pro', 'school'],
  copilot: ['school'],
};

export const PROVIDER_LABELS = {
  claude:  { name: 'Claude',  color: '#0C447C', bg: '#E6F1FB' },
  openai:  { name: 'ChatGPT', color: '#3B6D11', bg: '#EAF3DE' },
  gemini:  { name: 'Gemini',  color: '#633806', bg: '#FAEEDA' },
  copilot: { name: 'Copilot', color: '#3C3489', bg: '#EEEDFE' },
};

export const PLAN_LABELS = {
  free:   { name: 'Gratuito', color: '#5F5E5A' },
  pro:    { name: 'Pro',      color: '#0C447C' },
  school: { name: 'Escola',   color: '#3C3489' },
};

export const DISCIPLINAS = [
  'Matemática', 'Língua Portuguesa', 'Ciências', 'História', 'Geografia',
  'Inglês', 'Educação Física', 'Artes', 'Física', 'Química', 'Biologia', 'Filosofia',
];

export const SERIES = [
  '1º ano EF I', '2º ano EF I', '3º ano EF I', '4º ano EF I', '5º ano EF I',
  '6º ano EF II', '7º ano EF II', '8º ano EF II', '9º ano EF II',
  '1º ano EM', '2º ano EM', '3º ano EM',
];

export const FILE_ICONS = {
  pdf:  { label: 'PDF', bg: '#FCEBEB', color: '#A32D2D' },
  word: { label: 'DOC', bg: '#E6F1FB', color: '#0C447C' },
  img:  { label: 'IMG', bg: '#EAF3DE', color: '#3B6D11' },
  txt:  { label: 'TXT', bg: '#F1EFE8', color: '#5F5E5A' },
};

export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const LOADING_MSGS = [
  'Gerando seu material com IA...',
  'Estruturando o conteúdo pedagógico...',
  'Aplicando padrões SESI e BNCC...',
  'Verificando competências e objetivos...',
  'Finalizando o documento...',
];
