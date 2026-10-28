import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ModalPeriodoSobreposto from "./ModalPeriodoSobreposto";

const MENSAGEM =
  "Já existe designação em substituição a este titular, para este cargo nesta unidade, vigente até 30/06/2026.";

describe("ModalPeriodoSobreposto", () => {
  it("exibe o título e a mensagem quando aberto", () => {
    render(
      <ModalPeriodoSobreposto open mensagem={MENSAGEM} onFechar={vi.fn()} onAlterarPeriodo={vi.fn()} />
    );

    expect(screen.getByText("Período em conflito com outra designação")).toBeInTheDocument();
    expect(screen.getByTestId("mensagem-periodo-sobreposto")).toHaveTextContent(MENSAGEM);
  });

  it("não renderiza o conteúdo quando fechado", () => {
    render(
      <ModalPeriodoSobreposto
        open={false}
        mensagem={MENSAGEM}
        onFechar={vi.fn()}
        onAlterarPeriodo={vi.fn()}
      />
    );

    expect(screen.queryByTestId("mensagem-periodo-sobreposto")).not.toBeInTheDocument();
  });

  it("chama onFechar ao clicar em Fechar", () => {
    const onFechar = vi.fn();
    render(
      <ModalPeriodoSobreposto open mensagem={MENSAGEM} onFechar={onFechar} onAlterarPeriodo={vi.fn()} />
    );

    fireEvent.click(screen.getByTestId("botao-fechar-periodo-sobreposto"));

    expect(onFechar).toHaveBeenCalledTimes(1);
  });

  it("chama onFechar ao pressionar Esc", () => {
    const onFechar = vi.fn();
    render(
      <ModalPeriodoSobreposto open mensagem={MENSAGEM} onFechar={onFechar} onAlterarPeriodo={vi.fn()} />
    );

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(onFechar).toHaveBeenCalledTimes(1);
  });

  it("chama onAlterarPeriodo ao clicar em Alterar período", () => {
    const onAlterarPeriodo = vi.fn();
    render(
      <ModalPeriodoSobreposto
        open
        mensagem={MENSAGEM}
        onFechar={vi.fn()}
        onAlterarPeriodo={onAlterarPeriodo}
      />
    );

    fireEvent.click(screen.getByTestId("botao-alterar-periodo-sobreposto"));

    expect(onAlterarPeriodo).toHaveBeenCalledTimes(1);
  });
});
