import { render, screen } from "@testing-library/react";
import LoginLayout from "../(login)/layout";

describe("LoginLayout", () => {
    it("renderiza o children centralizado", () => {
        render(
            <LoginLayout>
                <div data-testid="child">Conteúdo Login</div>
            </LoginLayout>
        );
        const child = screen.getByTestId("child");
        expect(child).toBeInTheDocument();
        const container = child.closest(
            ".flex.flex-col.items-center.flex-shrink-0.px-4.py-8"
        );
        expect(container).toBeInTheDocument();
        expect(container).toHaveClass("w-full");
    });
});
