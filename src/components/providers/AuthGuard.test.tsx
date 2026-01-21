import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AuthGuard from "./AuthGuard";
import useMe from "@/hooks/useMe";
import { User, useUserStore } from "@/stores/useUserStore";

vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
    usePathname: vi.fn().mockReturnValue("/dashboard"),
}));

vi.mock("@/hooks/useMe", () => ({
    default: vi.fn(),
}));

vi.mock("@/stores/useUserStore", () => ({
    useUserStore: vi.fn(),
}));

vi.mock("@/components/ui/FullPageLoader", () => ({
    default: () => <div>FullPageLoader</div>,
}));

const mockRemoveQueries = vi.fn();
vi.mock("@tanstack/react-query", async (importOriginal) => {
    const actual = await importOriginal<
        typeof import("@tanstack/react-query")
    >();
    return {
        ...actual,
        useQueryClient: () => ({
            ...actual.useQueryClient(),
            removeQueries: mockRemoveQueries,
        }),
    };
});

const useMeMock = useMe as Mock;
const useRouterMock = useRouter as Mock;
const useUserStoreMock = useUserStore as unknown as Mock;

const mockPush = vi.fn();

const TestChild = () => <div>Conteúdo Protegido</div>;

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

const renderWithProviders = (
    ui: React.ReactElement,
    queryClient: QueryClient
) => {
    return render(
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
};

describe("AuthGuard", () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = createTestQueryClient();

        useRouterMock.mockReturnValue({ push: mockPush });
    });

    it("deve renderizar o FullPageLoader enquanto os dados do usuário estão carregando", () => {
        useMeMock.mockReturnValue({
            isLoading: true,
            isError: false,
            error: null,
        });
        useUserStoreMock.mockReturnValue(null);

        renderWithProviders(
            <AuthGuard>
                <TestChild />
            </AuthGuard>,
            queryClient
        );

        expect(screen.getByText("FullPageLoader")).toBeInTheDocument();
        expect(
            screen.queryByText("Conteúdo Protegido")
        ).not.toBeInTheDocument();
    });

    it("deve renderizar o FullPageLoader se o carregamento terminar mas o usuário não estiver no store", () => {
        useMeMock.mockReturnValue({
            isLoading: false,
            isError: false,
            error: null,
            data: undefined,
        });
        useUserStoreMock.mockReturnValue(null);

        renderWithProviders(
            <AuthGuard>
                <TestChild />
            </AuthGuard>,
            queryClient
        );

        expect(screen.getByText("FullPageLoader")).toBeInTheDocument();
        expect(
            screen.queryByText("Conteúdo Protegido")
        ).not.toBeInTheDocument();
    });

    it("deve redirecionar para / em caso de erro", async () => {
        const error = new Error("Não autorizado");
        useMeMock.mockReturnValue({
            isLoading: false,
            isError: true,
            error,
            data: undefined,
        });
        useUserStoreMock.mockReturnValue(null);

        renderWithProviders(
            <AuthGuard>
                <TestChild />
            </AuthGuard>,
            queryClient
        );

        expect(screen.getByText("FullPageLoader")).toBeInTheDocument();

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/");
        });
    });

    it("não deve executar a lógica de redirect novamente quando didRedirect.current já é true", async () => {
        useMeMock.mockReturnValue({
            isLoading: true,
            isError: false,
            error: null,
            data: undefined,
        });
        useUserStoreMock.mockReturnValue(null);

        const { rerender } = renderWithProviders(
            <AuthGuard>
                <TestChild />
            </AuthGuard>,
            queryClient
        );

        expect(mockPush).not.toHaveBeenCalled();

        useMeMock.mockReturnValue({
            isLoading: false,
            isError: false,
            error: null,
            data: undefined,
        });

        rerender(
            <QueryClientProvider client={queryClient}>
                <AuthGuard>
                    <TestChild />
                </AuthGuard>
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledTimes(1);
        });

        mockPush.mockClear();

        useMeMock.mockReturnValue({
            isLoading: false,
            isError: true,
            error: new Error("Não autorizado"),
            data: undefined,
        });

        rerender(
            <QueryClientProvider client={queryClient}>
                <AuthGuard>
                    <TestChild />
                </AuthGuard>
            </QueryClientProvider>
        );

        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(mockPush).not.toHaveBeenCalled();
    });

    it("não deve redirecionar múltiplas vezes quando didRedirect.current é true", async () => {
        const error = new Error("Não autorizado");

        useMeMock.mockReturnValue({
            isLoading: true,
            isError: false,
            error: null,
            data: undefined,
        });
        useUserStoreMock.mockReturnValue(null);

        const { rerender } = renderWithProviders(
            <AuthGuard>
                <TestChild />
            </AuthGuard>,
            queryClient
        );

        expect(screen.getByText("FullPageLoader")).toBeInTheDocument();
        expect(mockPush).not.toHaveBeenCalled();

        useMeMock.mockReturnValue({
            isLoading: false,
            isError: true,
            error,
            data: undefined,
        });

        rerender(
            <QueryClientProvider client={queryClient}>
                <AuthGuard>
                    <TestChild />
                </AuthGuard>
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledTimes(1);
            expect(mockPush).toHaveBeenCalledWith("/");
        });

        mockPush.mockClear();
        useMeMock.mockReturnValue({
            isLoading: false,
            isError: true,
            error: new Error("Outro erro"),
            data: undefined,
        });

        rerender(
            <QueryClientProvider client={queryClient}>
                <AuthGuard>
                    <TestChild />
                </AuthGuard>
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(mockPush).not.toHaveBeenCalled();
        });
    });

    it("deve renderizar os filhos quando o usuário estiver autenticado", () => {
        const fakeUser: User = {
            name: "Usuário Teste",
            email: "teste@example.com",
            username: "teste.user",
            cpf: "111.222.333-44",
            rede: "SME",
            is_core_sso: false,
            is_validado: true,
            perfil_acesso: { codigo: 1, nome: "Padrão" },
            unidades: [],
        };

        useMeMock.mockReturnValue({
            isLoading: false,
            isError: false,
            error: null,
            data: fakeUser,
        });
        useUserStoreMock.mockReturnValue(fakeUser);

        renderWithProviders(
            <AuthGuard>
                <TestChild />
            </AuthGuard>,
            queryClient
        );

        expect(screen.getByText("Conteúdo Protegido")).toBeInTheDocument();
        expect(screen.queryByText("FullPageLoader")).not.toBeInTheDocument();
    });
});
