import { describe, expect, it } from "vitest";
import createFormSchemaCargosBase, {
  createFormSchemaCargosBaseData,
  editFormSchemaCargosBase,
} from "./createFormSchemaCargosBase";

const validPayload: createFormSchemaCargosBaseData = {
  codigo_cargo: "1",
  grupamento: "DOCENTES",
  descricao_resumida: "Resumo",
  descricao_completa: "Descricao completa",
  descricao_eol: "Descricao EOL",
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
  permite_substituicao: false,
  possui_periodo_fechado: false,
  data_fim_periodo: null,
};

describe("createFormSchemaCargosBase", () => {
  it("valida payload completo quando pesquisa de licenças está habilitada", () => {
    const result = createFormSchemaCargosBase.safeParse(validPayload);

    expect(result.success).toBe(true);
  });

  it("exige descricao_eol no cadastro", () => {
    const { descricao_eol: _descricaoEol, ...payloadSemDescricaoEol } = validPayload;

    const result = createFormSchemaCargosBase.safeParse(payloadSemDescricaoEol);

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ["descricao_eol"] }),
    ]);
  });

  it("limita descricao_eol a 255 caracteres no cadastro", () => {
    expect(
      createFormSchemaCargosBase.safeParse({ ...validPayload, descricao_eol: "a".repeat(255) }).success,
    ).toBe(true);

    const result = createFormSchemaCargosBase.safeParse({
      ...validPayload,
      descricao_eol: "a".repeat(256),
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ["descricao_eol"] }),
    ]);
  });

  it.each(["descricao_completa", "descricao_eol", "descricao_resumida"])(
    "rejeita %s vazia ou só com espaços no cadastro",
    (campo) => {
      ["", "   "].forEach((valor) => {
        const result = createFormSchemaCargosBase.safeParse({ ...validPayload, [campo]: valor });

        expect(result.success).toBe(false);
        expect(result.error?.issues).toEqual([
          expect.objectContaining({ message: "Campo obrigatório.", path: [campo] }),
        ]);
      });
    },
  );

  it("aceita cadastro sem provimento, com provimento vazio ou preenchido", () => {
    expect(createFormSchemaCargosBase.safeParse(validPayload).success).toBe(true);
    expect(createFormSchemaCargosBase.safeParse({ ...validPayload, provimento: "" }).success).toBe(true);

    const result = createFormSchemaCargosBase.safeParse({
      ...validPayload,
      provimento: "portando diploma de Pedagogia",
    });

    expect(result.success).toBe(true);
    expect(result.data?.provimento).toBe("portando diploma de Pedagogia");
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

  it("exige data final quando o cargo possui período fechado", () => {
    const result = createFormSchemaCargosBase.safeParse({
      ...validPayload,
      possui_periodo_fechado: true,
      data_fim_periodo: null,
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "A data final do período é obrigatória.",
          path: ["data_fim_periodo"],
        }),
      ]),
    );
  });

  it("aceita data final válida quando o cargo possui período fechado", () => {
    const result = createFormSchemaCargosBase.safeParse({
      ...validPayload,
      possui_periodo_fechado: true,
      data_fim_periodo: new Date(2026, 0, 31),
    });

    expect(result.success).toBe(true);
  });

  it("exige campos booleanos", () => {
    const result = createFormSchemaCargosBase.safeParse({
      codigo_cargo: "1",
      grupamento: "DOCENTES",
      descricao_resumida: "Resumo",
      descricao_completa: "Descricao completa",
      descricao_eol: "Descricao EOL",
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
        expect.objectContaining({
          path: ["permite_substituicao"],
        }),
        expect.objectContaining({
          path: ["possui_periodo_fechado"],
        }),
      ]),
    );
  });
});

describe("editFormSchemaCargosBase", () => {
  it("não exige descricao_eol na edição", () => {
    const { descricao_eol: _descricaoEol, ...payloadSemDescricaoEol } = validPayload;

    expect(editFormSchemaCargosBase.safeParse(payloadSemDescricaoEol).success).toBe(true);
    expect(editFormSchemaCargosBase.safeParse({ ...validPayload, descricao_eol: "" }).success).toBe(true);
  });

  it("mantém descricao_completa obrigatória e limitada a 255 caracteres na edição", () => {
    ["   ", "a".repeat(256)].forEach((descricao_completa) => {
      const result = editFormSchemaCargosBase.safeParse({ ...validPayload, descricao_completa });

      expect(result.success).toBe(false);
      expect(result.error?.issues).toEqual([
        expect.objectContaining({ path: ["descricao_completa"] }),
      ]);
    });
  });

  it("mantém descricao_resumida obrigatória na edição", () => {
    const result = editFormSchemaCargosBase.safeParse({ ...validPayload, descricao_resumida: "   " });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ["descricao_resumida"] }),
    ]);
  });

  it("aplica as regras de licença e de período fechado na edição", () => {
    const result = editFormSchemaCargosBase.safeParse({
      ...validPayload,
      quantidade_maxima_de_dias_de_licenca: "0",
      possui_periodo_fechado: true,
      data_fim_periodo: null,
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ["quantidade_maxima_de_dias_de_licenca"] }),
        expect.objectContaining({ path: ["data_fim_periodo"] }),
      ]),
    );
  });
});
