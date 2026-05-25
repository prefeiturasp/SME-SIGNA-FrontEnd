import { useMutation } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { excluirDesignacao } from "@/actions/designacoes";
import { useExcluirDesignacao } from "./useExcluirDesignacao";

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(),
}));

vi.mock("@/actions/designacoes", () => ({
  excluirDesignacao: vi.fn(),
}));

describe("useExcluirDesignacao", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("configura useMutation com mutationFn que chama excluirDesignacao", async () => {
    const mutationReturn = { mutateAsync: vi.fn() };
    vi.mocked(useMutation).mockReturnValueOnce(mutationReturn as never);
    vi.mocked(excluirDesignacao).mockResolvedValueOnce({ success: true });

    const result = useExcluirDesignacao();

    expect(useMutation).toHaveBeenCalledTimes(1);
    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0];
    expect(typeof mutationConfig.mutationFn).toBe("function");

    const response = await mutationConfig.mutationFn(44);
    expect(excluirDesignacao).toHaveBeenCalledWith(44);
    expect(response).toEqual({ success: true });
    expect(result).toBe(mutationReturn);
  });
});
