const flowRoot = document.getElementById("flow-root");
if (flowRoot && typeof renderFlow === "function" && typeof FLOW !== "undefined") {
  renderFlow(flowRoot, FLOW);
}

loadGoatCounter();
