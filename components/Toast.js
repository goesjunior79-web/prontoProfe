import { useEffect } from 'react';

export default function Toast({ msg, type = 'success', onClose }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [msg]);

  if (!msg) return null;

  const styles = {
    success: { bg: '#EAF3DE', color: '#27500A', border: '#9FCE6A', icon: '✓' },
    error:   { bg: '#FCEBEB', color: '#A32D2D', border: '#E8AAAA', icon: '⚠' },
    info:    { bg: '#E6F1FB', color: '#0C447C', border: '#90B8E0', icon: 'ℹ' },
  };
  const s = styles[type] || styles.success;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10,
      padding: '12px 16px', fontSize: 13, color: s.color, fontWeight: 500,
      display: 'flex', alignItems: 'center', gap: 10, maxWidth: 320,
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      animation: 'slideIn 0.25s ease',
    }}>
      <span style={{ fontSize: 15 }}>{s.icon}</span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{msg}</span>
      <button
        style={{ background: 'none', border: 'none', color: s.color, cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0, opacity: 0.7 }}
        onClick={onClose}
      >✕</button>
    </div>
  );
}
