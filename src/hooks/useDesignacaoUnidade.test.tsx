import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";

import useFetchDesignacaoUnidadeMutation from "./useDesignacaoUnidade";
import { getDesignacaoUnidadeAction } from "@/actions/designacao-unidade";

vi.mock("@/actions/designacao-unidade", () => ({
    getDesignacaoUnidadeAction: vi.fn(),
}));

describe("useFetchDesignacaoUnidadeMutation", () => {
    let queryClient: QueryClient;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );

    beforeEach(() => {
        (getDesignacaoUnidadeAction as ReturnType<typeof vi.fn>).mockReset();

        queryClient = new QueryClient({
            defaultOptions: {
                mutations: { retry: false },
            },
        });
    });

    it("executa mutation com sucesso", async () => {
        const mockResponse = {
            success: true,
            data: { nome: "Unidade Teste" },
        };

        (getDesignacaoUnidadeAction as ReturnType<typeof vi.fn>)
            .mockResolvedValueOnce(mockResponse);

        const { result } = renderHook(
            () => useFetchDesignacaoUnidadeMutation(),
            { wrapper }
        );

        result.current.mutate("123");

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(getDesignacaoUnidadeAction).toHaveBeenCalledWith("123");
    });

    it("entra em erro quando success = false", async () => {
        const mockResponse = {
            success: false,
            error: "Erro ao buscar unidade",
        };

        (getDesignacaoUnidadeAction as ReturnType<typeof vi.fn>)
            .mockResolvedValueOnce(mockResponse);

        const { result } = renderHook(
            () => useFetchDesignacaoUnidadeMutation(),
            { wrapper }
        );

        result.current.mutate("123");

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });
    });

    it("entra em erro quando action lança exceção", async () => {
        (getDesignacaoUnidadeAction as ReturnType<typeof vi.fn>)
            .mockRejectedValueOnce(new Error("Erro inesperado"));

        const { result } = renderHook(
            () => useFetchDesignacaoUnidadeMutation(),
            { wrapper }
        );

        result.current.mutate("123");

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });
    });

    it("usa mensagem de erro customizada quando response.error existe", async () => {
        const mockResponse = {
            success: false,
            error: "Erro específico da API",
        };

        (getDesignacaoUnidadeAction as ReturnType<typeof vi.fn>)
            .mockResolvedValueOnce(mockResponse);

        const { result } = renderHook(
            () => useFetchDesignacaoUnidadeMutation(),
            { wrapper }
        );

        result.current.mutate("123");

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error?.message).toBe("Erro específico da API");
    });

    it("usa mensagem padrão quando response.error não existe", async () => {
        const mockResponse = {
            success: false,
        };

        (getDesignacaoUnidadeAction as ReturnType<typeof vi.fn>)
            .mockResolvedValueOnce(mockResponse);

        const { result } = renderHook(
            () => useFetchDesignacaoUnidadeMutation(),
            { wrapper }
        );

        result.current.mutate("123");

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error?.message).toBe(
            "Não foi possível buscar os dados da unidade"
        );
    });
});
