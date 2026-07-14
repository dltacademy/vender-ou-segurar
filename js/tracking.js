// ============================================================
// Tracking genérico por canal/variante + resolução de link ref.
// Cada ferramenta define seu próprio objeto CONFIG (ver config.example.js)
// com o formato: { refByChannel: {...}, refDefault, telegramUsername,
// goatCounterSite, siteUrl, brand }.
// ============================================================

function getChannel() {
  const params = new URLSearchParams(window.location.search);
  return params.get("c") || null;
}

function getVariant() {
  const params = new URLSearchParams(window.location.search);
  const v = params.get("v");
  return v === "b" ? "b" : "a";
}

function getRefLink() {
  const channel = getChannel();
  if (channel && CONFIG.refByChannel && CONFIG.refByChannel[channel]) {
    return CONFIG.refByChannel[channel];
  }
  return CONFIG.refDefault;
}

function getTelegramLink(prefill) {
  const base = `https://t.me/${CONFIG.telegramUsername}`;
  return prefill ? `${base}?text=${encodeURIComponent(prefill)}` : base;
}

function track(eventName) {
  if (window.goatcounter && window.goatcounter.count) {
    window.goatcounter.count({ path: eventName, event: true });
  }
}

/** Chamar uma vez no final do <body>, depois de CONFIG estar definido. */
function loadGoatCounter() {
  if (!CONFIG.goatCounterSite) return;
  const gc = document.createElement("script");
  gc.async = true;
  gc.setAttribute("data-goatcounter", "https://" + CONFIG.goatCounterSite + ".goatcounter.com/count");
  gc.src = "//gc.zgo.at/count.js";
  document.head.appendChild(gc);
}
