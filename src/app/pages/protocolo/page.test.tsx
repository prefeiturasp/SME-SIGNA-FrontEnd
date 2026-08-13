import { render, screen } from "@testing-library/react";
import Protocolo from "./page";

describe("Protocolo", () => {
    it("deve renderizar o texto 'Protocolo'", () => {
        render(<Protocolo />);

        expect(screen.getByText("Protocolo")).toBeInTheDocument();
    });
});
