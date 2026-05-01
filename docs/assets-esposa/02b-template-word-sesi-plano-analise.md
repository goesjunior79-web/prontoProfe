# Análise do Template Word SESI — Plano de Trabalho Docente (PTD)

> **Origem:** `C:\projetos\Sesi Edu\public\modelo_plano.docx` — recebido em 2026-05-01.
> **Arquivo no repo:** `docs/assets-esposa/02b-template-word-sesi-plano.docx` (73 KB)
> **Imagem decorativa extraída:** `docs/assets-esposa/04-imagem-template-plano.png`
>
> **🚨 ATENÇÃO:** este template **diverge significativamente** da SPEC das 12 seções
> que a esposa enviou no PROMPT MESTRE. Há **conflito** que precisa ser resolvido
> antes da implementação.

---

## 1. Identificação do template

| Campo | Valor extraído |
|---|---|
| **Tipo de documento** | Plano de Trabalho Docente — 1ª Etapa |
| **Professora** | Sheila Goes |
| **Componente Curricular exemplo** | Língua Portuguesa |
| **Turma/Ano exemplo** | 3º Ano A |
| **Vigência exemplo** | março 2026 |
| **Capítulo exemplo** | Capítulo 2 — Relatos da memória |
| **Imagem decorativa** | Background institucional A4 (triângulos vermelhos + faixa cinza com logo SESI) |
| **Página** | A4 portrait (1240 × 1754 px @ 220 DPI = ~1 página A4) |

---

## 2. ESTRUTURA REAL DO TEMPLATE (na ordem extraída)

⚠ Esta é a estrutura **realmente usada pela esposa hoje**, extraída do `.docx`. Não bate
com a spec das 12 seções.

| # | Seção | Observações |
|---|---|---|
| 1 | **HABILIDADES** | Lista com **códigos BNCC** (EF15LP05, EF03LP24, EF35LP03 etc) |
| 2 | **UNIDADES DO MATERIAL DIDÁTICO** | Cita capítulo, livro complementar, simulado de referência |
| 3 | **OBJETIVOS** | Verbos no infinitivo, lista de 8 objetivos |
| 4 | **EVIDÊNCIAS DE APRENDIZAGEM - INSTRUMENTOS E CRITÉRIOS DE AVALIAÇÃO** | **Combinado em 1 seção, não 2.** Contém Instrumento 1 (Formativa) + Instrumento 2 (Somativa) + Descritores Avalia+ (D1, D3, D10) + Critérios |
| 5 | **AÇÕES A DESENVOLVER PARA ATINGIR OS OBJETIVOS – ATIVIDADES DE APRENDIZAGEM** | **Combinado em 1 seção.** Estações de Aprendizagem com Complexidade Graduada (DUA), 4 estações N1-N4 |
| 6 | **INSERÇÃO DE SIMULADOS AVALIA+ NA ROTINA** | **Não está na spec!** Mini simulados semanais de 5 questões |
| 7 | **ESTRATÉGIA DE AVANÇO POR NÍVEL** | **Não está na spec!** Transições N1→N2, N2→N3, N3→N4 com ações concretas |
| 8 | **PLANEJAMENTO INTEGRADO** | Disciplinas envolvidas + Tema + Ações |
| 9 | **RECURSOS DIDÁTICOS** | **Não está na spec atual** (foi removida na simplificação para 12 seções). Lista: livro estruturado, Chromebooks, plataformas gamificadas (Wordwall, Escola Games), materiais manipuláveis |
| 10 | **FLEXIBILIZAÇÃO DE ESTRATÉGIAS** | **Não está na spec atual.** Equivale à "DIFERENCIAÇÃO PEDAGÓGICA" (também removida). Contém **alunos reais com laudos** (Alice, Bento, Isaque, Kevin, Nicollas) |

---

## 3. 🚨 Conflito: SPEC (12 seções) vs Template Real (10 seções diferentes)

### Estrutura da SPEC (PROMPT 1 v2 + PROMPT MESTRE)
1. IDENTIFICAÇÃO
2. COMPETÊNCIAS
3. HABILIDADES
4. DESCRITORES – AVALIA
5. EXPECTATIVAS DE ENSINO E APRENDIZAGEM
6. OBJETIVOS DE APRENDIZAGEM
7. AÇÕES A DESENVOLVER
8. EVIDÊNCIAS DE APRENDIZAGEM
9. INSTRUMENTOS E CRITÉRIOS DE AVALIAÇÃO
10. INTEGRAÇÕES
11. ATIVIDADES DE APROFUNDAMENTO
12. TAREFAS PERSONALIZADAS / AVANÇAR

### Estrutura do Template Real (10 seções)
1. HABILIDADES (com códigos BNCC)
2. UNIDADES DO MATERIAL DIDÁTICO
3. OBJETIVOS
4. EVIDÊNCIAS – INSTRUMENTOS – CRITÉRIOS (combinado)
5. AÇÕES – ATIVIDADES (combinado)
6. INSERÇÃO DE SIMULADOS AVALIA+
7. ESTRATÉGIA DE AVANÇO POR NÍVEL
8. PLANEJAMENTO INTEGRADO
9. RECURSOS DIDÁTICOS
10. FLEXIBILIZAÇÃO DE ESTRATÉGIAS

### Mapeamento
| SPEC tem | Template tem | Decisão pendente |
|---|---|---|
| IDENTIFICAÇÃO | (cabeçalho com Profa/CC/Turma/Vigência) | É o cabeçalho ou seção? |
| COMPETÊNCIAS | ❌ não tem | Spec acrescenta? |
| HABILIDADES | ✅ HABILIDADES (com códigos BNCC) | Manter formato BNCC |
| DESCRITORES – AVALIA | ⚠ aparece dentro de Evidências (D1, D3, D10) | Seção própria (spec) ou inline (template)? |
| EXPECTATIVAS | ❌ não tem | Spec acrescenta? |
| OBJETIVOS | ✅ OBJETIVOS | OK |
| AÇÕES (separada) | ⚠ combinado com ATIVIDADES | Manter separado (spec) ou combinar (template)? |
| EVIDÊNCIAS (separada) | ⚠ combinado com INSTRUMENTOS+CRITÉRIOS | Manter separado (spec) ou combinar (template)? |
| INSTRUMENTOS E CRITÉRIOS (separada) | (combinado acima) | Idem |
| INTEGRAÇÕES | ✅ PLANEJAMENTO INTEGRADO (nome diferente) | Renomear? |
| ATIVIDADES DE APROFUNDAMENTO | ❌ não como seção própria (parte das Estações N3/N4) | — |
| TAREFAS PERSONALIZADAS / AVANÇAR | ⚠ FLEXIBILIZAÇÃO DE ESTRATÉGIAS (foco em laudo, não em "avançar") | Renomear / repensar? |
| ❌ (não na spec) | ✅ UNIDADES DO MATERIAL DIDÁTICO | Adicionar de volta? |
| ❌ (não na spec) | ✅ INSERÇÃO DE SIMULADOS AVALIA+ | Adicionar? |
| ❌ (não na spec) | ✅ ESTRATÉGIA DE AVANÇO POR NÍVEL (N1→N2, N2→N3, N3→N4) | Adicionar? Riquíssimo |
| ❌ (não na spec — foi removida) | ✅ RECURSOS DIDÁTICOS | Repor? |

> **Resolução pendente:** a esposa precisa decidir qual estrutura é a definitiva.
> **Hipótese provável:** o template real é o que ela usa hoje na prática; a SPEC é o
> que ela queria simplificar. Mas a riqueza pedagógica do template (códigos BNCC,
> Estratégias de Avanço por Nível, Estações Graduadas) é difícil de descartar.

---

## 4. 💎 Achados pedagógicos PRECIOSOS no template

Estes elementos são únicos do template real (não estão na SPEC) e representam
qualidade pedagógica específica:

### 4.1 Códigos BNCC explícitos nas Habilidades
```
EF15LP05 – Planejar texto considerando situação comunicativa, finalidade e interlocutor.
EF15LP06 – Reler e revisar textos aprimorando aspectos de clareza e organização.
EF15LP07 – Editar versão final do texto em suporte adequado.
EF03LP24 – Ler e compreender relatos considerando estrutura e contexto.
EF35LP03 – Inferir informações implícitas em textos.
EF35LP04 – Identificar efeito de sentido decorrente do uso de palavras.
```

> **Implicação:** o app deve usar **catálogo BNCC** (assim como vai usar catálogo
> AVALIA). Habilidades referenciadas pelo código + descrição.

### 4.2 Estações de Aprendizagem com Complexidade Graduada (DUA)

**Metodologia:** Desenho Universal de Aprendizagem com **rotação de estações**.

```
Estação N1 — Foco D1 (Localizar informações explícitas)
   - Sublinhar respostas antes de registrar
   - Completar frases com banco de palavras

Estação N2 — Foco D1 + D3 (literais e inferenciais simples)
   - Explicar significado no contexto
   - Reescrever trecho acrescentando sentimento

Estação N3 — Foco D3 + D10 (organização textual + repertório)
   - Analisar escolha de palavras
   - Reescrever incluindo conectivo

Estação N4 — Foco Análise (pensamento crítico)
   - Analisar efeito de sentido
   - Transformar ponto de vista do texto
```

> Cada estação tem **descritor AVALIA específico** + ações concretas. Pode virar
> componente reutilizável do app: a Estação X é o módulo que detalha o que cada nível
> deve fazer com o material.

### 4.3 Mini simulados semanais (5 questões)
> "Aplicar mini simulados semanais (5 questões). Trabalhar técnica de leitura de
> enunciado. Ensinar estratégia de eliminação de distratores. Corrigir coletivamente
> explicitando raciocínio."

Frequência específica e propósito explícito (familiarizar com formato AVALIA sem
perder intencionalidade).

### 4.4 Estratégia de Avanço por Nível (transições)
```
N1 → N2: Trabalhar textos curtos. Ensinar localizar info. Modelar resposta.
N2 → N3: Estimular justificativa. Exigir ampliação. Trabalhar conectivos.
N3 → N4: Análise lexical. Ampliar produção. Organização argumentativa.
```

> **Conceito-chave:** o app pode oferecer "como fazer aluno avançar de N1 para N2"
> como feature explícita.

### 4.5 Recursos Didáticos detalhados
- Material Estruturado: livro didático específico
- Chromebooks
- Plataformas Gamificadas (Wordwall, Escola Games — com jogo "Desafio dos Descritores")
- Materiais Manipuláveis (cards de leitura, lousa branca, cartazes)

---

## 5. 🔒 Considerações de privacidade

O template tem **nomes reais de alunos com laudos médicos**:
- Alice da Silva Marques (nível silábico sem valor sonoro — escrita copista)
- Bento Maciel (laudo dislexia + apraxia da fala)
- Isaque Camargo (laudo dislexia)
- Kevin Fava (em investigação de TDAH)
- Nicollas Roberto (laudo TDAH)

> **Implicação:** este template é da turma **real** dela. Quando virar template do app:
> - **Anonimizar** (substituir por nomes-placeholder ou variáveis genéricas)
> - **Tratar como referência da estrutura**, não como dados copiados
> - **Não distribuir** este `.docx` literal — é dado pessoal protegido (LGPD)

> Boa prática: **não commitar este `.docx` no Git público**. Considerar adicionar
> `docs/assets-esposa/*.docx` ao `.gitignore` ou colocar versão anonimizada no repo.
> Decisão pra `@architect`/Sidney.

---

## 6. Recomendações

### Para Sidney (decisão antes do Spec Pipeline)
**Pergunta principal:** a estrutura definitiva do PTD do app é:
- (a) **As 12 seções da SPEC** (mais limpa, mais simples)
- (b) **As 10 seções do template real** (rica em conteúdo SESI específico)
- (c) **Híbrida:** 12 seções da spec **incluindo** as preciosidades do template
  (códigos BNCC nas Habilidades, Estações Graduadas em Ações, Estratégia de Avanço por
  Nível como nova seção, Mini Simulados, Recursos Didáticos)

> Recomendação Orion: **(c) híbrida**. As 12 seções da spec dão estrutura limpa, mas as
> preciosidades do template real (BNCC, Estações, Estratégias de Avanço, Recursos)
> precisam estar no app — ou ele entrega menos qualidade que o que ela já produz hoje.
> Não respeitamos o "zerar retrabalho" se o app gera algo MENOS rico que o template
> manual dela.

### Para `@architect` (no Spec Pipeline)
- Modelar **catálogo de códigos BNCC** (similar ao catálogo AVALIA)
- Implementar **Estações Graduadas** como sub-template das Ações
- Tratar **Flexibilização de Estratégias** com schema reutilizável
  (aluno + laudo + estratégias específicas) — conecta com `AlunosModal`
- Aplicar **anonimização** do template antes de subir versão pública

### Para a esposa (próxima rodada de perguntas)
- Confirmar qual estrutura PTD usar (a/b/c acima)
- Reconfirmar status das seções "DESCRITORES AVALIA" como própria ou inline
- Esclarecer se "FLEXIBILIZAÇÃO" do template = "TAREFAS PERSONALIZADAS / AVANÇAR" da spec
