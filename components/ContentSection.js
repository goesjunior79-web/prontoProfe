import { F, S, T, Chips, secLabel, inp } from './ui';

export default function ContentSection({ tab, plano, prova, atividade, setPlano, setProva, setAtividade }) {
  return (
    <div style={{ background: '#fff', border: '0.5px solid #E0DDD5', borderRadius: 12, padding: '1rem', marginBottom: 12 }}>
      <span style={secLabel}>
        Conteúdo{tab === 'prova' ? ' da prova' : tab === 'plano' ? ' da aula' : ' da atividade'}
      </span>

      {tab === 'plano' && <>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <F label="Aulas por semana">
            <S value={plano.duracao} onChange={v => setPlano(p => ({ ...p, duracao: v }))} opts={['1 aula/semana', '2 aulas/semana', '3 aulas/semana', '4 aulas/semana', '5 aulas/semana']} />
          </F>
          <F label="Metodologias">
            <Chips
              opts={['Expositiva', 'Grupo', 'Gamificação', 'Sala invertida', 'Laboratório', 'Debate']}
              sel={plano.metodos}
              toggle={v => setPlano(p => ({ ...p, metodos: p.metodos.includes(v) ? p.metodos.filter(x => x !== v) : [...p.metodos, v] }))}
            />
          </F>
        </div>
        <F label="Descreva o conteúdo ou envie arquivo abaixo">
          <T value={plano.conteudo} onChange={v => setPlano(p => ({ ...p, conteudo: v }))} ph="Tema, trechos do livro, objetivos..." />
        </F>
      </>}

      {tab === 'prova' && <>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
          <F label="Dificuldade">
            <S value={prova.dificuldade} onChange={v => setProva(p => ({ ...p, dificuldade: v }))} opts={['Básico', 'Intermediário', 'Avançado', 'Misto']} />
          </F>
          <F label="Quantidade">
            <S value={prova.qtd} onChange={v => setProva(p => ({ ...p, qtd: v }))} opts={['5 questões', '8 questões', '10 questões', '15 questões', '20 questões']} />
          </F>
          <F label="Valor do instrumento">
            <input style={inp} value={prova.valorInstrumento} onChange={e => setProva(p => ({ ...p, valorInstrumento: e.target.value }))} placeholder="Ex: 10,0" />
          </F>
        </div>
        <F label="Tipo de questões" style={{ marginBottom: 10 }}>
          <Chips
            opts={['Múltipla escolha', 'Verdadeiro/Falso', 'Dissertativa', 'Lacunas']}
            sel={prova.tipos}
            toggle={v => setProva(p => ({ ...p, tipos: p.tipos.includes(v) ? p.tipos.filter(x => x !== v) : [...p.tipos, v] }))}
          />
        </F>
        <F label="O que será avaliado? (Critérios de Avaliação)" style={{ marginBottom: 10 }}>
          <T value={prova.criterios} onChange={v => setProva(p => ({ ...p, criterios: v }))} ph={'- Identificar a finalidade do gênero textual\n- Reconhecer estrutura e elementos do texto\n(um critério por linha)'} />
        </F>
        <F label="Conteúdo avaliado ou envie arquivo abaixo" style={{ marginBottom: 10 }}>
          <T value={prova.conteudo} onChange={v => setProva(p => ({ ...p, conteudo: v }))} ph="Descreva os tópicos ou cole o texto base da prova..." />
        </F>
        <F label="Instruções especiais (opcional)">
          <input style={inp} value={prova.instrucoes} onChange={e => setProva(p => ({ ...p, instrucoes: e.target.value }))} placeholder="Ex: sem calculadora, incluir gabarito..." />
        </F>
      </>}

      {tab === 'atividade' && <>
        <F label="Tipos de atividade" style={{ marginBottom: 10 }}>
          <Chips
            opts={['Exercícios', 'Lúdica', 'Pesquisa', 'Produção textual', 'Estudo de caso']}
            sel={atividade.tipos}
            toggle={v => setAtividade(p => ({ ...p, tipos: p.tipos.includes(v) ? p.tipos.filter(x => x !== v) : [...p.tipos, v] }))}
          />
        </F>
        <F label="Conteúdo">
          <T value={atividade.conteudo} onChange={v => setAtividade(p => ({ ...p, conteudo: v }))} ph="Descreva o conteúdo..." />
        </F>
      </>}
    </div>
  );
}
