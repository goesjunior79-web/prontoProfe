import { inp, lbl } from '../ui';

const SESI_LOGO_B64 = '/9j/4AAQSkZJRgABAQEA3ADcAAD/2wBDAAIBAQEBAQIBAQECAgICAgQDAgICAgUEBAMEBgUGBgYFBgYGBwkIBgcJBwYGCAsICQoKCgoKBggLDAsKDAkKCgr/2wBDAQICAgICAgUDAwUKBwYHCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgr/wAARCABxAVUDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAC';

const STEPS = [
  { titulo: 'Bem-vinda ao ProntoProfe! 👩‍🏫', desc: 'Seu gerador de materiais escolares com Inteligência Artificial. Crie provas, planos de aula e atividades em segundos.', campo: null },
  { titulo: 'Qual é o seu nome?', desc: 'Seu nome vai aparecer no cabeçalho dos documentos gerados.', campo: { key: 'nomeProfessora', label: 'Nome completo', ph: 'Ex: Sheila Goes' } },
  { titulo: 'Tudo pronto! 🎉', desc: 'Perfil salvo! Você pode completar outras informações (cidade, código da escola) clicando em ⚙️ Meus dados na barra lateral a qualquer momento.', campo: null },
];

export default function SetupModal({ setupStep, cfg, onCfgChange, onNext, onBack, onSkip }) {
  const step = STEPS[setupStep];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', maxWidth: 420, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <img src={`data:image/jpeg;base64,${SESI_LOGO_B64}`} style={{ height: 36 }} alt="SESI" />
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#1a1a18', marginBottom: 6, textAlign: 'center' }}>{step.titulo}</div>
        <div style={{ fontSize: 14, color: '#5F5E5A', marginBottom: 18, textAlign: 'center', lineHeight: 1.6 }}>{step.desc}</div>

        {step.campo && (
          <div style={{ marginBottom: 18 }}>
            <label style={lbl}>{step.campo.label}</label>
            <input style={inp} value={cfg[step.campo.key] || ''} placeholder={step.campo.ph} onChange={e => onCfgChange(step.campo.key, e.target.value)} />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 18 }}>
          {STEPS.map((_, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i === setupStep ? '#003DA5' : '#D3D1C7' }} />)}
        </div>

        <button style={{ width: '100%', padding: '11px', background: '#003DA5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }} onClick={onNext}>
          {setupStep < STEPS.length - 1 ? 'Próximo →' : 'Começar →'}
        </button>
        {setupStep > 0 && (
          <button style={{ width: '100%', marginTop: 7, padding: '8px', background: 'transparent', border: 'none', fontSize: 13, color: '#888', cursor: 'pointer' }} onClick={onBack}>← Voltar</button>
        )}
        {setupStep === 0 && (
          <button style={{ width: '100%', marginTop: 7, padding: '8px', background: 'transparent', border: 'none', fontSize: 12, color: '#aaa', cursor: 'pointer' }} onClick={onSkip}>Pular</button>
        )}
      </div>
    </div>
  );
}
