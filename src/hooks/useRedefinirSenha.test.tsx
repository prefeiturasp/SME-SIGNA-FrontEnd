import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import useRedefinirSenha from "./useRedefinirSenha";

vi.mock("@/actions/redefinir-senha", () => ({
    redefinirSenhaAction: vi.fn(),
}));
import { redefinirSenhaAction } from "@/actions/redefinir-senha";

describe("useRedefinirSenha", () => {
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
        vi.mocked(redefinirSenhaAction).mockReset();
    });

    it("faz request de redefinição de senha com sucesso", async () => {
        vi.mocked(redefinirSenhaAction).mockResolvedValueOnce({
            success: true,
        });
        const { result } = renderHook(() => useRedefinirSenha(), { wrapper });
        await act(async () => {
            await result.current.mutateAsync({
                uid: "abc123",
                token: "token123",
                password: "Senha@123",
                password2: "Senha@123",
            });
        });
        expect(redefinirSenhaAction).toHaveBeenCalledWith({
            uid: "abc123",
            token: "token123",
            password: "Senha@123",
            password2: "Senha@123",
        });
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
            expect(result.current.data).toEqual({ success: true });
        });
    });

    it("trata erro customizado (non_field_errors)", async () => {
        vi.mocked(redefinirSenhaAction).mockResolvedValueOnce({
            success: false,
            error: "Senhas não conferem",
        });
        const { result } = renderHook(() => useRedefinirSenha(), { wrapper });
        await act(async () => {
            await result.current.mutateAsync({
                uid: "abc123",
                token: "token123",
                password: "Senha@123",
                password2: "SenhaErrada",
            });
        });
        expect(redefinirSenhaAction).toHaveBeenCalledWith({
            uid: "abc123",
            token: "token123",
            password: "Senha@123",
            password2: "SenhaErrada",
        });
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
            expect(result.current.data).toEqual({
                success: false,
                error: "Senhas não conferem",
            });
        });
    });

    it("trata erro inesperado (rejected)", async () => {
        vi.mocked(redefinirSenhaAction).mockRejectedValueOnce(
            new Error("Erro inesperado")
        );
        const { result } = renderHook(() => useRedefinirSenha(), { wrapper });
        await act(async () => {
            await expect(
                result.current.mutateAsync({
                    uid: "abc123",
                    token: "token123",
                    password: "Senha@123",
                    password2: "Senha@123",
                })
            ).rejects.toThrow();
        });
        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });
    });
});
