import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import ModuleGrid from "./moduloGrid";

// Mock de ícone para testes
const MockIcon = ({ className }: { className?: string }) => (
    <svg className={className} data-testid="mock-icon">
        <path d="M0 0" />
    </svg>
);

const mockModules = [
    {
        id: "designacao",
        title: "Designação",
        description: "Realize a pesquisa e validação de servidores para verificar a aptidão.",
        icon: MockIcon,
        url: "/designacao",
    },
    {
        id: "nomeacao",
        title: "Nomeação",
        description: "Gerencie os processos de nomeação, acompanhando etapas e registros.",
        icon: MockIcon,
        url: "/nomeacao",
    },
    {
        id: "protocolo",
        title: "Protocolo",
        description: "Registre, acompanhe e consulte protocolos.",
        icon: MockIcon,
        url: "/protocolo",
    },
];

describe("ModuleGrid", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock do window.location
        delete (window as any).location;
        window.location = { href: "" } as any;
    });

    it("renderiza todos os módulos fornecidos", () => {
        render(<ModuleGrid modules={mockModules} />);

        expect(screen.getByText("Designação")).toBeInTheDocument();
        expect(screen.getByText("Nomeação")).toBeInTheDocument();
        expect(screen.getByText("Protocolo")).toBeInTheDocument();
    });

    it("renderiza as descrições dos módulos", () => {
        render(<ModuleGrid modules={mockModules} />);

        expect(
            screen.getByText(/realize a pesquisa e validação de servidores/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/gerencie os processos de nomeação/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/registre, acompanhe e consulte protocolos/i)
        ).toBeInTheDocument();
    });

    it("renderiza os ícones dos módulos", () => {
        render(<ModuleGrid modules={mockModules} />);

        const icons = screen.getAllByTestId("mock-icon");
        expect(icons).toHaveLength(3);
    });

    it("renderiza um botão 'Abrir módulo' para cada módulo", () => {
        render(<ModuleGrid modules={mockModules} />);

        const buttons = screen.getAllByRole("button", { name: /abrir módulo/i });
        expect(buttons).toHaveLength(3);
    });

    it("redireciona para a URL correta ao clicar no botão", async () => {
        const user = userEvent.setup();

        render(<ModuleGrid modules={mockModules} />);

        const buttons = screen.getAllByRole("button", { name: /abrir módulo/i });

        await user.click(buttons[0]);
        expect(window.location.href).toBe("/designacao");

        await user.click(buttons[1]);
        expect(window.location.href).toBe("/nomeacao");

        await user.click(buttons[2]);
        expect(window.location.href).toBe("/protocolo");
    });

    it("renderiza vazio quando não há módulos", () => {
        const { container } = render(<ModuleGrid modules={[]} />);

        const grid = container.querySelector("div");
        expect(grid?.children).toHaveLength(0);
    });

    it("aplica as classes CSS corretas no grid", () => {
        const { container } = render(<ModuleGrid modules={mockModules} />);

        const grid = container.firstChild;
        expect(grid).toHaveClass("grid", "grid-cols-1", "md:grid-cols-2", "lg:grid-cols-4");
    });

    it("renderiza cada módulo com a estrutura correta", () => {
        render(<ModuleGrid modules={[mockModules[0]]} />);

        // Verifica se o card do módulo existe
        const moduleCard = screen.getByText("Designação").closest("div");
        expect(moduleCard).toHaveClass("bg-white", "rounded-xl", "shadow-sm");

        // Verifica se o ícone está dentro de um container circular
        const iconContainer = screen.getByTestId("mock-icon").closest("div");
        expect(iconContainer).toHaveClass("w-14", "h-14", "rounded-full", "bg-gray-400");
    });

    it("renderiza o título com as classes corretas", () => {
        render(<ModuleGrid modules={[mockModules[0]]} />);

        const title = screen.getByText("Designação");
        expect(title).toHaveClass("font-semibold", "text-lg", "text-gray-400");
    });

    it("renderiza a descrição com as classes corretas", () => {
        render(<ModuleGrid modules={[mockModules[0]]} />);

        const description = screen.getByText(/realize a pesquisa e validação/i);
        expect(description).toHaveClass("text-sm", "text-gray-600");
    });

    it("renderiza o botão com as classes corretas", () => {
        render(<ModuleGrid modules={[mockModules[0]]} />);

        const button = screen.getByRole("button", { name: /abrir módulo/i });
        expect(button).toHaveClass("bg-red-700", "hover:bg-red-800", "text-white");
    });
});