import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import useSolicitarRedefinicaoSenha from "./useSolicitarRedefinicaoSenha";

vi.mock("@/actions/esqueci-senha", () => ({
    esqueciSenhaAction: vi.fn(),
}));

import { esqueciSenhaAction } from "@/actions/esqueci-senha";

describe("useSolicitarRedefinicaoSenha", () => {
    let queryClient: QueryClient;
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        vi.mocked(esqueciSenhaAction).mockReset();
    });

    it("faz request de recuperação de senha com sucesso", async () => {
        vi.mocked(esqueciSenhaAction).mockResolvedValueOnce({
            success: true,
            message: "Link enviado!",
        });

        const { result } = renderHook(() => useSolicitarRedefinicaoSenha(), {
            wrapper,
        });

        await act(async () => {
            await result.current.mutateAsync({ username: "47198005055" });
        });

        expect(esqueciSenhaAction).toHaveBeenCalledWith({
            username: "47198005055",
        });
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
            expect(result.current.data).toEqual({
                success: true,
                message: "Link enviado!",
            });
        });
    });

    it("trata erro ao recuperar senha (resposta de API com success=false)", async () => {
        vi.mocked(esqueciSenhaAction).mockResolvedValueOnce({
            success: false,
            error: "Usuário não encontrado",
        });

        const { result } = renderHook(() => useSolicitarRedefinicaoSenha(), {
            wrapper,
        });

        await act(async () => {
            await result.current.mutateAsync({ username: "00000000000" });
        });

        expect(esqueciSenhaAction).toHaveBeenCalledWith({
            username: "00000000000",
        });
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
            expect(result.current.data).toEqual({
                success: false,
                error: "Usuário não encontrado",
            });
        });
    });

    it("trata erro inesperado (rejected)", async () => {
        vi.mocked(esqueciSenhaAction).mockRejectedValueOnce(
            new Error("Erro inesperado")
        );

        const { result } = renderHook(() => useSolicitarRedefinicaoSenha(), {
            wrapper,
        });

        await act(async () => {
            await expect(
                result.current.mutateAsync({ username: "47198005055" })
            ).rejects.toThrow();
        });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });
    });

    it("não chama a action se payload estiver vazio", async () => {
        const { result } = renderHook(() => useSolicitarRedefinicaoSenha(), {
            wrapper,
        });

        await act(async () => {
            try {
                await result.current.mutateAsync({ username: "" });
            } catch {}
        });

        expect(esqueciSenhaAction).toHaveBeenCalledWith({ username: "" });
    });
});
