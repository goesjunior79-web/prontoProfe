# Assets institucionais da esposa — pendentes de envio

> **Origem:** mensagem da esposa em 2026-04-30: "DOCUMENTOS QUE PRECISO ENVIAR (ESSENCIAL)
> – Para garantir fidelidade total e evitar invenções."

> **Status:** todos pendentes de envio. Sem eles, o app **vai inventar** estrutura
> visual e descritores — quebrando as regras finais.

---

## 6 documentos a receber

| # | Asset | Por quê | Bloqueia | Recebido? |
|---|---|---|---|---|
| 1 | **Catálogo oficial dos Descritores AVALIA** (PDF ou planilha) | Sem isso, o app inventa descritores → quebra REGRA-FINAL #2 | Módulo 2 (Avaliação) | ❌ |
| 2 | **Template Word oficial do SESI** — Prova Objetiva CE-228 (.docx) | Para exportação fiel | Todos os módulos | ✅ **2026-05-01** — `02-template-word-sesi-prova.docx` + análise em `02-template-word-sesi-analise.md` |
| 2b | **Template Word oficial do SESI** — Plano (PTD) (.docx) | Estrutura do PTD | Módulo 1 | ✅ **2026-05-01** — `02b-template-word-sesi-plano.docx` + análise crítica em `02b-template-word-sesi-plano-analise.md`. **🚨 conflito spec vs template real registrado** |
| 3 | **Logo SESI institucional** (PNG/SVG) | Cabeçalho dos documentos | Todos os módulos | ✅ **2026-05-01** — 2 versões: `03-logo-sesi.jpeg` (completa FIESP/SESI/SENAI/IRS, 341x113) + `03-logo-sesi-simplificada.jpg` (só "SESI" em barra vermelha, 242x113). Decisão de qual usar fica para análise final |
| 4 | **Brasão da escola/unidade** | Cabeçalho dos documentos | Todos os módulos | ❌ |
| 5 | **Modelo de cartão-resposta oficial** | Para o Simulado Avalia (Tela 4) | Módulo 2 | ❌ |
| 6 | **Modelo de relatório final aceito pela escola** (.docx) | Validar template do Módulo 5 | Módulo 5 | ❌ |

### Templates específicos que podem aparecer depois

O template recebido em 2026-05-01 cobre apenas **Prova Objetiva (CE-228)**. Outros
podem vir conforme implementação:
- Template de Avaliação mista (obj + diss)
- Template de Simulado Avalia
- Template de PTD
- Template de Aula Diária/Semanário
- Template de Atividade
- Template de Pauta de Observação / Plenária / Pauta de Leitura / Rubrica
- Template de Relatório Final

---

## Convenção de nome dos arquivos quando chegarem

Ao receber, salvar nesta pasta com nomes padronizados:

| # | Nome de arquivo sugerido | Formato |
|---|---|---|
| 1 | `01-descritores-avalia-oficial.{pdf,xlsx,csv}` | PDF/planilha |
| 2 | `02-template-word-sesi.docx` | .docx |
| 3 | `03-logo-sesi.{png,svg}` | imagem |
| 4 | `04-brasao-escola.{png,svg}` | imagem |
| 5 | `05-cartao-resposta-modelo.{pdf,docx,jpg}` | PDF/.docx/foto |
| 6 | `06-relatorio-final-modelo.docx` | .docx |

---

## Comportamento do app sem esses assets (modo conservador)

Conforme `REGRAS-FINAIS.md`:

- **Sem descritores AVALIA:** app **omite** a coluna/seção de descritores e mostra alerta
  ("Sem catálogo oficial, descritores não serão gerados. Importe nas Configurações.")
- **Sem template Word:** export usa template "genérico SESI" (já existe parcial em
  `lib/planoBuilder.js` e `lib/docBuilder.js`) com aviso "padrão genérico — sem template
  oficial"
- **Sem logo/brasão:** placeholder cinza com texto "[LOGO SESI]" / "[BRASÃO]"
- **Sem cartão-resposta:** Simulado Avalia mostra a prova mas avisa que cartão-resposta
  não pode ser gerado sem o modelo
- **Sem relatório modelo:** usa template inferido das 5 seções da spec, com aviso

> **Princípio:** sempre **avisar** a usuária quando algo está faltando, nunca improvisar
> silenciosamente. Quebrar visualmente é melhor que inventar discretamente.

---

## Após receber os arquivos

Quando chegarem:

1. Salvar nesta pasta com os nomes padronizados acima
2. Atualizar este README marcando como "✅ recebido em DD/MM"
3. Atualizar `docs/specs/GAP-ANALYSIS.md` removendo as pendências correspondentes
4. Avisar Sidney que os blockers foram destravados
5. `@architect` decide o pipeline de incorporação (parsing dos descritores,
   conversão do template, etc.)
