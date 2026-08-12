import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBuscarCargosBase, useBuscarCargosBaseById } from "./useBuscarCargosBase";
import { fetchCargosBaseAction, fetchCargosBaseActionByIdAction } from "@/actions/cargos-base";

const useQueryMock = vi.fn((options) => options);

vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: unknown) => useQueryMock(options),
}));

vi.mock("@/actions/cargos-base", () => ({
  fetchCargosBaseAction: vi.fn(),
  fetchCargosBaseActionByIdAction: vi.fn(),
}));

describe("useBuscarCargosBase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("configura query com chave e opções esperadas", () => {
    renderHook(() => useBuscarCargosBase());

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["get-cargos-base"],
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 0,
      }),
    );

    const queryOptions = useQueryMock.mock.calls[0][0] as { queryFn: () => Promise<unknown> };
    expect(typeof queryOptions.queryFn).toBe("function");
  });

  it("retorna lista vazia quando o primeiro cargo tem codigo 0", async () => {
    vi.mocked(fetchCargosBaseAction).mockResolvedValueOnce({
      success: true,
      data: [{ codigoCargo: 0, nomeCargo: "placeholder" } as never],
    });

    renderHook(() => useBuscarCargosBase());
    const queryOptions = useQueryMock.mock.calls[0][0] as { queryFn: () => Promise<unknown> };
    const data = await queryOptions.queryFn();

    expect(data).toEqual([]);
  });

  it("retorna os dados quando a busca é bem-sucedida", async () => {
    const payload = [{ codigoCargo: 12, nomeCargo: "Cargo 12" }];
    vi.mocked(fetchCargosBaseAction).mockResolvedValueOnce({
      success: true,
      data: payload as never,
    });

    renderHook(() => useBuscarCargosBase());
    const queryOptions = useQueryMock.mock.calls[0][0] as { queryFn: () => Promise<unknown> };
    const data = await queryOptions.queryFn();

    expect(data).toEqual(payload);
  });

  it("lança erro quando action retorna falha", async () => {
    vi.mocked(fetchCargosBaseAction).mockResolvedValueOnce({
      success: false,
      error: "falha ao buscar",
    });

    renderHook(() => useBuscarCargosBase());
    const queryOptions = useQueryMock.mock.calls[0][0] as { queryFn: () => Promise<unknown> };

    await expect(queryOptions.queryFn()).rejects.toThrow("falha ao buscar");
  });
});

describe("useBuscarCargosBaseById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("configura query com id e opções esperadas", () => {
    renderHook(() => useBuscarCargosBaseById(42));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["get-cargos-base-by-id", 42],
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 0,
        enabled: true,
      }),
    );
  });

  it("retorna dados quando busca por id é bem-sucedida", async () => {
    const payload = {
      id: 42,
      grupamento: "DOCENTES",
      descricao_resumida: "Resumo",
      descricao_completa: "Completa",
      situacao_funcional: "EFETIVO",
      utilizado_para_funcoes: true,
      utilizado_para_designacoes: false,
      utilizado_para_ste: false,
      utilizado_para_permutas: false,
      cargo_base_ficticio: false,
      status: "ATIVO",
    };

    vi.mocked(fetchCargosBaseActionByIdAction).mockResolvedValueOnce({
      success: true,
      data: payload as never,
    });

    renderHook(() => useBuscarCargosBaseById(42));
    const queryOptions = useQueryMock.mock.calls[0][0] as { queryFn: () => Promise<unknown> };
    const data = await queryOptions.queryFn();

    expect(fetchCargosBaseActionByIdAction).toHaveBeenCalledWith(42);
    expect(data).toEqual(payload);
  });

  it("lança erro quando busca por id falha", async () => {
    vi.mocked(fetchCargosBaseActionByIdAction).mockResolvedValueOnce({
      success: false,
      error: "falha ao buscar por id",
    });

    renderHook(() => useBuscarCargosBaseById(42));
    const queryOptions = useQueryMock.mock.calls[0][0] as { queryFn: () => Promise<unknown> };

    await expect(queryOptions.queryFn()).rejects.toThrow("falha ao buscar por id");
  });

  it("desabilita query quando id é 0", () => {
    renderHook(() => useBuscarCargosBaseById(0));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["get-cargos-base-by-id", 0],
        enabled: false,
      }),
    );
  });
});
