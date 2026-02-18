import { render, screen, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DashboardLayout from "@/app/pages/layout";
import { useUserStore } from "@/stores/useUserStore";

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
    }),
    usePathname: () => "/pages",
}));

const mockUser = {
    username: "testuser",
    name: "Test User",
    email: "test@example.com",
    cpf: "123.456.789-00",
    rede: "SME",
    is_core_sso: false,
    is_validado: true,
    perfil_acesso: {
        codigo: 1,
        nome: "Perfil Teste",
    },
    unidades: [
        {
            ue: {
                codigo_eol: "123",
                nome: "UE Teste",
                sigla: "UET",
            },
            dre: {
                codigo_eol: "456",
                nome: "DRE Teste",
                sigla: "DRET",
            },
        },
    ],
};

vi.mock("@/components/providers/AuthGuard", () => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/hooks/useMe", () => ({
    default: () => ({
        isLoading: false,
        isError: false,
        data: mockUser,
    }),
}));

const queryClient = new QueryClient();

beforeAll(() => {
    window.matchMedia = () =>
        ({
            matches: false,
            media: "",
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
        } as unknown as MediaQueryList);
});

describe("DashboardLayout (layout.tsx)", () => {
    beforeEach(() => {
        useUserStore.setState({ user: mockUser });
    });

    afterEach(() => {
        useUserStore.setState({ user: null });
        vi.clearAllMocks();
    });

    it("renderiza sidebar, navbar e conteúdo corretamente", async () => {
        await act(async () => {
            render(
                <QueryClientProvider client={queryClient}>
                    <DashboardLayout>
                        <div data-testid="child">Conteúdo de teste</div>
                    </DashboardLayout>
                </QueryClientProvider>
            );
        });

        await waitFor(() => {
            expect(screen.getByText(mockUser.name)).toBeInTheDocument();
        });

        expect(screen.getByTestId("child")).toBeInTheDocument();
        expect(screen.getByText(/sair/i)).toBeInTheDocument();
    });
});
