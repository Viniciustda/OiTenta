# Telas — mobile, projeto "Bora Telas" (Flutter)

Fonte: `design/mobile/telas/source/` (zip "Sistema do app Bora"): `Bora Telas.dc.html` (canvas de pranchetas), `Broto.dc.html`, `support.js`. Capturas em `design/mobile/telas/screens/`: cada prancheta 390×844 com deviceScaleFactor 2, mais o canvas inteiro.

O arquivo diz no topo: **"Bloco 1 de 3 · aguardando aprovação — Onboarding em chat"**. Os blocos 2 e 3 não vêm no zip.

UC = `docs/0-casos-de-uso.md` · Fluxo = seção de `docs/0-fluxos.md`.

| # | Tela | O que mostra | Ação que leva a ela | UC | Fluxo |
|---|---|---|---|---|---|
| 00 | Canvas completo | As 3 pranchetas lado a lado, com título e legenda | Abrir `Bora Telas.dc.html` | — | — |
| 01 | Onboarding 1a — boas-vindas (passo 2 de 6) | Chat com o Broto, "Bora!", pergunta "O que mais te trava…?" com chips de resposta | Primeiro acesso, depois do cadastro | UC01 | §1 |
| 02 | Onboarding 1b — horários livres (passo 4 de 6) | Grade seg–dom × **períodos** (manhã 6h–12h, tarde 12h–18h, noite 18h–23h) marcados por toque; "10 períodos · cerca de 20h livres por semana" | Responder a pergunta anterior | UC01 | §1 |
| 03 | Onboarding 1c — limite diário (passo 5 de 6) | Slider "Máximo por dia" (1h–8h), "Eu nunca passo desse limite…" | "Continuar" | UC01 | §1 |

## Observações

- A grade é **por período** (3 por dia), diferente da web e do "Redefinir rotina" do Bora App, que usam grade **por hora**. Para o modelo de tempo decidido (`docs/2-decisoes-mvp.md`, 4c), um período vira uma janela de horário.
- O onboarding aqui tem **6 passos** (a web tem 4) e inclui uma pergunta sobre o que mais trava o usuário, que a web não tem.
- Sem estados interativos: as pranchetas são estáticas (nenhum botão no canvas responde).
- O arquivo usa **cores fixas em hex** (não variáveis CSS). Mapeie para os tokens de `design/tokens.md`.
- `Broto.dc.html` daqui usa nomes de humor em inglês (`sleepy`, `excited`…) e estágio como número 1–5; o da web usa nomes em português.
