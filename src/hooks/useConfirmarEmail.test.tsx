import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useConfirmarEmail from "./useConfirmarEmail";
import { vi } from "vitest";

interface User {
    name: string;
    username: string | number;
    perfil_acesso: { nome: string; codigo: number };
    unidade: [
        {
            nomeUnidade: string;
            codigo: string;
        }
    ];
    email: string;
    cpf: string;
}

type UserState = {
    user: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
};

const setUserMock = vi.fn();

vi.mock("@/stores/useUserStore", () => {
    const useUserStore = (selector: (state: UserState) => unknown) =>
        selector({
            setUser: setUserMock,
            clearUser: vi.fn(),
            user: null,
        } as UserState);
    (useUserStore as unknown as { getState?: () => UserState }).getState =
        () => ({
            user: null,
            setUser: setUserMock,
            clearUser: vi.fn(),
        });
    return { useUserStore };
});

const confirmarEmailActionMock = vi.fn();
vi.mock("@/actions/confirmar-email", () => ({
    confirmarEmailAction: (...args: unknown[]) =>
        confirmarEmailActionMock(...args),
}));

describe("useConfirmarEmail", () => {
    let queryClient: QueryClient;
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
    });

    it("atualiza apenas o email do usuário quando sucesso e user existe", async () => {
        const existingUser = {
            name: "Fulano",
            username: "u1",
            perfil_acesso: { nome: "Gestor", codigo: 1 },
            unidade: [{ nomeUnidade: "UE1", codigo: "1" }] as [
                {
                    nomeUnidade: string;
                    codigo: string;
                }
            ],
            email: "old@a.com",
            cpf: "123",
        };
        type UseUserStoreModule = {
            useUserStore: ((
                selector: (state: UserState) => unknown
            ) => unknown) & {
                getState?: () => UserState;
            };
        };

        const useUserStore = (await import(
            "@/stores/useUserStore"
        )) as unknown as UseUserStoreModule;
        useUserStore.useUserStore.getState = () => ({
            user: existingUser,
            setUser: setUserMock,
            clearUser: vi.fn(),
        });

        confirmarEmailActionMock.mockResolvedValueOnce({
            success: true,
            new_mail: "new@b.com",
        });

        const { result } = renderHook(() => useConfirmarEmail(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync({ code: "token" });
        });

        await waitFor(() => {
            expect(setUserMock).toHaveBeenCalledWith({
                ...existingUser,
                email: "new@b.com",
            });
        });
    });

    it("não chama setUser se não houver currentUser", async () => {
        const useUserStore = (await import(
            "@/stores/useUserStore"
        )) as unknown as {
            useUserStore: { getState?: () => UserState };
        };
        useUserStore.useUserStore.getState = () => ({
            user: null,
            setUser: setUserMock,
            clearUser: vi.fn(),
        });

        confirmarEmailActionMock.mockResolvedValueOnce({
            success: true,
            new_mail: "new@b.com",
        });

        const { result } = renderHook(() => useConfirmarEmail(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync({ code: "token" });
        });

        expect(setUserMock).not.toHaveBeenCalled();
    });

    it("propaga erro e mutation fica em erro quando action rejeita", async () => {
        confirmarEmailActionMock.mockRejectedValueOnce(new Error("fail"));

        const { result } = renderHook(() => useConfirmarEmail(), { wrapper });

        await act(async () => {
            try {
                await result.current.mutateAsync({ code: "token" });
            } catch {}
        });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });
    });

    it("não chama setUser se response.success for false", async () => {
        const existingUser = {
            name: "Fulano",
            username: "u1",
            perfil_acesso: { nome: "Gestor", codigo: 1 },
            unidade: [{ nomeUnidade: "UE1", codigo: "1" }] as [
                {
                    nomeUnidade: string;
                    codigo: string;
                }
            ],
            email: "old@a.com",
            cpf: "123",
        };

        const useUserStore = (await import(
            "@/stores/useUserStore"
        )) as unknown as {
            useUserStore: { getState?: () => UserState };
        };
        useUserStore.useUserStore.getState = () => ({
            user: existingUser,
            setUser: setUserMock,
            clearUser: vi.fn(),
        });

        confirmarEmailActionMock.mockResolvedValueOnce({ success: false });

        const { result } = renderHook(() => useConfirmarEmail(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync({ code: "token" });
        });

        expect(setUserMock).not.toHaveBeenCalled();
    });

    it("não chama setUser se response.new_mail for falsy", async () => {
        const existingUser = {
            name: "Fulano",
            username: "u1",
            perfil_acesso: { nome: "Gestor", codigo: 1 },
            unidade: [{ nomeUnidade: "UE1", codigo: "1" }] as [
                {
                    nomeUnidade: string;
                    codigo: string;
                }
            ],
            email: "old@a.com",
            cpf: "123",
        };

        const useUserStore = (await import(
            "@/stores/useUserStore"
        )) as unknown as {
            useUserStore: { getState?: () => UserState };
        };
        useUserStore.useUserStore.getState = () => ({
            user: existingUser,
            setUser: setUserMock,
            clearUser: vi.fn(),
        });

        confirmarEmailActionMock.mockResolvedValueOnce({ success: true });

        const { result } = renderHook(() => useConfirmarEmail(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync({ code: "token" });
        });

        expect(setUserMock).not.toHaveBeenCalled();
    });
});
