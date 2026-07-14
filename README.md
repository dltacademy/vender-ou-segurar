# Vender ou Segurar? — descubra se é decisão ou pânico

4 perguntas rápidas pra saber se vender agora é uma decisão racional ou uma reação emocional — grátis, sem cadastro, roda no seu navegador.

Construído com o [ferramenta-kit](https://github.com/dltacademy/ferramenta-kit) — página única, zero backend, zero build.

## Antes de divulgar

1. Copiar `config.example.js` → `config.js` e preencher: links ref por canal, username do Telegram, código do GoatCounter.
2. `og-image.png` (1200x630) de marca já vem pronto. Opcional: gerar um específico pra esta ferramenta com `generateCard({format:"og", ...})` do `js/canvas-cards.js` e sobrescrever.
3. Habilitar GitHub Pages no repo (Settings → Pages → Source: GitHub Actions).
4. Testar local: `python3 -m http.server 8000`.
5. Divulgar com `?c=<canal>` em cada lugar diferente pra rastrear conversão por origem.

## Estrutura

Ver o [README do kit](https://github.com/dltacademy/ferramenta-kit) pra entender o padrão completo.
