import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUserStore } from "@/stores/useUserStore";

import { render, screen } from "@testing-library/react";
import MeusDadosPage from "./page";

vi.mock("@/stores/useUserStore", () => {
    return {
        useUserStore: vi.fn(),
    };
});

function renderWithQueryProvider(ui: React.ReactElement) {
    const queryClient = new QueryClient();
    return render(
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
}

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        refresh: vi.fn(),
    }),
    usePathname: () => "/dashboard/meus-dados",
    useSearchParams: () => ({}),
    useParams: () => ({}),
}));

describe("MeusDadosPage", () => {
    it("deve renderizar o componente MeusDados", () => {
        renderWithQueryProvider(<MeusDadosPage />);
        expect(
            screen.getByText(/esses são os seus dados cadastrados/i)
        ).toBeInTheDocument();
    });

    it("deve exibir o nome completo", () => {
        const fakeUser = {
            name: "Fake User",
            perfil_acesso: { nome: "Assistente de diretor", codigo: 3085 },
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

        (
            useUserStore as unknown as {
                mockImplementation: (fn: () => unknown) => void;
            }
        ).mockImplementation(() => fakeUser);
        renderWithQueryProvider(<MeusDadosPage />);
        expect(screen.getByText(/fake user/i)).toBeInTheDocument();
    });
});
