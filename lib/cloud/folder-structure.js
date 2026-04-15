// lib/cloud/folder-structure.js
// Utilitários compartilhados de estrutura de pastas e nomes de arquivo.

const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

export const FOLDER_ROOT = 'Pronto Profe';

export function getMonthFolderName() {
  const now = new Date();
  return `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
}

export function getCloudFileName(ext) {
  const now = new Date();
  return `pronto-profe-${now.toISOString().split('T')[0]}.${ext}`;
}

export const MIME_TYPES = {
  pdf:   'application/pdf',
  word:  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export const FILE_EXT = { pdf: 'pdf', word: 'docx', excel: 'xlsx' };
