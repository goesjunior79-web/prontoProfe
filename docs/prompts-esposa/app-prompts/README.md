# App-prompts — Versões finais para uso programático

> Estes são os prompts **finais** que vão entrar no `pages/api/generate.js` do SESI Edu.
> A esposa enviou nesse formato com **placeholders** (`{componente}`, `{ano}`, `{capitulo}`)
> para o app interpolar dinamicamente. **Diferente** dos prompts em `../NN-*.md`, que são
> as versões "ChatGPT humano" que ela cola manualmente.

## Status

| # | Módulo da spec | Arquivo | Recebido |
|---|---|---|---|
| 1 | Módulo 1 — PTD | [`01-ptd.md`](./01-ptd.md) | ✅ 2026-04-29 (v2 especialista) |
| 2 | Módulo 2 — Avaliações | [`02-avaliacao.md`](./02-avaliacao.md) | ✅ 2026-04-29 |
| 3 | Módulo 3 — Atividades complementares | [`03-atividades-complementares.md`](./03-atividades-complementares.md) | ✅ 2026-04-29 |
| 4 | Módulo 4 — Observações de alunos | [`04-observacao-aluno.md`](./04-observacao-aluno.md) | ✅ 2026-04-29 |
| 5 | Módulo 5 — Relatórios de etapa | [`05-relatorio-final.md`](./05-relatorio-final.md) | ✅ 2026-04-29 |

## Módulos extras (não estavam na SPEC OFICIAL)

| # | Função | Arquivo | Recebido |
|---|---|---|---|
| 7 | Aula Diária (Rotina Intencional SESI) | [`07-aula-diaria.md`](./07-aula-diaria.md) | ✅ 2026-04-29 |
| 8 | Classificador automático de alunos (engine do Painel F01) | [`08-classificador-alunos.md`](./08-classificador-alunos.md) | ✅ 2026-04-29 |

## Metaprompts (transversais — rodam sobre os outros)

| # | Função | Arquivo | Recebido |
|---|---|---|---|
| 6 | Corretor (anti-erro do modelo) | [`06-corretor.md`](./06-corretor.md) | ✅ 2026-04-29 |

**5 módulos da SPEC cobertos + 1 metaprompt corretor.** Sidney avisou (2026-04-29) que
**há mais prompts a chegar**. Análise final consolidada será feita após a chegada de todos
antes de iniciar o Spec Pipeline.

## Convenção

- Numeração casa com os módulos da [SPEC OFICIAL](../../specs/SPEC-OFICIAL-esposa.md)
- Cada arquivo contém: prompt original + análise + placeholders + regras de validação
- Quando todos chegarem, `@architect` desenha a composição final com a camada DNA SESI
