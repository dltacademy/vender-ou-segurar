function gateUnavailableConversion(report) {
  const convert = report && report.convertOverride;
  if (!convert) return report;

  const offerUrl = convert.hideRef ? "#" : getOfferLink(convert.offerKey || "default");
  const hasOffer = Boolean(offerUrl && offerUrl !== "#");
  // A oferta e a unica coisa que torna o bloco de conversao disponivel. O
  // grupo nao entra nesta conta: e gratuito e aparece de qualquer forma, como
  // brinde ao lado da oferta ou em bloco proprio quando nao ha oferta.
  if (hasOffer) return report;

  const routingLabels = new Set(["roteamento", "próximo passo"]);
  const stats = Array.isArray(report.stats)
    ? report.stats.map((stat) =>
        routingLabels.has(String(stat.label).toLowerCase())
          ? { ...stat, value: "Sem oferta" }
          : stat
      )
    : report.stats;

  return { ...report, stats, convertOverride: null };
}

if (typeof FLOW !== "undefined" && typeof FLOW.buildReport === "function") {
  const buildReport = FLOW.buildReport.bind(FLOW);
  FLOW.buildReport = (answers) => gateUnavailableConversion(buildReport(answers));
}

const flowRoot = document.getElementById("flow-root");
if (flowRoot && typeof renderFlow === "function" && typeof FLOW !== "undefined") {
  renderFlow(flowRoot, FLOW);
}

loadGoatCounter();
