import { useState } from 'react';
import { PROVIDER_LABELS } from '../lib/constants';

const TIPO_ICONS = { prova: '📋', plano: '📚', atividade: '✏️' };

export default function HistoryPanel({ items, onReload }) {
  const [open, setOpen] = useState(false);
  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginBottom: 12 }}>
      <button
        style={{
          width: '100%', background: open ? '#F7F6F3' : 'transparent',
          border: '0.5px solid #E0DDD5', borderRadius: open ? '8px 8px 0 0' : 8,
          padding: '9px 14px', fontSize: 12, color: '#5F5E5A', cursor: 'pointer',
          textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
        onClick={() => setOpen(o => !o)}
      >
        <span>📖 Histórico recente <span style={{ color: '#888' }}>({items.length})</span></span>
        <span style={{ fontSize: 10 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ border: '0.5px solid #E0DDD5', borderTop: 'none', borderRadius: '0 0 8px 8px', background: '#fff', overflow: 'hidden' }}>
          {items.slice(0, 10).map((item, i) => (
            <div
              key={item.id || i}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderTop: i > 0 ? '0.5px solid #F0EDE6' : 'none' }}
            >
              <span style={{ fontSize: 15, flexShrink: 0 }}>{TIPO_ICONS[item.tipo] || '📄'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#1a1a18', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.titulo || item.disciplina || 'Sem título'}
                </div>
                <div style={{ fontSize: 10, color: '#aaa', marginTop: 1 }}>
                  {item.data}
                  {item.provider ? ` · ${PROVIDER_LABELS[item.provider]?.name || item.provider}` : ''}
                  {item.serie ? ` · ${item.serie}` : ''}
                </div>
              </div>
              {item.conteudo && onReload && (
                <button
                  style={{ fontSize: 11, padding: '3px 10px', border: '0.5px solid #D3D1C7', borderRadius: 5, background: 'transparent', color: '#5F5E5A', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
                  onClick={() => { onReload(item); setOpen(false); }}
                >
                  Abrir
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
