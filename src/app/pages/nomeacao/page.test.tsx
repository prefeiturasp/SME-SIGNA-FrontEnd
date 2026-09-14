import { render, screen } from "@testing-library/react";
import Nomeacao from "./page";

describe("Nomeacao", () => {
    it("deve renderizar o texto 'Nomeação'", () => {
        render(<Nomeacao />);

        expect(screen.getByText("Nomeação")).toBeInTheDocument();
    });
});
