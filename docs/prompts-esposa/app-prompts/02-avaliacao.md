# App-prompt 02 — Avaliação Completa (v4 Final)

> **Versão final do prompt para uso programático no SESI Edu.**
> **v4 — PROMPT FINAL** recebida em 2026-05-01 (substitui v3 "Módulo Avaliação Completo").
>
> Mantém os **6 sub-botões** definidos na v3, mas em formato **enxuto** alinhado à
> filosofia open-ended das outras v3 (PTD, Aula Diária). Confia no PROMPT MESTRE pra
> dar contexto pedagógico.

---

## 1. Prompt original (v4 — Final)

```
Você é especialista em Avaliação SESI.

Gerar módulo completo organizado:

BOTÕES:
- Avaliação do capítulo
- Simulado Avalia
- Rubrica
- Pauta de observação
- Plenária
- Pauta de leitura

REGRAS:
- Não inventar descritores
- Usar somente os enviados
- Incluir níveis N1–N4 em tudo

AVALIAÇÃO DO CAPÍTULO:
- 10 questões (7 objetiva + 3 dissertativa)
- Gabarito com nível

SIMULADO:
- 100% objetiva
- Cartão-resposta
- Gabarito com descritor + nível

RUBRICA:
- Critérios com N1–N4

PAUTA OBSERVAÇÃO:
- Nome
- Habilidade
- Nível
- Observação

PLENÁRIA:
- Perguntas reflexivas

PAUTA DE LEITURA:
- Decodificação
- Fluência
- Fluente
- Com compreensão
- Sem compreensão

Gerar completo.
```

---

## 2. Os 6 sub-botões — schema final v4

### 🔘 1. Avaliação do Capítulo
- 10 questões (**7 objetivas + 3 dissertativas** — mix confirmado)
- Gabarito com nível por questão

### 🔘 2. Simulado AVALIA
- 100% objetiva (múltipla escolha A-D)
- Cartão-resposta
- Gabarito com **descritor + nível** por questão

### 🔘 3. Rubrica
- Tabela: Critérios × N1-N4

### 🔘 4. Pauta de Observação
- Por aluno: Nome / Habilidade / Nível / Observação

### 🔘 5. Plenária
- Perguntas reflexivas (simplificado vs v3 que tinha "+ discussão coletiva + registro
  da fala dos alunos")

### 🔘 6. Pauta de Leitura — terminologia final
A esposa **encurtou os termos** vs v3:

| v3 (longo) | v4 (curto) |
|---|---|
| Leitura em nível de decodificação | **Decodificação** |
| Leitura em desenvolvimento de fluência | **Fluência** |
| Leitura fluente | **Fluente** |
| Com compreensão | Com compreensão |
| Sem compreensão | Sem compreensão |

> **Sub-pendência aberta:** os 5 termos são categorias soltas (escolho 1) ou se
> combinam em 2 eixos (fase de leitura × compreensão)? Ex.: "Fluente + Com compreensão"
> ou "Decodificação + Sem compreensão"?
>
> Pelo formato listado, parece **2 eixos combináveis**:
> - Eixo 1 (fase): Decodificação | Fluência | Fluente
> - Eixo 2 (modificador): Com compreensão | Sem compreensão
>
> Faz sentido pedagógico (aluno pode ser fluente mas não compreender). Mas **ela não
> confirmou explicitamente**. Implementação assumirá 2 eixos combináveis até ser
> confirmado.

---

## 3. Regras absolutas (3 itens)

1. **Não inventar descritores** (regra finals reforçada)
2. **Usar somente os enviados** pela professora (catálogo oficial pendente — asset #1)
3. **Incluir níveis N1-N4 em tudo** (todos os 6 sub-botões usam N1-N4)

---

## 4. Mudanças vs v3 (algumas horas antes)

### 🔻 Simplificações
- Header curto: "Você é especialista em Avaliação SESI" (era "professora pedagoga
  especialista do SESI")
- Regras: 3 itens (era 3 itens com mais palavras)
- **Plenária**: só "Perguntas reflexivas" (v3 tinha + discussão coletiva + registro
  da fala)
- **Pauta de Leitura**: termos encurtados (Decodificação ↔ "em nível de decodificação")
- **Diferencial pedagógico universal removido** (v3 tinha "o que observar / como
  intervém / como avança" obrigatório em todos)
- Placeholders `{ano}, {componente}, {capitulo}, {descritores}` saíram do prompt
  (delegados ao PROMPT MESTRE)

### 🔧 Mantido
- 6 sub-botões na mesma ordem
- Regras absolutas (não inventar, descritores enviados, N1-N4 em tudo)
- Mix 7+3 na Avaliação do Capítulo
- Cartão-resposta no Simulado
- Schema da Pauta de Observação (Nome/Habilidade/Nível/Observação)
- Tabela da Rubrica (Critérios × N1-N4)

---

## 5. Filosofia da v4 — coerente com PTD v3 e Aula Diária v3

A esposa está **alinhando todos os prompts** numa filosofia common:
- **Header curto** ("Você é X")
- **Lista enxuta** de instruções
- **Open-ended** — confia que PROMPT MESTRE + LLM completam
- **Validador estrutural** (categorias) mais que checklists exaustivos

> Isso simplifica MUITO a manutenção dos prompts e a uniformidade da base de
> conhecimento.

---

## 6. Validador estrutural por sub-botão

### Universal (todos os 6)
- Presença dos 4 níveis N1-N4 (heurística: cada output cita os 4 rótulos)
- Não inventar descritores (LLM check via PROMPT 6)

### Específicos
| Sub-botão | Validações |
|---|---|
| Avaliação do Capítulo | Tem 10 questões? 7 objetivas + 3 dissertativas? Cada questão tem nível? |
| Simulado AVALIA | 100% objetiva A-D? Cartão-resposta presente? Gabarito tem descritor + nível por q.? |
| Rubrica | Tabela Critérios × N1-N4? Pelo menos 1 critério? |
| Pauta de Observação | Tem campo Nome / Habilidade / Nível / Observação? |
| Plenária | Tem perguntas reflexivas? |
| Pauta de Leitura | Tem 3 categorias de fase + 2 modificadores de compreensão? |

---

## 7. Histórico evolutivo do PROMPT 2 (Avaliação)

| Versão | Data | Características |
|---|---|---|
| v1 | 2026-04-29 | Genérico, 1 prompt cobre simulado + capítulo |
| v2 (interpretação) | 2026-04-30 | 2 sub-modos (Simulado / Capítulo) |
| v3 | 2026-05-01 manhã | **6 sub-botões/instrumentos** — kit completo. Detalhado |
| **v4** | **2026-05-01 tarde** | **Versão definitiva.** 6 sub-botões mantidos. Enxuto, open-ended. Pauta de Leitura com termos encurtados |

---

## 8. Pendências menores ainda em aberto

1. **Pauta de Leitura — estrutura combinatória?** 5 termos soltos ou 2 eixos
   combináveis (fase × compreensão)? Implementação vai assumir 2 eixos.
2. **Pauta de Leitura aplica também a Matemática?** Provavelmente só LP, mas não
   confirmado.
3. **Catálogo dos Descritores AVALIA** — asset #1 segue pendente. Sem ele, sub-botões
   1 e 2 (Avaliação Capítulo + Simulado) operam em modo conservador.
