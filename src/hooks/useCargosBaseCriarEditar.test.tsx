import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCargosBaseCriarEditar } from "./useCargosBaseCriarEditar";
import createFormSchemaCargosBase from "@/components/dashboard/Gestao/FormCargosBase/createFormSchemaCargosBase";
import type { CargosBaseCriarEditar } from "@/types/gestao";

const useFormMock = vi.fn(() => ({ mockedForm: true }));
const zodResolverMock = vi.fn(() => "resolver-mock");
const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

vi.mock("react-hook-form", () => ({
  useForm: (...args: unknown[]) => useFormMock(...args),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: (...args: unknown[]) => zodResolverMock(...args),
}));

describe("useCargosBaseCriarEditar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inicializa o formulário com schema, defaults e opções fixas", () => {
    const { result } = renderHook(() => useCargosBaseCriarEditar());

    expect(zodResolverMock).toHaveBeenCalledWith(createFormSchemaCargosBase);
    expect(useFormMock).toHaveBeenCalledWith(
      expect.objectContaining({
        resolver: "resolver-mock",
        defaultValues: {
          grupamento: "",
          codigo_cargo_eol: "",
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
        mode: "onChange",
      }),
    );

    expect(result.current.form).toEqual({ mockedForm: true });
    expect(result.current.isPending).toBe(false);
    expect(result.current.CargosBaseOpcoes).toHaveLength(10);
    expect(result.current.CargosBaseOpcoes[0]).toEqual({
      codigo: "1",
      nome: "1234567 - Professor do Ensino Fundamental I",
    });
    expect(result.current.CargosBaseOpcoes[9]).toEqual({
      codigo: "10",
      nome: "1234576 - Professor do Ensino Fundamental X",
    });
  });

  it("permite sobrescrever valores padrão ao criar o hook", () => {
    const customDefaults: CargosBaseCriarEditar = {
      grupamento: "2",
      codigo_cargo_eol: "9",
      descricao_resumida: "Resumo",
      descricao_completa: "Completa",
      situacao_funcional: "1",
      status: "3",
      utilizado_para_funcoes: true,
      utilizado_para_designacoes: true,
      utilizado_para_outros: false,
      utilizado_para_ste: true,
      utilizado_para_permutas: false,
      cargo_base_ficticio: true,
    };

    renderHook(() => useCargosBaseCriarEditar(customDefaults));

    expect(useFormMock).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: customDefaults,
      }),
    );
  });

  it("expõe onSubmitForm que registra os valores submetidos", () => {
    const { result } = renderHook(() => useCargosBaseCriarEditar());
    const payload = {
      codigo_cargo_eol: "1",
      grupamento: "2",
      descricao_resumida: "Resumo",
      descricao_completa: "Completa",
      situacao_funcional: "1",
      status: "3",
      utilizado_para_funcoes: true,
      utilizado_para_designacoes: false,
      utilizado_para_outros: false,
      utilizado_para_ste: true,
      utilizado_para_permutas: false,
      cargo_base_ficticio: false,
    };

    result.current.onSubmitForm(payload);
    expect(consoleLogSpy).toHaveBeenCalledWith(payload);
  });
});
