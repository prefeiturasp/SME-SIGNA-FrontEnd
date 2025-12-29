import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "./page";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        back: vi.fn(),
    }),
}));
vi.mock("@/hooks/useOcorrencias", () => ({
    useOcorrencias: () => ({
        data: [],
        isLoading: false,
        isError: false,
    }),
}));

const queryClient = new QueryClient();

const renderWithProvider = (ui: React.ReactElement) => {
    return render(
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
};

describe("Dashboard page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renderiza conteúdo protegido", async () => {
        renderWithProvider(<Dashboard />);

        await waitFor(() => {
            expect(
                screen.getByText(/dashboard/i)
            ).toBeInTheDocument();
        });
    });
});
