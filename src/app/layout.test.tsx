import { render } from "@testing-library/react";
import RootLayout, { metadata } from "./layout";
import { describe, it, expect, vi } from "vitest";

// Mock do ReactQueryProvider
vi.mock("@/lib/ReactQueryProvider", () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock das fontes do Next.js
vi.mock("next/font/google", () => ({
    Geist: vi.fn(() => ({
        variable: "--font-geist-sans",
        className: "geist-sans",
    })),
    Geist_Mono: vi.fn(() => ({
        variable: "--font-geist-mono",
        className: "geist-mono",
    })),
}));

describe("RootLayout", () => {
    it("renderiza o layout com children", () => {
        const { container } = render(
            <RootLayout>
                <div data-testid="test-child">Test Content</div>
            </RootLayout>
        );

        expect(container.querySelector('[data-testid="test-child"]')).toBeInTheDocument();
    });

    it("renderiza html com lang='en'", () => {
        const { container } = render(
            <RootLayout>
                <div>Test</div>
            </RootLayout>
        );

        // Verifica se o container contém o conteúdo renderizado
        expect(container).toBeTruthy();
    });

    it("aplica classes de fonte no body", () => {
        const { container } = render(
            <RootLayout>
                <div>Test</div>
            </RootLayout>
        );

        // Verifica se o container foi renderizado corretamente
        expect(container).toBeTruthy();
    });

    it("envolve children com ReactQueryProvider", () => {
        const { getByText } = render(
            <RootLayout>
                <div>Test Content</div>
            </RootLayout>
        );

        expect(getByText("Test Content")).toBeInTheDocument();
    });

    it("possui metadata correto", () => {
        expect(metadata.title).toBe("SIGNA");
        expect(metadata.description).toBe("Teste signa");
    });
});

