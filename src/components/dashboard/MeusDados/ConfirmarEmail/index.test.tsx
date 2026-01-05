import React from "react";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import { vi } from "vitest";
import ConfirmarEmail from "./index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function renderWithQueryProvider(ui: React.ReactElement) {
    const queryClient = new QueryClient();
    return render(
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
}

const clearUserMock = vi.fn();
vi.mock("@/stores/useUserStore", () => ({
    __esModule: true,
    useUserStore: (
        selector: (state: { clearUser: typeof clearUserMock }) => unknown
    ) =>
        selector({ clearUser: clearUserMock } as unknown as {
            clearUser: typeof clearUserMock;
        }),
}));

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
}));

vi.mock("js-cookie", () => ({
    __esModule: true,
    default: { remove: vi.fn() },
}));

const mutateAsyncMock = vi.fn();
vi.mock("@/hooks/useConfirmarEmail", () => ({
    __esModule: true,
    default: () => ({ mutateAsync: mutateAsyncMock }),
}));

describe("ConfirmarEmail component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mutateAsyncMock.mockReset();
    });

    it("exibe loading inicialmente e depois mostra sucesso quando a request retorna success", async () => {
        mutateAsyncMock.mockResolvedValue({ success: true });

        renderWithQueryProvider(<ConfirmarEmail code="token" />);

        expect(screen.getByText(/Aguarde um momento!/i)).toBeInTheDocument();

        await waitFor(() => expect(mutateAsyncMock).toHaveBeenCalled());

        await screen.findByText("E-mail confirmado!");
        expect(
            screen.getByText(/Agora você já possui acesso ao Signa/i)
        ).toBeInTheDocument();
    });

    it("exibe erro quando a request retorna success false", async () => {
        mutateAsyncMock.mockResolvedValue({ success: false, error: "erro" });

        renderWithQueryProvider(<ConfirmarEmail code="token" />);

        await waitFor(() => expect(mutateAsyncMock).toHaveBeenCalled());

        await screen.findByText("Ocorreu um erro!");
        const alert = screen.getByRole("alert");
        expect(within(alert).getByText(/erro/i)).toBeInTheDocument();
    });
    it("não chama a request quando code não for passado", async () => {
        mutateAsyncMock.mockResolvedValue({ success: true });

        renderWithQueryProvider(<ConfirmarEmail code={""} />);

        expect(screen.getByText(/Aguarde um momento!/i)).toBeInTheDocument();
        await waitFor(() => expect(mutateAsyncMock).not.toHaveBeenCalled());
    });

    it("não chama a request novamente no rerender da pagina", async () => {
        mutateAsyncMock.mockResolvedValue({ success: true });

        const queryClient = new QueryClient();
        const { rerender } = render(
            <QueryClientProvider client={queryClient}>
                <ConfirmarEmail code="token" />
            </QueryClientProvider>
        );

        await waitFor(() => expect(mutateAsyncMock).toHaveBeenCalledTimes(1));

        rerender(
            <QueryClientProvider client={queryClient}>
                <ConfirmarEmail code="token-2" />
            </QueryClientProvider>
        );

        await waitFor(() => expect(mutateAsyncMock).toHaveBeenCalledTimes(1));
    });

    it("handleLogout chama clearUser, remove cookie e redireciona para tela de login", async () => {
        mutateAsyncMock.mockResolvedValue({ success: true });

        renderWithQueryProvider(<ConfirmarEmail code="token" />);

        await screen.findByText("E-mail confirmado!");

        const sairBtn = screen.getByText("Sair");
        fireEvent.click(sairBtn);

        expect(clearUserMock).toHaveBeenCalled();
        expect(pushMock).toHaveBeenCalledWith("/");
    });
});
