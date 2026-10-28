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
  nome: "VANESSA GUSTAVO DA SILVA",
  indicado_nome_servidor: "VANESSA GUSTAVO DA SILVA",
  indicado_nome_civil: "",
  tipo: "DESIGNACAO",
  tipo_de_ato: "Designação",
  status_publicacao: "NAO_PUBLICADO",
  ato_pai_id: null,
  ato_raiz_id: null,
  criado_em: "2026-09-30T12:38:15.722045-03:00",
  criado_por_nome: "ADALBERTO PAVLIDIS DA SILVA",
  rf: "7914229",
  indicado_rf: "7914229",
  data_inicio: "2012-09-30",
  data_fim: null,
  vigente: false,
  cessada_em: null,
  atos_relacionados: [
    {
      id: 2,
      ato_pai_id: 1,
      ato_raiz_id: 1,
      cargo: "DIRETOR DE ESCOLA",
      rf: "7914229",
      status: "insubsistente",
      status_publicacao: "NAO_PUBLICADO",
      sei_numero: "12",
      doc: null,
      criado_em: "2026-09-30T12:38:42.772457-03:00",
      criado_por_nome: "ADALBERTO PAVLIDIS DA SILVA",
      tipo_apostila: null,
      tipo_insubsistencia: null,
      data_cessacao: null,
      tipo: "APOSTILA",
      tipo_de_ato: "Apostila de Designação",
      nivel: 1,
      data_designacao: "2012-09-30",
      numero_portaria: 11,
      ano_vigente: "",
      portaria: "11",
      nome: "VANESSA GUSTAVO DA SILVA",
      observacoes: "",
      ativo: false,
      ultimo_ato_vigente: false,
    },
    {
      id: 35,
      ato_pai_id: 1,
      ato_raiz_id: 1,
      cargo: "DIRETOR DE ESCOLA",
      rf: "7914229",
      status: "insubsistente",
      status_publicacao: "NAO_PUBLICADO",
      sei_numero: "12",
      doc: null,
      criado_em: "2026-09-30T12:38:42.772457-03:00",
      criado_por_nome: "ADALBERTO PAVLIDIS DA SILVA",
      tipo_apostila: null,
      tipo_insubsistencia: null,
      data_cessacao: null,
      tipo: "INSUBSISTENCIA",
      tipo_de_ato: "Insubsistência de Designação",
      nivel: 1,
      data_designacao: "2012-09-30",
      numero_portaria: 13,
      ano_vigente: "2013",
      portaria: "13/2013",
      nome: "VANESSA GUSTAVO DA SILVA",
      observacoes: "13",
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
        tipo: "APOSTILA",
        data: "30/09/2026",
        portaria: "11",
        titulo: "Apostila de Designação",
        descricao: "",
        principal: false,
        esta_vigente: false,
      },
      {
        id: 35,
        tipo: "INSUBSISTENCIA",
        data: "30/09/2026",
        portaria: "13/2013",
        titulo: "Insubsistência de Designação",
        descricao: "13",
        principal: true,
        esta_vigente: true,
      },
    ]);
  });

  it("usa o nome do indicado quando o nome de exibição está vazio", () => {
    const [ato] = mapearHistoricoParaAtosPrincipais([
      { ...designacaoBase, nome: " " },
    ]);

    expect(ato.nome_servidor_indicado).toBe(designacaoBase.indicado_nome_servidor);
  });

  it.each(["DESIGNACAO", "CESSACAO", "APOSTILA", "INSUBSISTENCIA"])(
    "preserva o tipo %s para abrir a tela correspondente",
    (tipo) => {
      const [ato] = mapearHistoricoParaAtosPrincipais([{
        ...designacaoBase,
        atos_relacionados: [{
          ...designacaoBase.atos_relacionados[0],
          tipo,
        }],
      }]);

      expect(ato.atos_relacionados[0].tipo).toBe(tipo);
    }
  );

  it("usa a data de criação do ato relacionado", () => {
    const [ato] = mapearHistoricoParaAtosPrincipais([{
      ...designacaoBase,
      atos_relacionados: [{
        ...designacaoBase.atos_relacionados[0],
        tipo: "CESSACAO",
        data_cessacao: "2020-03-04",
        data_designacao: "2012-09-30",
        criado_em: "2026-10-01T16:00:44.372070-03:00",
      }],
    }]);

    expect(ato.atos_relacionados[0].data).toBe("01/10/2026");
  });

  it("aceita data de criação nula nos atos relacionados", () => {
    const [ato] = mapearHistoricoParaAtosPrincipais([{
      ...designacaoBase,
      atos_relacionados: [{
        ...designacaoBase.atos_relacionados[0],
        criado_em: null as unknown as string,
      }],
    }]);

    expect(ato.atos_relacionados[0].data).toBe("");
  });

  it("retorna lista vazia quando não recebe designações", () => {
    expect(mapearHistoricoParaAtosPrincipais()).toEqual([]);
    expect(mapearHistoricoParaAtosPrincipais([])).toEqual([]);
  });

  it("preenche os campos opcionais ausentes e preserva datas que não estão em ISO", () => {
    const [ato] = mapearHistoricoParaAtosPrincipais([{
      ...designacaoBase,
      tipo_de_ato: "",
      portaria: null as unknown as string,
      numero_portaria: null,
      cargo: null as unknown as string,
      data_inicio: "30/09/2012",
      cessada_em: null,
      data_fim: "04/03/2020",
      atos_relacionados: null as unknown as DesignacaoHistorico["atos_relacionados"],
    }]);

    expect(ato).toMatchObject({
      tipo_ato_display: "Designação",
      realizada_em: "30/09/2012",
      data_cessacao: "04/03/2020",
      numero_portaria: "",
      cargo_display: "",
      atos_relacionados: [],
    });
  });

  it("usa o número da portaria quando o texto da portaria está ausente", () => {
    const [ato] = mapearHistoricoParaAtosPrincipais([{
      ...designacaoBase,
      portaria: null as unknown as string,
      numero_portaria: 44,
      atos_relacionados: [{
        ...designacaoBase.atos_relacionados[0],
        criado_em: "não-iso",
        portaria: null as unknown as string,
        tipo_de_ato: null as unknown as string,
        observacoes: null as unknown as string,
      }],
    }]);

    expect(ato.numero_portaria).toBe("44");
    expect(ato.atos_relacionados[0]).toMatchObject({
      data: "não-iso",
      portaria: "",
      titulo: "",
      descricao: "",
    });
  });
});
