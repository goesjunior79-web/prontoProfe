# Schema do Banco de Dados — MVP

> **Origem:** mensagem da esposa em 2026-04-30, identificada como
> "BANCO DE DADOS (SIMPLES E SUFICIENTE)". Define o schema mínimo do MVP.

> **Filosofia:** "simples e suficiente" — não over-engineer. Adicionar colunas/tabelas
> só quando uma feature exigir.

---

## 3 tabelas mínimas

### 📌 Tabela: `alunos`

| Campo | Tipo sugerido | Notas |
|---|---|---|
| `id` | uuid (Supabase) ou int auto | PK |
| `nome` | text | Obrigatório |
| `turma` | text | Ex.: "A", "B", "2º A" |

**Migração do app atual:** o `AlunosModal` hoje guarda em `localStorage` chave
`sesi_alunos` com `{ nome, turma, serie, disciplina, obs }`. Migração sugerida:
- `nome`, `turma` → vão direto
- `serie`, `disciplina` → ficam fora desta tabela; viram propriedades do aluno por
  contexto (várias disciplinas/séries podem ter o mesmo aluno) ou ficam em `avaliacoes`
- `obs` (NEE/laudo) → pode virar coluna extra `obs_nee` ou tabela separada

> **Pendente decidir com `@architect`:** schema da esposa é minimal. Manter como está
> (3 colunas) ou estender com `serie`, `obs_nee`, `user_id` (multi-tenant)?

---

### 📌 Tabela: `avaliacoes`

| Campo | Tipo sugerido | Notas |
|---|---|---|
| `id` | uuid | PK |
| `aluno_id` | uuid | FK → alunos.id |
| `componente` | text | Ex.: "Língua Portuguesa", "Matemática" |
| `nivel` | enum / text | "N1" \| "N2" \| "N3" \| "N4" |
| `observacao` | text | Texto livre — observação pedagógica |
| `data` | timestamp | Quando foi a aferição |

**Função:** **histórico longitudinal por aluno por componente**. Cada linha = 1
classificação do aluno num componente em uma data específica, com observação livre.

**Alimenta:**
- Painel N1-N4 (Tela 7) — query agregada por aluno
- Relatório de etapa (Módulo 5) — query histórica por aluno na etapa
- Classificador automático (PROMPT 8) — fonte de `{dados_dos_alunos}`

> Esta é a tabela que **resolve o esquema longitudinal** que o PROMPT 4 propunha
> (`historico: [{data, tipo, texto}]`). A esposa formalizou de forma equivalente.

---

### 📌 Tabela: `planejamentos`

| Campo | Tipo sugerido | Notas |
|---|---|---|
| `id` | uuid | PK |
| `tipo` | enum | "PTD" \| "aula" \| "atividade" \| "avaliacao" |
| `ano` | text | Ex.: "2º ano EF I" |
| `componente` | text | Ex.: "Língua Portuguesa" |
| `capitulo` | text | Nome do capítulo |
| `conteudo_gerado` | text | Output completo do LLM (markdown ou HTML) |

**Função:** repositório de **conteúdos gerados** pelo app, indexáveis por tipo / ano /
componente / capítulo.

**Implicações:**
- Permite **re-baixar** um documento já gerado sem regerar (economia de tokens)
- Permite **histórico de planejamentos** ("quais PTDs eu já fiz pra esse capítulo?")
- Conecta com a Tela 2 (PTD) → Tela 3 (Semanário): o Semanário lê o `conteudo_gerado`
  do PTD ativo

> **Pendente decidir com `@architect`:**
> - Versionamento (várias versões do mesmo PTD? marcar latest?)
> - Soft delete vs hard delete
> - Quem pode ler (multi-tenant: `user_id`?)

---

## Implementação no SESI Edu

### Stack proposto: Supabase (já presente)

`lib/supabase.js` já existe no app. Estender com:
- Migrations SQL para as 3 tabelas
- Row Level Security (RLS) — cada professora vê só os próprios dados
- Triggers/Edge Functions opcionais para auto-cálculos (média do aluno, alertas etc.)

### Migração do `localStorage`

O app atualmente persiste em `localStorage`:
- `sesi_alunos` (cadastro)
- Configs (`cfg`)
- Histórico de gerações (via `lib/db/history.js`)

Plano de migração para Supabase:
1. Criar tabelas
2. Importar `localStorage.sesi_alunos` → `alunos`
3. Importar histórico → `planejamentos`
4. Criar tabela `avaliacoes` do zero (não existe equivalente local)
5. Manter localStorage como cache offline (opcional)

> Pendente decisão `@architect`: estratégia exata de migração.

---

## O que NÃO está no schema (e pode precisar)

A esposa disse "simples e suficiente". Coisas que **não** estão e podem aparecer:

- **`habilidades`** — entidades nomeadas. Hoje tudo vai em `componente` + texto livre.
- **`descritores`** — só vai existir após a esposa enviar o catálogo oficial.
- **`projetos`** — o `ProjetosModal` (commit 7fa6607) usa localStorage. Se ficar no
  MVP, virar tabela.
- **`materiais_didaticos`** — anexos de capítulos. Pode ser Supabase Storage.
- **`tags`/`turmas`** — turmas como entidade própria (hoje só string).

> Adicionar **conforme necessidade real**, não preventivamente. Filosofia da esposa.
