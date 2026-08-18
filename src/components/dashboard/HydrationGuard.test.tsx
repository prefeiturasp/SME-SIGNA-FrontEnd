import { render, screen } from "@testing-library/react";
import { HydrationGuard } from "./HydrationGuard";

const useSyncExternalStoreMock = vi.fn();
vi.mock("react", async (importOriginal) => {
    const actual = await importOriginal<typeof import("react")>();
    return {
        ...actual,
        useSyncExternalStore: (
            ...args: Parameters<typeof actual.useSyncExternalStore>
        ) => useSyncExternalStoreMock(...args),
    };
});

describe("HydrationGuard", () => {
    beforeEach(() => {
        useSyncExternalStoreMock.mockImplementation(
            (
                subscribe: () => () => void,
                getSnapshot: () => boolean,
                getServerSnapshot: () => boolean
            ) => {
                const unsubscribe = subscribe();
                unsubscribe();
                getServerSnapshot();
                return getSnapshot();
            }
        );
    });

    it("não deve renderizar os filhos antes da hidratação", () => {
        useSyncExternalStoreMock.mockReturnValue(false);

        render(
            <HydrationGuard>
                <div>Conteúdo Protegido</div>
            </HydrationGuard>
        );

        expect(
            screen.queryByText("Conteúdo Protegido")
        ).not.toBeInTheDocument();
    });

    it("deve renderizar os filhos após a hidratação", () => {
        render(
            <HydrationGuard>
                <div>Conteúdo Protegido</div>
            </HydrationGuard>
        );

        expect(screen.getByText("Conteúdo Protegido")).toBeInTheDocument();
    });
});
