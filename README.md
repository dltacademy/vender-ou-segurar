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

**No ar e indexável** em `https://vender-ou-segurar.dlt.academy/`, servindo `<meta name="robots" content="index, follow">`. O `robots.txt` mantém `Allow: /`, e a ferramenta já está registrada no portal e no `sitemap.xml`.

## Arquitetura

- HTML/CSS/JavaScript vanilla;
- zero backend, zero build e zero dependência externa nova;
- respostas processadas somente no navegador;
- CSP restritiva e JavaScript executável somente em arquivos externos;
- tracking opcional por `?c=<canal>&v=<variante>` com parâmetros sanitizados;
- nenhum contato pessoal exposto: o único canal é o grupo público em `CONFIG.community`.

## O que aparece no fim do resultado

Nenhum ramo termina sem continuação. O que preenche o espaço depende do que a pessoa respondeu:

| Ramo | O que aparece |
|---|---|
| Elegível à oferta | oferta em destaque **+** grupo grátis ao lado, discreto |
| Sem oferta aplicável | grupo grátis em bloco próprio, em destaque |

O peso visual segue quem está ao lado: a oferta é a ação que sustenta o projeto, então o brinde nunca disputa o clique com ela. Onde não há oferta a lógica se inverte — ali o grupo é a ação da vez. Antes desta regra, o ramo sem oferta terminava **sem próximo passo nenhum**, porque esta ferramenta não tem aresta de guia.

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
