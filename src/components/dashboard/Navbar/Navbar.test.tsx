import { render, screen } from "@testing-library/react";
import { describe, it, afterEach, vi, expect } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navbar } from "./Navbar";

interface MockUser {
    username: string;
    name: string;
    perfil_acesso: { nome: string; codigo: number };
}
const mockUser: MockUser = {
    username: "12345",
    name: "JOÃO DA SILVA",
    perfil_acesso: { nome: "ASSISTENTE DE DIRETOR", codigo: 3085 },
};

vi.mock("@/stores/useUserStore", () => ({
    useUserStore: (
        selector: (state: { user: MockUser | undefined }) => unknown
    ) => selector({ user: mockUser }),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn() }),
}));

const queryClient = new QueryClient();

const renderWithProvider = (ui: React.ReactElement) => {
    return render(
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
};

describe("Navbar", () => {
    afterEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it("deve renderizar a logo", () => {
        renderWithProvider(<Navbar />);
        expect(screen.getByAltText("Logo GIPE")).toBeInTheDocument();
    });

    it("deve exibir RF quando username não for CPF", () => {
        renderWithProvider(<Navbar />);
        expect(screen.getByText(/RF: 12345/i)).toBeInTheDocument();
    });

    it("deve exibir CPF quando username for um CPF válido", async () => {
        const mockUserCPF = {
            username: "12345678901",
            name: "MARIA DA SILVA",
            perfil_acesso: { nome: "DIRETOR", codigo: 3360 },
        };
        vi.doMock("@/stores/useUserStore", () => ({
            useUserStore: (
                selector: (state: { user: typeof mockUserCPF }) => unknown
            ) => selector({ user: mockUserCPF }),
        }));
        const { Navbar: NavbarCPF } = await import("./Navbar");
        renderWithProvider(<NavbarCPF />);
        expect(screen.getByText(/CPF: 12345678901/i)).toBeInTheDocument();
    });

    it("deve exibir o nome do usuário capitalizado", () => {
        renderWithProvider(<Navbar />);
        expect(screen.getByText(/joão da silva/i)).toBeInTheDocument();
    });

    it("deve exibir o perfil de acesso capitalizado", () => {
        renderWithProvider(<Navbar />);
        expect(screen.getByText(/assistente de diretor/i)).toBeInTheDocument();
    });

    it("deve renderizar o botão de sair", () => {
        renderWithProvider(<Navbar />);
        expect(
            screen.getByRole("button", { name: /sair/i })
        ).toBeInTheDocument();
    });

    it("não deve quebrar se não houver usuário logado", async () => {
        vi.doMock("@/stores/useUserStore", () => ({
            useUserStore: (selector: (state: { user: undefined }) => unknown) =>
                selector({ user: undefined }),
        }));
        const { Navbar: NavbarSemUser } = await import("./Navbar");
        renderWithProvider(<NavbarSemUser />);
        expect(screen.queryByText(/RF:/i)).not.toBeInTheDocument();
    });
});
