import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import BotoesDeNavegacao from "./BotoesDeNavegacao";

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

describe("BotoesDeNavegacao", () => {
  it("renderiza botões com rótulos esperados e dispara callbacks", async () => {
    const onAnterior = vi.fn();
    const onProximo = vi.fn();

    render(
      <BotoesDeNavegacao
        disableAnterior={false}
        disableProximo={false}
        onAnterior={onAnterior}
        onProximo={onProximo}
      />
    );

    const botaoAnterior = screen.getByTestId("botao-anterior");
    const botaoProximo = screen.getByTestId("botao-proximo");

    expect(botaoAnterior).toHaveTextContent("Voltar");
    expect(botaoProximo).toHaveTextContent("Avançar");
    expect(botaoProximo).toHaveAttribute("type", "submit");

    await userEvent.click(botaoAnterior);
    await userEvent.click(botaoProximo);

    expect(onAnterior).toHaveBeenCalledTimes(1);
    expect(onProximo).toHaveBeenCalledTimes(1);
  });

  it("aplica estado disabled nos botões conforme props", async () => {
    const onAnterior = vi.fn();
    const onProximo = vi.fn();

    render(
      <BotoesDeNavegacao
        disableAnterior={true}
        disableProximo={true}
        onAnterior={onAnterior}
        onProximo={onProximo}
      />
    );

    const botaoAnterior = screen.getByTestId("botao-anterior");
    const botaoProximo = screen.getByTestId("botao-proximo");

    expect(botaoAnterior).toBeDisabled();
    expect(botaoProximo).toBeDisabled();

    await userEvent.click(botaoAnterior);
    await userEvent.click(botaoProximo);

    expect(onAnterior).not.toHaveBeenCalled();
    expect(onProximo).not.toHaveBeenCalled();
  });
});

