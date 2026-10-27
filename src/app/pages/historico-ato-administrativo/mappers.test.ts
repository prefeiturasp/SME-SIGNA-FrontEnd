import { describe, expect, it } from "vitest";
import { mapearHistoricoParaAtosPrincipais } from "./mappers";
import type { DesignacaoHistorico } from "@/types/historico-designacoes";

const designacaoBase: DesignacaoHistorico = {
  id: 1,
  status: "insubsistente",
  numero_portaria: 12,
  ano_vigente: "2021",
  portaria: "12/2021",
  sei_numero: "12",
  doc: null,
  ue: "014591",
  dre: "108100",
  dre_nome: "DIRETORIA REGIONAL DE EDUCACAO BUTANTA",
  unidade_proponente: "EMEI - BENEDICTO CASTRUCCI, PROF.",
  codigo_hierarquico: "162100000140000",
  cargo: "DIRETOR DE ESCOLA",
  servidor_indicado: "VANESSA GUSTAVO DA SILVA",
  indicado_rf: "7914229",
  data_inicio: "2012-09-30",
  data_fim: null,
  vigente: false,
  cessada_em: null,
  atos_relacionados: [
    {
      id: 2,
      ato_pai_id: 1,
      tipo: "APOSTILA",
      tipo_de_ato: "Apostila",
      nivel: 1,
      data_do_ato: null,
      numero_portaria: 11,
      ano_vigente: "",
      portaria: "11",
      nome_display: "VANESSA GUSTAVO DA SILVA",
      observacao: "",
      ativo: false,
      ultimo_ato_vigente: false,
    },
    {
      id: 35,
      ato_pai_id: 1,
      tipo: "INSUBSISTENCIA",
      tipo_de_ato: "Insubsistência",
      nivel: 1,
      data_do_ato: "2013-05-10",
      numero_portaria: 13,
      ano_vigente: "2013",
      portaria: "13/2013",
      nome_display: "VANESSA GUSTAVO DA SILVA",
      observacao: "13",
      ativo: true,
      ultimo_ato_vigente: true,
    },
  ],
};

describe("mapearHistoricoParaAtosPrincipais", () => {
  it("mapeia a designação principal com os dados exibidos no card", () => {
    const [atoPrincipal] = mapearHistoricoParaAtosPrincipais([designacaoBase]);

    expect(atoPrincipal).toMatchObject({
      id: 1,
      tipo_ato_display: "Designação",
      realizada_em: "30/09/2012",
      data_cessacao: "",
      status: "INSUBSISTENTE",
      numero_portaria: "12/2021",
      cargo_display: "DIRETOR DE ESCOLA",
      nome_servidor_indicado: "VANESSA GUSTAVO DA SILVA",
    });
  });

  it("usa a data de cessação quando a designação foi cessada", () => {
    const [atoPrincipal] = mapearHistoricoParaAtosPrincipais([
      { ...designacaoBase, status: "cessada", cessada_em: "2020-03-04" },
    ]);

    expect(atoPrincipal).toMatchObject({
      status: "CESSADA",
      data_cessacao: "04/03/2020",
    });
  });

  it("marca como vigente a designação ativa", () => {
    const [atoPrincipal] = mapearHistoricoParaAtosPrincipais([
      { ...designacaoBase, status: "vigente", vigente: true },
    ]);

    expect(atoPrincipal.status).toBe("EM_VIGENCIA");
  });

  it("mapeia os atos relacionados indicando o último ato vigente como principal", () => {
    const [atoPrincipal] = mapearHistoricoParaAtosPrincipais([designacaoBase]);

    expect(atoPrincipal.atos_relacionados).toEqual([
      {
        id: 2,
        data: "",
        portaria: "11",
        titulo: "Apostila",
        descricao: "",
        principal: false,
        esta_vigente: false,
      },
      {
        id: 35,
        data: "10/05/2013",
        portaria: "13/2013",
        titulo: "Insubsistência",
        descricao: "13",
        principal: true,
        esta_vigente: true,
      },
    ]);
  });

  it("retorna lista vazia quando não recebe designações", () => {
    expect(mapearHistoricoParaAtosPrincipais()).toEqual([]);
    expect(mapearHistoricoParaAtosPrincipais([])).toEqual([]);
  });
});
