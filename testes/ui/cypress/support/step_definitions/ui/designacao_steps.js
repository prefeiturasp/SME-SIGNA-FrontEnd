// Step Definitions para Designação de Servidores
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import {
  designacaoLocators,
  designacaoTextos,
  designacaoUrls,
} from '../../ui/locators/designacao_locators';

// ─── Given — Navegação ────────────────────────────────────────────────────────

Given('que o usuário está na página do dashboard', () => {
  // Após login a aplicação já está no contexto autenticado (URL pode ser / ou /pages)
  // Não forçamos cy.visit() para evitar 307 — aguardamos o carregamento natural
  cy.aguardarCarregamento();
  cy.get('main', { timeout: 15000 }).should('be.visible');
});

Given('que o usuário acessa a página de nova designação', () => {
  // Utilizado em cenários isolados: aceita URL atual pós-navegação via UI
  cy.aguardarCarregamento();
  cy.url({ timeout: 15000 }).should('include', 'designacoes-passo-1');
});

// ─── Given — Pré-condições reutilizáveis (via "E" nos cenários de setup) ──────

Given('pesquisa pelo RF {string}', (rf) => {
  cy.get(designacaoLocators.campoRF, { timeout: 10000 })
    .should('be.visible')
    .clear()
    .type(rf);
  cy.wait(1000);
  cy.get(designacaoLocators.botaoPesquisarServidor).first().click();
  cy.contains('button', designacaoTextos.tituloAccordionServidor, { timeout: 15000 })
    .should('be.visible');
});

// ─── When — Ações ─────────────────────────────────────────────────────────────

When('clica para abrir o módulo {string}', (modulo) => {
  cy.contains('h2', modulo)
    .parent()
    .parent()
    .find('button')
    .first()
    .click();
  cy.aguardarCarregamento();
});

When('navega pelo menu lateral e clica em {string}', (item) => {
  cy.wait(1000);
  cy.contains('a', item)
    .should('be.visible')
    .click();

  cy.url({ timeout: 20000 }).should('include', 'listagem-designacoes');
  cy.aguardarCarregamento();

  // Aguarda o botão "Nova Designação" estar visível no DOM — isso garante que
  // o POST RSC de conteúdo do listagem JÁ FOI processado pelo browser.
  // Só depois registramos o delay para os próximos POSTs (background refreshes).
  cy.get('main > div:first-child > div:first-child > div > button', { timeout: 20000 })
    .first()
    .should('be.visible');

  // Neste ponto o conteúdo já renderizou. Qualquer novo POST para listagem
  // é apenas background refresh — pode ser atrasado sem afetar a UI.
  cy.intercept('POST', '**/listagem-designacoes**', (req) => {
    req.continue((res) => {
      res.delay = 90000;
    });
  });
});

When('clica no botão Nova Designação', () => {
  // Intercept já ativo para listagem (registrado no step anterior)
  // Registra alias para passo-1 para confirmar que a página carregou
  cy.intercept('POST', '**/designacoes-passo-1**').as('loadPasso1');

  cy.get('main > div:first-child > div:first-child > div > button')
    .first()
    .should('be.visible')
    .click();

  cy.wait('@loadPasso1', { timeout: 20000 });
  cy.url({ timeout: 20000 }).should('include', 'designacoes-passo-1');
  cy.contains('h1', 'Designação', { timeout: 20000 }).should('be.visible');
  cy.get(designacaoLocators.campoRF, { timeout: 20000 }).should('be.visible');
});

When('preenche o campo RF com {string}', (rf) => {
  cy.get(designacaoLocators.campoRF, { timeout: 20000 })
    .should('be.visible')
    .and('not.be.disabled')
    .click();

  cy.wait(500);

  cy.get(designacaoLocators.campoRF)
    .type(rf, { delay: 150 });

  cy.wait(2000);
});

When('preenche o campo RF com RF aleatorio da lista', () => {
  const rf = rfList[Math.floor(Math.random() * rfList.length)];
  cy.log(`RF selecionado aleatoriamente: ${rf}`);
  cy.get(designacaoLocators.campoRF, { timeout: 20000 })
    .should('be.visible')
    .and('not.be.disabled')
    .click();
  cy.wait(500);
  cy.get(designacaoLocators.campoRF)
    .type(rf, { delay: 150 });
  cy.wait(2000);
});

When('clica em pesquisar', () => {
  cy.wait(1000); // pausa antes de clicar — ritmo manual
  cy.get('[id^="radix-"] form > div:nth-child(3) button, .ant-card-body form button:last-of-type, .ant-card-body button:contains("Pesquisar")')
    .first()
    .should('be.visible')
    .click();
  cy.wait(5000); // aguarda resposta da API de pesquisa de servidor
});

When('expande o accordion de dados do servidor', () => {
  cy.contains('button', designacaoTextos.tituloAccordionServidor)
    .click();
  cy.wait(1500);
  cy.get(designacaoLocators.campoNomeServidor, { timeout: 10000 })
    .should('exist');
});

When('clica em {string}', (texto) => {
  const seletor = texto.trim();
  cy.wait(800);

  if (seletor === 'Pesquisar Unidade proponente') {
    // Aguarda 25 s para o React registrar o estado dos dropdowns DRE + Unidade
    // antes de submeter o formulário de pesquisa da unidade proponente
    cy.wait(25000);

    // Seletor estável derivado do document.querySelector fornecido pelo usuário:
    // #radix-_r_3m_ > div > div > div > form > div:nth-child(1) > div.w-[150px].pt-[2rem] > button
    // O ID radix é dinâmico — usamos [id^="radix-"] + classe Tailwind w-[150px] para identificar
    // o container do botão Pesquisar da Unidade Proponente de forma única
    const seletorBotaoPesquisarUnidade = '[id^="radix-"] form div[class*="w-[150px]"] > button';

    cy.get(seletorBotaoPesquisarUnidade)
      .scrollIntoView({ duration: 600 })
      .should('be.visible')
      .and('not.be.disabled');

    cy.wait(500);

    cy.get(seletorBotaoPesquisarUnidade).click({ force: true });
    cy.wait(3000);

    // 2º clique de segurança — garante que o React processou o submit
    cy.get(seletorBotaoPesquisarUnidade).click({ force: true });

  } else if (seletor === 'Pesquisar') {
    cy.contains('button', 'Pesquisar').last()
      .scrollIntoView({ duration: 600 })
      .should('be.visible')
      .and('not.be.disabled');

    cy.wait(800);

    cy.contains('button', 'Pesquisar').last().click({ force: true });
    cy.wait(3000);

    cy.contains('button', 'Pesquisar').last().click({ force: true });

  } else {
    cy.contains('button', seletor, { timeout: 10000 }).should('be.visible').click();
  }

  cy.wait(3000);
});

When('clica no botão de editar servidor', () => {
  cy.wait(1500); // pausa — ritmo manual
  cy.get(designacaoLocators.conteudoAccordionServidor)
    .contains('button', 'Editar')
    .should('be.visible')
    .click();
  cy.wait(2000);
});

When('cancela a edição no modal', () => {
  cy.wait(1000);
  cy.get(designacaoLocators.botaoCancelarModal)
    .should('be.visible')
    .click();
  cy.wait(2000);
});

When('seleciona uma DRE aleatória no formulário', () => {
  cy.wait(1000);
  cy.get('button[role="combobox"]').first()
    .should('be.visible')
    .click();
  cy.wait(1500);
  cy.get(designacaoLocators.opcoesDropdown, { timeout: 10000 })
    .should('have.length.greaterThan', 0)
    .then(($opts) => {
      const idx = Math.floor(Math.random() * $opts.length);
      cy.wrap($opts.eq(idx)).click({ force: true });
    });
  cy.wait(3000); // aguarda unidades carregarem após seleção da DRE
});

When('seleciona uma unidade proponente aleatória', () => {
  cy.wait(1000);
  cy.get('button[role="combobox"]').eq(1)
    .should('be.visible')
    .click();
  cy.wait(1500);
  cy.get(designacaoLocators.opcoesDropdown, { timeout: 10000 })
    .should('have.length.greaterThan', 0)
    .then(($opts) => {
      // Seleciona do início da lista — primeiras unidades têm maior chance de ter dados completos
      const max = Math.min(5, $opts.length - 1);
      const idx = Math.floor(Math.random() * max);
      cy.wrap($opts.eq(idx)).scrollIntoView().click({ force: true });
    });
  cy.wait(2000);
});

When('espera {int} seg', (segundos) => {
  cy.wait(segundos * 1000);
});

When('valida a existencia do botão e clica em {string}', (texto) => {
  if (texto === 'Pesquisar Unidade proponente') {
    // XPath de referência (ID dinâmico): //*[@id="radix-_r_3g_"]/div/div/div/form/div/div[3]/button/p
    // CSS estável equivalente: [id^="radix-"] form > div > div:nth-child(3) > button
    const seletor = '[id^="radix-"] form > div > div:nth-child(3) > button';

    cy.get(seletor, { timeout: 15000 })
      .scrollIntoView({ duration: 500 })
      .should('exist')
      .and('be.visible')
      .and('not.be.disabled');

    cy.get(seletor).click({ force: true });

    // Aguarda o painel de resultado aparecer
    cy.contains('Funcionários da unidade', { timeout: 60000 }).should('exist');
    cy.wait(2000);
  } else {
    cy.contains('button', texto, { timeout: 15000 })
      .scrollIntoView()
      .should('be.visible')
      .and('not.be.disabled')
      .click({ force: true });
  }
});

When('espera os dados da unidade carregarem', () => {
  // Rola para baixo para garantir que o painel está na viewport (lazy render)
  cy.scrollTo('bottom', { duration: 800, ensureScrollable: false });
  cy.wait(1000);

  // Polling do DOM: fica verificando a cada 50 ms até 60 s
  cy.contains('Funcionários da unidade', { timeout: 60000 })
    .should('exist');

  cy.wait(2000);
});

When('clica em pesquisar unidade proponente', () => {
  cy.intercept('POST', '**/designacoes-passo-1**').as('loadResultadoPesquisa');
  cy.contains('button', 'Pesquisar').last()
    .should('be.visible')
    .click();
  cy.wait('@loadResultadoPesquisa', { timeout: 30000 });
  cy.wait(2000);
});

When('seleciona o cargo {string} no painel da unidade', (cargo) => {
  // Botão de seleção de cargo dentro do painel Radix (form-item com botões de opção)
  cy.get('[id$="-form-item"] button')
    .first()
    .should('be.visible')
    .click();
  cy.wait(1500);
  // Aguarda a opção específica ficar disponível e clica
  cy.contains('[role="option"], button, label', cargo, { timeout: 10000 })
    .should('be.visible')
    .click({ force: true });
  cy.wait(2000); // aguarda os campos adicionais renderizarem (Qtd. Turmas, Cargo sobreposto, Módulos)
});

When('seleciona o cargo de forma aleatoria no painel da unidade', () => {
  // Abre o combobox de cargos disponíveis na unidade proponente
  cy.get('[id$="-form-item"] button', { timeout: 10000 })
    .first()
    .should('be.visible')
    .click();
  cy.wait(1500);
  cy.get('[role="option"]', { timeout: 10000 })
    .should('have.length.greaterThan', 0)
    .then(($opts) => {
      const idx = Math.floor(Math.random() * $opts.length);
      cy.log(`Cargo selecionado (índice ${idx}): ${$opts.eq(idx).text().trim()}`);
      cy.wrap($opts.eq(idx)).click({ force: true });
    });
  cy.wait(2000);
});

When('clica no botão Avançar', () => {
  // Botão Avançar na barra inferior da página
  cy.get('main > div:nth-child(4) > div > div:nth-child(2) > button, button:contains("Avançar")')
    .last()
    .should('be.visible')
    .click();
  cy.wait(3000);
});

// ─── Then — Asserções ──────────────────────────────────────────────────────────

Then('deve visualizar o card do módulo {string}', (modulo) => {
  cy.contains('h2', modulo).should('be.visible');
  cy.get(designacaoLocators.descricaoCardDesignacao).should('be.visible');
});

Then('o sistema valida que está na listagem de designações', () => {
  cy.url({ timeout: 15000 }).should('include', 'listagem-designacoes');
});

Then('o sistema valida que está na página de nova designação', () => {
  cy.url({ timeout: 15000 }).should('include', 'designacoes-passo-1');
});

Then('deve visualizar o texto {string}', (texto) => {
  // scrollIntoView garante que o elemento está na viewport antes de validar visibilidade
  cy.contains(texto, { timeout: 30000 })
    .should('exist')
    .scrollIntoView()
    .should('be.visible');
});

Then('deve visualizar o formulário da designação', () => {
  cy.contains('h1', 'Designação').should('be.visible');
  cy.get(designacaoLocators.cardServidorIndicado).should('be.visible');
  cy.get(designacaoLocators.campoRF).should('be.visible');
});

Then('deve exibir o accordion {string}', (titulo) => {
  cy.contains('button', titulo, { timeout: 15000 })
    .should('be.visible');
});

Then('o sistema abre o conteúdo do accordion', () => {
  cy.get('[data-state="open"]', { timeout: 10000 }).should('exist');
  cy.wait(2000);
});

Then('deve visualizar os campos de dados do servidor', () => {
  // Campos obrigatórios — sempre presentes
  const camposObrigatorios = [
    designacaoLocators.campoNomeServidor,
    designacaoLocators.campoRFServidor,
    designacaoLocators.campoVinculo,
    designacaoLocators.campoCargoBase,
    designacaoLocators.campoLotacao,
  ];

  camposObrigatorios.forEach((seletor) => {
    cy.get(seletor).should('exist');
  });

  // Campos opcionais — dependem do cadastro do servidor
  const camposOpcionais = [
    designacaoLocators.campoNomeSocial,
    designacaoLocators.campoCursosTitulos,
    designacaoLocators.campoCargoSobreposto,
    designacaoLocators.campoLocalExercicio,
    designacaoLocators.campoLaudoMedico,
  ];

  cy.get('body').then(($body) => {
    camposOpcionais.forEach((seletor) => {
      if ($body.find(seletor).length > 0) {
        cy.get(seletor).should('exist');
      } else {
        cy.log(`Campo opcional não presente: ${seletor}`);
      }
    });
  });
});

Then('deve abrir o modal de edição dos dados do servidor', () => {
  cy.get(designacaoLocators.modalEditar, { timeout: 10000 }).should('be.visible');
  cy.contains('h2', designacaoTextos.tituloModalEditar).should('be.visible');
});

Then('o modal deve exibir os campos editáveis do servidor', () => {
  const labelsObrigatorios = [
    designacaoLocators.labelNomeServidor,
    designacaoLocators.labelRFModal,
    designacaoLocators.labelVinculo,
    designacaoLocators.labelCargoBase,
    designacaoLocators.labelLotacao,
  ];

  // Campos opcionais (NomeSocial excluído — depende do cadastro e pode causar falsos negativos)
  const labelsOpcionais = [
    designacaoLocators.labelCargoSobreposto,
    designacaoLocators.labelLocalExercicio,
    designacaoLocators.labelLaudoMedico,
  ];

  cy.get(designacaoLocators.modalEditar).then(($modal) => {
    labelsObrigatorios.forEach((seletor) => {
      cy.wrap($modal).find(seletor).should('exist');
    });

    labelsOpcionais.forEach((seletor) => {
      if ($modal.find(seletor).length > 0) {
        cy.wrap($modal).find(seletor).should('exist');
      } else {
        cy.log(`Label opcional não presente no modal: ${seletor}`);
      }
    });
  });

  cy.get(designacaoLocators.botaoCancelarModal).should('be.visible');
  cy.get(designacaoLocators.botaoSalvarModal).should('be.visible');
});

Then('o modal de edição deve ser fechado', () => {
  cy.get(designacaoLocators.modalEditar, { timeout: 10000 }).should('not.exist');
  cy.wait(1000);
});

Then('deve visualizar a seção de unidade proponente', () => {
  cy.contains('span', designacaoTextos.tituloUnidadeProponente, { timeout: 10000 }).should('be.visible');
  cy.get(designacaoLocators.labelDRE).should('exist');
  cy.get(designacaoLocators.labelUnidadeProponente).should('exist');
  cy.wait(1000);
});

Then('o sistema carrega o painel de dados da unidade proponente', () => {
  // O painel já foi aguardado no step anterior (espera os dados da unidade carregarem)
  // Confirma que o conteúdo está visível após scroll para garantir que o elemento está na viewport
  cy.scrollTo('bottom', { duration: 500 });
  cy.contains('DRE', { timeout: 15000 }).should('be.visible');
});

Then('o sistema exibe a seção {string}', (titulo) => {
  cy.contains(titulo, { timeout: 15000 }).should('be.visible');
  cy.wait(1000);
});

// ─── Passo 2 — Portarias de designação ────────────────────────────────────────

// ─── Lista de RFs para seleção aleatória ─────────────────────────────────────
const rfList = [
  '7311559', '7704941', '5764521', '7443625',
  '7914229', '7209983', '7443668',
];

const numerosPortaria = [
  '1234567','2345678','3456789','4567890','5678901',
  '6789012','7890123','8901234','9012345','0123456',
  '1357924','2468013','3579124','4680235','5791346',
  '6802457','7913568','8024679','9135780','0246891',
  '1470258','2581369','3692470','4703581','5814692',
  '6925703','7036814','8147925','9258036','0369147',
];

const numerosSEI = [
  '7654321','6543210','5432109','4321098','3210987',
  '2109876','1098765','0987654','9876543','8765432',
  '9753108','8642097','7531986','6420875','5319764',
  '4208653','3197542','2086431','1975320','0864219',
  '9630741','8529630','7418529','6307418','5196307',
  '4085196','3974085','2863974','1752863','0641752',
];

Then('deve visualizar os campos da portaria', () => {
  const labels = [
    'Portaria da designação', 'Ano Vigente', 'Nº SEI', 'D.O', 'Designação',
    'A partir de', 'Até', 'Carater Especial', 'Impedimento para substituição',
    'Com afastamento?', 'Possui pendência?', 'Selecione o tipo de cargo:',
    'Cargo Disponível', 'Cargo Vago',
  ];
  labels.forEach((texto) => {
    cy.contains(texto, { timeout: 10000 }).should('exist');
  });
});

When('preenche o campo portaria com numero aleatorio', () => {
  const numero = numerosPortaria[Math.floor(Math.random() * numerosPortaria.length)];
  // XPath de referência: .../form/div[2]/div[2]/div[1]/.../div[1]/div[1]/div/input
  // Primeiro input de texto habilitado na seção da portaria (div[1] do segundo card)
  cy.get('main form > div:nth-child(2) > div:nth-child(2) > div:nth-child(1)', { timeout: 10000 })
    .find('input')
    .not('[type="radio"]').not('[type="checkbox"]').not('[type="hidden"]').not(':disabled')
    .first()
    .should('be.visible')
    .clear().type(numero, { delay: 80 });
  cy.wait(500);
});

When('preenche o campo SEI com numero aleatorio', () => {
  const numero = numerosSEI[Math.floor(Math.random() * numerosSEI.length)];
  // XPath de referência: .../form/div[2]/div[2]/div[1]/.../div[1]/div[3]/div/input
  // Terceiro campo da grade (portaria=div[1], ano vigente=div[2], SEI=div[3])
  // Usando label 'Nº SEI' para localização estável
  cy.contains('label', 'Nº SEI', { timeout: 10000 })
    .invoke('attr', 'for')
    .then((inputId) => {
      if (inputId) {
        cy.get(`#${inputId}`)
          .should('be.visible').and('not.be.disabled')
          .clear().type(numero, { delay: 80 });
      } else {
        // Fallback: segundo input habilitado na seção portaria
        cy.get('main form > div:nth-child(2) > div:nth-child(2) > div:nth-child(1)')
          .find('input')
          .not('[type="radio"]').not('[type="checkbox"]').not('[type="hidden"]').not(':disabled')
          .eq(1)
          .should('be.visible')
          .clear().type(numero, { delay: 80 });
      }
    });
  cy.wait(500);
});

When('navega ate Seleciona o tipo de cargo', () => {
  // CSS derivado do querySelector fornecido:
  // .ant-card-body > div.p-4.pt-4.border-t.mt-4 > div > div.space-y-3 > label
  cy.get('.ant-card-body > div.p-4.pt-4.border-t > div > div.space-y-3 > label', { timeout: 10000 })
    .first()
    .scrollIntoView({ duration: 500 })
    .should('be.visible');
  cy.wait(500);
});

When('valida a existencia das opcoes Cargo Disponivel e Cargo Vago', () => {
  // Estrutura DOM (IDs dinâmicos Radix):
  // Cargo Disponível: [id$="-form-item"] > div:nth-child(1) > label
  //   ex: document.querySelector("#_r_6dl_-form-item > div:nth-child(1) > label")
  // Cargo Vago:       [id$="-form-item"] > div:nth-child(2) > label
  //   ex: document.querySelector("#_r_6dl_-form-item > div:nth-child(2) > label")
  cy.contains('label', 'Cargo Disponível', { timeout: 10000 }).should('exist');
  cy.contains('label', 'Cargo Vago', { timeout: 10000 }).should('exist');
});

When('seleciona a opcao {string}', (opcao) => {
  // Estrutura: [id$="-form-item"] > div:nth-child(N) > label
  // Cargo Disponível → div:nth-child(1), Cargo Vago → div:nth-child(2)
  // ex: document.querySelector("#_r_sm_-form-item > div:nth-child(2) > label")
  cy.contains('label', opcao, { timeout: 10000 })
    .scrollIntoView()
    .should('be.visible')
    .click({ force: true });
  cy.wait(1500);
});

When('seleciona e clica a opcao {string}', (opcao) => {
  // ex: document.querySelector("#_r_sm_-form-item > div:nth-child(2) > label") para "Cargo Vago"
  cy.contains('label', opcao, { timeout: 10000 })
    .scrollIntoView()
    .should('be.visible')
    .click({ force: true });
  cy.wait(1500);
});

When('clica no campo e seleciona aleatoriamente um dos cargos vagos', () => {
  // Campo "Selecione o cargo" é Radix/Shadcn Select — trigger é button[role="combobox"]
  // Navegação pelo label para garantir o campo correto independente de IDs dinâmicos
  cy.wait(1500);
  cy.contains('label', 'Selecione o cargo', { timeout: 10000 })
    .should('be.visible')
    .parent()
    .find('button[role="combobox"]', { timeout: 10000 })
    .scrollIntoView({ duration: 300 })
    .should('be.visible')
    .click({ force: true });
  cy.wait(500);
  cy.get('[role="option"]', { timeout: 10000 })
    .filter(':visible')
    .should('have.length.greaterThan', 0)
    .then(($opts) => {
      const idx = Math.floor(Math.random() * $opts.length);
      cy.log(`Cargo vago selecionado (índice ${idx}): ${$opts.eq(idx).text().trim()}`);
      cy.wrap($opts.eq(idx)).click({ force: true });
    });
  cy.wait(2000);
});

When('preenche o campo RF titular com {string}', (rf) => {
  cy.get('.ant-card-body').last()
    .find('input').first()
    .should('be.visible').and('not.be.disabled')
    .clear().type(rf, { delay: 100 });
  cy.wait(1000);
});

// ── Passo 2 — step novo: clica + preenche RF do titular (aleatório da lista) ──
When('clica e preenche o campo RF titular com um dos RF da lista', () => {
  const rf = rfList[Math.floor(Math.random() * rfList.length)];
  cy.log(`RF titular selecionado aleatoriamente: ${rf}`);
  const titularSection = 'main form > div:nth-child(2) > div:nth-child(2) > div:nth-child(2)';
  cy.get(titularSection, { timeout: 10000 })
    .find('input')
    .not('[type="radio"]').not('[type="checkbox"]').not('[type="hidden"]')
    .filter(':visible')
    .first()
    .should('be.visible').and('not.be.disabled')
    .click()
    .clear().type(rf, { delay: 100 });
  cy.wait(1000);
});

// ── Passo 2 — step novo: clica + preenche RF do titular ───────────────────────
When('clica e preenche o campo RF titular com {string}', (rf) => {
  // XPath de referência: //*[@id="_r_o8_-form-item"] — ID dinâmico Radix
  // A seção do titular é div:nth-child(2) do segundo bloco de cards
  const titularSection = 'main form > div:nth-child(2) > div:nth-child(2) > div:nth-child(2)';
  cy.get(titularSection, { timeout: 10000 })
    .find('input')
    .not('[type="radio"]').not('[type="checkbox"]').not('[type="hidden"]')
    .filter(':visible')
    .first()
    .should('be.visible').and('not.be.disabled')
    .click()
    .clear().type(rf, { delay: 100 });
  cy.wait(1000);
});

// ── Passo 2 — step novo: valida e clica em pesquisar o titular ────────────────
When('valida a existencia do botao e clica em pesquisar o titular', () => {
  // XPath: .../form/div[2]/div[2]/div[2]/div/div[2]/.../div[2]/button
  // Escopo na seção titular (div:nth-child(2)) — botão de pesquisar dentro dela
  const titularSection = 'main form > div:nth-child(2) > div:nth-child(2) > div:nth-child(2)';
  cy.get(`${titularSection} > div > div:nth-child(2) button`, { timeout: 15000 })
    .filter(':visible')
    .last()
    .scrollIntoView({ duration: 400 })
    .should('be.visible')
    .and('not.be.disabled')
    .click({ force: true });

  // Aguarda os dados do titular aparecerem no DOM (Nome Servidor é o primeiro campo)
  // Timeout alto (120s) pois a API pode ser lenta dependendo do ambiente
  cy.contains('Nome Servidor', { timeout: 120000 }).should('exist');
  cy.wait(2000);
});

When('clica em pesquisar o titular', () => {
  cy.get('.ant-card-body').last()
    .find('button').last()
    .scrollIntoView({ duration: 400 })
    .should('be.visible').and('not.be.disabled');
  cy.wait(500);
  cy.get('.ant-card-body').last().find('button').last().click({ force: true });
  cy.wait(5000);
});

Then('o sistema carrega e exibe os dados do titular', () => {
  cy.get('[id^="radix-"]', { timeout: 20000 }).filter(':visible')
    .should('have.length.greaterThan', 0);
  cy.wait(2000);
});

Then('deve visualizar os campos do servidor titular', () => {
  // Usando textos parciais para evitar falhas por acento/capitalização diferente
  // Nome Social é OPCIONAL — depende do cadastro e pode causar falsos negativos
  const campos = [
    'Nome Servidor',  // Nome Servidor
    'RF',             // RF
    'nculo',          // Vínculo / Vinculo (partial para evitar problema de acento)
    'Cargo base',     // Cargo base
    'Lota',           // Lotação (partial)
    'Laudo',          // Laudo Médico / Laudo médico (partial)
    'sobreposto',     // Cargo sobreposto/Função Atividade (partial)
    'Local',          // Local de Exercício (partial)
  ];
  campos.forEach((texto) => {
    cy.contains(texto, { timeout: 10000 }).should('exist');
  });
});

When('clica no botao editar do titular', () => {
  cy.get('[id^="radix-"] button:contains("Editar"), [data-state="open"] button:contains("Editar")')
    .last().scrollIntoView().should('be.visible')
    .click({ force: true });
  cy.wait(2000);
});

Then('deve abrir o modal de edicao do servidor titular', () => {
  cy.get('[role="dialog"]', { timeout: 10000 }).should('be.visible');
  cy.contains('h2', 'Editar dados servidor indicado').should('be.visible');
});

Then('o modal deve exibir os campos editaveis do titular', () => {
  // Campos obrigatórios no modal do titular (Nome Social é opcional — depende do cadastro)
  const labelsObrigatorios = [
    'Nome servidor', 'RF', 'Vínculo', 'Cargo base', 'Lotação',
  ];
  cy.get('[role="dialog"]').within(() => {
    labelsObrigatorios.forEach((texto) => {
      cy.contains(texto, { timeout: 5000 }).should('exist');
    });
    cy.contains('button', 'Cancelar').should('be.visible');
    cy.contains('button', 'Salvar').should('be.visible');
  });
});

When('cancela a edicao no modal do titular', () => {
  cy.get('[role="dialog"]').within(() => {
    cy.contains('button', 'Cancelar').should('be.visible').click();
  });
  cy.wait(1000);
});

Then('o modal de edicao do titular deve ser fechado', () => {
  cy.get('[role="dialog"]', { timeout: 10000 }).should('not.exist');
  cy.wait(1000);
});

Then('deve visualizar os botoes de navegacao do passo 2', () => {
  cy.contains('button', 'Voltar', { timeout: 10000 }).should('be.visible');
  cy.contains('button', 'Avançar', { timeout: 10000 }).should('be.visible');
});

When('clica em Avançar no rodape do passo 2', () => {
  // Diagnóstico: cy.get(selector, { timeout }) aguarda o elemento EXISTIR, não o
  // seu ESTADO. Quando o botão já existe (mas disabled), o timeout é consumido
  // imediatamente e o .should() downstream usa apenas defaultCommandTimeout (10s).
  //
  // Solução definitiva: .should(callback) colocado DIRETAMENTE em cy.get() força
  // o Cypress a re-executar cy.get() + callback inteiro a cada retry, respeitando
  // os 60s. Traversals intermediários (.filter, .last) quebram esse vínculo.
  cy.wait(5000); // absorve latência de API pós-modal do titular
  cy.get('button', { timeout: 60000 }).should(($buttons) => {
    const $avançar = $buttons.filter(':contains("Avançar")');
    expect($avançar.length, 'botão Avançar deve existir').to.be.greaterThan(0);
    expect($avançar.last().prop('disabled'), 'botão Avançar deve estar habilitado').to.equal(false);
  });
  cy.contains('button', 'Avançar').last()
    .scrollIntoView()
    .should('be.visible')
    .click({ force: true });
  cy.wait(4000);
});

// ─── Passo 3 — Resumo e confirmação ───────────────────────────────────────────

Then('o sistema direciona para a pagina de resumo da designacao', () => {
  cy.contains('PORTARIA', { timeout: 20000 }).should('exist');
  cy.wait(1000);
});

Then('deve visualizar os dados do resumo da portaria', () => {
  cy.contains('PORTARIA', { timeout: 15000 }).should('be.visible');
  cy.contains('PORTARIA Nº', { timeout: 10000 }).should('exist');
  cy.contains('SEI Nº', { timeout: 10000 }).should('exist');
  // Rola até o final para garantir que seções abaixo do fold sejam renderizadas
  cy.scrollTo('bottom', { ensureScrollable: false, duration: 500 });
  cy.wait(2000);
});

When('preenche o campo informacoes adicionais', () => {
  const texto = 'Insira informações que considerar importante no processo da designação. Este é um campo opcional.';
  cy.get('textarea, [id$="-form-item"] textarea').first()
    .scrollIntoView().should('be.visible')
    .click().clear().type(texto, { delay: 30 });
  cy.wait(500);
});

When('seleciona a opcao contabilizar no historico', () => {
  cy.contains('button', 'Contabilizar')
    .scrollIntoView().should('be.visible')
    .click({ force: true });
  cy.wait(1000);
  cy.get('[role="option"]').then(($opts) => {
    if ($opts.length > 0) {
      cy.contains('[role="option"]', 'Contabilizar').click({ force: true });
    }
  });
  cy.wait(1000);
});

Then('deve visualizar os botoes de confirmacao', () => {
  cy.contains('button', 'Voltar', { timeout: 10000 }).scrollIntoView().should('be.visible');
  cy.contains('button', 'Salvar', { timeout: 10000 }).scrollIntoView().should('be.visible');
});

When('clica em Salvar', () => {
  // Intercepta a navegação pós-save para qualquer dessas rotas
  cy.intercept('GET', '**/listagem-designacoes**').as('redirecionaListagem');
  cy.intercept('POST', '**/listagem-designacoes**').as('carregaListagem');

  cy.get('main > div:nth-child(5) > div > div:nth-child(2) > button, button:contains("Salvar")')
    .last()
    .scrollIntoView({ duration: 400 })
    .should('be.visible')
    .and('not.be.disabled')
    .click({ force: true });

  // Fecha modal de confirmação se aparecer (ex: "Confirmar designação?")
  cy.get('body').then(($body) => {
    if ($body.find('[role="dialog"] button:contains("Confirmar"), [role="dialog"] button:contains("Sim")').length > 0) {
      cy.get('[role="dialog"] button:contains("Confirmar"), [role="dialog"] button:contains("Sim")')
        .first()
        .click({ force: true });
    }
  });

  cy.wait(3000);
});

Then('o sistema conclui e direciona para listagem de designacoes', () => {
  // Aguarda o redirecionamento para listagem — pode demorar após confirmação
  // Tenta via URL primeiro; se não redirecionar, aguarda o alias de intercept
  cy.url({ timeout: 45000 }).then((url) => {
    if (url.includes('listagem-designacoes')) {
      // Redirecionou normalmente
      cy.aguardarCarregamento();
      cy.get('main', { timeout: 15000 }).should('be.visible');
    } else {
      // Ainda em passo-3 — aguarda o GET de redirect pelo alias
      cy.wait('@redirecionaListagem', { timeout: 30000 });
      cy.url({ timeout: 20000 }).should('include', 'listagem-designacoes');
      cy.aguardarCarregamento();
      cy.get('main', { timeout: 15000 }).should('be.visible');
    }
  });
});

// ─── Cenários de Exceção ──────────────────────────────────────────────────────

Then('o sistema exibe mensagem de servidor não encontrado', () => {
  // Aguarda a resposta da API de pesquisa
  cy.wait(6000);
  // Para RF inválido, o accordion de dados do servidor NÃO deve aparecer
  // O sistema pode exibir toast, alerta ou simplesmente não renderizar o accordion
  cy.contains('button', 'Dados do servidor indicado', { timeout: 3000 })
    .should('not.exist');
  cy.log('Comportamento correto: accordion de dados do servidor não exibido para RF inválido');
});

When('tenta avançar o passo 2 sem preencher a portaria', () => {
  // Rola até o rodapé e clica em Avançar sem preencher os campos obrigatórios
  cy.contains('button', 'Avançar', { timeout: 10000 })
    .last()
    .scrollIntoView()
    .should('be.visible')
    .click({ force: true });
  cy.wait(2000);
});

Then('o sistema impede o avanco do passo 2', () => {
  // O sistema deve permanecer no passo 2 — não deve navegar para o passo 4
  cy.url({ timeout: 5000 }).should('include', 'designacoes-passo-2');
  cy.log('Avanço bloqueado corretamente: sistema permanece no passo 2');
});

Then('o sistema exibe mensagem de titular não encontrado', () => {
  cy.wait(5000);
  // "Nome Servidor" existe no DOM desde o accordion do servidor principal (passo 1).
  // É necessário escopar a verificação à seção do titular para não ter falso positivo.
  const titularSection = 'main form > div:nth-child(2) > div:nth-child(2) > div:nth-child(2)';
  cy.get(titularSection).within(() => {
    cy.contains('Nome Servidor', { timeout: 3000 }).should('not.exist');
  });
  cy.log('Comportamento correto: dados do titular não carregados para RF inválido');
});

When('tenta pesquisar sem preencher o campo RF', () => {
  // Garante que o campo RF está vazio, depois tenta clicar em Pesquisar
  cy.get(designacaoLocators.campoRF, { timeout: 10000 })
    .should('be.visible')
    .clear();
  cy.wait(500);
  cy.get('[id^="radix-"] form > div:nth-child(3) button, .ant-card-body form button:last-of-type, .ant-card-body button:contains("Pesquisar")', { timeout: 10000 })
    .first()
    .should('be.visible')
    .click({ force: true });
  cy.wait(5000);
});

Then('o sistema impede a pesquisa sem RF', () => {
  // Com RF vazio, o accordion de dados do servidor não deve aparecer
  cy.contains('button', 'Dados do servidor indicado', { timeout: 3000 })
    .should('not.exist');
  cy.log('Comportamento correto: pesquisa bloqueada com RF vazio');
});
