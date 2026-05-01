# Checklist de Validação do App (Uso Real)

> **Origem:** mensagem da esposa em 2026-04-30, identificada como
> "CHECKLIST DE VALIDAÇÃO DO APP (USO REAL)". Define os 18+ checks a serem feitos pelo
> validador (determinístico + LLM) antes de a usuária confiar num material gerado.

> Esse checklist substitui o validador hipotético que eu propus no GAP-ANALYSIS — agora
> temos a fonte oficial dos critérios.

---

## 6 Categorias × 18+ Checks

### 📌 1. ESTRUTURA (OBRIGATÓRIO)

- [ ] Todas as seções do PTD estão presentes
- [ ] Nenhum título foi alterado
- [ ] Ordem das seções está correta
- [ ] Aula diária segue **início → desenvolvimento → fechamento**

**Tipo de validação:** determinística (regex/comparação de strings)

---

### 📌 2. CONTEÚDO (CRÍTICO)

- [ ] Não inventou conteúdo fora do capítulo
- [ ] Habilidades estão corretas (do material)
- [ ] Descritores Avalia **NÃO foram inventados**
- [ ] Atividade principal condiz com o capítulo

**Tipo de validação:** LLM (PROMPT 6 — Corretor) + comparação semântica com material
extraído via `ProjetosModal`

---

### 📌 3. INTENCIONALIDADE (NÍVEL ESPECIALISTA)

- [ ] Objetivo está claro (verbo no infinitivo)
- [ ] Há previsão de dificuldade do aluno
- [ ] Existe intervenção pedagógica descrita
- [ ] Diferenciação N1–N4 está presente

**Tipo de validação:** misto — determinística para "verbo no infinitivo" e presença dos
níveis; LLM para qualidade da previsão e intervenção

---

### 📌 4. TEMPO (SUA REALIDADE)

- [ ] Aula cabe em 50 minutos
- [ ] Sem excesso de atividade
- [ ] Semana está distribuída corretamente

**Tipo de validação:** determinística (soma cronométrica) + LLM (qualidade do excesso)

---

### 📌 5. AVALIAÇÃO (ESSENCIAL)

- [ ] Avaliação formativa está clara
- [ ] Evidência de aprendizagem é observável
- [ ] Avaliação somativa está coerente

**Tipo de validação:** LLM (PROMPT 6) — checa qualidade descritiva

---

### 📌 6. PADRÃO SESI (FINAL)

- [ ] Formato pronto para Word
- [ ] Linguagem pedagógica adequada
- [ ] Documento utilizável sem retrabalho

**Tipo de validação:** mista — determinística (export .docx funciona) + LLM (linguagem)

---

## Implementação proposta

### Fluxo de geração com validação

```
1. Gera v1 (PROMPT N do módulo)
2. Roda PROMPT 6 (Corretor) → v2
3. Validador determinístico checa categorias 1, 4 e 6
4. Se falhar → regenera (max 3 tentativas)
5. LLM auditor checa categorias 2, 3 e 5
6. Se passar → exporta .docx
7. Se v2 final tem warnings → mostra checklist com items "?" pra usuária revisar
```

### UI proposta

Antes de baixar o .docx, mostrar **um painel de checklist visual**:
- ✅ verde — passou
- ⚠️ amarelo — passou mas precisa revisão (LLM teve baixa confiança)
- ❌ vermelho — falhou (não deveria chegar aqui se tudo correu bem)

A usuária pode "Confiar e baixar" mesmo com ⚠️, mas vê os itens.

### Conexão com REGRAS-FINAIS.md

Os checks **2.1** ("não inventou conteúdo"), **2.3** ("descritores não foram inventados")
e **1.1-1.3** ("estrutura não foi alterada") são as 4 regras finais traduzidas em checks
acionáveis.
