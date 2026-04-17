const TABS = [['prova', '📝 Prova'], ['plano', '📋 Plano de Aula'], ['atividade', '✏️ Atividade']];

export default function TabSelector({ tab, onTabChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
      {TABS.map(([k, l]) => (
        <button
          key={k}
          style={{
            padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            border: '0.5px solid ' + (tab === k ? '#003DA5' : '#D3D1C7'),
            background: tab === k ? '#003DA5' : 'transparent',
            color: tab === k ? '#fff' : '#888',
          }}
          onClick={() => onTabChange(k)}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
