// ============================================================
// Motor genérico de cards em <canvas> — usado tanto pra cards de
// resultado (share de usuário) quanto pra criativos de anúncio.
// Zero dependências. Formatos comuns já prontos em CARD_FORMATS.
// ============================================================

const CARD_FORMATS = {
  square: { width: 1080, height: 1080 }, // Instagram/Telegram feed
  story: { width: 1080, height: 1920 }, // Stories/Reels/TikTok
  feed: { width: 1200, height: 628 }, // Facebook/LinkedIn/X link preview
  og: { width: 1200, height: 630 }, // og:image
};

/**
 * Desenha um card com fundo gradiente + título + estatística grande +
 * linhas de detalhe + rodapé de marca. Retorna o <canvas>.
 *
 * @param {object} opts
 * @param {"square"|"story"|"feed"|"og"|{width,height}} opts.format
 * @param {string} [opts.eyebrow] título pequeno no topo
 * @param {string} opts.headline texto grande de destaque (pode quebrar linha com \n)
 * @param {string} [opts.headlineColor] cor do headline (default verde)
 * @param {string[]} [opts.lines] linhas de texto abaixo do headline
 * @param {boolean} [opts.showFooter=true] mostra "brand · siteUrl"
 * @param {(ctx, w, h) => void} [opts.customDraw] hook pra desenho extra (gráficos, ícones)
 */
function generateCard(opts) {
  const format = typeof opts.format === "string" ? CARD_FORMATS[opts.format] : opts.format;
  const { width, height } = format;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  drawCardBackground(ctx, width, height);

  if (opts.customDraw) opts.customDraw(ctx, width, height);

  const cx = width / 2;
  ctx.textAlign = "center";

  let y = height * 0.12;

  if (opts.eyebrow) {
    ctx.fillStyle = "#e2e8f0";
    ctx.font = `600 ${Math.round(width * 0.033)}px system-ui, sans-serif`;
    ctx.fillText(opts.eyebrow, cx, y);
    y += height * 0.07;
  }

  ctx.fillStyle = opts.headlineColor || "#4ade80";
  const headlineSize = Math.round(width * (opts.headlineSizeRatio || 0.075));
  ctx.font = `900 ${headlineSize}px system-ui, sans-serif`;
  const headlineLines = String(opts.headline).split("\n");
  headlineLines.forEach((line) => {
    ctx.fillText(line, cx, y);
    y += headlineSize * 1.08;
  });

  y += height * 0.02;

  if (opts.lines && opts.lines.length) {
    ctx.fillStyle = "#cbd5e1";
    ctx.font = `500 ${Math.round(width * 0.026)}px system-ui, sans-serif`;
    opts.lines.forEach((line) => {
      ctx.fillText(line, cx, y);
      y += height * 0.045;
    });
  }

  if (opts.showFooter !== false) {
    drawCardFooter(ctx, width, height);
  }

  return canvas;
}

function drawCardBackground(ctx, width, height) {
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, "#0f172a");
  grad.addColorStop(1, "#1e1b4b");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

function drawCardFooter(ctx, width, height) {
  ctx.textAlign = "center";
  const cx = width / 2;
  ctx.font = `600 ${Math.round(width * 0.028)}px system-ui, sans-serif`;
  ctx.fillStyle = "#818cf8";
  ctx.fillText("Teste em:", cx, height * 0.855);
  ctx.font = `700 ${Math.round(width * 0.031)}px system-ui, sans-serif`;
  ctx.fillStyle = "#e2e8f0";
  ctx.fillText(CONFIG.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""), cx, height * 0.895);
  ctx.font = `500 ${Math.round(width * 0.022)}px system-ui, sans-serif`;
  ctx.fillStyle = "#64748b";
  ctx.fillText(CONFIG.brand, cx, height * 0.93);
}

function downloadCanvasAsPng(canvas, filename) {
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  });
}
