/**
 * Tela 4 — Avaliação (grid de 6 sub-tipos)
 *
 * Story: US-007a-f (FASE 2)
 */

import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import LoginGate from '../../components/LoginGate';
import { listSubtipos } from '../../lib/avaliacao/subtipos';

export default function AvaliacaoIndex() {
  const { data: session, status } = useSession();
  if (status === 'loading') return <div style={loadingStyle}>Carregando…</div>;
  if (status !== 'authenticated') return <LoginGate />;

  return (
    <>
      <Head>
        <title>Avaliação — ProntoProfe!</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={pageStyle}>
        <header style={headerStyle}>
          <Link href="/" style={backLinkStyle}>← Início</Link>
          <h1 style={titleStyle}>📝 Avaliação</h1>
          <div style={{ fontSize: 12, color: '#888' }}>{session.user.name || session.user.email}</div>
        </header>

        <main style={mainStyle}>
          <p style={lead}>
            Escolha o tipo de instrumento avaliativo. Cada um segue padrão SESI v3.
          </p>

          <div style={gridStyle}>
            {listSubtipos().map(s => (
              <Link key={s.slug} href={`/avaliacao/${s.slug}`} style={cardLink}>
                <div style={{ ...cardStyle, borderTop: `3px solid ${s.cor}` }}>
                  <div style={iconStyle}>{s.icon}</div>
                  <div style={cardTitleStyle}>{s.title}</div>
                  <div style={cardDescStyle}>{s.descricao}</div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}

const pageStyle = { minHeight: '100vh', background: '#F7F6F3', fontFamily: 'system-ui, -apple-system, sans-serif' };
const headerStyle = { display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', background: '#fff', borderBottom: '0.5px solid #E0DDD5' };
const backLinkStyle = { color: '#003DA5', textDecoration: 'none', fontSize: 13 };
const titleStyle = { flex: 1, fontSize: 17, fontWeight: 700, color: '#1a1a18', margin: 0 };
const mainStyle = { maxWidth: 880, margin: '0 auto', padding: 16 };
const lead = { fontSize: 14, color: '#5F5E5A', marginBottom: 16 };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 };
const cardLink = { textDecoration: 'none', color: 'inherit' };
const cardStyle = { background: '#fff', border: '0.5px solid #E0DDD5', borderRadius: 12, padding: '18px 16px', textAlign: 'center', minHeight: 140, transition: 'transform 0.15s', cursor: 'pointer' };
const iconStyle = { fontSize: 32, marginBottom: 8 };
const cardTitleStyle = { fontSize: 14, fontWeight: 700, color: '#1a1a18', marginBottom: 6 };
const cardDescStyle = { fontSize: 11, color: '#888', lineHeight: 1.5 };
const loadingStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F6F3', color: '#888', fontSize: 14 };
