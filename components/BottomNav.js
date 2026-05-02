/**
 * Sidebar / BottomNav agrupada em 4 categorias (Fase 4 — auditoria 2026-05-02).
 *
 * Antes: 6 atalhos genéricos, 7 das 8 telas novas eram órfãs (só por URL).
 * Agora: Início + 4 grupos com submenu (Planejar / Avaliar / Acompanhar / Ajustar)
 * + Materiais. Todas as telas ganham acesso primário.
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

const ITEMS = [
  { key: 'inicio',     icon: '🏠', label: 'Início',     href: '/' },
  {
    key: 'planejar',   icon: '📚', label: 'Planejar',
    children: [
      { label: 'PTD',         href: '/ptd'  },
      { label: 'Aula diária', href: '/aula' },
    ],
  },
  {
    key: 'avaliar',    icon: '📝', label: 'Avaliar',
    children: [
      { label: 'Avaliação por capítulo', href: '/avaliacao' },
      { label: 'Atividades',             href: '/atividade' },
      { label: 'Painel N1-N4',           href: '/painel'    },
      { label: 'Corrigir prova',         action: 'turma'    },
    ],
  },
  {
    key: 'acompanhar', icon: '📊', label: 'Acompanhar',
    children: [
      { label: 'Observação do aluno', href: '/observacao' },
      { label: 'Relatório de etapa',  href: '/relatorio'  },
      { label: 'Alunos',              action: 'alunos'   },
    ],
  },
  { key: 'materiais', icon: '📋', label: 'Materiais', href: '/dashboard' },
  {
    key: 'ajustar',    icon: '⚙️', label: 'Ajustar',
    children: [
      { label: 'Configurações', href: '/config'   },
      { label: 'Projetos',      action: 'projetos' },
    ],
  },
];

export default function SideNav({ onTurmaClick, onConfigClick, onProjetosClick, onAlunosClick }) {
  const router = useRouter();
  const [openKey, setOpenKey] = useState(null);
  const wrapperRef = useRef(null);

  // Fecha submenu ao clicar fora
  useEffect(() => {
    if (!openKey) return;
    const handler = e => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpenKey(null);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [openKey]);

  const dispatchAction = action => {
    if (action === 'turma')    return onTurmaClick?.();
    if (action === 'projetos') return onProjetosClick?.();
    if (action === 'alunos')   return onAlunosClick?.();
    if (action === 'config')   return onConfigClick?.();
  };

  const handleClick = item => {
    if (item.children) {
      setOpenKey(openKey === item.key ? null : item.key);
      return;
    }
    setOpenKey(null);
    if (item.action) return dispatchAction(item.action);
    if (item.href)   return router.push(item.href);
  };

  const handleChildClick = (parentKey, child) => {
    setOpenKey(null);
    if (child.action) return dispatchAction(child.action);
    if (child.href)   return router.push(child.href);
  };

  const isActive = item => {
    if (item.href === '/' && router.pathname === '/') return true;
    if (item.href && item.href !== '/' && router.pathname.startsWith(item.href)) return true;
    if (item.children) {
      return item.children.some(c => c.href && router.pathname.startsWith(c.href));
    }
    return false;
  };

  return (
    <>
      <style>{`
        .sidenav {
          position: fixed; top: 0; left: 0;
          width: 80px; height: 100vh;
          background: #fff; border-right: 1px solid #E0DDD5;
          box-shadow: 2px 0 8px rgba(0,0,0,0.06);
          display: flex; flex-direction: column; align-items: center;
          padding-top: 12px; gap: 4px; z-index: 200;
        }
        .sidenav-logo { font-size: 26px; margin-bottom: 16px; padding: 8px; line-height: 1; }
        .sidenav-item {
          width: 68px; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 4px;
          padding: 10px 4px; border: none; background: transparent;
          cursor: pointer; border-radius: 14px;
          transition: background 0.15s, color 0.15s; color: #888;
          -webkit-tap-highlight-color: transparent; position: relative;
        }
        .sidenav-item:hover  { background: #F1EFE8; color: #333; }
        .sidenav-item.active { background: #E8EFFC; color: #003DA5; }
        .sidenav-item.open   { background: #E8EFFC; color: #003DA5; }
        .sidenav-icon { font-size: 22px; line-height: 1; }
        .sidenav-label { font-size: 10px; font-weight: 500; letter-spacing: 0.2px; }
        .sidenav-item.active .sidenav-label,
        .sidenav-item.open   .sidenav-label { font-weight: 700; }
        .sidenav-offset { margin-left: 80px; }

        /* Submenu (popover) */
        .sidenav-submenu {
          position: absolute; left: 86px; top: 0; min-width: 180px;
          background: #fff; border: 1px solid #E0DDD5; border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          padding: 6px; z-index: 210;
        }
        .sidenav-submenu button {
          display: block; width: 100%; padding: 9px 12px;
          font-size: 13px; color: #333; background: transparent;
          border: none; border-radius: 8px; text-align: left;
          cursor: pointer; white-space: nowrap;
        }
        .sidenav-submenu button:hover { background: #F1EFE8; }
        .sidenav-submenu button.active { background: #E8EFFC; color: #003DA5; font-weight: 600; }

        /* Mobile bottom bar */
        @media (max-width: 640px) {
          .sidenav {
            top: auto; bottom: 0; left: 0; right: 0;
            width: 100%; height: 60px; flex-direction: row;
            justify-content: space-around; padding-top: 0;
            padding-bottom: env(safe-area-inset-bottom);
            border-right: none; border-top: 1px solid #E0DDD5;
            box-shadow: 0 -2px 12px rgba(0,0,0,0.07); gap: 0;
          }
          .sidenav-logo { display: none; }
          .sidenav-item { width: auto; flex: 1; padding: 5px 2px; border-radius: 0; min-width: 0; }
          .sidenav-item:hover { background: transparent; }
          .sidenav-item.active, .sidenav-item.open { background: transparent; color: #003DA5; }
          .sidenav-icon {
            font-size: 19px; width: 32px; height: 32px;
            display: flex; align-items: center; justify-content: center;
            border-radius: 10px;
          }
          .sidenav-item.active .sidenav-icon,
          .sidenav-item.open   .sidenav-icon { background: #E8EFFC; }
          .sidenav-label { font-size: 9px; }
          .sidenav-offset { margin-left: 0; margin-bottom: 60px; }

          /* Submenu vira sheet inferior */
          .sidenav-submenu {
            position: fixed; left: 8px; right: 8px; bottom: 68px; top: auto;
            min-width: 0; max-width: none; padding: 8px;
          }
          .sidenav-submenu button { padding: 14px 14px; font-size: 14px; }
        }

        @media (max-width: 400px) {
          .sidenav-label { display: none; }
          .sidenav-item { padding: 8px 2px; }
          .sidenav-icon { font-size: 22px; width: 36px; height: 36px; }
        }
      `}</style>

      <nav className="sidenav" ref={wrapperRef}>
        <div className="sidenav-logo">👩‍🏫</div>

        {ITEMS.map(item => (
          <button
            key={item.key}
            className={`sidenav-item${isActive(item) ? ' active' : ''}${openKey === item.key ? ' open' : ''}`}
            onClick={() => handleClick(item)}
            title={item.label}
            aria-haspopup={item.children ? 'menu' : undefined}
            aria-expanded={item.children ? (openKey === item.key) : undefined}
          >
            <span className="sidenav-icon">{item.icon}</span>
            <span className="sidenav-label">{item.label}</span>

            {item.children && openKey === item.key && (
              <div className="sidenav-submenu" role="menu" onClick={e => e.stopPropagation()}>
                {item.children.map((child, i) => {
                  const active = child.href && router.pathname.startsWith(child.href);
                  return (
                    <button
                      key={i}
                      className={active ? 'active' : ''}
                      onClick={e => { e.stopPropagation(); handleChildClick(item.key, child); }}
                    >
                      {child.label}
                    </button>
                  );
                })}
              </div>
            )}
          </button>
        ))}
      </nav>
    </>
  );
}
