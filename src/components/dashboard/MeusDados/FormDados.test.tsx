import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import FormDados from "./FormDados";

interface MockUser {
    name: string;
    perfil_acesso: { nome: string; codigo: number };
    cpf: string;
    unidades: {
        dre: { nome: string; codigo_eol: string; sigla: string };
        ue: { nome: string; codigo_eol: string; sigla: string };
    }[];
    email: string;
}
const mockUser: MockUser = {
    name: "João da Silva",
    email: "joao@email.com",
    cpf: "123.456.789-00",
    perfil_acesso: { nome: "Administrador", codigo: 0 },
    unidades: [
        {
            dre: {
                codigo_eol: "001",
                nome: "DRE Teste",
                sigla: "DRT",
            },
            ue: {
                codigo_eol: "0001",
                nome: "EMEF Teste",
                sigla: "EMEF",
            },
        },
    ],
};

vi.mock("@/stores/useUserStore", () => {
    const mockUser = {
        name: "João da Silva",
        email: "joao@email.com",
        cpf: "123.456.789-00",
        perfil_acesso: { nome: "Administrador", codigo: 0 },
        unidades: [
            {
                dre: {
                    codigo_eol: "001",
                    nome: "DRE Teste",
                    sigla: "DRT",
                },
                ue: {
                    codigo_eol: "0001",
                    nome: "EMEF Teste",
                    sigla: "EMEF",
                },
            },
        ],
    };

    const mockSetUser = vi.fn();

    const mockUserStore = {
        user: mockUser,
        setUser: mockSetUser,
    };

    const mockedHook = (selector: (state: typeof mockUserStore) => unknown) =>
        selector(mockUserStore);

    return {
        useUserStore: Object.assign(mockedHook, {
            getState: () => mockUserStore,
        }),
        __mockUser: mockUser,
        __mockSetUser: mockSetUser,
    };
});

const pushSpy = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: pushSpy,
        replace: vi.fn(),
        prefetch: vi.fn(),
    }),
}));

function renderWithQueryProvider(ui: React.ReactElement) {
    const queryClient = new QueryClient();
    return render(
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
}

describe("FormDados", () => {
    beforeEach(() => {
        pushSpy.mockClear();
    });

    it("renderiza os campos com valores do usuário", () => {
        renderWithQueryProvider(<FormDados />);

        expect(screen.getByLabelText(/nome completo/i)).toHaveValue(
            mockUser.name
        );
        expect(screen.getByLabelText(/e-mail/i)).toHaveValue(mockUser.email);
        expect(screen.getByLabelText(/cpf/i)).toHaveValue(mockUser.cpf);
        expect(screen.getByLabelText(/perfil de acesso/i)).toHaveValue(
            mockUser.perfil_acesso.nome
        );
    });

    it("abre o modal de nova senha ao clicar em 'Alterar senha'", async () => {
        const user = userEvent.setup();
        renderWithQueryProvider(<FormDados />);
        const btnAlterarSenha = screen.getByRole("button", {
            name: /alterar senha/i,
        });
        await user.click(btnAlterarSenha);
        expect(
            await screen.findByRole("heading", { name: /nova senha/i })
        ).toBeInTheDocument();
    });

    it("abre o modal de nova senha ao clicar em 'Alterar email'", async () => {
        const user = userEvent.setup();
        renderWithQueryProvider(<FormDados />);
        const btnAlterarEmail = screen.getByRole("button", {
            name: /alterar e-mail/i,
        });
        await user.click(btnAlterarEmail);
        expect(
            await screen.findByRole("heading", { name: /Alteração de e-mail/i })
        ).toBeInTheDocument();
    });
});
