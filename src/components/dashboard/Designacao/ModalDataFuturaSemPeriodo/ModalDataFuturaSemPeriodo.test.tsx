import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ModalDataFuturaSemPeriodo from "./ModalDataFuturaSemPeriodo";

const MENSAGEM = 'Não é possível criar uma designação com data futura sem informar a data "Até".';

describe("ModalDataFuturaSemPeriodo", () => {
  it("exibe o título e a mensagem quando aberto", () => {
    render(
      <ModalDataFuturaSemPeriodo open mensagem={MENSAGEM} onFechar={vi.fn()} onAlterarPeriodo={vi.fn()} />
    );

    expect(screen.getByText("Data final obrigatória")).toBeInTheDocument();
    expect(screen.getByTestId("mensagem-data-futura-sem-periodo")).toHaveTextContent(MENSAGEM);
  });

  it("não renderiza o conteúdo quando fechado", () => {
    render(
      <ModalDataFuturaSemPeriodo
        open={false}
        mensagem={MENSAGEM}
        onFechar={vi.fn()}
        onAlterarPeriodo={vi.fn()}
      />
    );

    expect(screen.queryByTestId("mensagem-data-futura-sem-periodo")).not.toBeInTheDocument();
  });

  it("chama onFechar ao clicar em Fechar", () => {
    const onFechar = vi.fn();
    render(
      <ModalDataFuturaSemPeriodo open mensagem={MENSAGEM} onFechar={onFechar} onAlterarPeriodo={vi.fn()} />
    );

    fireEvent.click(screen.getByTestId("botao-fechar-data-futura-sem-periodo"));

    expect(onFechar).toHaveBeenCalledTimes(1);
  });

  it("chama onFechar ao pressionar Esc", () => {
    const onFechar = vi.fn();
    render(
      <ModalDataFuturaSemPeriodo open mensagem={MENSAGEM} onFechar={onFechar} onAlterarPeriodo={vi.fn()} />
    );

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(onFechar).toHaveBeenCalledTimes(1);
  });

  it("chama onAlterarPeriodo ao clicar em Alterar período", () => {
    const onAlterarPeriodo = vi.fn();
    render(
      <ModalDataFuturaSemPeriodo
        open
        mensagem={MENSAGEM}
        onFechar={vi.fn()}
        onAlterarPeriodo={onAlterarPeriodo}
      />
    );

    fireEvent.click(screen.getByTestId("botao-alterar-periodo-data-futura-sem-periodo"));

    expect(onAlterarPeriodo).toHaveBeenCalledTimes(1);
  });
});
