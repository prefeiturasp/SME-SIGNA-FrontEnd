// =====================================================
// PACK - MEUS DADOS / ALTERAÇÃO DE E-MAIL
// =====================================================

export const meusDadosPack = {

  // ===============================
  // 🌐 PÁGINA / CONTEXTO
  // ===============================
  pagina: {
    principal: () =>
      cy.get('main, #root').should('be.visible')
  },

  // ===============================
  // 🧭 MENU / ACESSO
  // ===============================
  menu: {
    // Ant Design Menu — estrutura: <li><span class="ant-menu-title-content">Meus dados</span></li>
    // Parent (acordeão) e filho (link) têm spans com o mesmo texto.
    // cy.contains() retorna elemento único → usar cy.get().filter().last() para pegar sub-item filho.
    meusDados: () =>
      cy.get('span')
        .filter((i, el) => /meus dados/i.test(el.textContent.trim()))
        .last()
  },

  // ===============================
  // 🧾 TÍTULOS / TEXTOS
  // ===============================
  textos: {
    tituloMeusDados: () =>
      cy.contains(/meus dados/i),

    qualquerTexto: (texto) =>
      cy.contains(texto, { timeout: 10000 })
  },

  // ===============================
  // 🔘 BOTÕES
  // ===============================
  botoes: {
    alterarEmail: () =>
      cy.contains('button, a, span, div[role="button"]', /alterar e-?mail/i, { timeout: 15000 }),

    alterarSenha: () =>
      cy.contains('button, a, span, div[role="button"]', /alterar senha/i, { timeout: 15000 }),

    qualquer: (texto) =>
      cy.contains('button, a, span, div[role="button"]', texto, { timeout: 15000 })
  },

  // ===============================
  // 📧 CAMPO E-MAIL
  // ===============================
  campos: {
    email: () =>
      cy.get('input[type="email"], input[placeholder*="mail" i], input[placeholder*="e-mail" i], input[name*="email" i]')
        .filter(':visible')
        .first()
  },

  // ===============================
  // 💬 MENSAGENS / ALERTAS
  // ===============================
  mensagens: {
    alerta: () =>
      cy.get('[role="alert"], .ant-message, .ant-notification, [class*="toast"], [class*="alert"], [class*="success"], [class*="notice"]', { timeout: 10000 })
        .filter(':visible')
        .first(),

    qualquerConfirmacao: () =>
      cy.contains(/e-?mail.*alterado|alteração.*sucesso|enviado|confirma|atenção|aviso/i, { timeout: 10000 })
  }
}
