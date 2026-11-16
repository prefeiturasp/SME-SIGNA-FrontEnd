import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TagApostilada from "./TagApostilada";

describe("TagApostilada", () => {
  it("exibe a flag quando o ato está apostilado", () => {
    render(<TagApostilada apostilado />);
    expect(screen.getByText("Apostilada")).toBeInTheDocument();
  });

  it.each([false, null, undefined])("não exibe a flag quando apostilado é %s", (apostilado) => {
    const { container } = render(<TagApostilada apostilado={apostilado} />);
    expect(container).toBeEmptyDOMElement();
  });
});
