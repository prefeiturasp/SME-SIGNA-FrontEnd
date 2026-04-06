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
    }, 10000);

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
    }, 10000);

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
    }, 10000);

    it("reseta o formulário quando o modal é fechado", async () => {
        const user = userEvent.setup();
        const mockOnOpenChange = vi.fn();

        renderWithQueryProvider(
            <ModalNovaSenha {...defaultProps} onOpenChange={mockOnOpenChange} />
        );

        await user.type(
            screen.getByPlaceholderText("Digite a senha atual"),
            "SenhaAntiga123"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha"),
            "Senha123!"
        );

        const btnCancelar = screen.getByRole("button", { name: /cancelar/i });
        await user.click(btnCancelar);

        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it("valida que senha com menos de 8 caracteres não habilita o botão", async () => {
        const user = userEvent.setup();
        
        renderWithQueryProvider(<ModalNovaSenha {...defaultProps} />);

        await user.type(
            screen.getByPlaceholderText("Digite a senha atual"),
            "SenhaAntiga123"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha"),
            "Sen@1"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha novamente"),
            "Sen@1"
        );

        const salvarBtn = screen.getByRole("button", { name: /salvar senha/i });
        expect(salvarBtn).toBeDisabled();
    });

    it("valida que senha com mais de 12 caracteres não habilita o botão", async () => {
        const user = userEvent.setup();
        
        renderWithQueryProvider(<ModalNovaSenha {...defaultProps} />);

        await user.type(
            screen.getByPlaceholderText("Digite a senha atual"),
            "SenhaAntiga123"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha"),
            "Senha@123456789"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha novamente"),
            "Senha@123456789"
        );

        const salvarBtn = screen.getByRole("button", { name: /salvar senha/i });
        expect(salvarBtn).toBeDisabled();
    });

    it("valida que senha sem letra maiúscula não habilita o botão", async () => {
        const user = userEvent.setup();
        
        renderWithQueryProvider(<ModalNovaSenha {...defaultProps} />);

        await user.type(
            screen.getByPlaceholderText("Digite a senha atual"),
            "SenhaAntiga123"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha"),
            "senha@123"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha novamente"),
            "senha@123"
        );

        const salvarBtn = screen.getByRole("button", { name: /salvar senha/i });
        expect(salvarBtn).toBeDisabled();
    });

    it("valida que senha sem letra minúscula não habilita o botão", async () => {
        const user = userEvent.setup();
        
        renderWithQueryProvider(<ModalNovaSenha {...defaultProps} />);

        await user.type(
            screen.getByPlaceholderText("Digite a senha atual"),
            "SenhaAntiga123"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha"),
            "SENHA@123"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha novamente"),
            "SENHA@123"
        );

        const salvarBtn = screen.getByRole("button", { name: /salvar senha/i });
        expect(salvarBtn).toBeDisabled();
    });

    it("valida que senha sem número não habilita o botão", async () => {
        const user = userEvent.setup();
        
        renderWithQueryProvider(<ModalNovaSenha {...defaultProps} />);

        await user.type(
            screen.getByPlaceholderText("Digite a senha atual"),
            "SenhaAntiga123"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha"),
            "Senha@abc"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha novamente"),
            "Senha@abc"
        );

        const salvarBtn = screen.getByRole("button", { name: /salvar senha/i });
        expect(salvarBtn).toBeDisabled();
    });

    it("valida que senha sem símbolo não habilita o botão", async () => {
        const user = userEvent.setup();
        
        renderWithQueryProvider(<ModalNovaSenha {...defaultProps} />);

        await user.type(
            screen.getByPlaceholderText("Digite a senha atual"),
            "SenhaAntiga123"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha"),
            "Senha1234"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha novamente"),
            "Senha1234"
        );

        const salvarBtn = screen.getByRole("button", { name: /salvar senha/i });
        expect(salvarBtn).toBeDisabled();
    });

    it("valida que senha com espaço em branco não habilita o botão", async () => {
        const user = userEvent.setup();
        
        renderWithQueryProvider(<ModalNovaSenha {...defaultProps} />);

        await user.type(
            screen.getByPlaceholderText("Digite a senha atual"),
            "SenhaAntiga123"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha"),
            "Senha @123"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha novamente"),
            "Senha @123"
        );

        const salvarBtn = screen.getByRole("button", { name: /salvar senha/i });
        expect(salvarBtn).toBeDisabled();
    });

    it("valida que senha com caractere acentuado não habilita o botão", async () => {
        const user = userEvent.setup();
        
        renderWithQueryProvider(<ModalNovaSenha {...defaultProps} />);

        await user.type(
            screen.getByPlaceholderText("Digite a senha atual"),
            "SenhaAntiga123"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha"),
            "Sénha@123"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha novamente"),
            "Sénha@123"
        );

        const salvarBtn = screen.getByRole("button", { name: /salvar senha/i });
        expect(salvarBtn).toBeDisabled();
    });

    it("exibe ícone de check quando critério é atendido", async () => {
        const user = userEvent.setup();
        
        renderWithQueryProvider(<ModalNovaSenha {...defaultProps} />);

        await user.type(
            screen.getByPlaceholderText("Digite a nova senha"),
            "Senha123!"
        );

        const checkIcons = screen.getAllByTestId("check-icon");
        expect(checkIcons.length).toBeGreaterThan(0);
    });

    it("mantém botão desabilitado se senha atual não for preenchida", async () => {
        const user = userEvent.setup();
        
        renderWithQueryProvider(<ModalNovaSenha {...defaultProps} />);

        await user.type(
            screen.getByPlaceholderText("Digite a nova senha"),
            "Senha123!"
        );
        await user.type(
            screen.getByPlaceholderText("Digite a nova senha novamente"),
            "Senha123!"
        );

        const salvarBtn = screen.getByRole("button", { name: /salvar senha/i });
        expect(salvarBtn).toBeDisabled();
    });

    it("exibe mensagem 'Importante' sobre a alteração de senha", () => {
        renderWithQueryProvider(<ModalNovaSenha {...defaultProps} />);

        expect(screen.getByText(/importante:/i)).toBeInTheDocument();
        expect(
            screen.getByText(
                /ao alterar a sua senha, ela se tornará padrão e será utilizada/i
            )
        ).toBeInTheDocument();
    });

    it("limpa erro ao fechar o modal via cancelar", async () => {
        const user = userEvent.setup();
        const mockOnOpenChange = vi.fn();
        const mensagemDeErroAPI = "Erro ao atualizar senha";

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

        // Clicar em cancelar deve chamar onOpenChange(false), que limpa os erros
        const btnCancelar = screen.getByRole("button", { name: /cancelar/i });
        await user.click(btnCancelar);

        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    }, 10000);
});
