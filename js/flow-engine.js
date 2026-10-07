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

  function visibleQuestions() {
    const questions = [];
    flow.steps.forEach((step) => {
      if (step.showIf && !step.showIf(answers)) return;
      visibleFields(step).forEach((field) => {
        questions.push({ ...field, sectionTitle: step.title, sectionDescription: step.description });
      });
    });
    return questions;
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
      const group = element("div", "radio-group flow-options");
      group.setAttribute("role", "group");
      group.setAttribute("aria-label", field.label);
      field.options.forEach((option) => {
        const value = option.value !== undefined ? option.value : option;
        const button = element("button", "flow-option", option.label !== undefined ? option.label : option);
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

  function missingRequiredField(field) {
    const value = answers[field.id];
    if (field.required && (value === undefined || value === null || value === "")) {
      return field.label;
    }
    return null;
  }

  function resetFlow() {
    flow.steps.forEach((step) => step.fields.forEach((field) => {
      delete answers[field.id];
      if (field.value !== undefined) answers[field.id] = field.value;
    }));
    stepIndex = 0;
    track("flow_reset");
    renderStep();
  }

  function renderStep() {
    root.replaceChildren();
    const questions = visibleQuestions();
    if (stepIndex >= questions.length) stepIndex = Math.max(0, questions.length - 1);
    const question = questions[stepIndex];
    if (!question) return;

    const card = element("div", "card flow-card");
    renderProgress(card, questions);
    card.appendChild(element("p", "flow-kicker", question.sectionTitle));
    card.appendChild(element("h2", "", question.label));
    if (question.sectionDescription) card.appendChild(element("p", "section-desc flow-help", question.sectionDescription));

    const grid = element("div", "control-grid");
    const dynamic = question.showIf || flow.steps.some((item) => item.showIf || item.fields.some((field) => field.showIf));
    const onDynamicChange = dynamic ? renderStep : () => {};
    renderField(question, grid, onDynamicChange);
    card.appendChild(grid);

    const error = element("p", "form-error");
    error.setAttribute("role", "alert");
    error.tabIndex = -1;
    error.hidden = true;
    card.appendChild(error);

    const actions = element("div", "btn-row");
    if (stepIndex > 0) {
      const back = element("button", "btn-secondary", "← Voltar");
      back.type = "button";
      back.setAttribute("aria-label", "Voltar à pergunta anterior");
      back.addEventListener("click", () => {
        stepIndex -= 1;
        renderStep();
      });
      actions.appendChild(back);
    }

    const restart = element("button", "btn-secondary", "Reiniciar");
    restart.type = "button";
    restart.setAttribute("aria-label", "Reiniciar o questionário");
    restart.addEventListener("click", resetFlow);
    actions.appendChild(restart);

    const last = stepIndex === questions.length - 1;
    const next = element("button", "btn-primary", last ? flow.reportLabel || "Gerar meu plano →" : "Continuar →");
    next.type = "button";
    next.addEventListener("click", () => {
      const missing = missingRequiredField(question);
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
        track("flow_passo");
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

  function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function readableAnswer(field) {
    const value = answers[field.id];
    if (value === undefined || value === null || value === "") return "Não respondido";
    if (field.type === "radio" && field.options) {
      const option = field.options.find((item) => (item.value !== undefined ? item.value : item) === value);
      if (option) return option.label !== undefined ? option.label : String(option);
    }
    if (field.format) return String(field.format(value));
    return String(value);
  }

  function renderAnswerRecord() {
    const record = element("section", "answer-record");
    record.appendChild(element("h2", "", "Suas respostas"));
    flow.steps.forEach((step) => step.fields.forEach((field) => {
      const item = element("div", "answer-item");
      item.appendChild(element("p", "answer-q", field.label));
      item.appendChild(element("p", "answer-a", readableAnswer(field)));
      record.appendChild(item);
    }));
    return record;
  }

  function renderReport() {
    const report = flow.buildReport({ ...answers });
    const convert = report.convertOverride !== undefined ? report.convertOverride : flow.convert;
    track("relatorio_gerado");
    root.replaceChildren();

    const card = element("div", "card result-card");
    card.appendChild(element("h2", "", flow.reportTitle || "Seu plano"));

    if (report.headline) {
      const banner = element("div", `result-hero result-banner ${report.tone === "bad" ? "is-alert bad" : "good"}`);
      const top = element("div", "result-top");
      const inner = element("div");
      inner.appendChild(element("p", "result-kicker", report.tone === "bad" ? "Atenção ao próximo passo" : "Leitura do seu protocolo"));
      inner.appendChild(element("h2", "result-big big-stat", report.headline));
      top.appendChild(inner);
      if (report.sublabel) top.appendChild(element("p", "result-read stat-label", report.sublabel));
      banner.appendChild(top);
      card.appendChild(banner);
    }

    if (report.stats && report.stats.length) {
      const row = element("div", "result-stats stat-row");
      report.stats.slice(0, 3).forEach((stat) => {
        const box = element("div", "stat-box");
        box.appendChild(element("strong", "val", stat.value));
        box.appendChild(element("span", "label", stat.label));
        row.appendChild(box);
      });
      card.appendChild(row);
    }

    card.appendChild(renderAnswerRecord());
    const resultActions = element("section", "result-actions");
    resultActions.appendChild(element("h3", "result-actions-title", "Leve este protocolo para a próxima decisão"));
    resultActions.appendChild(element("p", "", "Marque as etapas, copie o resumo ou baixe um card. Nada é enviado para um servidor."));

    if (report.findings && report.findings.length) {
      const list = element("div", "report-findings");
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

      const copy = element("button", "btn btn-secondary", "Copiar protocolo");
      copy.type = "button";
      copy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(planAsText(report, convert));
          copy.textContent = "Copiado";
          setTimeout(() => { copy.textContent = "Copiar protocolo"; }, 1500);
          track("copiar_plano");
        } catch (_) {
          copy.textContent = "Não foi possível copiar";
        }
      });
      const row = element("div", "result-actions-row");
      row.appendChild(copy);
      resultActions.appendChild(row);
    }

    if (report.extraText) {
      card.appendChild(element("p", "section-desc report-extra", report.extraText));
    }

    const actions = element("div", "result-actions-row");
    if (report.shareCard) {
      const download = element("button", "btn btn-secondary", "Baixar card do resultado");
      download.type = "button";
      download.addEventListener("click", () => {
        const canvas = generateCard({ format: "square", ...report.shareCard });
        downloadCanvasAsPng(canvas, `${flow.slug || "plano"}.png`);
        track("download_card");
      });
      actions.appendChild(download);
    }
    const textDownload = element("button", "btn btn-secondary", "Baixar texto");
    textDownload.type = "button";
    textDownload.addEventListener("click", () => downloadTextFile(`${flow.slug || "protocolo"}-resultado.txt`, planAsText(report, convert)));
    actions.appendChild(textDownload);
    const restart = element("button", "btn btn-secondary", "Refazer");
    restart.type = "button";
    restart.addEventListener("click", resetFlow);
    actions.appendChild(restart);
    resultActions.appendChild(actions);
    resultActions.appendChild(element("p", "privacy-line", "Privacidade: suas respostas e o resultado permanecem nesta página e não são enviados para a DLT Academy."));
    card.appendChild(resultActions);
    root.appendChild(card);

    // Evento fixo e único: o nome nunca revela o ramo a que as respostas levaram.
    track("roteador_resultado");
    const conversionBlock = convert ? renderConvert(convert) : null;
    if (conversionBlock) {
      root.appendChild(conversionBlock);
    } else {
      // Sem oferta, esta ferramenta terminava sem próximo passo nenhum: ela
      // não tem aresta de guia como a Primeiros Passos. O grupo é a única
      // continuação disponível aqui, e por isso entra destacado.
      const communityBlock = renderCommunity();
      if (communityBlock) {
        root.appendChild(communityBlock);
      }
    }
  }

  // Botão do grupo. Link externo, mas não afiliado: sem sponsored/nofollow,
  // com o referrerpolicy que a política de segurança exige.
  //
  // O peso visual depende de quem está ao lado, e isso não é estilo: a oferta
  // é a ação que sustenta o projeto. `.btn-telegram` (#26a5e4) tem contraste
  // 7.20:1 com o fundo, contra 3.00:1 do `.btn-primary` (#1E4FD8) — solto ao
  // lado da oferta, o brinde puxaria mais o olho que ela. Junto: discreto.
  // Sozinho: destacado, porque ali não há nada para disputar.
  function communityButton(destaque) {
    const cfg = CONFIG.community;
    const btn = element("a", destaque ? "btn btn-telegram" : "btn btn-secondary", cfg.label || "Entrar grátis no grupo →");
    btn.href = getCommunityLink();
    btn.target = "_blank";
    btn.rel = "noopener noreferrer";
    btn.referrerPolicy = "no-referrer";
    btn.addEventListener("click", () => track("clique_comunidade"));
    return btn;
  }

  function renderCommunity() {
    if (!isCommunityConfigured()) return null;
    const cfg = CONFIG.community;
    const block = element("div", "card next-step cta-verdict convert-block visible");
    if (cfg.tag) block.appendChild(element("span", "tag s1", cfg.tag));
    if (cfg.headline) block.appendChild(element("div", "convert-headline", cfg.headline));
    if (cfg.sub) block.appendChild(element("div", "convert-sub", cfg.sub));
    const actions = element("div", "btn-row");
    actions.appendChild(communityButton(true)); // sozinho: é a ação da vez
    block.appendChild(actions);
    return block;
  }

  function renderConvert(config) {
    const offerKey = config.offerKey || "default";
    const offerUrl = config.hideRef ? "#" : getOfferLink(offerKey);
    const hasOffer = Boolean(offerUrl && offerUrl !== "#");
    if (!hasOffer) return null;

    const block = element("div", "card offer cta-verdict convert-block visible");
    if (config.tag) block.appendChild(element("span", "tag s2", config.tag));
    block.appendChild(element("div", "convert-headline", config.headline));
    if (config.sub) block.appendChild(element("div", "convert-sub", config.sub));

    if (hasOffer && config.offers && config.offers.length) {
      const list = element("ul", "offer-list");
      config.offers.forEach((item) => list.appendChild(element("li", "", item)));
      block.appendChild(list);
    }

    const actions = element("div", "btn-row");
    if (hasOffer) {
      const link = element("a", "btn btn-primary", config.ctaLabel || "Ver condições →");
      link.href = offerUrl;
      link.target = "_blank";
      link.rel = "sponsored nofollow noopener noreferrer";
      link.referrerPolicy = "no-referrer";
      link.addEventListener("click", () => track(`clique_oferta_${offerKey}_principal`));
      actions.appendChild(link);
    }

    // Comunidade como brinde ao lado da oferta: gratuita e sem trava de
    // elegibilidade, acompanha sem competir. hideCommunity suprime.
    if (config.hideCommunity !== true && isCommunityConfigured()) {
      actions.appendChild(communityButton(false));
    }

    block.appendChild(actions);
    if (config.note) block.appendChild(element("p", "fine-print", config.note));
    if (hasOffer) {
      block.appendChild(element(
        "p",
        "affiliate-disclosure",
        config.disclosure || "Este é um link de afiliado. A DLT Academy pode receber comissão se uma conta elegível for criada e utilizada. As condições exibidas no cadastro prevalecem."
      ));
    }
    return block;
  }

  track("flow_iniciado");
  renderStep();
}
