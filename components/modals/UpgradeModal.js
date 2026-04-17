import { PLAN_LABELS } from '../../lib/constants';

const PLANS = [
  { key: 'pro',    price: 'R$ 29/mês',  desc: '150 gerações + IAs',    color: '#003DA5' },
  { key: 'school', price: 'R$ 149/mês', desc: 'Ilimitado + todas as IAs', color: '#534AB7' },
];

export default function UpgradeModal({ showUpgrade, showProviderUpgrade, onUpgrade, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', maxWidth: 460, width: '100%' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>
          {showProviderUpgrade ? 'IA bloqueada no plano gratuito' : 'Limite atingido'}
        </div>
        <div style={{ fontSize: 13, color: '#5F5E5A', marginBottom: 18 }}>
          {showProviderUpgrade ? 'Faça upgrade para usar ChatGPT, Gemini e outros.' : 'Você usou todas as gerações do mês.'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          {PLANS.map(p => (
            <div key={p.key} style={{ border: '2px solid ' + p.color, borderRadius: 10, padding: '1rem' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: p.color }}>{PLAN_LABELS[p.key].name}</div>
              <div style={{ fontSize: 19, fontWeight: 600, margin: '4px 0' }}>{p.price}</div>
              <div style={{ fontSize: 12, color: '#5F5E5A', marginBottom: 10 }}>{p.desc}</div>
              <button style={{ width: '100%', padding: 7, background: p.color, color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }} onClick={() => onUpgrade(p.key)}>
                Assinar
              </button>
            </div>
          ))}
        </div>
        <button style={{ width: '100%', padding: 8, background: 'transparent', border: '0.5px solid #D3D1C7', borderRadius: 6, fontSize: 13, color: '#888', cursor: 'pointer' }} onClick={onClose}>
          Continuar gratuito
        </button>
      </div>
    </div>
  );
}
