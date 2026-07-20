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

const exactVerdicts = [
  [{ sono: "tira-o-sono" }, "A exposição pode estar maior que sua tolerância"],
  [{ motivo: "necessidade" }, "A decisão começa pela necessidade de liquidez"],
  [{ tese: "tese-mudou" }, "Uma mudança de tese merece revisão consciente"],
  [{ motivo: "medo", tese: "so-preco" }, "O medo pode estar conduzindo a decisão"],
  [{ motivo: "ganancia" }, "Realização parcial é uma alternativa possível"],
  [{ tese: "sem-tese" }, "Falta um critério para manter ou vender"],
  [{}, "Você pode revisar sem agir agora"],
];
for (const [overrides, expectedHeadline] of exactVerdicts) {
  assert.equal(report(overrides).headline, expectedHeadline);
}
assert.equal(new Set(exactVerdicts.map(([overrides]) => report(overrides).headline)).size, 7);

assert.equal(
  report({ sono: "tira-o-sono", motivo: "necessidade", tese: "tese-mudou" }).headline,
  "A exposição pode estar maior que sua tolerância",
  "impacto no sono tem precedência"
);
assert.equal(
  report({ motivo: "necessidade", tese: "tese-mudou" }).headline,
  "A decisão começa pela necessidade de liquidez",
  "liquidez tem precedência sobre tese"
);
assert.equal(
  report({ motivo: "ganancia", tese: "sem-tese" }).headline,
  "Realização parcial é uma alternativa possível",
  "realização preserva a precedência editorial existente"
);

const exchanges = ["binance", "outra", "carteira"];
const binanceAnswers = ["sim", "nao"];
const variations = ["lucro", "prejuizo", "naosei"];
const motives = ["medo", "ganancia", "necessidade", "checando"];
const theses = ["so-preco", "tese-mudou", "sem-tese"];
const sleepAnswers = ["tranquilo", "mais-ou-menos", "tira-o-sono"];
let combinations = 0;
for (const corretora of exchanges) {
  for (const jaTemBinance of binanceAnswers) {
    for (const variacao of variations) {
      for (const motivo of motives) {
        for (const tese of theses) {
          for (const sono of sleepAnswers) {
            combinations += 1;
            const result = report({ corretora, jaTemBinance, variacao, motivo, tese, sono });
            const shouldOffer =
              corretora === "outra" &&
              jaTemBinance === "nao" &&
              motivo === "checando" &&
              tese === "so-preco" &&
              sono === "tranquilo";
            assert.equal(
              Boolean(result.convertOverride),
              shouldOffer,
              `oferta incorreta: ${corretora}/${jaTemBinance}/${variacao}/${motivo}/${tese}/${sono}`
            );
          }
        }
      }
    }
  }
}
assert.equal(combinations, 648);

const expectedFields = ["corretora", "jaTemBinance", "variacao", "motivo", "tese", "sono"];
const actualFields = Array.from(flow.steps, (step) =>
  Array.from(step.fields, (field) => field.id)
).flat();
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

console.log("Flow matrix: OK — 7 vereditos, precedências e 648 combinações de oferta");
