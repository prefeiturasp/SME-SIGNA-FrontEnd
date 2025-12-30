import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SignOutButton from "./SignOutButton";
import { vi } from "vitest";

const clearUserMock = vi.fn();
const pushMock = vi.fn();

vi.mock("@/stores/useUserStore", () => ({
    useUserStore: (selector: (state: unknown) => unknown) =>
        selector({ clearUser: clearUserMock }),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
}));

const queryClient = new QueryClient();

const renderComponent = () => {
    return render(
        <QueryClientProvider client={queryClient}>
            <SignOutButton />
        </QueryClientProvider>
    );
};

describe("SignOutButton", () => {
    beforeEach(() => {
        clearUserMock.mockClear();
        pushMock.mockClear();
        queryClient.clear();
    });

    it('renderiza o botão "Sair"', () => {
        renderComponent();
        expect(
            screen.getByRole("button", { name: /sair/i })
        ).toBeInTheDocument();
    });

    it("executa clearUser, remove a query e redireciona ao clicar", async () => {
        clearUserMock.mockResolvedValue(undefined);
        const removeQueriesSpy = vi.spyOn(queryClient, "removeQueries");
        renderComponent();

        fireEvent.click(screen.getByRole("button", { name: /sair/i }));

        // Aguarda a execução do clearUser (que é async)
        await vi.waitFor(() => {
            expect(clearUserMock).toHaveBeenCalled();
        });

        expect(removeQueriesSpy).toHaveBeenCalledWith({ queryKey: ["me"] });
        expect(pushMock).toHaveBeenCalledWith("/");
    });
});
