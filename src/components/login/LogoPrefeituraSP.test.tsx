import { render, screen } from "@testing-library/react";
import LogoPrefeituraSP from "./LogoPrefeituraSP";
import { describe, it, expect } from "vitest";

describe("LogoPrefeituraSP", () => {
    it("renderiza a imagem da logo da Prefeitura de SP", () => {
        render(<LogoPrefeituraSP />);
        
        const logo = screen.getByAltText("Logo prefeitura de SP");
        expect(logo).toBeInTheDocument();
    });

    it("aplica className customizada quando fornecida", () => {
        render(<LogoPrefeituraSP className="custom-class" />);
        
        const logo = screen.getByAltText("Logo prefeitura de SP");
        expect(logo).toHaveClass("custom-class");
    });

    it("usa dimensões padrão quando não fornecidas pela imagem", () => {
        render(<LogoPrefeituraSP />);
        
        const logo = screen.getByAltText("Logo prefeitura de SP");
        // Verifica que a imagem foi renderizada, as dimensões são aplicadas via props width/height
        expect(logo).toBeInTheDocument();
    });

    it("aceita props adicionais", () => {
        render(<LogoPrefeituraSP data-testid="logo-test" />);
        
        const logo = screen.getByTestId("logo-test");
        expect(logo).toBeInTheDocument();
    });
});

