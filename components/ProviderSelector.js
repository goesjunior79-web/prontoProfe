import { PROVIDER_LABELS, PROVIDER_ACCESS } from '../lib/constants';

export default function ProviderSelector({ provider, plan, onProviderChange, onUpgradeClick }) {
  const canUse = p => PROVIDER_ACCESS[p]?.includes(plan);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em' }}>IA:</span>
      {Object.entries(PROVIDER_LABELS).map(([key, info]) => {
        const avail = canUse(key);
        const active = provider === key;
        return (
          <button
            key={key}
            style={{
              padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              border: '0.5px solid ' + (active ? info.color : '#D3D1C7'),
              background: active ? info.bg : 'transparent',
              color: active ? info.color : '#5F5E5A',
              opacity: avail ? 1 : 0.45,
            }}
            onClick={() => {
              if (!avail) { onUpgradeClick(); return; }
              onProviderChange(key);
            }}
          >
            {info.name}{!avail ? ' 🔒' : ''}
          </button>
        );
      })}
    </div>
  );
}
