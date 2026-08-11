import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCriarCargosBase } from "./useCriarCargosBase";
import { criarCargosBaseAction } from "@/actions/cargos-base";
import type { createFormSchemaCargosBaseData } from "@/components/dashboard/Gestao/FormCargosBase/createFormSchemaCargosBase";

// O mock de useMutation abaixo devolve as options recebidas (não o UseMutationResult
// real), então result.current aqui é na verdade { mutationFn }, daí o cast local.
type MutationOptions = {
  mutationFn: (variables: { values: createFormSchemaCargosBaseData }) => Promise<unknown>;
};

const useMutationMock = vi.fn((options) => options);

vi.mock("@tanstack/react-query", () => ({
  useMutation: (options: unknown) => useMutationMock(options),
}));

vi.mock("@/actions/cargos-base", () => ({
  criarCargosBaseAction: vi.fn(),
}));

describe("useCriarCargosBase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("configura mutationFn no useMutation", () => {
    const { result } = renderHook(() => useCriarCargosBase());

    expect(useMutationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        mutationFn: expect.any(Function),
      }),
    );
    expect(typeof (result.current as unknown as MutationOptions).mutationFn).toBe("function");
  });

  it("retorna dados quando action é bem-sucedida", async () => {
    const values = {
      grupamento: "DOCENCIA",
      codigo_cargo: "123",
      descricao_resumida: "Resumo",
      descricao_completa: "Completa",
      situacao_funcional: "EFETIVO",
      status: "ATIVO",
      utilizado_para_funcoes: false,
      utilizado_para_designacoes: false,
      utilizado_para_outros: false,
      utilizado_para_ste: false,
      utilizado_para_permutas: false,
      cargo_base_ficticio: false,
    };

    vi.mocked(criarCargosBaseAction).mockResolvedValueOnce({
      success: true,
      data: { id: 99 },
    } as never);

    const { result } = renderHook(() => useCriarCargosBase());
    const data = await (result.current as unknown as MutationOptions).mutationFn({ values });

    expect(criarCargosBaseAction).toHaveBeenCalledWith(values);
    expect(data).toEqual({ id: 99 });
  });

  it("lança erro quando action retorna falha", async () => {
    vi.mocked(criarCargosBaseAction).mockResolvedValueOnce({
      success: false,
      error: "erro ao criar",
    });

    const { result } = renderHook(() => useCriarCargosBase());

    await expect(
      (result.current as unknown as MutationOptions).mutationFn({
        values: {
          grupamento: "",
          codigo_cargo: "",
          descricao_resumida: "",
          descricao_completa: "",
          situacao_funcional: "",
          status: "",
          utilizado_para_funcoes: false,
          utilizado_para_designacoes: false,
          utilizado_para_outros: false,
          utilizado_para_ste: false,
          utilizado_para_permutas: false,
          cargo_base_ficticio: false,
        },
      }),
    ).rejects.toThrow("erro ao criar");
  });
});
