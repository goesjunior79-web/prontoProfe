import { signOut } from 'next-auth/react';
import { PLAN_LIMITS, PLAN_LABELS } from '../lib/constants';
import { btnPri, btnSec } from './ui';

export default function AppHeader({ cfg, plan, usage, session, onUpgradeClick, onTutorialClick }) {
  const usagePct   = plan === 'school' ? 5 : Math.min(100, (usage / PLAN_LIMITS[plan]) * 100);
  const usageColor = usagePct > 80 ? '#A32D2D' : usagePct > 50 ? '#BA7517' : '#3B6D11';

  return (
    <div style={{
      background: '#fff',
      borderBottom: '0.5px solid #E0DDD5',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 880,
        margin: '0 auto',
        padding: '10px 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>👩‍🏫</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a18' }}>ProntoProfe!</div>
            <div style={{ fontSize: 10, color: '#888' }}>Assistente pedagógico</div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Plano + uso */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 10, fontWeight: 500, padding: '2px 8px',
            borderRadius: 20, background: '#F1EFE8',
            color: PLAN_LABELS[plan].color,
          }}>
            {PLAN_LABELS[plan].name}
          </span>
          <span style={{ fontSize: 11, color: usageColor }}>
            {plan === 'school' ? '∞' : `${usage}/${PLAN_LIMITS[plan]}`}
          </span>
        </div>

        <button
          onClick={onTutorialClick}
          title="Tutorial"
          style={{ ...btnSec, fontSize: 12, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          ? Tutorial
        </button>

        {plan !== 'school' && (
          <button style={btnPri} onClick={onUpgradeClick}>Upgrade</button>
        )}

        {/* Avatar + sair */}
        {session?.user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {session.user.image
              ? <img src={session.user.image} alt="avatar" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
              : <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#003DA5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{session.user.name?.[0] ?? '?'}</div>
            }
            <button style={{ ...btnSec, fontSize: 11 }} onClick={() => signOut()} title="Sair">
              Sair
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
