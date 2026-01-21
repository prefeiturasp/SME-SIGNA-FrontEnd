import React from "react";
import { render, screen } from "@testing-library/react";
import LoginTela from "./page";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock do useRouter do Next.js (next/navigation)
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
}));

// Mock do hook useLogin
const mutateAsyncMock = vi.fn();
const isPendingMock = false;
vi.mock("@/hooks/useLogin", () => ({
    __esModule: true,
    default: () => ({ mutateAsync: mutateAsyncMock, isPending: isPendingMock }),
}));

describe("LoginTela Page", () => {
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

    it("renderiza o componente LoginForm", async () => {
        render(<LoginTela />, { wrapper });
        
        // Verifica se os campos do formulário de login estão presentes
        expect(screen.getByPlaceholderText("Seu RF")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Sua senha")).toBeInTheDocument();
        
        // Verifica se o botão de acessar está presente
        expect(screen.getByRole("button", { name: /acessar/i })).toBeInTheDocument();
    });
});

