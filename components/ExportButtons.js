// components/ExportButtons.js
// Botões de exportação do conteúdo gerado: PDF, Word e Excel.
// Aparece somente quando há resultado da IA. Desabilitado durante geração.

import { useState } from 'react';

const BUTTONS = [
  { key: 'pdf',   label: 'PDF',   icon: '📄', color: '#A32D2D', bg: '#FDEAEA' },
  { key: 'word',  label: 'Word',  icon: '📝', color: '#1A5276', bg: '#EBF5FB' },
  { key: 'excel', label: 'Excel', icon: '📊', color: '#1E8449', bg: '#EAFAF1' },
];

export default function ExportButtons({ result, title, loading, provider, model }) {
  const [exporting, setExporting] = useState(null); // 'pdf' | 'word' | 'excel' | null

  if (!result) return null;

  const meta = { provider, model };

  const handleExport = async (key) => {
    if (exporting || loading) return;
    setExporting(key);
    try {
      if (key === 'pdf') {
        const { exportToPDF } = await import('../lib/exporters/pdf');
        await exportToPDF(result, title, meta);
      } else if (key === 'word') {
        const { exportToWord } = await import('../lib/exporters/word');
        await exportToWord(result, title, meta);
      } else if (key === 'excel') {
        const { exportToExcel } = await import('../lib/exporters/excel');
        await exportToExcel(result, title, meta);
      }
    } catch (err) {
      console.error(`Erro ao exportar ${key}:`, err);
      alert(`Não foi possível exportar como ${key.toUpperCase()}. Tente novamente.`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div style={s.wrapper}>
      <span style={s.label}>Exportar como:</span>
      <div style={s.buttons}>
        {BUTTONS.map(({ key, label, icon, color, bg }) => {
          const isExporting = exporting === key;
          const disabled    = !!exporting || loading;
          return (
            <button
              key={key}
              style={{
                ...s.btn,
                color,
                borderColor: color,
                background: isExporting ? color : bg,
                opacity: disabled && !isExporting ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
              onClick={() => handleExport(key)}
              disabled={disabled}
              title={`Baixar como ${label}`}
            >
              {isExporting ? (
                <span style={{ ...s.btnContent, color: '#fff' }}>
                  <span style={s.spinnerDot} />
                  Gerando...
                </span>
              ) : (
                <span style={s.btnContent}>
                  <span>{icon}</span>
                  <span>{label}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  wrapper: {
    display:    'flex',
    alignItems: 'center',
    gap:        12,
    marginTop:  16,
    paddingTop: 12,
    borderTop:  '1px solid #E8E8E8',
    flexWrap:   'wrap',
  },
  label: {
    fontSize:   12,
    color:      '#888',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  buttons: {
    display: 'flex',
    gap:     8,
    flexWrap: 'wrap',
  },
  btn: {
    display:      'flex',
    alignItems:   'center',
    padding:      '6px 14px',
    borderRadius: 8,
    border:       '1.5px solid',
    fontSize:     13,
    fontWeight:   600,
    cursor:       'pointer',
    transition:   'all 0.15s',
    minWidth:     90,
    justifyContent: 'center',
  },
  btnContent: {
    display:    'flex',
    alignItems: 'center',
    gap:        6,
  },
  spinnerDot: {
    display:      'inline-block',
    width:        10,
    height:       10,
    borderRadius: '50%',
    border:       '2px solid rgba(255,255,255,0.4)',
    borderTopColor: '#fff',
    animation:    'spin 0.7s linear infinite',
  },
};
