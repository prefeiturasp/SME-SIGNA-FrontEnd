import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useLogin from "./useLogin";
import { vi } from "vitest";
import { loginAction } from "@/actions/login";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
}));
vi.mock("@/actions/login", () => ({
    loginAction: vi.fn(),
}));

describe("useLogin", () => {
    let queryClient: QueryClient;
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );

    beforeEach(() => {
        pushMock.mockClear();
        (loginAction as ReturnType<typeof vi.fn>).mockReset();
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
    });

    it("faz login com sucesso, invalida query 'me' e redireciona", async () => {
        const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");
        (loginAction as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            success: true,
        });

        const { result } = renderHook(() => useLogin(), { wrapper });

        result.current.mutate({
            username: "a@b.com",
            password: "1234",
        });

        await waitFor(() => {
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: ["me"],
            });
        });
        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith("/dashboard");
        });
    });

    it("trata erro quando loginAction lança erro", async () => {
        (loginAction as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
            new Error("Erro de autenticação")
        );

        const { result } = renderHook(() => useLogin(), { wrapper });

        result.current.mutate({
            username: "x@y.com",
            password: "abcd",
        });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });
    });

    it("não faz nada se response.success for false", async () => {
        const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");
        (loginAction as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            success: false,
            error: "Erro customizado",
        });

        const { result } = renderHook(() => useLogin(), { wrapper });

        result.current.mutate({
            username: "erro@teste.com",
            password: "1234",
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(invalidateQueriesSpy).not.toHaveBeenCalled();
        expect(pushMock).not.toHaveBeenCalled();
    });
});
