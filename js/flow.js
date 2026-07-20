const FLOW = {
  slug: "vender-ou-segurar",
  reportTitle: "Seu protocolo de decisão",
  reportLabel: "Ver meu protocolo →",

  steps: [
    {
      title: "Sua posição hoje",
      description: "Onde a posição está e possuir conta em outra plataforma são informações diferentes.",
      fields: [
        {
          id: "corretora",
          label: "Onde essa posição está hoje?",
          type: "radio",
          required: true,
          options: [
            { value: "binance", label: "Binance" },
            { value: "outra", label: "Outra corretora" },
            { value: "carteira", label: "Carteira própria" },
          ],
        },
        {
          id: "jaTemBinance",
          label: "Você já possui uma conta Binance, mesmo que a posição esteja em outro lugar?",
          type: "radio",
          required: true,
          options: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
        {
          id: "variacao",
          label: "Como a posição está em relação ao valor investido?",
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
      title: "O motivo da decisão",
      description: "O motivo ajuda a separar necessidade financeira, mudança real e desconforto emocional.",
      fields: [
        {
          id: "motivo",
          label: "Por que você está pensando em vender agora?",
          type: "radio",
          required: true,
          options: [
            { value: "medo", label: "O preço caiu e tenho medo de perder mais" },
            { value: "ganancia", label: "O preço subiu e quero realizar parte do ganho" },
            { value: "necessidade", label: "Preciso do dinheiro para outra finalidade" },
            { value: "checando", label: "Estou apenas revisando a decisão" },
          ],
        },
      ],
    },
    {
      title: "Sua tese original",
      description: "Preço e tese podem mudar por motivos diferentes.",
      fields: [
        {
          id: "tese",
          label: "O que mudou desde a compra?",
          type: "radio",
          required: true,
          options: [
            { value: "so-preco", label: "Só o preço; minha razão original continua" },
            { value: "tese-mudou", label: "A razão original mudou de forma relevante" },
            { value: "sem-tese", label: "Nunca defini uma razão clara" },
          ],
        },
      ],
    },
    {
      title: "Tamanho e tranquilidade",
      description: "Uma posição que domina sua atenção pode estar maior que sua tolerância real.",
      fields: [
        {
          id: "sono",
          label: "Como essa posição afeta sua tranquilidade?",
          type: "radio",
          required: true,
          options: [
            { value: "tranquilo", label: "Consigo lidar com a oscilação" },
            { value: "mais-ou-menos", label: "Penso nisso com frequência" },
            { value: "tira-o-sono", label: "Isso afeta meu sono ou rotina" },
          ],
        },
      ],
    },
  ],

  buildReport(answers) {
    const findings = [];
    const plan = [];
    let headline = "Você pode revisar sem agir agora";
    let sublabel = "Observar e organizar critérios também é uma decisão";
    let tone = "good";
    let verdict = "nao-agir";

    if (answers.sono === "tira-o-sono") {
      headline = "A exposição pode estar maior que sua tolerância";
      sublabel = "Tranquilidade e capacidade de manter o plano são dados relevantes";
      tone = "bad";
      verdict = "reduzir-exposicao";
      findings.push({
        severity: 3,
        title: "O tamanho da posição pode ser o problema principal",
        text: "Quando a exposição afeta sono ou rotina, reduzir gradualmente ou revisar o tamanho pode ser mais simples do que buscar uma previsão de preço.",
      });
      plan.push({
        title: "Definir o nível de exposição que você consegue acompanhar",
        text: "Considere despesas, reserva, concentração e impacto emocional. O objetivo é encontrar um tamanho compatível com sua vida real, não cumprir uma regra universal.",
      });
      plan.push({
        title: "Comparar redução parcial e saída completa",
        text: "Avalie custos, impostos, liquidez e o que mudaria em sua tranquilidade em cada alternativa antes de executar qualquer ordem.",
      });
    } else if (answers.motivo === "necessidade") {
      headline = "A decisão começa pela necessidade de liquidez";
      sublabel = "Venda necessária e opinião sobre o mercado são decisões diferentes";
      verdict = "liquidez";
      findings.push({
        severity: 2,
        title: "Liquidez real pode justificar uma venda",
        text: "Quando o dinheiro tem outra finalidade concreta, estimar o valor necessário pode evitar que uma necessidade específica vire uma decisão de tudo ou nada.",
      });
      plan.push({
        title: "Estimar o valor realmente necessário",
        text: "Inclua custos, prazo e margem para imprevistos. Depois compare vender somente a parcela necessária com outras fontes de liquidez disponíveis.",
      });
      plan.push({
        title: "Revisar custos e efeito fiscal",
        text: "Taxas, spread, prazo de saque e tributação podem alterar o valor líquido recebido. Verifique as regras aplicáveis antes da execução.",
      });
    } else if (answers.tese === "tese-mudou") {
      headline = "Uma mudança de tese merece revisão consciente";
      sublabel = "Manter apenas para recuperar preço não substitui a razão original";
      verdict = "tese-mudou";
      findings.push({
        severity: 1,
        title: "Mudança de tese é diferente de oscilação de preço",
        text: "Se o motivo original deixou de existir, redução ou saída podem ser alternativas coerentes. A ferramenta não define qual delas é adequada ao seu caso.",
      });
      plan.push({
        title: "Registrar o que deixou de ser verdade",
        text: "Escreva a evidência que mudou e quais informações poderiam invalidar sua conclusão. Isso reduz a chance de confundir medo com revisão de tese.",
      });
      plan.push({
        title: "Planejar a execução antes de agir",
        text: "Compare redução, saída, prazo, custos e liquidez. Uma decisão fundamentada não exige executar tudo no mesmo momento.",
      });
    } else if (answers.motivo === "medo" && answers.tese === "so-preco") {
      headline = "O medo pode estar conduzindo a decisão";
      sublabel = "O preço mudou, mas sua razão original continua segundo suas respostas";
      tone = "bad";
      verdict = "pausa";
      findings.push({
        severity: 3,
        title: "Emoção e risco real ainda precisam ser separados",
        text: "Vontade de agir para interromper o desconforto não prova que a tese piorou. Uma pausa e uma revisão escrita podem melhorar a qualidade da decisão.",
      });
      plan.push({
        title: "Criar uma pausa antes de executar",
        text: "Registre o que mudou financeiramente, o que você está sentindo e qual risco concreto quer reduzir. Retome a decisão depois dessa separação.",
      });
      plan.push({
        title: "Revisar a tese e o tamanho da posição",
        text: "Se a tese continua, compare não agir e reduzir exposição. Se surgiram fatos novos, trate-os como possível mudança de tese.",
      });
    } else if (answers.motivo === "ganancia") {
      headline = "Realização parcial é uma alternativa possível"
      sublabel = "Você não precisa acertar o melhor preço para organizar o risco";
      verdict = "realizar";
      findings.push({
        severity: 1,
        title: "Realizar ganho não precisa ser uma decisão binária",
        text: "Manter tudo e vender tudo produzem exposições diferentes. Uma redução parcial pode ser comparada com ambas sem presumir um percentual ideal.",
      });
      plan.push({
        title: "Definir o objetivo da realização",
        text: "Decida se a prioridade é recuperar capital, reduzir concentração, criar liquidez ou diminuir ansiedade. O objetivo ajuda a dimensionar a alternativa.",
      });
      plan.push({
        title: "Comparar cenários antes da ordem",
        text: "Considere como você reagiria se o preço subisse, ficasse parecido ou caísse depois da venda. Inclua custos e impostos na comparação.",
      });
    } else if (answers.tese === "sem-tese") {
      headline = "Falta um critério para manter ou vender"
      sublabel = "Sem uma razão explícita, cada oscilação pode gerar uma nova decisão";
      tone = "bad";
      verdict = "definir-tese";
      findings.push({
        severity: 2,
        title: "A ausência de tese aumenta decisões reativas",
        text: "Antes de escolher uma ordem, vale definir horizonte, função da posição, riscos aceitos e fatos que justificariam uma revisão.",
      });
      plan.push({
        title: "Escrever uma tese mínima",
        text: "Registre por que mantém a posição, por quanto tempo pretende revisá-la e quais mudanças fariam a decisão deixar de fazer sentido.",
      });
      plan.push({
        title: "Comparar a posição com sua situação financeira",
        text: "Considere reserva, dívidas, concentração, liquidez e tranquilidade. Uma tese de ativo não corrige uma exposição incompatível com sua vida.",
      });
    } else {
      plan.push({
        title: "Revisar a tese em uma data definida",
        text: "Se não há necessidade financeira, mudança de tese ou exposição incompatível, não agir agora pode ser uma alternativa legítima.",
      });
      plan.push({
        title: "Definir gatilhos de revisão",
        text: "Escolha fatos verificáveis que justificariam nova análise, em vez de transformar cada oscilação em uma decisão.",
      });
    }

    if (answers.variacao === "prejuizo") {
      findings.push({
        severity: 2,
        title: "Prejuízo pode aumentar aversão à perda",
        text: "O preço de compra é relevante para impostos e resultado, mas não deve ser o único critério para manter uma tese que mudou ou vender uma tese que continua.",
      });
    } else if (answers.variacao === "lucro") {
      findings.push({
        severity: 1,
        title: "Lucro pode aumentar medo de devolver ganhos",
        text: "Separar objetivo de realização, concentração e necessidade de liquidez ajuda a evitar uma decisão guiada apenas pelo resultado acumulado.",
      });
    } else {
      plan.push({
        title: "Confirmar custo médio e resultado antes de decidir",
        text: "Use extratos e registros confiáveis. Incerteza sobre o resultado pode distorcer a percepção de risco e o efeito tributário.",
      });
    }

    if (answers.corretora === "carteira") {
      plan.push({
        title: "Planejar a transferência antes de uma venda",
        text: "Confirme rede, endereço, taxa, prazo e compatibilidade da plataforma de destino. Faça teste pequeno quando a transferência for necessária.",
      });
    } else if (answers.corretora === "outra") {
      plan.push({
        title: "Revisar custos e regras da plataforma atual",
        text: "Compare taxa, spread, liquidez, saque e disponibilidade no seu país antes de mover a posição ou abrir outra conta.",
      });
    } else {
      plan.push({
        title: "Usar a conta existente sem buscar novo cadastro",
        text: "Você já possui a plataforma onde a posição está. Revise segurança, custos e execução sem tentar obter benefício de conta nova.",
      });
    }

    if (answers.sono === "mais-ou-menos" && verdict !== "reduzir-exposicao") {
      findings.push({
        severity: 2,
        title: "A exposição merece acompanhamento",
        text: "Pensar frequentemente na posição pode indicar concentração ou ausência de critérios. Inclua tranquilidade na próxima revisão do tamanho.",
      });
    }

    // A trava de elegibilidade cobre apenas quem já tem conta — e país, onde
    // a pergunta existir. Motivo, tese e sono continuam definindo o veredito e
    // o TEXTO da oferta; não a existência dela.
    const eligible = answers.jaTemBinance === "nao";
    // Quando a decisão sobre a posição atual é urgente ou desconfortável, a
    // oferta continua visível, mas o texto devolve a pessoa ao passo simples:
    // resolver a posição que já existe vem antes de qualquer conta nova.
    const decisaoVemPrimeiro =
      answers.sono === "tira-o-sono" ||
      answers.motivo === "necessidade" ||
      answers.motivo === "medo" ||
      answers.tese === "tese-mudou";

    const convertOverride = eligible
      ? {
          offerKey: "default",
          tag: decisaoVemPrimeiro ? "Depois de resolver a posição" : "Comparação opcional de plataforma",
          headline: decisaoVemPrimeiro
            ? "Primeiro a posição que você já tem; a conta pode esperar"
            : "Conta nova, somente se comparar outra plataforma fizer sentido",
          sub: decisaoVemPrimeiro
            ? "A oferta aparece porque você ainda não tem conta na Binance, e ela é separada do que você veio resolver. O protocolo acima trata da posição atual — abrir conta não vende, não move e não decide nada por você. Volte aqui quando o passo de cima estiver resolvido."
            : "A oferta aparece porque você informou que ainda não tem conta na Binance e está apenas revisando a decisão, sem necessidade de liquidez, mudança de tese ou desconforto elevado.",
          offers: [
            "Cadastre-se pelo link de indicação e receba cashback vitalício em parte das taxas elegíveis.",
            "Válido para contas novas e elegíveis.",
            "Abrir conta não obriga mover a posição, depositar ou operar.",
          ],
          ctaLabel: "Ver condições para conta nova →",
          note: "Compare país, produtos, custos e benefício exibido no cadastro. A decisão sobre sua posição permanece separada desta oferta.",
          disclosure: "Este é um link de afiliado. A DLT Academy pode receber comissão se uma conta elegível for criada e utilizada. As condições exibidas pela Binance prevalecem.",
        }
      : null;

    return {
      headline,
      sublabel,
      tone,
      stats: [
        { value: answers.variacao === "lucro" ? "Lucro" : answers.variacao === "prejuizo" ? "Prejuízo" : "Incerto", label: "situação informada" },
        { value: answers.corretora === "binance" ? "Binance" : answers.corretora === "outra" ? "Outra corretora" : "Carteira própria", label: "onde está" },
        { value: eligible ? "Oferta opcional" : "Sem oferta", label: "roteamento" },
      ],
      findings,
      plan,
      convertOverride,
      extraText: "Este protocolo organiza informações para reflexão. Não fornece ordem personalizada, não prevê preço e não substitui avaliação financeira, tributária ou jurídica individual.",
      shareCard: {
        eyebrow: "MEU PROTOCOLO DE DECISÃO",
        headline,
        lines: [sublabel, "Educacional — não é recomendação de investimento"],
        headlineColor: tone === "bad" ? "#f87171" : "#6EE7A8",
      },
    };
  },
};
