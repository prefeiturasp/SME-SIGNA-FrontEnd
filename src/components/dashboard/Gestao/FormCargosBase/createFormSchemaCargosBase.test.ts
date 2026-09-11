import { describe, expect, it } from "vitest";
import createFormSchemaCargosBase, { createFormSchemaCargosBaseData } from "./createFormSchemaCargosBase";

const validPayload: createFormSchemaCargosBaseData = {
  codigo_cargo: "1",
  grupamento: "DOCENTES",
  descricao_resumida: "Resumo",
  descricao_completa: "Descricao completa",
  situacao_funcional: "ATIVO",
  status: "ATIVO",
  utilizado_para_funcoes: true,
  utilizado_para_designacoes: false,
  utilizado_para_ste: true,
  utilizado_para_permutas: false,
  cargo_base_ficticio: false,
  testar_laudo: false,
  pesquisar_licencas_no_sigpec: true,
  quantidade_maxima_de_dias_de_licenca: "15",
};

describe("createFormSchemaCargosBase", () => {
  it("valida payload completo quando pesquisa de licenças está habilitada", () => {
    const result = createFormSchemaCargosBase.safeParse(validPayload);

    expect(result.success).toBe(true);
  });

  it("permite quantidade vazia quando pesquisa de licenças está desabilitada", () => {
    const result = createFormSchemaCargosBase.safeParse({
      ...validPayload,
      pesquisar_licencas_no_sigpec: false,
      quantidade_maxima_de_dias_de_licenca: "",
    });

    expect(result.success).toBe(true);
  });

  it("permite quantidade ausente quando pesquisa de licenças está desabilitada", () => {
    const { quantidade_maxima_de_dias_de_licenca: _quantidade, ...payloadSemQuantidade } = validPayload;

    const result = createFormSchemaCargosBase.safeParse({
      ...payloadSemQuantidade,
      pesquisar_licencas_no_sigpec: false,
    });

    expect(result.success).toBe(true);
  });

  it("exige quantidade maior que zero quando pesquisa de licenças está habilitada", () => {
    const result = createFormSchemaCargosBase.safeParse({
      ...validPayload,
      quantidade_maxima_de_dias_de_licenca: "0",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({
        message: "A quantidade máxima de dias de licença deve ser maior que 0.",
        path: ["quantidade_maxima_de_dias_de_licenca"],
      }),
    ]);
  });

  it("trata quantidade vazia como zero quando pesquisa de licenças está habilitada", () => {
    const result = createFormSchemaCargosBase.safeParse({
      ...validPayload,
      quantidade_maxima_de_dias_de_licenca: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toEqual(
      expect.objectContaining({
        path: ["quantidade_maxima_de_dias_de_licenca"],
      }),
    );
  });

  it("exige campos booleanos", () => {
    const result = createFormSchemaCargosBase.safeParse({
      codigo_cargo: "1",
      grupamento: "DOCENTES",
      descricao_resumida: "Resumo",
      descricao_completa: "Descricao completa",
      situacao_funcional: "ATIVO",
      status: "ATIVO",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ["utilizado_para_funcoes"],
        }),
        expect.objectContaining({
          path: ["pesquisar_licencas_no_sigpec"],
        }),
      ]),
    );
  });
});
