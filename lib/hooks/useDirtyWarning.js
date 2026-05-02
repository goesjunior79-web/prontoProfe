/**
 * Hook que avisa o usuário antes de fechar a aba quando há trabalho
 * não salvo (ex: resultado gerado, ainda não baixado).
 *
 * Audit 2026-05-02 (UX 4): refresh perde resultado em todas as 7 telas
 * novas. Sheila gera PTD, fecha aba sem querer, perde tudo.
 *
 * Uso:
 *   useDirtyWarning(!!result);
 *
 * Quando `dirty` muda para true, anexa listener; remove quando volta a false.
 */

import { useEffect } from 'react';

export function useDirtyWarning(dirty) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e) => {
      e.preventDefault();
      // Browsers ignoram o texto custom — só importa que e.returnValue seja string truthy.
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
}
