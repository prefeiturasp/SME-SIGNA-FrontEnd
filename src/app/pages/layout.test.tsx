import { render, screen } from "@testing-library/react";
import DashboardLayout from "@/app/pages/layout";
vi.mock("@/components/ui/sidebar", () => ({
    SidebarProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="sidebar-provider">{children}</div>
    ),
}));

vi.mock("@/components/dashboard/Navbar/Navbar", () => ({
    Navbar: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock("@/components/dashboard/HydrationGuard", () => ({
    HydrationGuard: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="hydration-guard">{children}</div>
    ),
}));

vi.mock("@/components/providers/AuthGuard", () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="auth-guard">{children}</div>
    ),
}));

vi.mock("@/components/providers/NotificationProvider", () => ({
    NotificationProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="notification-provider">{children}</div>
    ),
}));

vi.mock("@/components/dashboard/Sidebar/app-new-sidebar", () => ({
    AppNewSidebar: () => <div data-testid="app-new-sidebar">Sidebar</div>,
}));

vi.mock("antd", () => ({
    Layout: ({
        children,
        hasSider,
        style,
    }: {
        children: React.ReactNode;
        hasSider?: boolean;
        style?: React.CSSProperties;
    }) => (
        <div data-testid="layout" data-has-sider={String(!!hasSider)} data-min-height={style?.minHeight}>
            {children}
        </div>
    ),
}));

describe("DashboardLayout (layout.tsx)", () => {
    it("renderiza wrappers, sidebar, navbar, conteúdo e rodapé", () => {
        render(
            <DashboardLayout>
                <div data-testid="child">Conteudo de teste</div>
            </DashboardLayout>
        );

        expect(screen.getByTestId("hydration-guard")).toBeInTheDocument();
        expect(screen.getByTestId("layout")).toHaveAttribute("data-has-sider", "true");
        expect(screen.getByTestId("layout")).toHaveAttribute("data-min-height", "100vh");
        expect(screen.getByTestId("sidebar-provider")).toBeInTheDocument();
        expect(screen.getByTestId("app-new-sidebar")).toBeInTheDocument();
        expect(screen.getByTestId("notification-provider")).toBeInTheDocument();
        expect(screen.getByTestId("auth-guard")).toBeInTheDocument();
        expect(screen.getByTestId("navbar")).toBeInTheDocument();
        expect(screen.getByTestId("child")).toBeInTheDocument();
        expect(
            screen.getByText("Sistema homologado para navegadores: Google Chrome e Firefox")
        ).toBeInTheDocument();
    });
});
