import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCargosBase } from "./useCargosBase";

const resetMock = vi.fn();
const useFormMock = vi.fn(() => ({
  reset: resetMock,
  handleSubmit: vi.fn(),
}));
const zodResolverMock = vi.fn(() => "resolver-mock");
const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

vi.mock("react-hook-form", () => ({
  useForm: (...args: unknown[]) => useFormMock(...args),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: (...args: unknown[]) => zodResolverMock(...args),
}));

describe("useCargosBase", () => {
  it("configura useForm com valores padrão e limpa com handleClear", () => {
    const { result } = renderHook(() => useCargosBase());

    expect(useFormMock).toHaveBeenCalledWith(
      expect.objectContaining({
        resolver: "resolver-mock",
        defaultValues: {
          grupamento: "",
          descricao_resumida: "",
          descricao_completa: "",
          situacao_funcional: "",
          status: "",
        },
        mode: "onChange",
      }),
    );

    result.current.handleClear();
    expect(resetMock).toHaveBeenCalledWith({
      grupamento: "",
      descricao_resumida: "",
      descricao_completa: "",
      situacao_funcional: "",
      status: "",
    });
  });

  it("respeita valores customizados e envia para reset", () => {
    const customDefaults = {
      grupamento: "2",
      descricao_resumida: "Resumo",
      descricao_completa: "Descrição completa",
      situacao_funcional: "1",
      status: "3",
    };

    const { result } = renderHook(() => useCargosBase(customDefaults));
    result.current.handleClear();

    expect(resetMock).toHaveBeenLastCalledWith(customDefaults);
  });

  it("faz log dos valores no submit", () => {
    const values = {
      grupamento: "1",
      descricao_resumida: "desc",
      descricao_completa: "desc completa",
      situacao_funcional: "2",
      status: "1",
    };

    const { result } = renderHook(() => useCargosBase());
    result.current.onSubmitFilterForm(values);

    expect(consoleSpy).toHaveBeenCalledWith(values);
  });
});
