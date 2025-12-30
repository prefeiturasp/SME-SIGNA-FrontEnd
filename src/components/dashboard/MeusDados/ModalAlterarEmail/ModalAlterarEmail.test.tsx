import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/hooks/useAtualizarEmail", () => {
    const __mutateAsync = vi.fn();
    return {
        default: () => ({
            mutateAsync: __mutateAsync,
            isPending: false,
        }),
        __mutateAsync,
    };
});

import * as useAtualizarEmailModule from "@/hooks/useAtualizarEmail";
const mockMutateAsync = (
    useAtualizarEmailModule as unknown as {
        __mutateAsync: Mock;
    }
).__mutateAsync;

import ModalAlterarEmail from "./ModalAlterarEmail";

function renderWithQueryProvider(ui: React.ReactElement) {
    const queryClient = new QueryClient();
    return render(
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
}

describe("ModalAlterarEmail", () => {
    const onOpenChange = vi.fn();
    const currentMail = "usuario@sme.prefeitura.sp.gov.br";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renderiza input com valor atual e botão Salvar desabilitado", () => {
        renderWithQueryProvider(
            <ModalAlterarEmail
                open={true}
                onOpenChange={onOpenChange}
                currentMail={currentMail}
            />
        );

        const input = screen.getByTestId("input-email");
        expect(input).toBeInTheDocument();
        expect(input).toHaveValue(currentMail);

        const salvarBtn = screen.getByRole("button", {
            name: /salvar e-mail/i,
        });
        expect(salvarBtn).toBeDisabled();
    });

    it("chama onOpenChange ao clicar em Cancelar e não dispara a mutation", async () => {
        renderWithQueryProvider(
            <ModalAlterarEmail
                open={true}
                onOpenChange={onOpenChange}
                currentMail={currentMail}
            />
        );

        const user = userEvent.setup();
        const btnCancelar = screen.getByRole("button", { name: /cancelar/i });
        await user.click(btnCancelar);

        expect(onOpenChange).toHaveBeenCalledWith(false);
        expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it("habilita o botão Salvar quando o e-mail é alterado para um formato válido diferente do atual", async () => {
        renderWithQueryProvider(
            <ModalAlterarEmail
                open={true}
                onOpenChange={onOpenChange}
                currentMail={currentMail}
            />
        );

        const user = userEvent.setup();
        const input = screen.getByTestId("input-email");
        await user.clear(input);
        await user.type(input, "novo@sme.prefeitura.sp.gov.br");

        const salvarBtn = screen.getByRole("button", {
            name: /salvar e-mail/i,
        });
        expect(salvarBtn).toBeEnabled();
    });

    it("mantém o botão desabilitado quando o e-mail não é válido", async () => {
        renderWithQueryProvider(
            <ModalAlterarEmail
                open={true}
                onOpenChange={onOpenChange}
                currentMail={currentMail}
            />
        );

        const user = userEvent.setup();
        const input = screen.getByTestId("input-email");
        await user.clear(input);
        await user.type(input, "email-invalido");

        const salvarBtn = screen.getByRole("button", {
            name: /salvar e-mail/i,
        });
        expect(salvarBtn).toBeDisabled();
    });

    it("mostra mensagem de sucesso e desabilita input após salvar com sucesso", async () => {
        mockMutateAsync.mockResolvedValue({ success: true });

        renderWithQueryProvider(
            <ModalAlterarEmail
                open={true}
                onOpenChange={onOpenChange}
                currentMail={currentMail}
            />
        );

        const user = userEvent.setup();
        const input = screen.getByTestId("input-email");
        await user.clear(input);
        await user.type(input, "novo@sme.prefeitura.sp.gov.br");

        const salvarBtn = screen.getByRole("button", {
            name: /salvar e-mail/i,
        });
        await user.click(salvarBtn);

        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: /fechar/i })
            ).toBeInTheDocument();
            expect(screen.getByTestId("input-email")).toBeDisabled();
            expect(
                screen.getByText(
                    /Um e-mail de confirmação foi enviado para o novo endereço/i
                )
            ).toBeInTheDocument();
        });

        const btnFechar = screen.getByRole("button", { name: /fechar/i });
        await user.click(btnFechar);
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("exibe a mensagem de erro retornada pela API quando a mutation falha", async () => {
        const mensagem = "Erro ao salvar e-mail";
        mockMutateAsync.mockResolvedValue({ success: false, error: mensagem });

        renderWithQueryProvider(
            <ModalAlterarEmail
                open={true}
                onOpenChange={onOpenChange}
                currentMail={currentMail}
            />
        );

        const user = userEvent.setup();
        const input = screen.getByTestId("input-email");
        await user.clear(input);
        await user.type(input, "novo@sme.prefeitura.sp.gov.br");

        const salvarBtn = screen.getByRole("button", {
            name: /salvar e-mail/i,
        });
        await user.click(salvarBtn);

        await waitFor(() => {
            expect(screen.getByText(mensagem)).toBeInTheDocument();
            expect(
                screen.queryByRole("button", { name: /fechar/i })
            ).toBeNull();
        });
    });
});
