import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { PLAN_LABELS, PROVIDER_LABELS } from '../lib/constants';
import SideNav from '../components/BottomNav';

const TIPO_ICONS  = { prova: '📋', plano: '📚', atividade: '✏️' };
const TIPO_LABELS = { prova: 'Provas', plano: 'Planos de Aula', atividade: 'Atividades' };

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [data, setData]   = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => d.error ? setError('Erro ao carregar dados.') : setData(d))
      .catch(() => setError('Sem conexão.'));
  }, [status]);

  if (status === 'loading' || (!data && !error)) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F6F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui,sans-serif', color: '#888', fontSize: 14 }}>
        Carregando...
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F6F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: '#888', marginBottom: 12 }}>Você precisa estar logado para ver o dashboard.</div>
          <Link href="/" style={{ color: '#003DA5', fontSize: 13 }}>← Voltar ao app</Link>
        </div>
      </div>
    );
  }

  const usagePct  = data?.limit === Infinity ? 0 : Math.min(100, Math.round((data?.usage / data?.limit) * 100));
  const totalMats = Object.values(data?.stats || {}).reduce((a, b) => a + b, 0);

  return (<>
    <Head>
      <title>Dashboard — ProntoProfe!</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>

    <div className="sidenav-offset" style={{ minHeight: '100vh', background: '#F7F6F3', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '0.5px solid #E0DDD5', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '10px 1rem', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>👩‍🏫</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a18' }}>ProntoProfe!</div>
            <div style={{ fontSize: 10, color: '#888' }}>Dashboard</div>
          </div>
          <div style={{ flex: 1 }} />
          <Link href="/" style={{ fontSize: 12, padding: '5px 14px', border: '0.5px solid #D3D1C7', borderRadius: 6, color: '#5F5E5A', textDecoration: 'none' }}>
            ← Voltar ao app
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '1.5rem 1rem' }}>

        {error && (
          <div style={{ background: '#FCEBEB', border: '0.5px solid #E8AAAA', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#A32D2D' }}>
            {error}
          </div>
        )}

        {data && (<>
          {/* Perfil + plano */}
          <div style={{ background: '#fff', border: '0.5px solid #E0DDD5', borderRadius: 12, padding: '1.25rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            {data.image
              ? <img src={data.image} alt="avatar" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
              : <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#003DA5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 }}>{data.name?.[0] ?? '?'}</div>
            }
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1a18' }}>{data.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20, background: '#F1EFE8', color: PLAN_LABELS[data.plan]?.color }}>
                  {PLAN_LABELS[data.plan]?.name}
                </span>
                {data.limit === Infinity ? (
                  <span style={{ fontSize: 12, color: '#3B6D11' }}>∞ gerações ilimitadas</span>
                ) : (
                  <span style={{ fontSize: 12, color: '#5F5E5A' }}>{data.usage} / {data.limit} gerações este mês</span>
                )}
              </div>
              {data.limit !== Infinity && (
                <div style={{ marginTop: 8, background: '#F1EFE8', borderRadius: 20, height: 6, width: '100%', maxWidth: 300 }}>
                  <div style={{ height: 6, borderRadius: 20, width: usagePct + '%', background: usagePct > 80 ? '#A32D2D' : usagePct > 50 ? '#BA7517' : '#3B6D11', transition: 'width 0.4s' }} />
                </div>
              )}
            </div>
          </div>

          {/* Cards de stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 16 }}>
            {['prova', 'plano', 'atividade'].map(tipo => (
              <div key={tipo} style={{ background: '#fff', border: '0.5px solid #E0DDD5', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: 26, marginBottom: 4 }}>{TIPO_ICONS[tipo]}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a18' }}>{data.stats[tipo] || 0}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{TIPO_LABELS[tipo]}</div>
              </div>
            ))}
            <div style={{ background: '#003DA5', border: '0.5px solid #003DA5', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: 26, marginBottom: 4 }}>🎯</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{totalMats}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Total gerado</div>
            </div>
          </div>

          {/* Histórico recente */}
          <div style={{ background: '#fff', border: '0.5px solid #E0DDD5', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #E0DDD5', fontSize: 13, fontWeight: 600, color: '#1a1a18' }}>
              Materiais recentes
            </div>
            {data.history.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', fontSize: 13, color: '#aaa' }}>
                Nenhum material gerado ainda. <Link href="/" style={{ color: '#003DA5' }}>Crie seu primeiro!</Link>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#F7F6F3' }}>
                      {['Tipo', 'Título / Disciplina', 'Série', 'IA', 'Data'].map(h => (
                        <th key={h} style={{ padding: '8px 14px', textAlign: 'left', color: '#888', fontWeight: 500, borderBottom: '0.5px solid #E0DDD5', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.history.map((item, i) => (
                      <tr key={item.id} style={{ borderBottom: i < data.history.length - 1 ? '0.5px solid #F0EDE6' : 'none' }}>
                        <td style={{ padding: '9px 14px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: 14 }}>{TIPO_ICONS[item.tipo]}</span>
                        </td>
                        <td style={{ padding: '9px 14px', maxWidth: 280 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500, color: '#1a1a18' }}>
                            {item.titulo || item.disciplina || '—'}
                          </div>
                          {item.disciplina && item.titulo && (
                            <div style={{ color: '#aaa', fontSize: 11, marginTop: 1 }}>{item.disciplina}</div>
                          )}
                        </td>
                        <td style={{ padding: '9px 14px', color: '#5F5E5A', whiteSpace: 'nowrap' }}>{item.serie || '—'}</td>
                        <td style={{ padding: '9px 14px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: PROVIDER_LABELS[item.provider]?.bg || '#F1EFE8', color: PROVIDER_LABELS[item.provider]?.color || '#888' }}>
                            {PROVIDER_LABELS[item.provider]?.name || item.provider}
                          </span>
                        </td>
                        <td style={{ padding: '9px 14px', color: '#aaa', whiteSpace: 'nowrap' }}>{item.data}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>)}
      </div>
      <SideNav />
    </div>
  </>);
}
