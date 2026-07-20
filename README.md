# Vender ou Segurar?

Ferramenta educacional para organizar emoção, risco real, necessidade de liquidez, tese e tamanho da exposição antes de revisar uma posição em cripto.

Este lote preserva os vereditos existentes. Ele não adiciona derivativos, proteção, sinal, previsão ou lógica de campanha.

## Elegibilidade

“Onde a posição está” e “já possui Binance” são perguntas separadas.

A oferta de conta nova é removida para:

- cliente Binance;
- posição em carteira própria;
- necessidade de liquidez;
- mudança de tese;
- decisão motivada por medo;
- posição que afeta sono ou rotina.

Uma comparação opcional de plataforma só aparece no caso estreito em que a pessoa usa outra corretora, não possui Binance, está apenas revisando a decisão, mantém a tese e relata tranquilidade com a exposição.

## Estado de publicação

A ferramenta permanece acessível para revisão, com indexação bloqueada por `<meta name="robots" content="noindex">`. O `robots.txt` usa `Allow: /` para que crawlers possam ler essa diretiva.

O portal e o sitemap não são alterados neste lote.

## Arquitetura

- HTML/CSS/JavaScript vanilla;
- zero backend, zero build e zero dependência externa nova;
- respostas processadas somente no navegador;
- CSP restritiva e JavaScript executável somente em arquivos externos;
- tracking opcional por `?c=<canal>&v=<variante>` com parâmetros sanitizados;
- contato público desabilitado enquanto `telegramUsername` estiver vazio.

## Testes

```bash
python3 -m py_compile security_check.py
python3 security_check.py .
node --check config.js
find js -name '*.js' -print0 | xargs -0 -n1 node --check
node tests/test-flow.mjs
node tests/test-contract.mjs
```

O workflow `Validate` executa esses gates em pull requests. O deploy do GitHub Pages continua restrito a pushes em `main`.

## Gates humanos

Antes de merge ou divulgação:

1. revisar desktop estreito/largo e celular;
2. testar teclado, foco, console, copiar plano e download do card;
3. abrir o link afiliado em sessão deslogada e confirmar benefício, país e elegibilidade;
4. revisar os vereditos como conteúdo educacional, sem ordem personalizada;
5. obter aprovação independente e fazer merge deliberado.

URL canônica: `https://vender-ou-segurar.dlt.academy/`.
