import {
    render,
    screen,
    fireEvent,
    waitFor,
    within,
} from "@testing-library/react";
import FormCadastro from "./index";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mutateAsyncMock = vi.fn();
vi.mock("@/hooks/useCadastro", () => ({
    __esModule: true,
    default: () => ({
        mutateAsync: mutateAsyncMock,
        isPending: false,
    }),
}));

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/actions/unidades", () => ({
    getDREs: vi.fn().mockResolvedValue([
        { uuid: "dre-1", nome: "DRE Norte" },
        { uuid: "dre-2", nome: "DRE Sul" },
    ]),
    getUEs: vi.fn().mockImplementation((dreUuid: string) => {
        if (dreUuid === "dre-1") {
            return Promise.resolve([
                { uuid: "ue-1", nome: "EMEF João da Silva" },
                { uuid: "ue-2", nome: "EMEF Maria das Dores" },
            ]);
        }
        return Promise.resolve([]);
    }),
}));

describe("FormCadastro", () => {
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

    beforeAll(() => {
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
    });

    const preencherFormulario = async () => {
        const selectOption = async (
            comboboxIndex: number,
            optionName: string
        ) => {
            const combobox = screen.getAllByRole("combobox")[comboboxIndex];
            fireEvent.click(combobox);
            const option = await within(document.body).findByRole("option", {
                name: optionName,
            });
            fireEvent.click(option);
            await waitFor(() => expect(option).not.toBeInTheDocument());
            fireEvent.blur(combobox);
        };

        await selectOption(0, "DRE Norte");
        await selectOption(1, "EMEF João da Silva");

        fireEvent.change(
            screen.getByPlaceholderText("Exemplo: Maria Clara Medeiros"),
            { target: { value: "Maria Teste" } }
        );

        fireEvent.change(screen.getByPlaceholderText("123.456.789-10"), {
            target: { value: "128.088.888-13" },
        });

        fireEvent.change(
            screen.getByPlaceholderText("Digite o seu e-mail corporativo"),
            { target: { value: "admin@sme.prefeitura.sp.gov.br" } }
        );
    };

    it("fluxo completo de cadastro com sucesso", async () => {
        mutateAsyncMock.mockResolvedValueOnce({ success: true });

        render(<FormCadastro />, { wrapper });

        await preencherFormulario();

        const cadastrarButton = screen.getByRole("button", {
            name: "Cadastrar agora",
        });
        await waitFor(() => expect(cadastrarButton).toBeEnabled());
        fireEvent.click(cadastrarButton);

        await waitFor(() => expect(mutateAsyncMock).toHaveBeenCalled());

        const finalizarButton = screen.getByRole("link", {
            name: /finalizar/i,
        });
        fireEvent.click(finalizarButton);
        expect(finalizarButton).toHaveAttribute("href", "/");
    });

    it("mostra mensagem de erro quando cadastro falha (username)", async () => {
        mutateAsyncMock.mockResolvedValueOnce({
            success: false,
            error: "Já existe uma conta com este CPF.",
            field: "username",
        });

        render(<FormCadastro />, { wrapper });

        await preencherFormulario();

        const cadastrarButton = screen.getByRole("button", {
            name: "Cadastrar agora",
        });
        await waitFor(() => expect(cadastrarButton).toBeEnabled());
        fireEvent.click(cadastrarButton);

        await waitFor(() =>
            expect(
                screen.getByText("Já existe uma conta com este CPF.")
            ).toBeInTheDocument()
        );
    });

    it("mostra mensagem de erro quando cadastro falha (outro campo)", async () => {
        mutateAsyncMock.mockResolvedValueOnce({
            success: false,
            error: "Este e-mail já está cadastrado.",
            field: "email",
        });

        render(<FormCadastro />, { wrapper });

        await preencherFormulario();

        const cadastrarButton = screen.getByRole("button", {
            name: "Cadastrar agora",
        });
        await waitFor(() => expect(cadastrarButton).toBeEnabled());
        fireEvent.click(cadastrarButton);

        await waitFor(() => expect(mutateAsyncMock).toHaveBeenCalled());
    });

    it("botão cancelar leva para a home", async () => {
        render(<FormCadastro />, { wrapper });

        const cancelarButton = screen.getByRole("button", { name: "Cancelar" });
        fireEvent.click(cancelarButton);

        expect(pushMock).toHaveBeenCalledWith("/");
    });
});
