import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';

const ITEMS = [
  { key: 'inicio',  icon: '🏠', label: 'Início',      href: '/' },
  { key: 'turma',   icon: '📷', label: 'Turma',       action: 'turma' },
  { key: 'dash',    icon: '📊', label: 'Dashboard',   href: '/dashboard' },
  { key: 'config',  icon: '⚙️', label: 'Config.',     action: 'config' },
];

export default function BottomNav({ activeKey, onTurmaClick, onConfigClick }) {
  const router = useRouter();

  const handleClick = item => {
    if (item.action === 'turma')  return onTurmaClick?.();
    if (item.action === 'config') return onConfigClick?.();
    if (item.href) router.push(item.href);
  };

  return (
    <>
      {/* espaçador para o conteúdo não ficar atrás da barra */}
      <div style={{ height: 72 }} />

      <nav style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 200,
        background: '#fff',
        borderTop: '1px solid #E0DDD5',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'stretch',
        height: 64,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {ITEMS.map(item => {
          const isActive = activeKey === item.key ||
            (item.href === '/' && router.pathname === '/') ||
            (item.href && item.href !== '/' && router.pathname.startsWith(item.href));

          return (
            <button
              key={item.key}
              onClick={() => handleClick(item)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: isActive ? '#003DA5' : '#888',
                transition: 'color 0.15s',
                padding: '6px 4px',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* círculo de destaque quando ativo */}
              <span style={{
                fontSize: 22,
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 12,
                background: isActive ? '#E8EFFC' : 'transparent',
                transition: 'background 0.15s',
              }}>
                {item.icon}
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: isActive ? 600 : 400,
                letterSpacing: 0.2,
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
