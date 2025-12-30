import { render, screen, waitFor } from "@testing-library/react";
import { vi, type Mock } from "vitest";
import userEvent from "@testing-library/user-event";
import ModalNovaSenha from "./ModalNovaSenha";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import * as useAtualizarSenhaModule from "@/hooks/useAtualizarSenha";
import * as headlessToastModule from "@/components/ui/headless-toast";

vi.mock("@/hooks/useAtualizarSenha", () => {
    const __mutateAsync = vi.fn();
    return {
        default: () => ({
            mutateAsync: __mutateAsync,
            isPending: false,
        }),
        __mutateAsync,
    };
});

vi.mock("@/components/ui/headless-toast", () => {
    const __toast = vi.fn();
    return {
        toast: __toast,
        __toast,
    };
});

const mockMutateAsync = (
    useAtualizarSenhaModule as unknown as {
        __mutateAsync: Mock;
    }
).__mutateAsync;
const toastMock = (headlessToastModule as unknown as { __toast: Mock }).__toast;

function renderWithQueryProvider(ui: React.ReactElement) {
    const queryClient = new QueryClient();
    return render(
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
}

describe("ModalNovaSenha", () => {
    const defaultProps = {
        open: true,
        onOpenChange: vi.fn(),
        onSalvar: vi.fn(),
        loading: false,
        erroGeral: null,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renderiza os campos de senha na ordem correta", () => {
        renderWithQueryProvider(<ModalNovaSenha {...defaultProps} />);
        expect(
            screen.getByPlaceholderText("Digite a senha atual")
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Digite a nova senha")
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Digite a nova senha novamente")
        ).toBeInTheDocument();
    });

    it("exibe critérios de senha e separa os de 'NÃO deve conter'", () => {
        renderWithQueryProvider(<ModalNovaSenha {...defaultProps} />);
        expect(
            screen.getByText(/a nova senha deve conter/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/a nova senha não deve conter/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/uma letra maiúscula/i)).toBeInTheDocument();
        expect(screen.getByText(/espaço em branco/i)).toBeInTheDocument();
    });

    it("habilita botão Salvar senha apenas quando todos critérios estão ok", async () => {
        renderWithQueryProvider(<ModalNovaSenha {...defaultProps} />);
        const user = userEvent.setup();
        await user.type(
            screen.getByPlaceholderText("Digite a senha atual"),
            "Senha@123"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha"),
            "Senha@123"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha novamente"),
            "Senha@123"
        );
        expect(
            screen.getByRole("button", { name: /salvar senha/i })
        ).toBeEnabled();
    });

    it("exibe erro de confirmação quando as senhas não coincidem", async () => {
        renderWithQueryProvider(<ModalNovaSenha {...defaultProps} />);
        const user = userEvent.setup();
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha"),
            "Senha@123"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha novamente"),
            "SenhaErrada"
        );
        expect(
            screen.getByText(/as senhas não coincidem/i)
        ).toBeInTheDocument();
    });

    it("exibe o ícone de erro (CloseCheck) quando algum critério não é atendido", async () => {
        renderWithQueryProvider(<ModalNovaSenha {...defaultProps} />);
        const user = userEvent.setup();
        await user.type(
            screen.getByPlaceholderText("Digite a senha atual"),
            "Senha@123"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha"),
            "abcá"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha novamente"),
            "abcá"
        );
        const closeCheckIcons = screen.getAllByTestId("close-check-icon");
        expect(closeCheckIcons.length).toBeGreaterThan(0);
    });

    it("alterna visibilidade da senha ao clicar no botão de exibir senha", async () => {
        renderWithQueryProvider(<ModalNovaSenha {...defaultProps} />);
        const user = userEvent.setup();
        // Botão de exibir senha atual
        const btnShowOld = screen
            .getAllByRole("button")
            .find((btn) => btn.innerHTML.includes("svg"));
        const inputOld = screen.getByPlaceholderText("Digite a senha atual");
        expect(inputOld).toHaveAttribute("type", "password");
        if (btnShowOld) {
            await user.click(btnShowOld);
            expect(inputOld).toHaveAttribute("type", "text");
        }
    });

    it("chama onOpenChange ao clicar no botão Cancelar", async () => {
        const onOpenChange = vi.fn();
        renderWithQueryProvider(
            <ModalNovaSenha {...defaultProps} onOpenChange={onOpenChange} />
        );
        const user = userEvent.setup();
        const btnCancelar = screen.getByRole("button", { name: /cancelar/i });
        await user.click(btnCancelar);
        expect(onOpenChange).toHaveBeenCalled();
    });

    it("preenche o form e realiza a troca de senha exibindo a mensagem de sucesso", async () => {
        const user = userEvent.setup();
        const mockOnOpenChange = vi.fn();

        mockMutateAsync.mockResolvedValue({ success: true });

        renderWithQueryProvider(
            <ModalNovaSenha {...defaultProps} onOpenChange={mockOnOpenChange} />
        );

        const senhaValida = "Senha123!";
        await user.type(
            screen.getByPlaceholderText("Digite a senha atual"),
            "SenhaAntiga123"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha"),
            senhaValida
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha novamente"),
            senhaValida
        );

        const salvarBtn = screen.getByRole("button", { name: /salvar senha/i });
        expect(salvarBtn).toBeEnabled();
        await user.click(salvarBtn);

        await waitFor(() => {
            expect(mockMutateAsync).toHaveBeenCalledWith({
                senha_atual: "SenhaAntiga123",
                nova_senha: senhaValida,
                confirmacao_nova_senha: senhaValida,
            });
            expect(mockOnOpenChange).toHaveBeenCalledWith(false);
            expect(toastMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    variant: "success",
                    title: "Tudo certo por aqui!",
                    description: "Sua senha foi atualizada.",
                })
            );
        });
    });

    it("realiza o submit e exibe a mensagem de erro retornada pela api", async () => {
        const user = userEvent.setup();
        const mockOnOpenChange = vi.fn();
        const mensagemDeErroAPI = "A senha atual está incorreta.";

        mockMutateAsync.mockResolvedValue({
            success: false,
            error: mensagemDeErroAPI,
        });

        renderWithQueryProvider(
            <ModalNovaSenha {...defaultProps} onOpenChange={mockOnOpenChange} />
        );

        const senhaValida = "Senha123!";
        await user.type(
            screen.getByPlaceholderText("Digite a senha atual"),
            "senha-errada"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha"),
            senhaValida
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha novamente"),
            senhaValida
        );

        const salvarBtn = screen.getByRole("button", { name: /salvar senha/i });
        await user.click(salvarBtn);

        await waitFor(() => {
            expect(screen.getByText(mensagemDeErroAPI)).toBeInTheDocument();
        });

        expect(mockOnOpenChange).not.toHaveBeenCalled();
    });
});
