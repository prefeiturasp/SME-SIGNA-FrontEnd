import { render, screen } from "@testing-library/react";
import { itemRender, MostrarRegistros } from "./utils";

describe("itemRender", () => {
    it("deve substituir o conteúdo do elemento 'prev' por 'Anterior' com ícone", () => {
        const originalElement = <a href="#">prev</a>;
        const result = itemRender!(1, "prev", originalElement);

        render(<>{result}</>);

        expect(screen.getByText("Anterior")).toBeInTheDocument();
        expect(screen.queryByText("prev")).not.toBeInTheDocument();
    });

    it("deve substituir o conteúdo do elemento 'next' por 'Próximo' com ícone", () => {
        const originalElement = <a href="#">next</a>;
        const result = itemRender!(2, "next", originalElement);

        render(<>{result}</>);

        expect(screen.getByText("Próximo")).toBeInTheDocument();
        expect(screen.queryByText("next")).not.toBeInTheDocument();
    });

    it("deve retornar o originalElement sem alterações quando type for 'page'", () => {
        const originalElement = <a href="#">3</a>;
        const result = itemRender!(3, "page", originalElement);

        expect(result).toBe(originalElement);
    });

    it("deve retornar o originalElement sem alterações quando ele não for um elemento React válido", () => {
        const originalElement = "prev" as unknown as React.ReactElement;
        const result = itemRender!(1, "prev", originalElement);

        expect(result).toBe(originalElement);
    });
});

describe("MostrarRegistros", () => {
    it("deve exibir o intervalo correto na primeira página", () => {
        render(<MostrarRegistros page={1} total={25} />);

        expect(
            screen.getByText("Mostrando 1-10 de 25 registro(s)")
        ).toBeInTheDocument();
    });

    it("deve exibir o intervalo correto em uma página intermediária", () => {
        render(<MostrarRegistros page={2} total={25} />);

        expect(
            screen.getByText("Mostrando 11-20 de 25 registro(s)")
        ).toBeInTheDocument();
    });

    it("deve limitar o final do intervalo ao total quando a última página não estiver completa", () => {
        render(<MostrarRegistros page={3} total={25} />);

        expect(
            screen.getByText("Mostrando 21-25 de 25 registro(s)")
        ).toBeInTheDocument();
    });
});
