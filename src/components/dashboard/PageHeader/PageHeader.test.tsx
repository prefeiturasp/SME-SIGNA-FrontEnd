import { render, screen } from "@testing-library/react";
import PageHeader from "./PageHeader";
import { describe, it, expect } from "vitest";

describe("PageHeader", () => {
    it("deve renderizar o título", () => {
        render(<PageHeader title="Test Title" />);
        expect(
            screen.getByRole("heading", { name: /test title/i })
        ).toBeInTheDocument();
    });

    it("deve renderizar o link de voltar por padrão", () => {
        render(<PageHeader title="Test Title" />);
        const link = screen.getByRole("link", { name: /voltar/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("href", "/dashboard");
    });

    it("não deve renderizar o link de voltar se showBackButton for false", () => {
        render(<PageHeader title="Test Title" showBackButton={false} />);
        expect(
            screen.queryByRole("link", { name: /voltar/i })
        ).not.toBeInTheDocument();
    });
});
