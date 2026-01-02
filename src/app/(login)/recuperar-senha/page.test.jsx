import React from "react";
import { render, screen } from "@testing-library/react";
import RecuperacaoDeSenhaTela from "./page";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock do useRouter do Next.js (next/navigation)
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
}));

// Mock do hook useRecuperarSenha
const mutateAsyncMock = vi.fn();
const isPendingMock = false;
vi.mock("@/hooks/useRecuperarSenha", () => ({
    __esModule: true,
    default: () => ({ mutateAsync: mutateAsyncMock, isPending: isPendingMock }),
}));

describe("RecuperacaoDeSenhaTela Page", () => {
    let queryClient;
    const wrapper = ({ children }) => (
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

    it("renderiza o componente FormRecuperarSenha", async () => {
        render(<RecuperacaoDeSenhaTela />, { wrapper });
        
        // Verifica se o campo de RF/CPF está presente
        expect(
            await screen.findByPlaceholderText("Insira seu RF")
        ).toBeInTheDocument();
        
        // Verifica se o botão Continuar está presente
        expect(
            screen.getByRole("button", { name: /continuar/i })
        ).toBeInTheDocument();
    });
});

