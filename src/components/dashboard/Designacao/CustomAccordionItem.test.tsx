import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { Accordion } from "@/components/ui/accordion";
import { CustomAccordionItem } from "./CustomAccordionItem";

type ColorVariant = "gold" | "purple" | "green" | "blue" | "silver" | "gray";

const renderWithAccordion = (ui: React.ReactNode) => {
  return render(
    <Accordion type="single" collapsible defaultValue="">
      {ui}
    </Accordion>
  );
};

describe("CustomAccordionItem", () => {
  it("renderiza o título corretamente", () => {
    renderWithAccordion(
      <CustomAccordionItem title="Meu Título" value="item-1">
        Conteúdo
      </CustomAccordionItem>
    );

    expect(screen.getByText("Meu Título")).toBeInTheDocument();
  });

  it("não exibe o conteúdo inicialmente quando fechado", () => {
    renderWithAccordion(
      <CustomAccordionItem title="Teste" value="item-1">
        Conteúdo oculto
      </CustomAccordionItem>
    );


    expect(screen.queryByText("Conteúdo oculto")).not.toBeInTheDocument();
  });

  it("exibe o conteúdo ao clicar no trigger", async () => {
    const user = userEvent.setup();

    renderWithAccordion(
      <CustomAccordionItem title="Teste" value="item-1">
        Conteúdo visível
      </CustomAccordionItem>
    );

    const trigger = screen.getByRole("button", { name: /teste/i });

    await user.click(trigger);

    expect(screen.getByText("Conteúdo visível")).toBeVisible();
  });

  it("aplica variante gold por padrão", () => {
    renderWithAccordion(
      <CustomAccordionItem title="Gold" value="item-1">
        Conteúdo
      </CustomAccordionItem>
    );

    const title = screen.getByText("Gold");

    expect(title).toHaveClass("text-[#E09326]");
  });

  it("aplica variante purple corretamente", () => {
    renderWithAccordion(
      <CustomAccordionItem title="Purple" value="item-1" color="purple">
        Conteúdo
      </CustomAccordionItem>
    );

    const title = screen.getByText("Purple");

    expect(title).toHaveClass("text-[#A936AF]");
  });

  it("renderiza os children dentro do Card", async () => {
    const user = userEvent.setup();

    renderWithAccordion(
      <CustomAccordionItem title="Filhos" value="item-1">
        <div data-testid="child">Child Content</div>
      </CustomAccordionItem>
    );

    await user.click(screen.getByRole("button", { name: /filhos/i }));

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("aplica className extra no AccordionItem", () => {
    renderWithAccordion(
      <CustomAccordionItem title="Classe" value="item-1" className="classe-extra">
        Conteúdo
      </CustomAccordionItem>,
    );

    expect(document.querySelector(".classe-extra")).toBeInTheDocument();
  });

  it.each([
    ["green", "text-green-600", "border-l-green-500"],
    ["blue", "text-[#274D9B]", "border-l-[#6F8CC7]"],
    ["silver", "text-silver", "border-l-[#565656]"],
    ["gray", "text-gray", "border-l-[#565656]"],
  ] satisfies Array<[ColorVariant, string, string]>)(
    "aplica variante %s corretamente",
    (color, textClass, borderClass) => {
      renderWithAccordion(
        <CustomAccordionItem title={`Variante ${color}`} value="item-1" color={color}>
          Conteúdo
        </CustomAccordionItem>,
      );

      const title = screen.getByText(`Variante ${color}`);
      const trigger = screen.getByRole("button", { name: new RegExp(`variante ${color}`, "i") });

      expect(title).toHaveClass(textClass);
      expect(trigger).toHaveClass(borderClass);
      expect(trigger).toHaveClass("bg-[#F9F9F9]");
    },
  );
});