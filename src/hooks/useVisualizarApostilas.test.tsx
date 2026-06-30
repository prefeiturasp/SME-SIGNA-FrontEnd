import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFetchApostilasById } from "./useVisualizarApostilas";

const useQueryMock = vi.fn();
const fetchApostilasByIdActionMock = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: unknown) => useQueryMock(options),
}));

vi.mock("@/actions/designacao", () => ({
  fetchApostilasByIdAction: (id: number) => fetchApostilasByIdActionMock(id),
}));

describe("useFetchApostilasById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("configura useQuery com queryKey e flags de cache esperadas", () => {
    useQueryMock.mockReturnValue({ data: null, isLoading: false });

    useFetchApostilasById(55);

    expect(useQueryMock).toHaveBeenCalledTimes(1);
    const queryOptions = useQueryMock.mock.calls[0][0];
    expect(queryOptions).toEqual(
      expect.objectContaining({
        queryKey: ["get-apostilas-by-id", 55],
        enabled: true,
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 0,
      })
    );
  });

  it("desabilita a query quando id é 0", () => {
    useQueryMock.mockReturnValue({ data: null, isLoading: false });

    useFetchApostilasById(0);

    const queryOptions = useQueryMock.mock.calls.at(-1)?.[0];
    expect(queryOptions.enabled).toBe(false);
  });

  it("queryFn retorna dados quando action responde com sucesso", async () => {
    useQueryMock.mockReturnValue({ data: null, isLoading: false });
    fetchApostilasByIdActionMock.mockResolvedValue({ success: true, data: { id: 7 } });

    useFetchApostilasById(7);
    const queryOptions = useQueryMock.mock.calls[0][0];
    const result = await queryOptions.queryFn();

    expect(fetchApostilasByIdActionMock).toHaveBeenCalledWith(7);
    expect(result).toEqual({ id: 7 });
  });

  it("queryFn lança erro quando action retorna success=false", async () => {
    useQueryMock.mockReturnValue({ data: null, isLoading: false });
    fetchApostilasByIdActionMock.mockResolvedValue({ success: false, error: "Falha API" });

    useFetchApostilasById(9);
    const queryOptions = useQueryMock.mock.calls[0][0];

    await expect(queryOptions.queryFn()).rejects.toThrow("Falha API");
  });
});
