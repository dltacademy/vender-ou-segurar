import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const index = fs.readFileSync(new URL("index.html", root), "utf8");
const robots = fs.readFileSync(new URL("robots.txt", root), "utf8");
const engine = fs.readFileSync(new URL("js/flow-engine.js", root), "utf8");
const bootstrapSource = fs.readFileSync(new URL("js/bootstrap.js", root), "utf8");
const trackingSource = fs.readFileSync(new URL("js/tracking.js", root), "utf8");
const configSource = fs.readFileSync(new URL("config.js", root), "utf8");
const workflows = [
  fs.readFileSync(new URL(".github/workflows/pages.yml", root), "utf8"),
  fs.readFileSync(new URL(".github/workflows/ci.yml", root), "utf8"),
].join("\n");

const canonical = "https://vender-ou-segurar.dlt.academy/";
const image = `${canonical}og-image.png`;
assert.match(index, /<meta name="robots" content="noindex">/);
assert.match(robots, /^User-agent: \*\s+Allow: \/$/m);
assert.match(index, /<meta name="referrer" content="no-referrer">/);
assert.match(index, /Content-Security-Policy/);
assert.equal(index.includes("unsafe-inline"), false);
assert.equal(index.includes("unsafe-eval"), false);
assert.equal(index.includes("meta name=\"keywords\""), false);
assert.match(index, /<script src="js\/bootstrap\.js"><\/script>/);
assert.equal(/<script>(.|\n)*?<\/script>/.test(index), false);
assert.match(index, new RegExp(`<link rel="canonical" href="${canonical}">`));
assert.match(index, new RegExp(`<meta property="og:url" content="${canonical}">`));
assert.match(index, new RegExp(`<meta property="og:image" content="${image}">`));
assert.match(index, new RegExp(`<meta name="twitter:image" content="${image}">`));

const jsonLdMatch = index.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
assert.ok(jsonLdMatch, "JSON-LD precisa existir");
const jsonLd = JSON.parse(jsonLdMatch[1]);
assert.equal(jsonLd["@type"], "WebApplication");
assert.equal(jsonLd.url, canonical);
assert.equal(jsonLd.image, image);

for (const match of index.matchAll(/<a\b([^>]*?)href="(https?:[^"#]+)"([^>]*)>/g)) {
  const attributes = `${match[1]} ${match[3]}`;
  assert.match(match[2], /^https:\/\//, `link externo não HTTPS: ${match[2]}`);
  assert.match(attributes, /rel="[^"]*noopener[^"]*noreferrer[^"]*"/);
  assert.match(attributes, /referrerpolicy="no-referrer"/);
}

assert.equal(engine.includes("innerHTML"), false);
assert.equal(engine.includes("report.html"), false);
assert.match(engine, /sponsored nofollow noopener noreferrer/);
assert.match(engine, /referrerPolicy = "no-referrer"/);

for (const line of workflows.split("\n")) {
  const match = line.match(/uses:\s*[^@\s]+@([^\s#]+)/);
  if (match) assert.match(match[1], /^[0-9a-f]{40}$/, `Action não fixada: ${line}`);
}
assert.match(workflows, /permissions:\s*\n\s*contents: read/);

assert.match(configSource, /allowedVariants:\s*\["a", "b"\]/);
assert.match(configSource, /telegramUsername:\s*""/);
assert.equal(/chamada|revis[aã]o personalizada/i.test(configSource), false);

const trackingSandbox = {
  URL,
  URLSearchParams,
  CONFIG: {
    refDefault: "https://example.com/ref/default",
    refByChannel: { yt: "https://example.com/ref/youtube" },
    allowedVariants: ["a", "b"],
    offers: { default: { url: "https://example.com/ref/default" } },
    telegramUsername: "",
    goatCounterSite: "",
  },
  window: { location: { search: "?c=yt&v=b" } },
  document: { createElement() {}, head: { appendChild() {} } },
};
vm.runInNewContext(
  `${trackingSource}\nglobalThis.__TRACKING__ = { getChannel, getVariant, getSafeExternalUrl, getRefLink };`,
  trackingSandbox
);
const tracking = trackingSandbox.__TRACKING__;
assert.equal(tracking.getChannel(), "yt");
assert.equal(tracking.getVariant(), "b");
assert.equal(tracking.getRefLink(), "https://example.com/ref/youtube");
assert.equal(tracking.getSafeExternalUrl("http://example.com"), "#");
assert.equal(tracking.getSafeExternalUrl("javascript:alert(1)"), "#");

trackingSandbox.window.location.search = "?c=constructor&v=decisao_2026";
assert.equal(tracking.getChannel(), "constructor");
assert.equal(tracking.getVariant(), "a");
assert.equal(tracking.getRefLink(), "https://example.com/ref/default");
trackingSandbox.window.location.search = "?c=%3Cscript%3E&v=variante%20inválida";
assert.equal(tracking.getChannel(), null);
assert.equal(tracking.getVariant(), "a");

let renderedReport;
vm.runInNewContext(bootstrapSource, {
  FLOW: { buildReport: () => ({ convertOverride: { offerKey: "default" } }) },
  document: { getElementById: () => ({}) },
  getOfferLink: () => "#",
  renderFlow: (_root, flow) => { renderedReport = flow.buildReport({}); },
  loadGoatCounter() {},
});
assert.equal(renderedReport.convertOverride, null, "destino inválido não pode renderizar oferta");

for (const source of [engine, trackingSource, bootstrapSource]) {
  assert.equal(/localStorage|sessionStorage|document\.cookie/.test(source), false);
}

console.log("Technical contract: OK — metadata, CSP, links, allowlists, fallback e workflows");
