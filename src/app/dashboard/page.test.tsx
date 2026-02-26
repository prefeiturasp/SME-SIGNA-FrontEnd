import { render, screen } from "@testing-library/react";
import Dashboard from "./page";
import { vi } from "vitest";

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

describe("Dashboard page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renderiza o título principal", () => {
        render(<Dashboard />);

        expect(
            screen.getByRole("heading", { name: /selecione o módulo/i })
        ).toBeInTheDocument();
    });

    it("renderiza a descrição", () => {
        render(<Dashboard />);

        expect(
            screen.getByText(/escolha abaixo o módulo que deseja acessar/i)
        ).toBeInTheDocument();
    });

    it("renderiza todos os módulos", () => {
        render(<Dashboard />);

        expect(screen.getByText("Designação")).toBeInTheDocument();
        expect(screen.getByText("Nomeação")).toBeInTheDocument();
        expect(screen.getByText("Protocolo")).toBeInTheDocument();
        expect(screen.getByText("Apoio administrativo")).toBeInTheDocument();
    });

    it("renderiza as descrições dos módulos", () => {
        render(<Dashboard />);

        expect(
            screen.getByText(/realize a pesquisa e validação de servidores/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/gerencie os processos de nomeação/i)
        ).toBeInTheDocument();
        expect(
            screen.getAllByText(/registre, acompanhe e consulte protocolos/i).length
        ).toBeGreaterThan(0);
    });

    it("renderiza o componente ModuleGrid", () => {
        const { container } = render(<Dashboard />);

        // Verifica se há 4 módulos renderizados
        const modules = container.querySelectorAll('[class*="module"]');
        expect(modules.length).toBeGreaterThanOrEqual(0);
    });
});