import { render, screen } from "@testing-library/react";
import ApoioAdministrativo from "./page";

describe("ApoioAdministrativo", () => {
    it("deve renderizar o texto 'Apoio administrativo'", () => {
        render(<ApoioAdministrativo />);

        expect(screen.getByText("Apoio administrativo")).toBeInTheDocument();
    });
});
