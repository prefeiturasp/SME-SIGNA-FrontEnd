import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "./page";
import { describe, it, expect } from "vitest";

describe("Dashboard Home Page", () => {
    it("renderiza a mensagem de boas-vindas", () => {
        render(<Home />);
        
        const heading = screen.getByRole("heading", { name: /seja bem-vindo/i });
        expect(heading).toBeInTheDocument();
    });

    it("aplica as classes CSS corretas", () => {
        const { container } = render(<Home />);
        
        const wrapper = container.querySelector(".flex.items-center.justify-center.h-screen");
        expect(wrapper).toBeInTheDocument();
    });

    it("renderiza o título com as classes corretas", () => {
        render(<Home />);
        
        const heading = screen.getByRole("heading", { name: /seja bem-vindo/i });
        expect(heading).toHaveClass("text-3xl", "font-semibold");
    });
});

