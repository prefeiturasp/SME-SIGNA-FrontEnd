import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";

import useCursosETitulos from "./useCursosETitulos";
import { getCursosETitulosAction } from "@/actions/cursos-e-titulos";
import type { IConcursoType } from "@/types/cursos-e-titulos";

vi.mock("@/actions/cursos-e-titulos", () => ({
    getCursosETitulosAction: vi.fn(),
}));

const getCursosETitulosActionMock = getCursosETitulosAction as Mock;

describe("useCursosETitulos", () => {
    let queryClient: QueryClient;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });
    });

    it("deve buscar os cursos e títulos em caso de sucesso", async () => {
        const fakeCursosETitulos: IConcursoType = {
            id: 1,
            concurso: "201002757777 - PROF ENS FUND II MEDIO",
        };

        getCursosETitulosActionMock.mockResolvedValue({
            success: true,
            data: fakeCursosETitulos,
        });

        const { result } = renderHook(() => useCursosETitulos(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(fakeCursosETitulos);
        expect(getCursosETitulosActionMock).toHaveBeenCalledTimes(1);
    });

    it("deve entrar em estado de erro quando a action retorna success: false", async () => {
        getCursosETitulosActionMock.mockResolvedValue({
            success: false,
            error: "Falha ao buscar cursos e títulos",
        });

        const { result } = renderHook(() => useCursosETitulos(), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe(
            "Falha ao buscar cursos e títulos"
        );
    });

    it("deve usar a mensagem padrão quando response.error é undefined", async () => {
        getCursosETitulosActionMock.mockResolvedValue({
            success: false,
            error: undefined,
        });

        const { result } = renderHook(() => useCursosETitulos(), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe(
            "Erro ao buscar cursos e títulos"
        );
    });

    it("deve tratar o erro quando getCursosETitulosAction lança uma exceção", async () => {
        const error = new Error("Erro de rede");
        getCursosETitulosActionMock.mockRejectedValue(error);

        const { result } = renderHook(() => useCursosETitulos(), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.error).toBe(error);
    });

    it("deve configurar retry como false", async () => {
        getCursosETitulosActionMock.mockResolvedValue({
            success: true,
            data: { id: 1, concurso: "Teste" },
        });

        const { result } = renderHook(() => useCursosETitulos(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        // Verifica que não há retentativas
        expect(getCursosETitulosActionMock).toHaveBeenCalledTimes(1);
    });
   

    it("deve usar a queryKey correta", async () => {
        getCursosETitulosActionMock.mockResolvedValue({
            success: true,
            data: { id: 1, concurso: "Teste" },
        });

        const { result } = renderHook(() => useCursosETitulos(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        // Verifica se os dados estão no cache com a queryKey correta
        const cachedData = queryClient.getQueryData(["cursos-e-titulos"]);
        expect(cachedData).toEqual({ id: 1, concurso: "Teste" });
    });
});

