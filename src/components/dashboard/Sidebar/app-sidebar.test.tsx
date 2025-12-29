import { render, screen } from "@testing-library/react";
import { AppSidebar } from "./app-sidebar";
import { usePathname } from "next/navigation";
import * as sidebarUi from "@/components/ui/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

vi.mock("@/assets/images/logo-gipe-nome.webp", () => ({
    default: {
        src: "/logo-gipe-nome.webp",
        height: 40,
        width: 120,
    },
}));

vi.mock("next/navigation", () => ({
    usePathname: vi.fn(),
}));

vi.spyOn(sidebarUi, "useSidebar").mockReturnValue({
    state: "expanded",
    open: true,
    setOpen: () => {},
    openMobile: false,
    setOpenMobile: () => {},
    isMobile: false,
    toggleSidebar: () => {},
});

beforeAll(() => {
    window.matchMedia = (query: string) =>
        ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => {},
        } as unknown as MediaQueryList);
});

describe("AppSidebar", () => {
    beforeEach(() => {
        (usePathname as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
            "/dashboard"
        );
    });

    const renderWithProvider = (ui: React.ReactNode) =>
        render(<SidebarProvider>{ui}</SidebarProvider>);

    it("renderiza os itens do menu e destaca o ativo", () => {
        renderWithProvider(<AppSidebar />);
        expect(screen.getByText("Meus dados")).toBeInTheDocument();
        expect(screen.getByTestId("icon-alert")).toBeInTheDocument();
        expect(screen.getByTestId("icon-user")).toBeInTheDocument();
    });

    it("destaca o menu correto conforme a rota", () => {
        (usePathname as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
            "/meus-dados"
        );
        renderWithProvider(<AppSidebar />);
        expect(
            screen.getByText("Meus dados").closest(".bg-[--sidebar-accent]")
        );
    });

    it("renderiza corretamente quando a sidebar está fechada (collapsed)", () => {
        vi.spyOn(sidebarUi, "useSidebar").mockReturnValue({
            state: "collapsed",
            open: false,
            setOpen: () => {},
            openMobile: false,
            setOpenMobile: () => {},
            isMobile: false,
            toggleSidebar: () => {},
        });
        renderWithProvider(<AppSidebar />);
        expect(screen.getByTestId("icon-alert")).toBeInTheDocument();
        expect(screen.getByTestId("icon-user")).toBeInTheDocument();
        expect(screen.getByText("Meus dados")).toBeInTheDocument();
    });
});
