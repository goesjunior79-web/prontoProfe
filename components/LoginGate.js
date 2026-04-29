import { signIn } from 'next-auth/react';

export default function LoginGate() {
  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F3', fontFamily: 'system-ui,-apple-system,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem 2rem', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>👩‍🏫</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a18', marginBottom: 6 }}>ProntoProfe!</div>
        <div style={{ fontSize: 14, color: '#5F5E5A', marginBottom: 28, lineHeight: 1.6 }}>
          Assistente pedagógico com IA para a rede SESI.<br/>
          Gere provas, planos de aula e atividades em segundos.
        </div>
        <button
          onClick={() => signIn('google')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '12px 20px', background: '#fff', border: '1.5px solid #D3D1C7', borderRadius: 10, fontSize: 15, fontWeight: 600, color: '#1a1a18', cursor: 'pointer', transition: 'border-color 0.2s' }}
          onMouseOver={e => e.currentTarget.style.borderColor = '#003DA5'}
          onMouseOut={e => e.currentTarget.style.borderColor = '#D3D1C7'}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Entrar com Google
        </button>
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 20, lineHeight: 1.6 }}>
          Desenvolvido para a rede SESI.<br />Seus dados ficam seguros e são usados apenas para personalizar seus materiais.
        </div>
      </div>
    </div>
  );
}
