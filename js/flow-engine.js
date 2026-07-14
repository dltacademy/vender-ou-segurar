// ============================================================
// FLOW ENGINE — motor de guias/protocolos passo-a-passo.
// ESTÁVEL: não edite este arquivo pra criar uma ferramenta nova.
// Toda ferramenta é definida SÓ em js/flow.js (schema no FRAMEWORK.md
// do kit). Uso: renderFlow(document.getElementById("flow-root"), FLOW)
// Requer carregados antes: config.js, tracking.js, canvas-cards.js.
//
// Capacidades:
//  - passos com campos range/number/text/select/radio
//  - ramificação: showIf(answers) em passos E em campos
//  - relatório: banner + stats + findings + PLANO passo-a-passo
//    (checklist numerada com "copiar plano")
//  - card compartilhável + bloco de conversão com link ref por canal
// ============================================================

function renderFlow(root, flow) {
  const answers = {};
  let stepIndex = 0; // índice dentro dos passos VISÍVEIS

  flow.steps.forEach((s) =>
    s.fields.forEach((f) => {
      if (f.value !== undefined) answers[f.id] = f.value;
    })
  );

  function h(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function visibleSteps() {
    return flow.steps.filter((s) => !s.showIf || s.showIf(answers));
  }

  function visibleFields(step) {
    return step.fields.filter((f) => !f.showIf || f.showIf(answers));
  }

  function renderProgress(container, steps) {
    const bar = h("div", "flow-progress");
    steps.forEach((_, i) => {
      bar.appendChild(h("span", "dot" + (i < stepIndex ? " done" : i === stepIndex ? " current" : "")));
    });
    bar.appendChild(h("span", "step-count", `passo ${stepIndex + 1} de ${steps.length}`));
    container.appendChild(bar);
  }

  function renderField(f, container, onDynamicChange) {
    const wrap = h("div", "control");
    const label = h("div", "control-label");
    label.appendChild(h("span", "", f.label));
    const valueEl = h("strong");
    label.appendChild(valueEl);
    wrap.appendChild(label);

    const fmt = f.format || ((v) => v);

    if (f.type === "range") {
      const input = document.createElement("input");
      input.type = "range";
      input.min = f.min;
      input.max = f.max;
      input.step = f.step || 1;
      input.value = answers[f.id] !== undefined ? answers[f.id] : f.min;
      answers[f.id] = Number(input.value);
      valueEl.textContent = fmt(Number(input.value));
      input.addEventListener("input", () => {
        answers[f.id] = Number(input.value);
        valueEl.textContent = fmt(Number(input.value));
      });
      wrap.appendChild(input);
    } else if (f.type === "number" || f.type === "text") {
      const input = document.createElement("input");
      input.type = f.type;
      if (f.placeholder) input.placeholder = f.placeholder;
      if (answers[f.id] !== undefined) input.value = answers[f.id];
      input.addEventListener("input", () => {
        answers[f.id] = f.type === "number" ? Number(input.value) : input.value;
      });
      wrap.appendChild(input);
    } else if (f.type === "select") {
      const sel = document.createElement("select");
      f.options.forEach((o) => {
        const opt = document.createElement("option");
        opt.value = o.value !== undefined ? o.value : o;
        opt.textContent = o.label !== undefined ? o.label : o;
        sel.appendChild(opt);
      });
      if (answers[f.id] !== undefined) sel.value = answers[f.id];
      answers[f.id] = sel.value;
      sel.addEventListener("change", () => {
        answers[f.id] = sel.value;
        onDynamicChange();
      });
      wrap.appendChild(sel);
    } else if (f.type === "radio") {
      const group = h("div", "radio-group");
      f.options.forEach((o) => {
        const val = o.value !== undefined ? o.value : o;
        const btn = h("button", "", o.label !== undefined ? o.label : o);
        btn.type = "button";
        if (answers[f.id] === val) btn.classList.add("selected");
        btn.addEventListener("click", () => {
          answers[f.id] = val;
          group.querySelectorAll("button").forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");
          onDynamicChange();
        });
        group.appendChild(btn);
      });
      wrap.appendChild(group);
    }
    container.appendChild(wrap);
  }

  function validateStep(step) {
    for (const f of visibleFields(step)) {
      if (f.required && (answers[f.id] === undefined || answers[f.id] === "" || answers[f.id] === null)) {
        return f.label;
      }
    }
    return null;
  }

  function renderStep() {
    root.innerHTML = "";
    const steps = visibleSteps();
    if (stepIndex >= steps.length) stepIndex = steps.length - 1;
    const step = steps[stepIndex];

    const card = h("div", "card");
    renderProgress(card, steps);
    card.appendChild(h("h2", "", step.title));
    if (step.description) card.appendChild(h("p", "section-desc", step.description));

    const grid = h("div", "control-grid");
    const hasDynamic = step.fields.some((f) => f.showIf) || flow.steps.some((s) => s.showIf);
    const onDynamicChange = hasDynamic ? () => renderStep() : () => {};
    visibleFields(step).forEach((f) => renderField(f, grid, onDynamicChange));
    card.appendChild(grid);

    const btns = h("div", "btn-row");
    if (stepIndex > 0) {
      const back = h("button", "btn-secondary", "← Voltar");
      back.addEventListener("click", () => {
        stepIndex--;
        renderStep();
      });
      btns.appendChild(back);
    }
    const isLast = stepIndex === steps.length - 1;
    const next = h("button", "btn-primary", isLast ? flow.reportLabel || "Gerar meu plano →" : "Continuar →");
    next.addEventListener("click", () => {
      const missing = validateStep(step);
      if (missing) {
        alert(`Preencha: ${missing}`);
        return;
      }
      if (isLast) {
        renderReport();
      } else {
        stepIndex++;
        track("flow_passo_" + (stepIndex + 1));
        renderStep();
      }
    });
    btns.appendChild(next);
    card.appendChild(btns);
    root.appendChild(card);
  }

  function planAsText(report) {
    const lines = [(flow.reportTitle || "Meu plano") + " — " + (CONFIG.brand || "")];
    (report.plan || []).forEach((p, i) => {
      lines.push(`${i + 1}. ${p.title}`);
      if (p.text) lines.push(`   ${p.text.replace(/<[^>]+>/g, "")}`);
    });
    if (flow.convert) {
      lines.push("");
      lines.push("🎁 Presente por responder: " + flow.convert.headline);
      lines.push(getRefLink());
    }
    lines.push("");
    lines.push("Gerado em: " + CONFIG.siteUrl);
    return lines.join("\n");
  }

  function renderReport() {
    const report = flow.buildReport(answers);
    track("relatorio_gerado");
    root.innerHTML = "";

    const card = h("div", "card");
    card.appendChild(h("h2", "", flow.reportTitle || "Seu plano"));

    if (report.headline) {
      const banner = h("div", "result-banner " + (report.tone === "bad" ? "bad" : "good"));
      const inner = h("div");
      inner.appendChild(h("div", "big-stat", report.headline));
      if (report.sublabel) inner.appendChild(h("div", "stat-label", report.sublabel));
      banner.appendChild(inner);
      card.appendChild(banner);
    }

    if (report.stats && report.stats.length) {
      const row = h("div", "stat-row");
      report.stats.forEach((s) => {
        const box = h("div", "stat-box");
        box.appendChild(h("div", "val", s.value));
        box.appendChild(h("div", "label", s.label));
        row.appendChild(box);
      });
      card.appendChild(row);
    }

    if (report.findings && report.findings.length) {
      const list = h("div");
      list.style.marginTop = "20px";
      report.findings.forEach((f) => {
        const div = h("div", "finding sev-" + (f.severity !== undefined ? f.severity : 2));
        div.appendChild(h("div", "finding-title", f.title));
        div.appendChild(h("div", "finding-text", f.text));
        list.appendChild(div);
      });
      card.appendChild(list);
    }

    if (report.plan && report.plan.length) {
      const planList = h("ol", "plan-list");
      report.plan.forEach((p) => {
        const li = h("li", "plan-step");
        const label = h("label", "plan-check");
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.addEventListener("change", () => li.classList.toggle("done", cb.checked));
        label.appendChild(cb);
        const body = h("div", "plan-body");
        body.appendChild(h("div", "plan-title", p.title));
        if (p.text) body.appendChild(h("div", "plan-text", p.text));
        label.appendChild(body);
        li.appendChild(label);
        planList.appendChild(li);
      });
      card.appendChild(planList);

      const copyBtn = h("button", "btn-secondary", "📋 Copiar plano");
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(planAsText(report)).then(() => {
          copyBtn.textContent = "✓ Copiado";
          setTimeout(() => (copyBtn.textContent = "📋 Copiar plano"), 1500);
          track("copiar_plano");
        });
      });
      const btnRowPlan = h("div", "btn-row");
      btnRowPlan.appendChild(copyBtn);
      card.appendChild(btnRowPlan);
    }

    if (report.html) {
      const extra = h("div");
      extra.style.marginTop = "16px";
      extra.innerHTML = report.html;
      card.appendChild(extra);
    }

    const btns = h("div", "btn-row");
    if (report.shareCard) {
      const dl = h("button", "btn-secondary", "📥 Baixar card do resultado");
      dl.addEventListener("click", () => {
        const canvas = generateCard({ format: "square", ...report.shareCard });
        downloadCanvasAsPng(canvas, (flow.slug || "plano") + ".png");
        track("download_card");
      });
      btns.appendChild(dl);
    }
    const redo = h("button", "btn-secondary", "↺ Refazer");
    redo.addEventListener("click", () => {
      stepIndex = 0;
      renderStep();
    });
    btns.appendChild(redo);
    card.appendChild(btns);
    root.appendChild(card);

    // report.convertOverride (definido em buildReport, com base nas respostas) tem
    // prioridade sobre o flow.convert estático — ver BRAND.md "Erros já cometidos":
    // nunca ofereça "abra sua conta" pra quem já respondeu que tem conta na Binance.
    const convert = report.convertOverride !== undefined ? report.convertOverride : flow.convert;
    if (convert) root.appendChild(renderConvert(convert));
  }

  function renderConvert(c) {
    const block = h("div", "card convert-block visible");
    if (c.tag) block.appendChild(h("span", "tag s2", c.tag));
    block.appendChild(h("div", "convert-headline", c.headline));
    if (c.sub) block.appendChild(h("div", "convert-sub", c.sub));
    if (c.offers && c.offers.length) {
      const ul = h("ul", "offer-list");
      c.offers.forEach((o) => ul.appendChild(h("li", "", o)));
      block.appendChild(ul);
    }
    const btns = h("div", "btn-row");
    // c.hideRef: quando o link de indicação não se aplica (ex.: pessoa já tem
    // identidade verificada na Binance — não dá pra abrir uma segunda conta).
    if (!c.hideRef) {
      const ref = h("a", "btn btn-primary", c.ctaLabel || "Abrir conta com cashback vitalício →");
      ref.href = getRefLink();
      ref.target = "_blank";
      ref.rel = "nofollow noopener";
      ref.addEventListener("click", () => track("clique_ref"));
      btns.appendChild(ref);
    }
    if (CONFIG.telegramUsername) {
      const tg = h("a", "btn btn-telegram", c.tgLabel || "💬 Falar no Telegram");
      tg.href = getTelegramLink(c.tgPrefill || "");
      tg.target = "_blank";
      tg.rel = "nofollow noopener";
      tg.addEventListener("click", () => track("clique_telegram"));
      btns.appendChild(tg);
    }
    block.appendChild(btns);
    return block;
  }

  track("flow_iniciado");
  renderStep();
}
