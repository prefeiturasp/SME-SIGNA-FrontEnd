import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, beforeEach } from "vitest";
import useServidorDesignacao from "./useServidorDesignacao";
import { getServidorDesignacaoAction } from "@/actions/servidores-designacao";
import { Servidor } from "@/types/designacao-unidade";

vi.mock("@/actions/servidores-designacao", () => ({
  getServidorDesignacaoAction: vi.fn(),
}));

const sampleRequest = { rf: "123" };


const mockData: Servidor = {
  nome_servidor: "Servidor Teste",
  rf: "123",
  vinculo: 1,
  lotacao: "Escola X",
  cd_cargo_base: 1,
  cargo_base: "Professor",
  cd_cargo_sobreposto_funcao_atividade: 2,
  cargo_sobreposto_funcao_atividade: "Nenhum",
  cursos_titulos: "Licenciatura",
  laudo_medico: "Não",
  local_de_servico: "Escola X",
  local_de_exercicio: "Escola X",
};
const sampleResponse = {
  success: true as const,
  data: mockData,
};


describe("useServidorDesignacao", () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.mocked(getServidorDesignacaoAction).mockReset();
  });

  it("executa a mutation com sucesso", async () => {
    vi.mocked(getServidorDesignacaoAction).mockResolvedValueOnce(
      sampleResponse
    );

    const { result } = renderHook(() => useServidorDesignacao(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(sampleRequest);
    });

    expect(getServidorDesignacaoAction).toHaveBeenCalledWith(
      sampleRequest,
      expect.anything()
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toEqual(sampleResponse);
    });
  });

  it("propaga erro controlado vindo da action", async () => {
    vi.mocked(getServidorDesignacaoAction).mockResolvedValueOnce({
      success: false,
      error: "Servidor não encontrado",
    });

    const { result } = renderHook(() => useServidorDesignacao(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(sampleRequest);
    });

    expect(getServidorDesignacaoAction).toHaveBeenCalledWith(
      sampleRequest,
      expect.anything()
    );

    await waitFor(() => {
      expect(result.current.data).toEqual({
        success: false,
        error: "Servidor não encontrado",
      });
    });
  });

  it("marca estado de erro quando a mutation rejeita", async () => {
    vi.mocked(getServidorDesignacaoAction).mockRejectedValueOnce(
      new Error("Falha inesperada")
    );

    const { result } = renderHook(() => useServidorDesignacao(), { wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync(sampleRequest)
      ).rejects.toThrow("Falha inesperada");
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

