import { useState, useEffect } from 'react';

/**
 * Banner discreto exibido quando há assets institucionais faltando.
 * Mostra sempre que o app pode entrar em modo conservador.
 *
 * Story: US-014a (FASE 0 Bedrock)
 * ADR: ADR-007 (modo conservador)
 *
 * Severities (de mais grave para menos):
 *   high   — vermelho   (descritores AVALIA — bloqueia avaliação fiel)
 *   medium — amarelo    (templates / cartão-resposta)
 *   low    — azul       (logo / brasão / modelo de relatório)
 *
 * Props:
 *   tipo  — opcional. Se passado, filtra só os assets que afetam esse tipo.
 *   onDismiss — opcional. Callback quando usuária fecha o banner.
 */
export default function AssetWarningBanner({ tipo = null, onDismiss = null }) {
  const [summary, setSummary] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/assets/status')
      .then(r => r.json())
      .then(setSummary)
      .catch(() => setSummary(null));
  }, []);

  if (dismissed || !summary || summary.missing === 0) return null;

  const items = tipo
    ? (summary.byType?.[tipo] || [])
    : summary.missingItems;

  if (items.length === 0) return null;

  const maxSeverity = items.reduce((acc, item) => {
    const order = { high: 3, medium: 2, low: 1 };
    return order[item.severity] > order[acc] ? item.severity : acc;
  }, 'low');

  const palette = {
    high:   { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B', icon: '🚨' },
    medium: { bg: '#FEF3C7', border: '#FCD34D', text: '#92400E', icon: '⚠️' },
    low:    { bg: '#EFF6FF', border: '#93C5FD', text: '#1E3A8A', icon: 'ℹ️' },
  };
  const c = palette[maxSeverity] || palette.low;

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  return (
    <div
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        padding: '12px 16px',
        borderRadius: 8,
        marginBottom: 16,
        fontSize: 13,
        lineHeight: 1.5,
      }}
      role="alert"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>{c.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            Modo conservador ativo
            {tipo ? ` para ${tipo}` : ''}
            {' '}
            ({items.length} {items.length === 1 ? 'item' : 'itens'} faltando)
          </div>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {items.map(item => (
              <li key={item.asset} style={{ marginBottom: 4 }}>
                <b>{item.name}</b>{' '}
                <span style={{ opacity: 0.85 }}>— {item.fallback}</span>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
            Importe os arquivos nas Configurações para o output completo no padrão SESI.
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={handleDismiss}
            style={{
              background: 'transparent',
              border: 'none',
              color: c.text,
              cursor: 'pointer',
              fontSize: 18,
              padding: 0,
              flexShrink: 0,
            }}
            aria-label="Fechar aviso"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
