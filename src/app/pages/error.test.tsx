import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import ErrorPage from "./error";

vi.mock("antd", () => ({
    Result: ({
        title,
        subTitle,
        extra,
    }: {
        title: string;
        subTitle?: string;
        extra?: React.ReactNode;
    }) => (
        <div>
            <p>{title}</p>
            {subTitle ? <p>{subTitle}</p> : null}
            {extra}
        </div>
    ),
}));

describe("ErrorPage (pages)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renderiza a mensagem de erro", () => {
        render(<ErrorPage error={new Error("falha")} reset={vi.fn()} />);

        expect(screen.getByText("Ocorreu um erro!")).toBeInTheDocument();
        expect(
            screen.getByText(/não foi possível carregar esta página/i)
        ).toBeInTheDocument();
    });

    it("loga o erro recebido no console", () => {
        const error = new Error("falha ao renderizar");

        render(<ErrorPage error={error} reset={vi.fn()} />);

        expect(console.error).toHaveBeenCalledWith(error);
    });

    it("chama reset ao clicar em 'Tentar novamente'", () => {
        const resetMock = vi.fn();

        render(<ErrorPage error={new Error("falha")} reset={resetMock} />);

        fireEvent.click(screen.getByText("Tentar novamente"));

        expect(resetMock).toHaveBeenCalledTimes(1);
    });
});
