// ============================================================
// "Vender ou Segurar?" — protocolo de decisão pra quem já tem posição.
// Dor real do holder: não é falta de informação de mercado, é decisão
// emocional sem estrutura. O fluxo separa sinal (tese mudou de verdade?
// necessidade real de liquidez?) de ruído (pânico, ganância, ansiedade).
// ============================================================

const FLOW = {
  slug: "vender-ou-segurar",
  reportTitle: "Seu protocolo de decisão",
  reportLabel: "Ver meu protocolo →",

  steps: [
    {
      title: "Sua posição hoje",
      description: "Contexto rápido antes de entrar no motivo.",
      fields: [
        {
          id: "corretora",
          label: "Onde você mantém essa posição hoje?",
          type: "radio",
          required: true,
          options: [
            { value: "binance", label: "Binance" },
            { value: "outra", label: "Outra corretora" },
            { value: "carteira", label: "Carteira própria (self-custody)" },
          ],
        },
        {
          id: "variacao",
          label: "Como está sua posição agora?",
          type: "radio",
          required: true,
          options: [
            { value: "lucro", label: "No lucro" },
            { value: "prejuizo", label: "No prejuízo" },
            { value: "naosei", label: "Não sei ao certo" },
          ],
        },
      ],
    },
    {
      title: "O motivo",
      description: "Seja honesto — isso não vai a lugar nenhum, é só pra você mesmo.",
      fields: [
        {
          id: "motivo",
          label: "Por que você está pensando em vender AGORA?",
          type: "radio",
          required: true,
          options: [
            { value: "medo", label: "O preço caiu e tenho medo de perder mais" },
            { value: "ganancia", label: "O preço subiu e quero travar o lucro" },
            { value: "necessidade", label: "Preciso do dinheiro pra outra coisa" },
            { value: "checando", label: "Só estou checando, não decidi nada" },
          ],
        },
      ],
    },
    {
      title: "Sua tese original",
      description: "O motivo de ter comprado ainda existe, ou só o preço mudou?",
      fields: [
        {
          id: "tese",
          label: "O que mudou desde que você comprou?",
          type: "radio",
          required: true,
          options: [
            { value: "so-preco", label: "Só o preço — minha razão de ter comprado continua a mesma" },
            { value: "tese-mudou", label: "A razão mudou de verdade (o motivo original não existe mais)" },
            { value: "sem-tese", label: "Nunca tive uma razão clara, comprei por impulso" },
          ],
        },
      ],
    },
    {
      title: "Sua cabeça",
      description: "Isso pesa mais do que parece.",
      fields: [
        {
          id: "sono",
          label: "Você consegue dormir tranquilo sabendo que tem esse dinheiro em cripto?",
          type: "radio",
          required: true,
          options: [
            { value: "tranquilo", label: "Sim, tranquilo" },
            { value: "mais-ou-menos", label: "Mais ou menos, penso nisso de vez em quando" },
            { value: "tira-o-sono", label: "Não, isso me tira o sono" },
          ],
        },
      ],
    },
  ],

  buildReport(a) {
    const findings = [];
    const plan = [];
    let headline, sublabel, tone;

    // Precedência do veredito: sono > necessidade real > tese mudou > pânico > ganância > sem tese > só checando
    if (a.sono === "tira-o-sono") {
      headline = "Sua posição está grande demais pra você";
      sublabel = "Isso vale mais que qualquer análise de mercado";
      tone = "bad";
      findings.push({
        severity: 3,
        title: "O problema não é o mercado, é o tamanho da posição",
        text: "Se isso tira seu sono, nenhuma previsão de preço vai resolver — o ativo certo pro seu perfil é aquele que você consegue segurar sem sofrer. Reduzir a posição pra um tamanho que não afeta seu sono é uma decisão válida, independente de qualquer outra resposta acima.",
      });
      plan.push({ title: "Defina o tamanho que te deixa tranquilo", text: "Não é sobre vender tudo ou nada — é sobre achar a fração da posição que você segura sem ansiedade." });
      plan.push({ title: "Venda só essa fração, não a posição toda", text: "Reduzir não é desistir da tese — é ajustar o risco ao seu perfil real, não ao perfil que você gostaria de ter." });
    } else if (a.motivo === "necessidade") {
      headline = "Isso não é sobre mercado, é sobre liquidez";
      sublabel = "A pergunta certa não é 'é hora de vender', é 'quanto eu realmente preciso'";
      tone = "good";
      findings.push({
        severity: 2,
        title: "Separe a decisão de mercado da decisão de liquidez",
        text: "Precisar do dinheiro é motivo legítimo — mas venda só o valor necessário, não a posição inteira por impulso de resolver logo.",
      });
      plan.push({ title: "Calcule exatamente quanto precisa", text: "Não arredonde pra cima 'por segurança' — isso é vender mais cripto do que precisa." });
      plan.push({ title: "Venda só esse valor", text: "O resto da posição não tem relação com essa necessidade — mantenha a tese original rodando pro restante." });
      plan.push({ title: "Considere o efeito fiscal", text: "Dependendo do valor, pode haver imposto sobre o ganho — confira antes de vender pra não ter surpresa na hora de declarar." });
    } else if (a.tese === "tese-mudou") {
      headline = "Sua tese mudou — isso é motivo real pra vender";
      sublabel = "Vender por mudança de tese é diferente de vender por medo do preço";
      tone = "good";
      findings.push({
        severity: 1,
        title: "Vender por tese é decisão, não reação",
        text: "Se o motivo original de ter comprado não existe mais, manter a posição só porque 'espera recuperar' é apostar, não investir.",
      });
      plan.push({ title: "Escreva por que a tese mudou", text: "Antes de vender, registre em uma frase o que exatamente deixou de ser verdade — isso vira critério pra próximas decisões." });
      plan.push({ title: "Venda com um plano, não de uma vez por impulso", text: "Considere vender em partes ao longo de alguns dias em vez de tudo de uma vez — reduz o risco de vender no pior preço do dia." });
    } else if (a.motivo === "medo" && a.tese === "so-preco") {
      headline = "Isso parece pânico, não decisão";
      sublabel = "O padrão nº 1 que trava investidor no prejuízo";
      tone = "bad";
      findings.push({
        severity: 3,
        title: "Você está prestes a vender por medo, não por mudança de tese",
        text: "O preço caiu, mas a razão de ter comprado continua a mesma segundo sua própria resposta. Vender agora, nessas condições, é o padrão clássico de venda no pânico — sair embaixo depois de ter entrado achando que fazia sentido.",
      });
      plan.push({ title: "Regra das 24 horas", text: "Proibido decidir qualquer coisa (vender, comprar, mexer) no mesmo dia de uma queda forte. Espere 24h com a cabeça fria." });
      plan.push({ title: "Releia por que você comprou", text: "Se a razão original continua de pé, o preço caindo não é motivo pra vender — é só o mercado fazendo o que mercado de risco faz." });
      plan.push({ title: "Se ainda quiser vender depois das 24h", text: "Tudo bem — mas venda por decisão fria, não no calor da queda. Considere vender uma fração, não tudo de uma vez." });
    } else if (a.motivo === "ganancia") {
      headline = "Trave uma parte, não tudo";
      sublabel = "Realizar lucro não precisa ser tudo ou nada";
      tone = "good";
      findings.push({
        severity: 1,
        title: "Vender tudo no topo (ou no que parece o topo) é apostar contra si mesmo",
        text: "Ninguém acerta o topo de forma consistente. Travar uma fração do lucro reduz o arrependimento dos dois lados: se continuar subindo, você ainda tem posição; se cair, você já garantiu parte do ganho.",
      });
      plan.push({ title: "Defina uma fração fixa pra realizar", text: "Ex.: vender 20-30% da posição em lucro, manter o resto rodando com a tese original." });
      plan.push({ title: "Separe o valor realizado da posição restante", text: "O que foi vendido não volta pra decisão — trate como capital já resolvido, não como 'ainda posso perder se eu não tivesse vendido'." });
    } else if (a.tese === "sem-tese") {
      headline = "Você nunca teve um plano — comece por aí";
      sublabel = "Antes de decidir vender, decida por que você está segurando";
      tone = "bad";
      findings.push({
        severity: 2,
        title: "Sem tese, toda decisão vira reação ao preço",
        text: "Comprar por impulso e decidir vender por impulso é o mesmo problema em dois momentos diferentes. Definir uma razão AGORA (mesmo que atrasada) já muda a qualidade da próxima decisão.",
      });
      plan.push({ title: "Escreva agora por que está segurando", text: "Uma frase: horizonte de tempo, o que faria você vender, o que faria você comprar mais." });
      plan.push({ title: "Só decida vender depois de ter essa frase escrita", text: "Sem isso, qualquer decisão de hoje é só reação ao gráfico, não estratégia." });
    } else {
      headline = "Você ainda não decidiu nada — e tá tudo bem";
      sublabel = "Só estar checando já é mais disciplina que a maioria tem";
      tone = "good";
      findings.push({
        severity: 1,
        title: "Checar sem agir por impulso é o comportamento certo",
        text: "A maioria decide no calor do momento. Você está avaliando antes — isso sozinho já reduz bastante o risco de erro.",
      });
      plan.push({ title: "Releia sua tese original", text: "Se ela continua de pé, não há motivo pra ação nenhuma agora." });
      plan.push({ title: "Defina um gatilho claro pro futuro", text: "Em vez de checar todo dia, defina o que faria você agir (ex.: queda de X%, notícia específica) e só revise quando isso acontecer." });
    }

    // achados adicionais, sempre que aplicável, independente do veredito principal
    const jaTemBinance = a.corretora === "binance";

    if (a.corretora === "outra") {
      findings.push({
        severity: 1,
        title: "Você mantém essa posição em outra corretora",
        text: "Não muda a decisão de vender ou segurar. Se um dia quiser abrir conta na Binance (plataforma diferente, verificação de identidade separada), o link abaixo dá cashback vitalício nas taxas — mas isso não move nem afeta a posição que você já tem.",
      });
    }

    // Quem já tem conta na Binance não tem como abrir outra: a verificação de
    // identidade é única por pessoa, não por conta. Ver BRAND.md "Erros já
    // cometidos" — nunca ofereça o link de indicação nesse caso.
    const convertOverride = jaTemBinance
      ? {
          tag: "Você já é cliente Binance",
          headline: "Não tem como abrir outra conta pra ganhar o cashback",
          sub: "A verificação de identidade da Binance é única por pessoa — uma vez feita, não dá pra repetir numa conta nova. O link de indicação só vale pra quem ainda não passou por esse cadastro. Isso não afeta em nada sua decisão de vender ou segurar acima.",
          hideRef: true,
          tgLabel: "💬 Revisar minha posição",
          tgPrefill: "Vim pelo 'Vender ou Segurar?' — já tenho conta Binance, quero revisar minha posição",
        }
      : undefined; // undefined = usa o flow.convert estático abaixo (caso elegível pro link)

    return {
      headline,
      sublabel,
      tone,
      stats: [
        { value: a.variacao === "lucro" ? "Lucro" : a.variacao === "prejuizo" ? "Prejuízo" : "Incerto", label: "situação atual" },
        { value: a.corretora === "binance" ? "Binance" : a.corretora === "outra" ? "Outra corretora" : "Carteira própria", label: "onde está" },
        { value: plan.length, label: "passos no protocolo" },
      ],
      findings,
      plan,
      convertOverride,
      shareCard: {
        eyebrow: "MEU PROTOCOLO DE DECISÃO",
        headline: headline,
        lines: [sublabel, "Educacional — não é recomendação de investimento"],
        headlineColor: tone === "bad" ? "#f87171" : "#6EE7A8",
        coupon: jaTemBinance
          ? {
              label: "PRESENTE POR RESPONDER",
              offerText: "Chamada de 15min\npra revisar sua posição",
            }
          : {
              label: "PRESENTE POR RESPONDER",
              offerText: "Cashback vitalício\nnas taxas Binance",
            },
      },
    };
  },

  convert: {
    tag: "Presente por responder",
    headline: "Cashback vitalício nas taxas, se ainda não tem conta",
    sub: "Vale pra quem ainda não tem conta na Binance — cashback em toda taxa, sem prazo de validade, pra sempre atrelado ao seu cadastro.",
    offers: [
      "Cashback vitalício nas taxas (não é desconto só na entrada — vale pra sempre)",
      "Chamada de 15min pra revisar sua posição e o protocolo junto comigo",
      "Sem sinais, sem promessa de lucro — só gestão de risco de verdade",
    ],
    ctaLabel: "Abrir conta com cashback vitalício →",
    tgLabel: "💬 Revisar minha posição",
    tgPrefill: "Vim pelo 'Vender ou Segurar?' — quero revisar minha posição",
  },
};
