const flowRoot = document.getElementById("flow-root");

if (typeof FLOW !== "undefined" && typeof FLOW.buildReport === "function") {
  const buildReport = FLOW.buildReport.bind(FLOW);
  FLOW.buildReport = (answers) => {
    const report = buildReport(answers);
    const convert = report && report.convertOverride;
    if (convert) {
      const offerUrl = getOfferLink(convert.offerKey || "default");
      if (!offerUrl || offerUrl === "#") {
        return { ...report, convertOverride: null };
      }
    }
    return report;
  };
}

if (flowRoot && typeof renderFlow === "function" && typeof FLOW !== "undefined") {
  renderFlow(flowRoot, FLOW);
}

loadGoatCounter();
