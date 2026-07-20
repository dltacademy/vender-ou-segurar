function renderFlow(root, flow) {
  const answers = {};
  let stepIndex = 0;

  flow.steps.forEach((step) => {
    step.fields.forEach((field) => {
      if (field.value !== undefined) answers[field.id] = field.value;
    });
  });

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  }

  function visibleSteps() {
    return flow.steps.filter((step) => !step.showIf || step.showIf(answers));
  }

  function visibleFields(step) {
    return step.fields.filter((field) => !field.showIf || field.showIf(answers));
  }

  function renderProgress(container, steps) {
    const progress = element("div", "flow-progress");
    steps.forEach((_, index) => {
      const state = index < stepIndex ? " done" : index === stepIndex ? " current" : "";
      progress.appendChild(element("span", `dot${state}`));
    });
    progress.appendChild(element("span", "step-count", `passo ${stepIndex + 1} de ${steps.length}`));
    container.appendChild(progress);
  }

  function renderField(field, container, onDynamicChange) {
    const wrapper = element("div", "control");
    const label = element("div", "control-label");
    label.appendChild(element("span", "", field.label));
    const liveValue = element("strong");
    label.appendChild(liveValue);
    wrapper.appendChild(label);

    const format = field.format || ((value) => value);

    if (field.type === "range") {
      const input = document.createElement("input");
      input.type = "range";
      input.min = field.min;
      input.max = field.max;
      input.step = field.step || 1;
      input.value = answers[field.id] !== undefined ? answers[field.id] : field.min;
      input.setAttribute("aria-label", field.label);
      answers[field.id] = Number(input.value);
      liveValue.textContent = format(Number(input.value));
      input.addEventListener("input", () => {
        answers[field.id] = Number(input.value);
        liveValue.textContent = format(Number(input.value));
      });
      wrapper.appendChild(input);
    } else if (field.type === "select") {
      const select = document.createElement("select");
      select.setAttribute("aria-label", field.label);
      field.options.forEach((option) => {
        const item = document.createElement("option");
        item.value = option.value !== undefined ? option.value : option;
        item.textContent = option.label !== undefined ? option.label : option;
        select.appendChild(item);
      });
      if (answers[field.id] !== undefined) select.value = answers[field.id];
      answers[field.id] = select.value;
      select.addEventListener("change", () => {
        answers[field.id] = select.value;
        onDynamicChange();
      });
      wrapper.appendChild(select);
    } else if (field.type === "number" || field.type === "text") {
      const input = document.createElement("input");
      input.type = field.type;
      input.setAttribute("aria-label", field.label);
      if (field.placeholder) input.placeholder = field.placeholder;
      if (answers[field.id] !== undefined) input.value = answers[field.id];
      input.addEventListener("input", () => {
        answers[field.id] = field.type === "number" ? Number(input.value) : input.value;
      });
      wrapper.appendChild(input);
    } else if (field.type === "radio") {
      const group = element("div", "radio-group");
      group.setAttribute("role", "group");
      group.setAttribute("aria-label", field.label);
      field.options.forEach((option) => {
        const value = option.value !== undefined ? option.value : option;
        const button = element("button", "", option.label !== undefined ? option.label : option);
        button.type = "button";
        const selected = answers[field.id] === value;
        button.classList.toggle("selected", selected);
        button.setAttribute("aria-pressed", String(selected));
        button.addEventListener("click", () => {
          answers[field.id] = value;
          group.querySelectorAll("button").forEach((peer) => {
            const isSelected = peer === button;
            peer.classList.toggle("selected", isSelected);
            peer.setAttribute("aria-pressed", String(isSelected));
          });
          onDynamicChange();
        });
        group.appendChild(button);
      });
      wrapper.appendChild(group);
    }

    container.appendChild(wrapper);
  }

  function missingRequiredField(step) {
    for (const field of visibleFields(step)) {
      const value = answers[field.id];
      if (field.required && (value === undefined || value === null || value === "")) {
        return field.label;
      }
    }
    return null;
  }

  function renderStep() {
    root.replaceChildren();
    const steps = visibleSteps();
    if (stepIndex >= steps.length) stepIndex = Math.max(0, steps.length - 1);
    const step = steps[stepIndex];
    if (!step) return;

    const card = element("div", "card");
    renderProgress(card, steps);
    card.appendChild(element("h2", "", step.title));
    if (step.description) card.appendChild(element("p", "section-desc", step.description));

    const grid = element("div", "control-grid");
    const dynamic = step.fields.some((field) => field.showIf) || flow.steps.some((item) => item.showIf);
    const onDynamicChange = dynamic ? renderStep : () => {};
    visibleFields(step).forEach((field) => renderField(field, grid, onDynamicChange));
    card.appendChild(grid);

    const error = element("p", "form-error");
    error.setAttribute("role", "alert");
    error.hidden = true;
    card.appendChild(error);

    const actions = element("div", "btn-row");
    if (stepIndex > 0) {
      const back = element("button", "btn-secondary", "← Voltar");
      back.type = "button";
      back.addEventListener("click", () => {
        stepIndex -= 1;
        renderStep();
      });
      actions.appendChild(back);
    }

    const last = stepIndex === steps.length - 1;
    const next = element("button", "btn-primary", last ? flow.reportLabel || "Gerar meu plano →" : "Continuar →");
    next.type = "button";
    next.addEventListener("click", () => {
      const missing = missingRequiredField(step);
      if (missing) {
        error.textContent = `Preencha: ${missing}`;
        error.hidden = false;
        error.focus();
        return;
      }
      if (last) {
        renderReport();
      } else {
        stepIndex += 1;
        track(`flow_passo_${stepIndex + 1}`);
        renderStep();
      }
    });
    actions.appendChild(next);
    card.appendChild(actions);
    root.appendChild(card);
  }

  function planAsText(report, convert) {
    const lines = [`${flow.reportTitle || "Meu plano"} — ${CONFIG.brand || ""}`];
    (report.plan || []).forEach((item, index) => {
      lines.push(`${index + 1}. ${item.title}`);
      if (item.text) lines.push(`   ${item.text}`);
    });
    if (convert && !convert.hideRef) {
      const offerUrl = getOfferLink(convert.offerKey || "default");
      if (offerUrl && offerUrl !== "#") {
        lines.push("", `Próximo passo: ${convert.headline}`, offerUrl);
        lines.push("Link de afiliado: a DLT Academy pode receber comissão se uma conta elegível for criada e utilizada.");
      }
    }
    lines.push("", `Gerado em: ${CONFIG.siteUrl}`);
    return lines.join("\n");
  }

  function renderReport() {
    const report = flow.buildReport({ ...answers });
    const convert = report.convertOverride !== undefined ? report.convertOverride : flow.convert;
    track("relatorio_gerado");
    root.replaceChildren();

    const card = element("div", "card");
    card.appendChild(element("h2", "", flow.reportTitle || "Seu plano"));

    if (report.headline) {
      const banner = element("div", `result-banner ${report.tone === "bad" ? "bad" : "good"}`);
      const inner = element("div");
      inner.appendChild(element("div", "big-stat", report.headline));
      if (report.sublabel) inner.appendChild(element("div", "stat-label", report.sublabel));
      banner.appendChild(inner);
      card.appendChild(banner);
    }

    if (report.stats && report.stats.length) {
      const row = element("div", "stat-row");
      report.stats.forEach((stat) => {
        const box = element("div", "stat-box");
        box.appendChild(element("div", "val", stat.value));
        box.appendChild(element("div", "label", stat.label));
        row.appendChild(box);
      });
      card.appendChild(row);
    }

    if (report.findings && report.findings.length) {
      const list = element("div");
      list.style.marginTop = "20px";
      report.findings.forEach((finding) => {
        const block = element("div", `finding sev-${finding.severity || 2}`);
        block.appendChild(element("div", "finding-title", finding.title));
        block.appendChild(element("div", "finding-text", finding.text));
        list.appendChild(block);
      });
      card.appendChild(list);
    }

    if (report.plan && report.plan.length) {
      const list = element("ol", "plan-list");
      report.plan.forEach((item) => {
        const entry = element("li", "plan-step");
        const label = element("label", "plan-check");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.addEventListener("change", () => entry.classList.toggle("done", checkbox.checked));
        label.appendChild(checkbox);
        const body = element("div", "plan-body");
        body.appendChild(element("div", "plan-title", item.title));
        if (item.text) body.appendChild(element("div", "plan-text", item.text));
        label.appendChild(body);
        entry.appendChild(label);
        list.appendChild(entry);
      });
      card.appendChild(list);

      const copy = element("button", "btn-secondary", "📋 Copiar plano");
      copy.type = "button";
      copy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(planAsText(report, convert));
          copy.textContent = "✓ Copiado";
          setTimeout(() => { copy.textContent = "📋 Copiar plano"; }, 1500);
          track("copiar_plano");
        } catch (_) {
          copy.textContent = "Não foi possível copiar";
        }
      });
      const row = element("div", "btn-row");
      row.appendChild(copy);
      card.appendChild(row);
    }

    if (report.extraText) {
      const extra = element("p", "section-desc", report.extraText);
      extra.style.marginTop = "16px";
      card.appendChild(extra);
    }

    const actions = element("div", "btn-row");
    if (report.shareCard) {
      const download = element("button", "btn-secondary", "📥 Baixar card do resultado");
      download.type = "button";
      download.addEventListener("click", () => {
        const canvas = generateCard({ format: "square", ...report.shareCard });
        downloadCanvasAsPng(canvas, `${flow.slug || "plano"}.png`);
        track("download_card");
      });
      actions.appendChild(download);
    }
    const restart = element("button", "btn-secondary", "↺ Refazer");
    restart.type = "button";
    restart.addEventListener("click", () => {
      stepIndex = 0;
      renderStep();
    });
    actions.appendChild(restart);
    card.appendChild(actions);
    root.appendChild(card);

    if (convert) {
      root.appendChild(renderConvert(convert));
      track(`roteador_resultado_${convert.offerKey || "default"}`);
    } else {
      track("roteador_resultado_sem_oferta");
    }
  }

  function renderConvert(config) {
    const block = element("div", "card convert-block visible");
    if (config.tag) block.appendChild(element("span", "tag s2", config.tag));
    block.appendChild(element("div", "convert-headline", config.headline));
    if (config.sub) block.appendChild(element("div", "convert-sub", config.sub));

    if (config.offers && config.offers.length) {
      const list = element("ul", "offer-list");
      config.offers.forEach((item) => list.appendChild(element("li", "", item)));
      block.appendChild(list);
    }

    const actions = element("div", "btn-row");
    if (!config.hideRef) {
      const offerKey = config.offerKey || "default";
      const url = getOfferLink(offerKey);
      if (url && url !== "#") {
        const link = element("a", "btn btn-primary", config.ctaLabel || "Ver condições →");
        link.href = url;
        link.target = "_blank";
        link.rel = "sponsored nofollow noopener noreferrer";
        link.referrerPolicy = "no-referrer";
        link.addEventListener("click", () => track(`clique_oferta_${offerKey}_principal`));
        actions.appendChild(link);
      }
    }

    if (config.publicTelegram === true && isTelegramConfigured()) {
      const telegram = element("a", "btn btn-telegram", config.tgLabel || "Falar no Telegram");
      telegram.href = getTelegramLink(config.tgPrefill || "");
      telegram.target = "_blank";
      telegram.rel = "nofollow noopener noreferrer";
      telegram.referrerPolicy = "no-referrer";
      actions.appendChild(telegram);
    }

    block.appendChild(actions);
    if (config.note) block.appendChild(element("p", "fine-print", config.note));
    block.appendChild(element(
      "p",
      "affiliate-disclosure",
      config.disclosure || "Este é um link de afiliado. A DLT Academy pode receber comissão se uma conta elegível for criada e utilizada. As condições exibidas no cadastro prevalecem."
    ));
    return block;
  }

  track("flow_iniciado");
  renderStep();
}
