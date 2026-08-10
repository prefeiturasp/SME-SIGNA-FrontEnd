import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBuscarCargosBase } from "./useBuscarCargosBase";
import { fetchCargosBaseAction } from "@/actions/cargos-base";

const useQueryMock = vi.fn((options) => options);

vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: unknown) => useQueryMock(options),
}));

vi.mock("@/actions/cargos-base", () => ({
  fetchCargosBaseAction: vi.fn(),
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
