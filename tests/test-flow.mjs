import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../js/flow.js", import.meta.url), "utf8");
const sandbox = {};
vm.runInNewContext(`${source}\nglobalThis.__FLOW__ = FLOW;`, sandbox);
const flow = sandbox.__FLOW__;

const base = {
  corretora: "outra",
  jaTemBinance: "nao",
  variacao: "lucro",
  motivo: "checando",
  tese: "so-preco",
  sono: "tranquilo",
};

function report(overrides = {}) {
  return flow.buildReport({ ...base, ...overrides });
}

const eligible = report();
assert.ok(eligible.convertOverride, "comparação não urgente e elegível deve ter uma oferta opcional");
assert.match(JSON.stringify(eligible.convertOverride), /parte das taxas elegíveis/i);
assert.match(JSON.stringify(eligible.convertOverride), /contas novas e elegíveis/i);

const blockedRoutes = [
  [{ jaTemBinance: "sim" }, "cliente Binance"],
  [{ corretora: "carteira" }, "carteira própria"],
  [{ motivo: "necessidade" }, "liquidez"],
  [{ motivo: "medo" }, "medo"],
  [{ tese: "tese-mudou" }, "tese alterada"],
  [{ sono: "tira-o-sono" }, "exposição excessiva"],
];
for (const [overrides, label] of blockedRoutes) {
  assert.equal(report(overrides).convertOverride, null, `${label} não recebe CTA`);
}

const verdicts = [
  report({ sono: "tira-o-sono" }).headline,
  report({ motivo: "necessidade" }).headline,
  report({ tese: "tese-mudou" }).headline,
  report({ motivo: "medo", tese: "so-preco" }).headline,
  report({ motivo: "ganancia" }).headline,
  report({ tese: "sem-tese" }).headline,
  report().headline,
];
assert.equal(new Set(verdicts).size, 7, "os sete vereditos existentes devem continuar distintos");

const expectedFields = ["corretora", "jaTemBinance", "variacao", "motivo", "tese", "sono"];
const actualFields = flow.steps.flatMap((step) => step.fields.map((field) => field.id));
assert.deepEqual(actualFields, expectedFields);

const variants = {
  corretora: "carteira",
  jaTemBinance: "sim",
  variacao: "naosei",
  motivo: "necessidade",
  tese: "sem-tese",
  sono: "mais-ou-menos",
};
const baseline = JSON.stringify(eligible);
for (const [field, value] of Object.entries(variants)) {
  assert.notEqual(
    JSON.stringify(report({ [field]: value })),
    baseline,
    `a resposta ${field} precisa alterar relatório, plano ou roteamento`
  );
}

const prohibited = [
  "proibido",
  "padrão clássico",
  "20-30%",
  "20–30%",
  "cashback em toda taxa",
  "sem prazo de validade",
  "pra sempre",
  "verificação de identidade é única",
  "chamada de 15min",
  "revisar minha posição",
];
for (const claim of prohibited) {
  assert.equal(source.toLowerCase().includes(claim.toLowerCase()), false, `claim proibido: ${claim}`);
}

for (const term of ["futuros", "hedge", "short", "liquidação"]) {
  assert.equal(source.toLowerCase().includes(term), false, `redesenho de proteção fora de escopo: ${term}`);
}
assert.equal(/tgLabel|tgPrefill|publicTelegram/.test(source), false, "fluxo não deve prometer contato");

console.log("Flow matrix: OK — 7 vereditos, 6 campos e 6 bloqueios de oferta");
