import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import AlterarSenha from "./index";

const mutateAsyncMock = vi.fn();
vi.mock("@/hooks/useRedefinirSenha", () => ({
    __esModule: true,
    default: () => ({
        mutateAsync: mutateAsyncMock,
        isPending: false,
    }),
}));

describe("AlterarSenha", () => {
    const defaultProps = { code: "uid123", token: "token123" };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renderiza campos e botão desabilitado inicialmente", () => {
        render(<AlterarSenha {...defaultProps} />);
        expect(screen.getByTestId("input-password")).toBeInTheDocument();
        expect(
            screen.getByTestId("input-confirm-password")
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /salvar senha/i })
        ).toBeDisabled();
    });

    it("habilita o botão quando senha e confirmação são válidas", async () => {
        render(<AlterarSenha {...defaultProps} />);
        const user = userEvent.setup();
        const senhaInput = screen.getByTestId("input-password");
        const confirmarInput = screen.getByTestId("input-confirm-password");
        await user.type(senhaInput, "Senha@123");
        await user.type(confirmarInput, "Senha@123");
        expect(
            screen.getByRole("button", { name: /salvar senha/i })
        ).toBeEnabled();
    });

    it("exibe mensagem de sucesso ao redefinir senha", async () => {
        mutateAsyncMock.mockResolvedValueOnce({ success: true });
        render(<AlterarSenha {...defaultProps} />);
        const user = userEvent.setup();
        const senhaInput = screen.getByTestId("input-password");
        const confirmarInput = screen.getByTestId("input-confirm-password");
        await user.type(senhaInput, "Senha@123");
        await user.type(confirmarInput, "Senha@123");
        fireEvent.click(screen.getByRole("button", { name: /salvar senha/i }));
        await waitFor(() => {
            expect(
                screen.getByText(/senha criada com sucesso/i)
            ).toBeInTheDocument();
            expect(screen.getByText(/acessar agora/i)).toBeInTheDocument();
        });
    });

    it("exibe mensagem de erro ao falhar na redefinição", async () => {
        mutateAsyncMock.mockResolvedValueOnce({
            success: false,
            error: "Token expirado",
        });
        render(<AlterarSenha {...defaultProps} />);
        const user = userEvent.setup();
        const senhaInput = screen.getByTestId("input-password");
        const confirmarInput = screen.getByTestId("input-confirm-password");
        await user.type(senhaInput, "Senha@123");
        await user.type(confirmarInput, "Senha@123");
        fireEvent.click(screen.getByRole("button", { name: /salvar senha/i }));
        await waitFor(() => {
            expect(
                screen.getByText(/o link está expirado/i)
            ).toBeInTheDocument();
            expect(
                screen.getByText(/solicitar novo link/i)
            ).toBeInTheDocument();
        });
    });

    it("exibe mensagem de erro específica quando senha é uma das últimas 5 anteriores", async () => {
        mutateAsyncMock.mockResolvedValueOnce({
            success: false,
            error: "A nova senha não pode ser uma das ultimas 5 anteriores",
        });

        render(<AlterarSenha {...defaultProps} />);
        const user = userEvent.setup();
        const senhaInput = screen.getByTestId("input-password");
        const confirmarInput = screen.getByTestId("input-confirm-password");

        await user.type(senhaInput, "Senha@123");
        await user.type(confirmarInput, "Senha@123");
        await user.click(screen.getByRole("button", { name: /salvar senha/i }));

        expect(await screen.findByText(/A nova senha não pode ser uma das ultimas 5 anteriores/i)).toBeInTheDocument();
        expect(screen.getByText(/crie uma nova senha/i)).toBeInTheDocument();
    });

    it("exibe mensagem customizada para token expirado", async () => {
        mutateAsyncMock.mockResolvedValueOnce({
            success: false,
            error: "Token inválido ou expirado.",
        });

        render(<AlterarSenha {...defaultProps} />);
        const user = userEvent.setup();

        const senhaInput = screen.getByTestId("input-password");
        const confirmarInput = screen.getByTestId("input-confirm-password");

        await user.type(senhaInput, "Senha@123");
        await user.type(confirmarInput, "Senha@123");

        fireEvent.click(screen.getByRole("button", { name: /salvar senha/i }));

        await waitFor(() => {
            expect(
                screen.getByText(
                /Por segurança, o link de redefinição expira em 5 minutos\. Solicite um novo para redefinir sua senha\./i)
            ).toBeInTheDocument();
        });
    });

    it("valida critério de senha maiúscula", async () => {
        render(<AlterarSenha {...defaultProps} />);
        const user = userEvent.setup();
        const senhaInput = screen.getByTestId("input-password");
        
        await user.type(senhaInput, "senha@123");
        
        expect(screen.getByText(/ao menos uma letra maiúscula/i)).toBeInTheDocument();
    });

    it("valida critério de senha minúscula", async () => {
        render(<AlterarSenha {...defaultProps} />);
        const user = userEvent.setup();
        const senhaInput = screen.getByTestId("input-password");
        
        await user.type(senhaInput, "SENHA@123");
        
        expect(screen.getByText(/ao menos uma letra minúscula/i)).toBeInTheDocument();
    });

    it("valida critério de tamanho da senha", async () => {
        render(<AlterarSenha {...defaultProps} />);
        const user = userEvent.setup();
        const senhaInput = screen.getByTestId("input-password");
        
        await user.type(senhaInput, "Aa@1");
        
        expect(screen.getByText(/entre 8 e 12 caracteres/i)).toBeInTheDocument();
    });

    it("valida critério de caracter numérico", async () => {
        render(<AlterarSenha {...defaultProps} />);
        const user = userEvent.setup();
        const senhaInput = screen.getByTestId("input-password");
        
        await user.type(senhaInput, "SenhaForte@");
        
        expect(screen.getByText(/ao menos um caracter numérico/i)).toBeInTheDocument();
    });

    it("valida critério de caracter especial", async () => {
        render(<AlterarSenha {...defaultProps} />);
        const user = userEvent.setup();
        const senhaInput = screen.getByTestId("input-password");
        
        await user.type(senhaInput, "Senha1234");
        
        expect(screen.getByText(/ao menos um caracter especial/i)).toBeInTheDocument();
    });

    it("valida que senha não deve conter espaços em branco", async () => {
        render(<AlterarSenha {...defaultProps} />);
        const user = userEvent.setup();
        const senhaInput = screen.getByTestId("input-password");
        
        await user.type(senhaInput, "Senha @123");
        
        expect(screen.getByText(/não deve conter espaços em branco/i)).toBeInTheDocument();
    });

    it("valida que senha não deve conter caracteres acentuados", async () => {
        render(<AlterarSenha {...defaultProps} />);
        const user = userEvent.setup();
        const senhaInput = screen.getByTestId("input-password");
        
        await user.type(senhaInput, "Sénha@123");
        
        expect(screen.getByText(/não deve conter caracteres acentuados/i)).toBeInTheDocument();
    });

    it("renderiza o link de cancelar", () => {
        render(<AlterarSenha {...defaultProps} />);
        
        const cancelarLink = screen.getByRole("link", { name: /cancelar/i });
        expect(cancelarLink).toBeInTheDocument();
        expect(cancelarLink).toHaveAttribute("href", "/");
    });

    it("renderiza o botão 'Acessar agora' após sucesso", async () => {
        mutateAsyncMock.mockResolvedValueOnce({ success: true });
        render(<AlterarSenha {...defaultProps} />);
        const user = userEvent.setup();
        
        const senhaInput = screen.getByTestId("input-password");
        const confirmarInput = screen.getByTestId("input-confirm-password");
        
        await user.type(senhaInput, "Senha@123");
        await user.type(confirmarInput, "Senha@123");
        
        fireEvent.click(screen.getByRole("button", { name: /salvar senha/i }));
        
        await waitFor(() => {
            const acessarLink = screen.getByRole("link", { name: /acessar agora/i });
            expect(acessarLink).toBeInTheDocument();
            expect(acessarLink).toHaveAttribute("href", "/");
        });
    });

    it("renderiza o link 'Solicitar novo link' após erro de token expirado", async () => {
        mutateAsyncMock.mockResolvedValueOnce({
            success: false,
            error: "Token inválido ou expirado.",
        });
        render(<AlterarSenha {...defaultProps} />);
        const user = userEvent.setup();
        
        const senhaInput = screen.getByTestId("input-password");
        const confirmarInput = screen.getByTestId("input-confirm-password");
        
        await user.type(senhaInput, "Senha@123");
        await user.type(confirmarInput, "Senha@123");
        
        fireEvent.click(screen.getByRole("button", { name: /salvar senha/i }));
        
        await waitFor(() => {
            const solicitarLink = screen.getByRole("link", { name: /solicitar novo link/i });
            expect(solicitarLink).toBeInTheDocument();
            expect(solicitarLink).toHaveAttribute("href", "/recuperar-senha");
        });
    });

    it("usa code e token de useParams quando não fornecidos via props", () => {
        const mockUseParams = vi.fn().mockReturnValue({
            code: "param-code",
            token: "param-token",
        });
        
        vi.doMock("next/navigation", () => ({
            useParams: mockUseParams,
        }));

        render(<AlterarSenha code={undefined} token={undefined} />);
        
        expect(screen.getByText(/crie uma nova senha/i)).toBeInTheDocument();
    });

    it("limpa mensagem de retorno ao submeter novamente", async () => {
        mutateAsyncMock
            .mockResolvedValueOnce({
                success: false,
                error: "A nova senha não pode ser uma das ultimas 5 anteriores",
            })
            .mockResolvedValueOnce({ success: true });

        render(<AlterarSenha {...defaultProps} />);
        const user = userEvent.setup();
        
        const senhaInput = screen.getByTestId("input-password");
        const confirmarInput = screen.getByTestId("input-confirm-password");
        
        await user.type(senhaInput, "Senha@123");
        await user.type(confirmarInput, "Senha@123");
        
        fireEvent.click(screen.getByRole("button", { name: /salvar senha/i }));
        
        await waitFor(() => {
            expect(screen.getByText(/A nova senha não pode ser uma das ultimas 5 anteriores/i)).toBeInTheDocument();
        });

        await user.clear(senhaInput);
        await user.clear(confirmarInput);
        await user.type(senhaInput, "Senha@456");
        await user.type(confirmarInput, "Senha@456");
        
        fireEvent.click(screen.getByRole("button", { name: /salvar senha/i }));
        
        await waitFor(() => {
            expect(screen.getByText(/senha criada com sucesso/i)).toBeInTheDocument();
        });
    });

});
