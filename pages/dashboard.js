import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import SideNav from '../components/BottomNav';

const TIPO_ICONS  = { prova: '📋', plano: '📚', atividade: '✏️' };
const TIPO_LABELS = { prova: 'Prova', plano: 'Plano de Aula', atividade: 'Atividade' };

export default function MeusMateriais() {
  const { data: session, status } = useSession();
  const [data, setData]   = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => d.error ? setError('Não foi possível carregar seus materiais. Tente novamente.') : setData(d))
      .catch(() => setError('Sem conexão com a internet. Verifique sua conexão e tente novamente.'));
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
          <div style={{ fontSize: 14, color: '#888', marginBottom: 12 }}>Você precisa estar logado para ver seus materiais.</div>
          <Link href="/" style={{ color: '#003DA5', fontSize: 13 }}>← Voltar ao app</Link>
        </div>
      </div>
    );
  }

  return (<>
    <Head>
      <title>Meus materiais — ProntoProfe!</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>

    <div className="sidenav-offset" style={{ minHeight: '100vh', background: '#F7F6F3', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '0.5px solid #E0DDD5', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '10px 1rem', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>👩‍🏫</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a18' }}>ProntoProfe!</div>
            <div style={{ fontSize: 10, color: '#888' }}>Meus materiais</div>
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
          {/* Perfil */}
          <div style={{ background: '#fff', border: '0.5px solid #E0DDD5', borderRadius: 12, padding: '1.25rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
            {data.image
              ? <img src={data.image} alt="avatar" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
              : <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#003DA5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>{data.name?.[0] ?? '?'}</div>
            }
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a18' }}>{data.name}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                {data.history.length === 0
                  ? 'Nenhum material gerado ainda'
                  : `${data.history.length} material${data.history.length > 1 ? 'is' : ''} gerado${data.history.length > 1 ? 's' : ''}`}
              </div>
            </div>
          </div>

          {/* Lista de materiais */}
          <div style={{ background: '#fff', border: '0.5px solid #E0DDD5', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #E0DDD5', fontSize: 13, fontWeight: 600, color: '#1a1a18' }}>
              Materiais gerados
            </div>
            {data.history.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', fontSize: 13, color: '#aaa' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
                Nenhum material gerado ainda.{' '}
                <Link href="/" style={{ color: '#003DA5' }}>Criar agora →</Link>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#F7F6F3' }}>
                      {['Tipo', 'Título / Disciplina', 'Série', 'Data'].map(h => (
                        <th key={h} style={{ padding: '8px 14px', textAlign: 'left', color: '#888', fontWeight: 500, borderBottom: '0.5px solid #E0DDD5', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.history.map((item, i) => (
                      <tr key={item.id} style={{ borderBottom: i < data.history.length - 1 ? '0.5px solid #F0EDE6' : 'none' }}>
                        <td style={{ padding: '9px 14px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ fontSize: 15 }}>{TIPO_ICONS[item.tipo]}</span>
                            <span style={{ fontSize: 10, color: '#888' }}>{TIPO_LABELS[item.tipo] || item.tipo}</span>
                          </div>
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
