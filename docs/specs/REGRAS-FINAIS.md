# Regras Finais para o Sistema

> **Origem:** mensagem da esposa em 2026-04-30, identificada como
> "REGRA FINAL PARA O SISTEMA". São as 4 regras **absolutas** que governam todo o
> comportamento do app SESI Edu.

---

## As 4 regras absolutas + 1 princípio guia (PROMPT MESTRE 2026-05-01)

> O PROMPT MESTRE acrescentou um **5º princípio guia**: **"Sempre pensar na PRATICIDADE
> da professora"**. Não é regra absoluta como as 4 primeiras, mas **princípio que
> orienta todas as decisões de design e implementação**. Quando houver dúvida, escolher
> o caminho mais prático para a usuária.

### 🔒 1. Não inventar conteúdos
O sistema só pode usar o material informado (capítulo, projeto, livro). Nunca
suplementar com conhecimento "geral" do LLM.

### 🔒 2. Não criar descritores
Os Descritores AVALIA (D01, D02…) **só** podem vir do catálogo oficial fornecido pela
esposa. O LLM **NÃO** pode inventar nem inferir descritores. Se o catálogo não estiver
disponível, o app deve **omitir** descritores em vez de criar.

### 🔒 3. Não alterar estrutura
Estruturas fixas (12 seções do PTD, 4 níveis N1-N4, 4/5 eixos das observações/relatórios,
24q do simulado, 10q da avaliação de capítulo) são **inegociáveis**. O LLM não pode
adicionar, remover ou reordenar.

### 🔒 4. Seguir exatamente os documentos enviados
Templates Word, logos, brasões, cartão-resposta, modelo de relatório, catálogo de
descritores — quando fornecidos pela esposa — devem ser **usados como estão**. App
não substitui por "equivalentes próprios".

---

## Implicação na arquitetura

Estas 4 regras devem aparecer:

1. **No system prompt central** (camada DNA SESI) — explicitadas em verbatim
2. **No PROMPT 6 (Corretor)** — auditoria pós-geração checa os 4 itens
3. **No validador determinístico** — checks programáticos das estruturas
4. **No comportamento de fallback** — quando faltar asset (descritor, template), **avisar
   a usuária**, não improvisar

## Implicação no UX

Quando o app não consegue cumprir uma das regras (ex.: falta catálogo de descritores),
deve **informar a usuária** ("Sem o catálogo oficial dos descritores, o app **não vai
gerar** essa parte. Por favor, importe o catálogo nas Configurações.") em vez de
silenciosamente inventar.

---

## Hierarquia de prioridade

Quando houver conflito entre instruções, **estas 4 regras prevalecem** sobre qualquer
outra (incluindo "completude" ou "qualidade pedagógica"). É preferível **entregar
incompleto e correto** do que **completo e inventado**.
