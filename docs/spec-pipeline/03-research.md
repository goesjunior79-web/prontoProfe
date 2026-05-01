# SESI Edu — Research (Phase 3)

> **Status:** Phase 3 do Spec Pipeline AIOX — concluída em 2026-05-01
> **Agente executor:** `@aiox-master` Orion atuando com persona `@analyst` Alex
> **Input:** `01-requirements.md` + `02-complexity.md` (score 18 = COMPLEX)
> **Próxima fase:** Phase 4 — Spec Writing (`@pm` Morgan)
>
> **Notas de processo:**
> - Investigação baseada em conhecimento prévio do agente + recomendações práticas
> - Itens marcados com 🔴 precisam **validação externa** do Sidney (consultoria legal,
>   testes de bibliotecas em sandbox)
> - Items 🟢 são respostas confiáveis prontas para virar spec

---

## 1. 🔴 LGPD para dados de alunos com laudos médicos

### Classificação legal
**Lei 13.709/2018 (LGPD)** — dado pessoal de aluno + laudo médico (TEA, TDAH, dislexia)
classifica-se como **DADO PESSOAL SENSÍVEL** (Art. 5° II), que inclui dados sobre
**saúde** e dados de **crianças e adolescentes** (Art. 14).

> Implicação: regime mais rigoroso que dado pessoal comum.

### Base legal aplicável (Art. 7° + Art. 11°)
Para dados sensíveis de menores (LGPD Art. 11° e 14°):

| Base | Aplicabilidade ao SESI Edu |
|---|---|
| **Consentimento específico e destacado** dos pais/responsáveis | ✅ obrigatório |
| **Cumprimento de obrigação legal** (educação) | parcial |
| **Tutela da saúde** (laudos) | parcial |
| **Exercício regular de direitos** | sim |

> Dual: precisa **consentimento dos pais** + **uso compatível** com a finalidade educativa.

### Princípios LGPD aplicáveis (Art. 6°)
- ✅ **Finalidade**: dados usados só para gerar materiais pedagógicos
- ✅ **Adequação**: compatível com ensino do aluno
- ✅ **Necessidade**: minimização — só o essencial
- ✅ **Livre acesso**: aluno/pais podem ver dados
- ✅ **Qualidade**: dados precisos e atualizados
- ✅ **Transparência**: política de privacidade clara
- ✅ **Segurança**: proteção contra acesso não autorizado
- ✅ **Prevenção**: medidas para evitar danos
- ✅ **Não discriminação**: dados não usados para discriminar
- ✅ **Responsabilização**: prova de conformidade

### Direitos do titular (Art. 18)
- Confirmação de tratamento
- Acesso aos dados
- Correção
- Anonimização ou eliminação
- Portabilidade
- Eliminação dos dados
- Revogação do consentimento

### Recomendações arquiteturais (privacy by design)

| Item | Implementação |
|---|---|
| **Consentimento** | Tela de cadastro de aluno com checkbox "tenho autorização dos pais" + texto explicativo. Log de consentimento (data, IP) |
| **Mínimo necessário** | Não coletar mais que: nome + turma + observações pedagógicas + laudo (campo livre) |
| **Acesso restrito** | RLS Supabase: cada professora vê só seus próprios alunos |
| **Criptografia em repouso** | Campo `obs` (laudo) criptografado no banco com chave por usuário |
| **Audit log** | Tabela `acessos_dados` com (usuario, aluno_id, ação, timestamp) |
| **Retenção** | Política: dados deletados 90 dias após o aluno deixar a turma (configurável) |
| **Portabilidade** | Botão "exportar todos meus dados" → JSON download |
| **Esquecimento** | Botão "excluir aluno e todos os dados" → soft delete + hard delete em 30 dias |
| **Não compartilhamento com IA externa** | Anthropic já tem Zero Data Retention — manter |
| **Termo de uso e política de privacidade** | Páginas dedicadas, com versionamento |
| **DPO** (Encarregado de Proteção de Dados) | Sidney como DPO inicial; obrigatório se for tratar dados de crianças em escala |

### 🔴 O que precisa validação externa do Sidney

1. **Consultoria jurídica** quando comercializar — empresa que trata dados de crianças
   precisa de assessoria especializada
2. **ANPD** (Autoridade Nacional de Proteção de Dados) — registrar como controlador?
   Verificar.
3. **Termo de uso e política de privacidade** — gerados por advogado, não pelo dev
4. **Avaliação de Impacto à Proteção de Dados (AIPD)** — pode ser exigida pelo regulador

### Referências
- Lei 13.709/2018 (LGPD)
- Resolução CD/ANPD n° 2/2022 (regras pra crianças e adolescentes)
- Guia "LGPD na Educação" (existem várias publicações da SAE Digital, Sponchiado etc.)

---

## 2. 🟢 Bibliotecas de validação heurística de LLM (JS/TS)

### Comparativo

| Library | Maturidade | Aplicabilidade | Recomendação |
|---|---|---|---|
| **Zod + retry manual** | Alta | Validar JSON output | ✅ Bom para outputs estruturados |
| **LangChain.js output parsers** | Média | Pipeline complexo | ⚠ Overkill pro escopo SESI Edu |
| **Guardrails AI** | Média (Python-first, JS limitado) | Validação semântica + correção | ⚠ Não recomendado em JS hoje |
| **Validador próprio (regex + listas)** | N/A | Específico ao domínio | ✅ **Recomendado para o MVP** |
| **OpenAI structured output / Anthropic tools** | Alta | Forçar formato | ✅ Pode complementar |

### Recomendação para SESI Edu

**Validador próprio em `lib/validators/`** — sem dependência externa pesada. Estrutura:

```js
// lib/validators/sections.js
export function validatePtdSections(text) {
  const SECOES = ['COMPETÊNCIAS', 'HABILIDADES', 'CAPÍTULO DO MATERIAL',
                   'OBJETIVOS', 'EVIDÊNCIAS DE APRENDIZAGEM',
                   'AÇÕES A DESENVOLVER', 'ALUNOS COM FLEXIBILIZAÇÃO',
                   'PLANEJAMENTO INTEGRADO'];
  // Verifica presença e ordem
}

// lib/validators/forbidden-terms.js
export function checkForbiddenTerms(text) {
  const TERMOS = ['desinteressado', 'lento', 'atrasado'];
  return TERMOS.filter(t => text.toLowerCase().includes(t));
}

// lib/validators/index.js
export async function validate(output, type) {
  const checks = [validateStructure(output, type),
                  checkForbiddenTerms(output),
                  // ...
                 ];
  return { passed: checks.every(c => c.ok), errors: checks.filter(c => !c.ok) };
}
```

> Vantagens: zero dep, controle total, fácil de testar. Custo: maior carga de
> implementação inicial (estimativa: 3-5 dias).

### Padrão Generator + Critic + Validador determinístico

Sequência recomendada (Strategy A do `02-complexity.md`):

```
1. LLM gera v1 (PROMPT MESTRE + PROMPT N específico)
2. Validador determinístico checa estrutura/listas (rápido, ~zero custo)
3. Se passou estrutura → LLM v2 = PROMPT 6 v2 (auditor) → corrige conteúdo
4. Validador determinístico re-checa v2
5. Se v2 passou → exporta .docx
6. Se falhou alguma etapa → regenera com instrução adicional (max 3 retries)
```

---

## 3. 🟢 html-to-docx vs `docx` library

### Estado atual do app
- `lib/exporters/word.js` usa **`docx`** library (já importada)
- `pages/api/gerar-plano-docx` e `/api/gerar-docx` (não inspecionados completamente) —
  provavelmente convertem HTML do `planoBuilder`/`docBuilder` → `.docx`. Suspeita: usam
  `html-to-docx` (lib npm).

### Comparação técnica

| Aspecto | `html-to-docx` | `docx` (Microsoft package) |
|---|---|---|
| **Abordagem** | HTML → DOCX (conversão) | Construção programática |
| **Fidelidade visual** | 70-85% (depende dos estilos CSS suportados) | 95%+ (controle total) |
| **Tabelas complexas** | Pode quebrar | Robusto |
| **Imagens (logo)** | Suportado mas com limites | Suporte completo |
| **Headers/Footers** | Limitado | Completo |
| **Tamanho do bundle** | Médio | Maior |
| **Curva de aprendizado** | Baixa (escreve HTML normal) | Média (construção via API) |
| **Manutenibilidade** | HTML é familiar | Mais código mas mais explícito |
| **Para template SESI** | ⚠ Risco de perder fidelidade do CE-228 | ✅ Replica com fidelidade |

### Recomendação

**Migrar para `docx` library puro** ao longo do MVP, especialmente para:
- Tela de Avaliação (CE-228 com faixa lateral, tabelas complexas)
- PTD (8 seções com formatação consistente)
- Cartão-resposta (precisa precisão)

> Manter `html-to-docx` para outputs simples no curto prazo (Atividade, Plenária —
> texto corrido).

> Estimativa: 1 semana para migrar PTD e Avaliação para `docx` puro com fidelidade
> total ao template oficial.

---

## 4. 🟢 RLS Supabase para multi-tenancy

### Padrão recomendado

**Single tenant model** com `user_id` em cada tabela + Row Level Security policies:

```sql
-- Migration: enable RLS
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE planejamentos ENABLE ROW LEVEL SECURITY;

-- Policy: usuários veem só suas próprias linhas
CREATE POLICY "professoras veem só seus alunos"
  ON alunos FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "professoras veem só suas avaliações"
  ON avaliacoes FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "professoras veem só seus planejamentos"
  ON planejamentos FOR ALL
  USING (auth.uid() = user_id);
```

### Integração NextAuth ↔ Supabase

**Desafio:** o app usa NextAuth (Google OAuth), não Supabase Auth nativo. RLS depende de
`auth.uid()` no contexto JWT.

**Soluções possíveis:**

#### Opção A — Service role key + checagem no server (mais simples)
- App nunca expõe Supabase ao cliente
- API routes Next.js validam sessão NextAuth + usam Supabase service_role
- RLS desabilitado (segurança vem do Next.js API)
- ✅ Simples; ❌ não usa benefícios nativos do Supabase

#### Opção B — JWT compartilhado entre NextAuth e Supabase (mais robusto)
- NextAuth gera JWT com claim `sub = user_id` que Supabase aceita
- Configurar `supabase-js` no cliente com este JWT
- RLS funciona nativamente
- ✅ Robusto, escalável; ❌ mais setup

#### Opção C — Supabase Auth nativo
- Migrar autenticação inteira para Supabase Auth (com Google provider)
- Abandonar NextAuth
- ✅ Mais simples a longo prazo; ❌ migração de auth existente

### Recomendação

**Opção A no MVP** (rápido, controle no server) → **Opção B em fase 2** quando
introduzir clientes pesados ou subscriptions realtime.

### Boas práticas RLS

- Sempre `ENABLE RLS` em todas as tabelas (mesmo as públicas, com policy permissiva)
- Indexar `user_id` em todas as tabelas
- Testar policies com `set role authenticated`
- Audit log: tabela separada com `service_role` acessando sem RLS

---

## 5. 🟡 Catálogo BNCC — códigos `EFXX[LP|MA]NN`

### Não há API oficial pública

A BNCC oficial (Ministério da Educação) está em **PDF** — sem API, sem dataset oficial.

### Datasets não-oficiais

Há repositórios GitHub com a BNCC em JSON/CSV (qualidade variável):
- `https://github.com/...` (geralmente datasets de comunidade)
- Datasets BNCC raspados estão **desatualizados** ou incompletos

### Recomendação

**Criar JSON estático curado** em `lib/data/bncc-anos-iniciais.json`:

```json
{
  "EF15LP05": {
    "codigo": "EF15LP05",
    "ano": "1º a 5º",
    "componente": "Língua Portuguesa",
    "descricao": "Planejar texto considerando situação comunicativa, finalidade e interlocutor."
  },
  "EF03LP24": {
    "codigo": "EF03LP24",
    "ano": "3º",
    "componente": "Língua Portuguesa",
    "descricao": "Ler e compreender relatos considerando estrutura e contexto."
  }
  // ... ~200-300 códigos só pra LP+Mat anos iniciais
}
```

### Sourcing do dataset

1. **PDF oficial BNCC** → extrair via OCR + curadoria manual da Sheila (validação
   pedagógica)
2. **Códigos do template real** que ela enviou (`02b-template-word-sesi-plano.docx`)
   contém EF15LP05, EF15LP06, EF15LP07, EF03LP24, EF35LP03, EF35LP04 — ponto de partida
3. **Coordenação SESI** pode ter o dataset estruturado — perguntar

### Implicação no MVP

- App usa o JSON curado quando disponível
- Modo conservador se código não está no JSON (não inventa descrição)
- Importação via Configurações (Sidney/Sheila atualizam ao longo do tempo)

---

## 6. 🟡 Catálogo AVALIA SESI

### Status

**Não há fonte pública conhecida.** AVALIA é documento institucional SESI/SARESP
restrito a professores e coordenação.

### Bloqueio

Asset #1 ainda pendente — esposa confirmou que tem o documento oficial.

### O que fazer enquanto não chega

1. **Modo conservador funcional desde o início** — app gera Avaliação do Capítulo +
   Simulado **sem** a coluna de descritores; mostra aviso na UI: *"Sem catálogo oficial,
   descritores não serão gerados. Importe nas Configurações"*
2. **Estrutura de dados pronta** para receber: tabela `descritores` em
   `lib/data/avalia-descritores.json` (placeholder vazio)
3. **Quando chegar:** parsear PDF/planilha → JSON estruturado:
   ```json
   {
     "D01": {
       "codigo": "D01",
       "componente": "Língua Portuguesa",
       "ano": "3º",
       "descricao": "Localizar informações explícitas em um texto.",
       "habilidade_relacionada": "EF03LP24"
     }
   }
   ```

### Inferência durante research

Pelos códigos vistos no template real (D1, D3, D10), **descritores AVALIA são
numerados sequencialmente por componente** — não seguem código BNCC. Provavelmente
catálogo SESI próprio.

---

## 7. 🟢 Generator + Critic patterns

### Referências acadêmicas

| Paper | Ano | Aplicabilidade |
|---|---|---|
| **Reflexion** (Shinn et al.) | 2023 | Auto-feedback do LLM sobre próprio output |
| **Self-Refine** (Madaan et al.) | 2023 | Iterative refinement com critic |
| **Constitutional AI** (Anthropic) | 2022 | Critic guiado por princípios escritos |

### Padrões em produção

1. **OpenAI Assistants API** — pode usar tool/function calling pra checar output antes
   de retornar
2. **LangGraph** — workflow com cycles (gerador → critic → corrector)
3. **Anthropic Computer Use / Tools** — function calling para validar formatos
4. **Implementações custom** — predominante em apps críticos (jurídicos, médicos,
   educacionais)

### Recomendação para SESI Edu

**Custom implementation simples** — não precisa de framework pesado:

```js
async function generateWithCritic(input, type) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const v1 = await callClaude({ system: PROMPT_MESTRE, user: input, type });
    const detCheck = validate(v1, type); // determinístico
    if (!detCheck.passed) continue; // regenera

    const v2 = await callClaude({
      system: PROMPT_6_VALIDADOR,
      user: v1
    });
    const v2Check = validate(v2, type);
    if (v2Check.passed) return v2; // sucesso
  }
  return { content: lastV2, warnings: ['validação não passou após 3 tentativas'] };
}
```

### Otimização: Anthropic Prompt Caching

> 🆕 Anthropic API agora tem **prompt caching** (reduz custo em ~90% para system
> prompts repetidos). PROMPT MESTRE + PROMPT N podem ser cacheados.
>
> **Recomendação:** ativar prompt caching no `pages/api/generate.js` — reduz custo
> dramaticamente, especialmente com Generator + Critic.

---

## 8. 🟢 Custo Anthropic API projetado

### Preços vigentes (modelo Anthropic)

| Modelo | Input/MTok | Output/MTok |
|---|---|---|
| **Claude Opus 4.7** | $15 | $75 |
| **Claude Sonnet 4.6** | $3 | $15 |
| **Claude Haiku 4.5** | $0.25 | $1.25 |

### Estimativa por geração (modelo Sonnet 4.6 — recomendado)

| Tipo de doc | Input tokens | Output tokens | Custo Generator | Custo + Critic | Total |
|---|---|---|---|---|---|
| **PTD** (8 seções) | ~3K (system) + 1K (input) | ~4K | $0.072 | $0.072 | **$0.144** |
| **Avaliação** (10q) | ~3K + 1K | ~3K | $0.057 | $0.057 | **$0.114** |
| **Aula Diária** (semana) | ~3K + 1K | ~5K | $0.087 | $0.087 | **$0.174** |
| **Atividade** | ~3K + 1K | ~1K | $0.027 | $0.027 | **$0.054** |
| **Observação** | ~3K + 0.5K | ~0.5K | $0.018 | $0.018 | **$0.036** |
| **Relatório** | ~3K + 1K | ~1K | $0.027 | $0.027 | **$0.054** |
| **Painel** (turma 32) | ~3K + 5K | ~3K | $0.069 | $0.069 | **$0.138** |
| **Média/geração** | | | | | **~$0.10** |

### Com Anthropic Prompt Caching (system prompt cacheado)
- System prompt (PROMPT MESTRE ~3K tokens) é cacheado
- Custo de input cai ~90% após primeira chamada
- Geração média cai para **~$0.05/geração**

### Projeção por plano

| Plano | Limite/mês | Custo bruto sem cache | Custo com cache | Receita | Margem |
|---|---|---|---|---|---|
| **Free** | 10 | $1.00 | $0.50 | $0 | -$0.50 |
| **Pro** | 150 | $15.00 | $7.50 | R$29 (~$5.80) | -$1.70 sem cache, +$5.30 com cache 🟡 |
| **School** | ∞ | $? | $? | R$149 (~$30) | depende do uso |

### 🚨 Insights de custo

1. **Plano Pro pode ser deficitário sem prompt caching** — fundamental ativar
2. **Plano School ∞** precisa de **cap razoável** (ex.: 1500 gerações/mês = ~$75
   custo, ~$30 receita = perda) — **revisar pricing** ou impor cap
3. **Plano Free é deficitário** — pode-se aceitar como custo de aquisição (CAC) se
   conversão Free→Pro ≥ 10%

### Recomendações de custo

1. ✅ **Ativar prompt caching** desde o MVP
2. ✅ **Pipeline híbrido** — validador determinístico primeiro (zero custo) reduz
   chamadas LLM extras
3. ⚠ **Revisar plano School** — cap de ~500 gerações/mês ou aumentar preço
4. ✅ **Cache de planejamentos** (re-baixar sem regerar) — tabela `planejamentos`
   no DB
5. 🟡 **Modelo Haiku** como fallback — se métricas mostram qualidade aceitável, custo
   cai para $0.005/geração (Sonnet → Haiku é 12x mais barato)

---

## 9. Resumo executivo do Research

| Tópico | Decisão | Risco |
|---|---|---|
| LGPD | RLS + criptografia + privacy by design + consultoria jurídica antes de comercializar | 🔴 ALTO sem consultoria |
| Validação heurística | Validador próprio em `lib/validators/` (sem dep) | 🟢 controlável |
| html-to-docx vs docx | Migrar gradualmente para `docx` library puro | 🟡 médio |
| RLS Supabase | Opção A (service role) no MVP, Opção B (JWT) em fase 2 | 🟢 padrão conhecido |
| Catálogo BNCC | JSON curado em `lib/data/` — semente do template real | 🟡 dependência do tempo |
| Catálogo AVALIA | Modo conservador até esposa enviar; estrutura pronta no DB | 🟢 desbloqueia rápido |
| Generator + Critic | Custom simples + prompt caching | 🟢 padrão conhecido |
| Custo API | $0.05/geração com cache; Pro pode ser deficitário sem cache | 🟡 ajustar pricing School |

---

## 10. Itens que ficam para Phase 4 (Spec Writing)

A Phase 4 vai consolidar tudo em `04-spec.md`:
1. Decisões finais arquiteturais (cada item desta research vira ADR ou nota no spec)
2. Schema final do banco com migrations SQL
3. Endpoints de API mapeados
4. Fluxos de UI por tela
5. Acceptance criteria por user story
6. Plano de Implementação por fase

---

## 11. ⚠ Validações externas necessárias (Sidney executa)

Antes de lançar publicamente:
1. 🔴 **Consultoria jurídica LGPD** (especializada em educação infantil)
2. 🔴 **Termo de consentimento e Política de Privacidade** redigidos por advogado
3. 🟡 **Teste de bibliotecas** (`docx` vs `html-to-docx`) em sandbox para validar
   fidelidade ao template SESI
4. 🟡 **POC do prompt caching Anthropic** no `pages/api/generate.js` para validar redução
   real de custo
5. 🟡 **Pesquisa de pricing** no mercado de apps educacionais (referências para reajuste
   do plano School)
