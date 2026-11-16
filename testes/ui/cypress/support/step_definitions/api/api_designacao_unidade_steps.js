/// <reference types="cypress" />

import { When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { UNIDADE_REFERENCIA } from '../../utils/dados_designacao'

When('eu busco os dados da unidade pelo código UE conhecido', () => {
  cy.signa_api_get(`/designacao/unidade/?codigo_ue=${UNIDADE_REFERENCIA.ue}`).then((res) => {
    cy.wrap(res).as('response')
  })
})

When('eu busco os dados da unidade pelo código UE conhecido sem token', () => {
  cy.signa_api_get(`/designacao/unidade/?codigo_ue=${UNIDADE_REFERENCIA.ue}`, { semToken: true }).then(
    (res) => {
      cy.wrap(res).as('response')
    }
  )
})

When('eu busco os dados da unidade pelo código UE {string}', (codigoUe) => {
  cy.signa_api_get(`/designacao/unidade/?codigo_ue=${codigoUe}`).then((res) => {
    cy.wrap(res).as('response')
  })
})

Then('a resposta da unidade deve conter a lista de cargos', () => {
  cy.get('@response').then((res) => {
    expect(res.body).to.have.property('cargos')
    expect(res.body.cargos).to.be.an('array')
  })
})

// Antes o endpoint respondia 200 com codigo_hierarquico nulo para UE
// inexistente; desde nov/2026 responde 400 com
// {"detail": "Erro ao consultar informações da unidade escolar"}.
Then('a resposta da unidade deve trazer a mensagem de erro', () => {
  cy.get('@response').then((res) => {
    expect(res.body, JSON.stringify(res.body)).to.have.property('detail')
    expect(res.body.detail).to.be.a('string').and.not.be.empty
  })
})

When('eu listo os cargos de unidade', () => {
  cy.signa_api_get('/designacao/unidade/cargos/').then((res) => {
    cy.wrap(res).as('response')
  })
})

// ============================================================================
// TURMAS ABERTAS — turmas.total, turmas.turnos e spi devem contar apenas
// turmas abertas no EOL (concluídas e excluídas ficam de fora).
// ============================================================================

// Cada linha de turnos traz "turno", "total" e um contador por ciclo
// (cicloXxx + semCiclo); tudo que não é "turno"/"total" é ciclo.
const somarCiclos = (turnos) =>
  turnos.reduce((soma, linha) => {
    Object.entries(linha).forEach(([chave, valor]) => {
      if (chave === 'turno' || chave === 'total') return
      soma[chave] = (soma[chave] || 0) + valor
    })
    return soma
  }, {})

Then('a quantidade de turmas retornada deve ser {int}', (quantidadeEsperada) => {
  cy.get('@response').then((res) => {
    expect(res.body.turmas.total, 'turmas.total').to.eq(quantidadeEsperada)
  })
})

Then('a quantidade de turmas retornada não deve ser {int}', (quantidadeIndevida) => {
  cy.get('@response').then((res) => {
    expect(res.body.turmas.total, 'turmas.total').to.not.eq(quantidadeIndevida)
  })
})

Then('a soma da distribuição de turmas por turno deve ser {int}', (quantidadeEsperada) => {
  cy.get('@response').then((res) => {
    const soma = res.body.turmas.turnos.reduce((total, linha) => total + linha.total, 0)
    expect(soma, 'soma de turmas.turnos[].total').to.eq(quantidadeEsperada)
  })
})

Then('a soma da distribuição de turmas por ciclo deve ser {int}', (quantidadeEsperada) => {
  cy.get('@response').then((res) => {
    const porCiclo = somarCiclos(res.body.turmas.turnos)
    const soma = Object.values(porCiclo).reduce((total, valor) => total + valor, 0)
    expect(soma, `soma dos ciclos ${JSON.stringify(porCiclo)}`).to.eq(quantidadeEsperada)
  })
})

// SPI é um subconjunto das turmas da UE: se o backend contasse concluídas ou
// excluídas só no SPI, algum ciclo do SPI passaria o mesmo ciclo das abertas.
Then('a contagem de SPI deve considerar apenas as turmas abertas', () => {
  cy.get('@response').then((res) => {
    const { turmas, spi } = res.body
    const somaTurnosSpi = spi.turnos.reduce((total, linha) => total + linha.total, 0)

    expect(spi.total, 'spi.total deve bater com a soma de spi.turnos').to.eq(somaTurnosSpi)
    expect(spi.total, 'spi.total não pode passar turmas.total').to.be.at.most(turmas.total)

    const ciclosAbertos = somarCiclos(turmas.turnos)
    Object.entries(somarCiclos(spi.turnos)).forEach(([ciclo, quantidade]) => {
      expect(quantidade, `SPI ${ciclo} não pode passar as turmas abertas do ciclo`).to.be.at.most(
        ciclosAbertos[ciclo] || 0
      )
    })
  })
})

// funcionarios_unidade é indexado pelo código do cargo; a busca é pelo nome
// para o cenário ficar legível sem decorar códigos (3379, 3085...).
// O tipo do front declara modulo como string, mas a API devolve número
// (confirmado contra QA em 2026-10-22) — Number() cobre os dois formatos.
Then('o módulo do cargo {string} deve ser {int}', (nomeCargo, moduloEsperado) => {
  cy.get('@response').then((res) => {
    const cargo = Object.values(res.body.funcionarios_unidade).find((c) => c.nome_cargo === nomeCargo)
    expect(cargo, `cargo "${nomeCargo}" em funcionarios_unidade`).to.exist
    expect(Number(cargo.modulo), `módulo de ${nomeCargo}`).to.eq(moduloEsperado)
  })
})

// Evidência: o JSON completo vai para cypress/screenshots/ (já no .gitignore,
// e o corpo traz nome/RF de servidores) e o screenshot captura o painel do
// cy.api com a resposta renderizada.
Then('registro a resposta da unidade como evidência', () => {
  const nomeArquivo = Cypress.currentTest.title.replace(/[^\wÀ-ſ-]+/g, '_')

  cy.get('@response').then((res) => {
    cy.writeFile(`cypress/screenshots/evidencias/unidade/${nomeArquivo}.json`, res.body)
  })
  cy.screenshot(`evidencia_${nomeArquivo}`)
})
