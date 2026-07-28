// ============================================================
// CONFIG — copie pra config.js e edite. É o ÚNICO arquivo que
// precisa ser tocado pra lançar uma ferramenta nova (regra do kit).
// ============================================================

const CONFIG = {
  // Link de afiliado padrão — usado quando não há ?c= reconhecido
  refDefault: "https://www.binance.com/register?ref=BOSS2026",

  // Um link ref por canal/campanha — rastreamento por origem (1 ref por canal).
  // Chave = valor do parâmetro ?c= na URL. Edite/adicione livremente.
  refByChannel: {
    grupos: "https://www.binance.com/register?ref=BOSS2026",
    whats: "https://www.binance.com/register?ref=BOSS2026",
    yt: "https://www.binance.com/register?ref=BOSS2026",
    bio: "https://www.binance.com/register?ref=BOSS2026",
    "tg-ads": "https://www.binance.com/register?ref=BOSS2026",
  },

  // Comunidade oficial da marca. Entra como brinde discreto ao lado da oferta
  // e, no ramo sem oferta, sustenta sozinha a continuação — que aqui é o
  // unico proximo passo, porque esta ferramenta nao tem aresta de guia.
  // Nunca é contato pessoal: sempre grupo público.
  community: {
    url: "https://t.me/dltacademy",
    label: "Entrar grátis no grupo →",
    tag: "Grátis",
    headline: "Continue com quem está no mesmo caminho",
    sub: "Grupo aberto da DLT Academy: dúvidas, conteúdos novos e avisos de golpe. Sem custo e sem cadastro.",
  },

  // Código de site do GoatCounter (goatcounter.com — grátis, sem cookies)
  goatCounterSite: "",

  // URL pública final do site (preencher após o deploy — usada em cards/OG)
  siteUrl: "https://SEU_USUARIO.github.io/NOME_DO_REPO/",

  // Marca
  brand: "dltacademy",
};
