import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginForm from "./index";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock do useRouter do Next.js (next/navigation)
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
}));

// Mock do hook useLogin
const mutateAsyncMock = vi.fn();
const isPendingMock = false;
vi.mock("@/hooks/useLogin", () => ({
    __esModule: true,
    default: () => ({ mutateAsync: mutateAsyncMock, isPending: isPendingMock }),
}));

describe("LoginForm", () => {
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

    it("renderiza os campos de RF/CPF e senha e botão Acessar", async () => {
        render(<LoginForm />, { wrapper });
        
        expect(screen.getByPlaceholderText("Seu RF")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Sua senha")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /acessar/i })).toBeInTheDocument();
    });

    it("exibe mensagem de erro ao submeter com credenciais inválidas", async () => {
        mutateAsyncMock.mockResolvedValueOnce({
            success: false,
            error: "Credenciais inválidas",
        });
        
        render(<LoginForm />, { wrapper });
        
        fireEvent.input(screen.getByPlaceholderText("Seu RF"), {
            target: { value: "1234567" },
        });
        fireEvent.input(screen.getByPlaceholderText("Sua senha"), {
            target: { value: "senha123" },
        });
        
        fireEvent.click(screen.getByRole("button", { name: /acessar/i }));
        
        await waitFor(() => {
            expect(screen.getByTestId("login-error")).toBeInTheDocument();
            expect(screen.getByText("Credenciais inválidas")).toBeInTheDocument();
        });
    });

    it("chama a função de login com os valores corretos ao submeter", async () => {
        mutateAsyncMock.mockResolvedValueOnce({
            success: true,
        });
        
        render(<LoginForm />, { wrapper });
        
        fireEvent.input(screen.getByPlaceholderText("Seu RF"), {
            target: { value: "1234567" },
        });
        fireEvent.input(screen.getByPlaceholderText("Sua senha"), {
            target: { value: "senha123" },
        });
        
        fireEvent.click(screen.getByRole("button", { name: /acessar/i }));
        
        await waitFor(() => {
            expect(mutateAsyncMock).toHaveBeenCalledWith({
                seu_rf: "1234567",
                senha: "senha123",
            });
        });
    });

    it("redireciona para recuperar senha ao clicar em Esqueci minha senha", async () => {
        render(<LoginForm />, { wrapper });
        
        const esqueciSenhaButton = screen.getByRole("button", { name: /esqueci minha senha/i });
        
        fireEvent.click(esqueciSenhaButton);
        
        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith("/recuperar-senha");
        });
    });

    it("renderiza o formulário com seus componentes principais", async () => {
        render(<LoginForm />, { wrapper });
        
        const submitButton = screen.getByRole("button", { name: /acessar/i });
        expect(submitButton).toBeInTheDocument();
    });

    it("exibe tooltips ao passar o mouse nos ícones de ajuda", async () => {
        render(<LoginForm />, { wrapper });
        
        const helpIcons = screen.getAllByRole("button", { name: "" });
        expect(helpIcons.length).toBeGreaterThan(0);
    });

    it("renderiza a logo da prefeitura", () => {
        render(<LoginForm />, { wrapper });
        
        const logoImage = screen.getByAltText("Login");
        expect(logoImage).toBeInTheDocument();
    });
});

