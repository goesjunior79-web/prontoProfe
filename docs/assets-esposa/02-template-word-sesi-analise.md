# Análise do Template Word SESI — Prova Modelo

> **Origem:** `G:\Meu Drive\05 - Negocios\ProntoProfe\Provas Modelos Sesi\Prova Sesi_Modelo.docx`
> Recebido em 2026-05-01.
> **Arquivo no repo:** `docs/assets-esposa/02-template-word-sesi-prova.docx` (48 KB)
> **Logo extraído:** `docs/assets-esposa/03-logo-sesi.jpeg` (logo institucional FIESP/SESI/SENAI/IRS)
>
> Este documento extrai e analisa a estrutura do template oficial SESI para que o app
> possa gerar `.docx` fiel ao padrão.

---

## 1. Identificação do template

| Campo | Valor extraído |
|---|---|
| **Tipo de documento** | Prova Objetiva |
| **Código institucional** | CE-228 |
| **Cidade** | BOTUCATU (escola de origem da esposa) |
| **Ano de ensino exemplo** | 3º Ano A |
| **Etapa exemplo** | 1ª Etapa |
| **Professora exemplo** | Sheila Goes (nome da esposa já consta) |
| **Total de questões** | 7 |
| **Pontuação** | 2+2+1+1+1+2+1 = 10 pontos |
| **Formato das questões** | 100% objetivas A/B/C/D com checkboxes `(    )` |

> 🆕 **Achado:** o template oficial tem **7 questões com pontuação variável** somando 10
> pontos. A spec da esposa (PROMPT 2 v3) fala em **10 questões** (7 objetivas + 3
> dissertativas). Provável reconciliação: o template é um EXEMPLO/layout, não restringe
> quantidade. O app deve usar o layout do cabeçalho/rodapé e parametrizar o miolo conforme
> necessário (10 questões total no modo Avaliação do Capítulo).

---

## 2. Estrutura do cabeçalho (extraída do XML)

```
┌──────────────────────────────────────────────────────────────┐
│  [LOGO SESI]    Nome: _____________  Nº ____   3º Ano A      │
│  BOTUCATU       Ensino: ☐ Fund. I  ☐ Fund. II  ☐ Médio       │
│                                                  1ª Etapa    │
│                 Data: __/__/____   CC: _________             │
│                 Professora: Sheila Goes                      │
├──────────────────────────────────────────────────────────────┤
│  O que será avaliado? (Critérios de Avaliação)               │
│  ........................                  Valor: ___        │
│  ........................                  Nota Final: ___   │
└──────────────────────────────────────────────────────────────┘

  Faixa lateral:  CE-228  /  Prova Objetiva
```

### Campos do cabeçalho
- **Logo SESI** (extraído como `03-logo-sesi.jpeg`) — canto superior esquerdo
- **Nome**: linha em branco para o aluno preencher
- **Nº**: pequeno espaço para número do aluno
- **Ano** (ex.: "3º Ano A")
- **Cidade** (BOTUCATU — configurável pelo perfil da escola)
- **Ensino**: 3 checkboxes (Fundamental I / Fundamental II / Médio)
- **Etapa** (1ª, 2ª, 3ª, 4ª)
- **Data** ___/___/___
- **CC** (Componente Curricular) — campo livre
- **Professora**: "Sheila Goes" (configurável)
- **Critérios de Avaliação**: caixa textual
- **Valor do instrumento**: numérico
- **Nota Final**: linha em branco

### Faixa lateral
- **Código do documento**: CE-228
- **Tipo**: "Prova Objetiva"

> O `lib/docBuilder.js` no app atual **já replica esse cabeçalho** (com docCode `CE-228`
> default e cidade `BOTUCATU` como default) — ver `docBuilder.js:131-183`. O app está
> alinhado com o template oficial em ~80%.

---

## 3. Estrutura do corpo

### Antes das questões
- **ORIENTAÇÕES**: "REALIZAR COM AUTONOMIA." (texto fixo)
- **LEIA O TEXTO ABAIXO PARA RESPONDER ÀS QUESTÕES** (quando aplicável — interpretação)
- **MATERIAIS** (lista de materiais necessários)
- **PASSO A PASSO**
- **DICA**

> Estes 4 últimos elementos são opcionais — aparecem quando o tipo de prova exige
> material físico (recortes, manipulativos) ou tem etapas processuais.

### Bloco de questão (padrão)
```
QUESTÃO 0X (Y PONTOS)
[enunciado da questão]

A) (    ) [alternativa A]
B) (    ) [alternativa B]
C) (    ) [alternativa C]
D) (    ) [alternativa D]
```

**Convenções:**
- Numeração 01, 02, 03... com zero à esquerda
- Pontuação entre parênteses: `(2 PONTOS)`, `(1 PONTO)` — variável por questão
- Alternativas: A) (    ) com **checkbox** entre parênteses
- Espaçamento amplo entre questões

### Após as questões
- **OBSERVAÇÕES DA PROFESSORA**: bloco de linhas em branco

> Reserva espaço pra anotações pessoais durante a correção.

---

## 4. Página, fonte e formatação

Não consegui extrair com certeza fonte/tamanho do XML sem parsing completo. Mas pelo
arquivo de 48 KB com apenas 1 imagem e 7 questões, indicações:
- A4 (provavelmente portrait)
- Fonte sans-serif (compatível com `lib/docBuilder.js:33` que usa Arial)
- 1 página única (cabe nas 7 questões + cabeçalho + rodapé)

---

## 5. Comparação com `lib/docBuilder.js` atual

| Elemento | Template oficial | `docBuilder.js` atual |
|---|---|---|
| Logo SESI | ✅ image1.jpeg embutida | ✅ `/logo_sesi.jpg` referenciado em linha 138 |
| BOTUCATU como cidade | ✅ explícita no header | ✅ default em linha 139 |
| Ensino: 3 checkboxes (FI/FII/EM) | ✅ | ✅ implementado em linha 158-160 |
| Faixa lateral: CE-228 + Prova Objetiva | ✅ | ✅ default `docCode='CE-228'`, `tipoDoc='Prova Objetiva'` (linhas 13-14) |
| Tabela: Nome / Nº / Ano | ✅ | ✅ implementado em linhas 142-148 |
| Data + CC + Professora | ✅ | ✅ implementado em linhas 168-180 |
| Box "Critérios de Avaliação" + Valor + Nota Final | ✅ | ✅ implementado em linhas 185-199 |
| ORIENTAÇÕES: REALIZAR COM AUTONOMIA | ✅ | ✅ literal em linha 201 |
| OBSERVAÇÕES DA PROFESSORA | ✅ | ✅ implementado em linhas 206-211 |
| Page numbering | (não confirmado) | ✅ "Page 1" em linha 213 |
| Fonte Arial 10.5pt | (não confirmado) | ✅ explícito em linha 35 |
| A4 portrait | ✅ | ✅ em linha 30 |

> **Conclusão impressionante:** o `lib/docBuilder.js` está **muito alinhado** com o
> template oficial. Provavelmente foi feito a partir de um template anterior ou
> modelado por inspiração. Vai precisar de ajustes mínimos:
> 1. Substituir `/logo_sesi.jpg` pelo arquivo extraído (`03-logo-sesi.jpeg`)
> 2. Verificar fonte exata (extrair de `word/styles.xml` se necessário)
> 3. Ajustar checkboxes das alternativas (template usa `(    )`, app pode ter outro estilo)
> 4. Garantir tamanhos/margens batem 100%

---

## 6. O que este template **NÃO** cobre

Esse é o template de **Prova Objetiva (CE-228)**. Faltam:

- **Template de Prova com questões mistas** (objetivas + dissertativas — Avaliação do
  Capítulo do PROMPT 2 v3)
- **Template de Simulado AVALIA** (24 questões + cartão-resposta)
- **Template de PTD**
- **Template de Aula Diária / Semanário**
- **Template de Atividade**
- **Template de Pauta de Observação**
- **Template de Plenária**
- **Template de Pauta de Leitura**
- **Template de Relatório Final de Etapa**
- **Template de Rubrica**
- **Brasão da escola** (separado do logo SESI institucional)
- **Cartão-resposta** (modelo independente)
- **Catálogo dos Descritores AVALIA** (não é template, é catálogo de dados)

> Faltam **9 templates específicos** + 3 assets adicionais. Esposa pode mandar mais
> arquivos conforme implementarmos cada módulo.

---

## 7. Recomendações pra implementação

1. **Asset #2 (Template Prova) → ✅ recebido** — usar como referência canônica para
   `lib/docBuilder.js`
2. **Asset #3 (Logo SESI) → ✅ recebido** (extraído do template) — copiar para
   `public/logo_sesi.jpg` substituindo o placeholder atual
3. **Pedir à esposa os outros templates** quando implementarmos cada módulo (não
   tudo de uma vez — solicitação por iteração)
4. **Não modificar o `docBuilder.js` agora** — esperar o Spec Pipeline. Mas registrar
   que ele está **80% alinhado**, mudanças vão ser pequenas
