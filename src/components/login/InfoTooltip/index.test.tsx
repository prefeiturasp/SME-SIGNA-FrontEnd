import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InfoTooltip from "./index";

describe("InfoTooltipInner", () => {
    it("renderiza trigger padrão quando não há children", () => {
        render(<InfoTooltip content="conteudo" />);
        expect(
            screen.getByRole("button", { name: /ajuda/i })
        ).toBeInTheDocument();
    });

    it("renderiza trigger custom quando children é passado", () => {
        render(
            <InfoTooltip content="conteudo">
                <button>custom</button>
            </InfoTooltip>
        );

        expect(screen.getByText("custom")).toBeInTheDocument();
    });

    it("mostra o conteúdo ao hover/focus no trigger", async () => {
        const user = userEvent.setup();
        render(<InfoTooltip content={<span>foo</span>} />);

        const trigger = screen.getByRole("button", { name: /ajuda/i });
        await user.hover(trigger);

        const matches = await screen.findAllByText("foo");
        expect(matches.length).toBeGreaterThan(0);
    });

    it("aplica contentClassName no content", async () => {
        const user = userEvent.setup();
        render(<InfoTooltip content="x" contentClassName="meu-class" />);

        const trigger = screen.getByRole("button", { name: /ajuda/i });
        await user.hover(trigger);

        const matches = await screen.findAllByText("x");
        const hasClass = matches.some((m) =>
            m.parentElement?.classList.contains("meu-class")
        );
        expect(hasClass).toBe(true);
    });
});
