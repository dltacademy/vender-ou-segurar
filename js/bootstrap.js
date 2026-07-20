function gateUnavailableConversion(report) {
  const convert = report && report.convertOverride;
  if (!convert) return report;

  const offerUrl = convert.hideRef ? "#" : getOfferLink(convert.offerKey || "default");
  const hasOffer = Boolean(offerUrl && offerUrl !== "#");
  const hasTelegram = convert.publicTelegram === true && isTelegramConfigured();
  if (hasOffer || hasTelegram) return report;

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
