import { useRouter } from 'next/router';

const ITEMS = [
  { key: 'inicio',   icon: '🏠', label: 'Início',     href: '/' },
  { key: 'alunos',   icon: '👥', label: 'Alunos',     action: 'alunos' },
  { key: 'turma',    icon: '📷', label: 'Corrigir',   action: 'turma' },
  { key: 'projetos', icon: '📁', label: 'Projetos',   action: 'projetos' },
  { key: 'dash',     icon: '📊', label: 'Dashboard',  href: '/dashboard' },
  { key: 'config',   icon: '⚙️', label: 'Configurar', action: 'config' },
];

export default function SideNav({ onTurmaClick, onConfigClick, onProjetosClick, onAlunosClick }) {
  const router = useRouter();

  const handleClick = item => {
    if (item.action === 'turma')    return onTurmaClick?.();
    if (item.action === 'config')   return onConfigClick?.();
    if (item.action === 'projetos') return onProjetosClick?.();
    if (item.action === 'alunos')   return onAlunosClick?.();
    if (item.href) router.push(item.href);
  };

  const isActive = item =>
    (item.href === '/' && router.pathname === '/') ||
    (item.href && item.href !== '/' && router.pathname.startsWith(item.href));

  return (
    <>
      <style>{`
        /* ── Sidebar esquerda (desktop) ── */
        .sidenav {
          position: fixed;
          top: 0; left: 0;
          width: 80px;
          height: 100vh;
          background: #fff;
          border-right: 1px solid #E0DDD5;
          box-shadow: 2px 0 8px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 12px;
          gap: 4px;
          z-index: 200;
        }

        .sidenav-logo {
          font-size: 26px;
          margin-bottom: 16px;
          padding: 8px;
          line-height: 1;
        }

        .sidenav-item {
          width: 68px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 10px 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 14px;
          transition: background 0.15s, color 0.15s;
          color: #888;
          -webkit-tap-highlight-color: transparent;
        }
        .sidenav-item:hover { background: #F1EFE8; color: #333; }
        .sidenav-item.active { background: #E8EFFC; color: #003DA5; }

        .sidenav-icon { font-size: 22px; line-height: 1; }
        .sidenav-label { font-size: 10px; font-weight: 500; letter-spacing: 0.2px; }
        .sidenav-item.active .sidenav-label { font-weight: 700; }

        /* margem no conteúdo para compensar a sidebar */
        .sidenav-offset { margin-left: 80px; }

        /* ── Barra inferior (mobile) ── */
        @media (max-width: 640px) {
          .sidenav {
            top: auto; bottom: 0; left: 0; right: 0;
            width: 100%;
            height: 60px;
            flex-direction: row;
            justify-content: space-around;
            padding-top: 0;
            padding-bottom: env(safe-area-inset-bottom);
            border-right: none;
            border-top: 1px solid #E0DDD5;
            box-shadow: 0 -2px 12px rgba(0,0,0,0.07);
            gap: 0;
          }
          .sidenav-logo { display: none; }
          .sidenav-item {
            width: auto;
            flex: 1;
            padding: 5px 2px;
            border-radius: 0;
            min-width: 0;
          }
          .sidenav-item:hover { background: transparent; }
          .sidenav-item.active { background: transparent; color: #003DA5; }
          .sidenav-icon {
            font-size: 19px;
            width: 32px; height: 32px;
            display: flex; align-items: center; justify-content: center;
            border-radius: 10px;
          }
          .sidenav-item.active .sidenav-icon { background: #E8EFFC; }
          .sidenav-label { font-size: 9px; }
          .sidenav-offset { margin-left: 0; margin-bottom: 60px; }
        }

        /* Telas muito pequenas: oculta labels dos itens secundários */
        @media (max-width: 400px) {
          .sidenav-label { display: none; }
          .sidenav-item { padding: 8px 2px; }
          .sidenav-icon { font-size: 22px; width: 36px; height: 36px; }
        }
      `}</style>

      <nav className="sidenav">
        <div className="sidenav-logo">👩‍🏫</div>

        {ITEMS.map(item => (
          <button
            key={item.key}
            className={`sidenav-item${isActive(item) ? ' active' : ''}`}
            onClick={() => handleClick(item)}
            title={item.label}
          >
            <span className="sidenav-icon">{item.icon}</span>
            <span className="sidenav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
