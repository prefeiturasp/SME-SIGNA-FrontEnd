import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchCargosBase } from "@/actions/gestao";
import type { CargosBaseResponse } from "@/types/gestao";
import { CHAVE_DESCRICAO_CARGO_BASE, useBuscarDescricoesCargosBase } from "./useBuscarDescricoesCargosBase";

vi.mock("@/actions/gestao", () => ({
  fetchCargosBase: vi.fn(),
}));

const cadastrados: Record<string, string> = {
  "3360": "Diretor de Escola",
  "3379": "Coordenador Pedagógico",
};

function respostaPara(codigo: string, results?: Partial<CargosBaseResponse>[]) {
  const encontrados =
    results ?? (cadastrados[codigo] ? [{ codigo_cargo: codigo, descricao_completa: cadastrados[codigo] }] : []);
  return {
    success: true as const,
    data: { count: encontrados.length, next: null, previous: null, results: encontrados as CargosBaseResponse[] },
  };
}

function renderizar() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 3 } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useBuscarDescricoesCargosBase(), { wrapper });
  return { buscar: result.current, queryClient };
}

describe("useBuscarDescricoesCargosBase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchCargosBase).mockImplementation(async (filtros) => respostaPara(filtros.codigo_cargo ?? ""));
  });

  it("busca cada código pelo filtro exato, em paralelo e sem repetir", async () => {
    const { buscar } = renderizar();

    const descricoes = await buscar([3360, "3360", " 03379 ", null, undefined, 0, "", 9999]);

    expect(descricoes).toEqual({
      "3360": "Diretor de Escola",
      "3379": "Coordenador Pedagógico",
      "9999": null,
    });
    expect(fetchCargosBase).toHaveBeenCalledTimes(3);
    expect(fetchCargosBase).toHaveBeenCalledWith({ codigo_cargo: "3360" });
    expect(fetchCargosBase).toHaveBeenCalledWith({ codigo_cargo: "3379" });
    expect(fetchCargosBase).toHaveBeenCalledWith({ codigo_cargo: "9999" });
  });

  it("dispara as consultas ao mesmo tempo", async () => {
    const resolvers: Array<() => void> = [];
    vi.mocked(fetchCargosBase).mockImplementation(
      (filtros) =>
        new Promise((resolve) => {
          resolvers.push(() => resolve(respostaPara(filtros.codigo_cargo ?? "")));
        })
    );
    const { buscar } = renderizar();

    const promessa = buscar([3360, 3379]);
    await vi.waitFor(() => expect(resolvers).toHaveLength(2));
    resolvers.forEach((resolver) => resolver());

    await expect(promessa).resolves.toEqual({
      "3360": "Diretor de Escola",
      "3379": "Coordenador Pedagógico",
    });
  });

  it("reaproveita o cache por código entre gerações", async () => {
    const { buscar } = renderizar();

    await buscar([3360]);
    await buscar([3360, 3379]);

    expect(fetchCargosBase).toHaveBeenCalledTimes(2);
  });

  it("busca de novo depois que o cache de descrições é invalidado", async () => {
    const { buscar, queryClient } = renderizar();

    await buscar([3360]);
    await queryClient.invalidateQueries({ queryKey: [CHAVE_DESCRICAO_CARGO_BASE] });
    await buscar([3360]);

    expect(fetchCargosBase).toHaveBeenCalledTimes(2);
  });

  it("lança erro, sem tentar de novo, quando a consulta falha", async () => {
    vi.mocked(fetchCargosBase).mockImplementation(async (filtros) =>
      filtros.codigo_cargo === "3379"
        ? { success: false as const, error: "Erro ao buscar os cargos base" }
        : respostaPara(filtros.codigo_cargo ?? "")
    );
    const { buscar } = renderizar();

    await expect(buscar([3360, 3379])).rejects.toThrow("Erro ao buscar os cargos base");
    expect(fetchCargosBase).toHaveBeenCalledTimes(2);
  });

  it("lança erro em vez de usar outro cargo quando o filtro por código não é aplicado", async () => {
    vi.mocked(fetchCargosBase).mockResolvedValue(
      respostaPara("3360", [{ codigo_cargo: "1111", descricao_completa: "Outro cargo" }])
    );
    const { buscar } = renderizar();

    await expect(buscar([3360])).rejects.toThrow("A busca do cargo 3360 retornou outros cargos.");
  });

  it("não consulta nada quando não há códigos", async () => {
    const { buscar } = renderizar();

    await expect(buscar([null, undefined])).resolves.toEqual({});
    expect(fetchCargosBase).not.toHaveBeenCalled();
  });
});
