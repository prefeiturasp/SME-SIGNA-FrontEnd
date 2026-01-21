import React from "react";
import { render, screen } from "@testing-library/react";
import FundoBranco from "./QuadroBranco";

describe("FundoBranco", () => {
  it("renderiza com classes padrão e inclui classe customizada", () => {
    render(
      <FundoBranco className="extra-class">
        <span data-testid="child">Conteúdo</span>
      </FundoBranco>
    );

    const wrapper = screen.getByTestId("child").parentElement;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.className).toContain("bg-white");
    expect(wrapper?.className).toContain("rounded-[4px]");
    expect(wrapper?.className).toContain("shadow-[4px_4px_12px_0px_rgba(0,0,0,0.12)]");
    expect(wrapper?.className).toContain("p-[24px_32px]");
    expect(wrapper?.className).toContain("extra-class");
  });
});

