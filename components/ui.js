export const inp = {
  width: '100%', padding: '8px 10px',
  border: '0.5px solid #D3D1C7', borderRadius: 8,
  fontSize: 14, fontFamily: 'inherit',
};

export const btnPri = {
  padding: '6px 14px', background: '#003DA5', color: '#fff',
  border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
};

export const btnSec = {
  padding: '5px 11px', fontSize: 12, borderRadius: 6,
  border: '0.5px solid #D3D1C7', background: '#fff', color: '#5F5E5A', cursor: 'pointer',
};

export const secLabel = {
  fontSize: 11, fontWeight: 600, color: '#888',
  textTransform: 'uppercase', letterSpacing: '0.05em',
  marginBottom: 8, display: 'block',
};

export const lbl = {
  fontSize: 11, fontWeight: 500, color: '#888', display: 'block',
  marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em',
};

export function F({ label, children, style }) {
  return <div style={style}><label style={lbl}>{label}</label>{children}</div>;
}

export function S({ value, onChange, opts }) {
  return (
    <select style={inp} value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Selecione</option>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function T({ value, onChange, ph }) {
  return (
    <textarea
      style={{ ...inp, minHeight: 85, resize: 'vertical', lineHeight: 1.55 }}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={ph}
    />
  );
}

export function Chips({ opts, sel, toggle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {opts.map(o => (
        <button
          key={o}
          style={{
            padding: '4px 11px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
            border: '0.5px solid ' + (sel.includes(o) ? '#185FA5' : '#D3D1C7'),
            background: sel.includes(o) ? '#E6F1FB' : 'transparent',
            color: sel.includes(o) ? '#0C447C' : '#5F5E5A',
            fontWeight: sel.includes(o) ? 500 : 400,
          }}
          onClick={() => toggle(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
