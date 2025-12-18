import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginForm from "./index";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock do useRouter do Next.js (next/navigation)
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
}));

// Mock do hook useSolicitarRedefinicaoSenha
const mutateAsyncMock = vi.fn();
const isPendingMock = false;
vi.mock("@/hooks/useSolicitarRedefinicaoSenha", () => ({
    __esModule: true,
    default: () => ({ mutateAsync: mutateAsyncMock, isPending: isPendingMock }),
}));

describe("FormRecuperarSenha", () => {
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

    it("renderiza o campo de RF/CPF e botão Continuar", async () => {
        render(<LoginForm />, { wrapper });
        expect(
            await screen.findByPlaceholderText("Digite um RF ou CPF")
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /continuar/i })
        ).toBeInTheDocument();
    });

    it("exibe mensagem de sucesso ao submeter o formulário", async () => {
        mutateAsyncMock.mockResolvedValueOnce({
            success: true,
            message:
                "Seu link de recuperação de senha foi enviado para ama***********@prefeitura.sme.gov.br Verifique sua caixa de entrada ou lixo eletrônico!",
        });
        render(<LoginForm />, { wrapper });
        fireEvent.input(screen.getByPlaceholderText("Digite um RF ou CPF"), {
            target: { value: "47198005055" },
        });
        fireEvent.click(screen.getByRole("button", { name: /continuar/i }));
        await waitFor(() => {
            expect(
                screen.getByText(
                    /Seu link de recuperação de senha foi enviado/i
                )
            ).toBeInTheDocument();
        });
    });

    it("exibe o ícone de sucesso ao submeter com sucesso", async () => {
        mutateAsyncMock.mockResolvedValueOnce({
            success: true,
            message: "Link enviado!",
        });
        render(<LoginForm />, { wrapper });
        fireEvent.input(screen.getByPlaceholderText("Digite um RF ou CPF"), {
            target: { value: "1234567" },
        });
        fireEvent.click(screen.getByRole("button", { name: /continuar/i }));
        await waitFor(() => {
            expect(screen.getByTestId("check-icon")).toBeInTheDocument();
        });
    });
    it("exibe mensagem de erro ao submeter com falha", async () => {
        mutateAsyncMock.mockResolvedValueOnce({
            success: false,
            error: "Usuário não encontrado",
        });
        render(<LoginForm />, { wrapper });
        fireEvent.input(screen.getByPlaceholderText("Digite um RF ou CPF"), {
            target: { value: "64718737001" },
        });
        fireEvent.click(screen.getByRole("button", { name: /continuar/i }));
        await waitFor(() => {
            expect(
                screen.getByText("Usuário não encontrado")
            ).toBeInTheDocument();
        });
    });

    it("redireciona ao clicar em Voltar", async () => {
        render(<LoginForm />, { wrapper });
        const backButton = screen.getByRole("link", { name: /voltar/i });

        fireEvent.click(backButton);
        expect(backButton).toHaveAttribute("href", "/");
    });

    it("redireciona para / na ultima etapa", async () => {
        mutateAsyncMock.mockResolvedValueOnce({
            success: true,
            message: "Seu link de recuperação de senha foi enviado",
        });
        render(<LoginForm />, { wrapper });
        fireEvent.input(screen.getByPlaceholderText("Digite um RF ou CPF"), {
            target: { value: "47198005055" },
        });
        fireEvent.click(screen.getByRole("button", { name: /continuar/i }));
        await waitFor(() => {
            expect(
                screen.getByText(
                    /Seu link de recuperação de senha foi enviado/i
                )
            ).toBeInTheDocument();
        });
        const finishButton = screen.getByRole("link", { name: /continuar/i });
        fireEvent.click(finishButton);
        expect(finishButton).toHaveAttribute("href", "/");
    });
});
