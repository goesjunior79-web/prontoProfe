import { inp, lbl } from '../ui';

const FIELDS = [
  { key: 'nomeProfessora', label: 'Nome da professora', ph: 'Ex: Sheila Goes' },
  { key: 'cidade',         label: 'Cidade / Unidade',   ph: 'Ex: BOTUCATU'    },
  { key: 'docCode',        label: 'Código da escola',   ph: 'Ex: CE-228'      },
  { key: 'tipoDoc',        label: 'Tipo do documento (lateral)', ph: 'Ex: Prova Objetiva' },
];

export default function ConfigModal({ cfg, onCfgChange, onSave, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', maxWidth: 400, width: '100%' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Configurações</div>
        {FIELDS.map(f => (
          <div key={f.key} style={{ marginBottom: 11 }}>
            <label style={lbl}>{f.label}</label>
            <input style={inp} value={cfg[f.key] || ''} placeholder={f.ph} onChange={e => onCfgChange(f.key, e.target.value)} />
          </div>
        ))}
        <button style={{ width: '100%', padding: '10px', background: '#003DA5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }} onClick={onSave}>
          Salvar
        </button>
      </div>
    </div>
  );
}
