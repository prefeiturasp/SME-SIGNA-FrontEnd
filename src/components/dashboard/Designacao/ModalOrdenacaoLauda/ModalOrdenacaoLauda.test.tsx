import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ModalOrdenacaoLauda from "./ModalOrdenacaoLauda";

const renderModal = (props: Partial<Parameters<typeof ModalOrdenacaoLauda>[0]> = {}) => {
  const onCancelar = vi.fn();
  const onConfirmar = vi.fn();
  const utils = render(
    <ModalOrdenacaoLauda open onCancelar={onCancelar} onConfirmar={onConfirmar} {...props} />
  );
  return { ...utils, onCancelar, onConfirmar };
};

describe("ModalOrdenacaoLauda", () => {
  it("exibe título, subtítulo e as três opções com descrição", () => {
    renderModal();

    expect(screen.getByText("Como deseja ordenar a lauda?")).toBeInTheDocument();
    expect(
      screen.getByText("Selecione como deseja organizar as informações no arquivo antes de fazer o download.")
    ).toBeInTheDocument();

    expect(screen.getByText("Número de portaria")).toBeInTheDocument();
    expect(screen.getByText("Ordena pelo número de portaria.")).toBeInTheDocument();
    expect(screen.getByText("Diretoria Regional de Educação")).toBeInTheDocument();
    expect(screen.getByText("Ordena pelo nome das DREs selecionadas em ordem alfabética.")).toBeInTheDocument();
    expect(screen.getByText("Título")).toBeInTheDocument();
    expect(screen.getByText("Ordena os títulos em ordem alfabética.")).toBeInTheDocument();
  });

  it("não renderiza o conteúdo quando fechado", () => {
    renderModal({ open: false });

    expect(screen.queryByText("Como deseja ordenar a lauda?")).not.toBeInTheDocument();
  });

  it("começa sem opção marcada e com o botão Baixar lauda desabilitado", () => {
    renderModal();

    screen.getAllByRole("radio").forEach((radio) => expect(radio).not.toBeChecked());
    expect(screen.getByTestId("botao-confirmar-ordenacao-lauda")).toBeDisabled();
  });

  it.each([
    ["NUMERO_PORTARIA"],
    ["DRE"],
    ["TITULO"],
  ])("confirma com a ordenação %s escolhida", (valor) => {
    const { onConfirmar, onCancelar } = renderModal();

    fireEvent.click(screen.getByTestId(`ordenacao-lauda-${valor}`));

    const botaoConfirmar = screen.getByTestId("botao-confirmar-ordenacao-lauda");
    expect(botaoConfirmar).toBeEnabled();

    fireEvent.click(botaoConfirmar);

    expect(onConfirmar).toHaveBeenCalledWith(valor);
    expect(onCancelar).not.toHaveBeenCalled();
  });

  it("chama onCancelar sem confirmar ao clicar em Cancelar", () => {
    const { onCancelar, onConfirmar } = renderModal();

    fireEvent.click(screen.getByTestId("ordenacao-lauda-DRE"));
    fireEvent.click(screen.getByTestId("botao-cancelar-ordenacao-lauda"));

    expect(onCancelar).toHaveBeenCalledTimes(1);
    expect(onConfirmar).not.toHaveBeenCalled();
  });

  it("chama onCancelar ao pressionar Esc", () => {
    const { onCancelar } = renderModal();

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(onCancelar).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["cancelar", "botao-cancelar-ordenacao-lauda"],
    ["confirmar", "botao-confirmar-ordenacao-lauda"],
  ])("começa sem opção marcada ao reabrir depois de %s", (_, botao) => {
    const props = { onCancelar: vi.fn(), onConfirmar: vi.fn() };
    const { rerender } = render(<ModalOrdenacaoLauda open {...props} />);

    fireEvent.click(screen.getByTestId("ordenacao-lauda-TITULO"));
    fireEvent.click(screen.getByTestId(botao));

    rerender(<ModalOrdenacaoLauda open={false} {...props} />);
    rerender(<ModalOrdenacaoLauda open {...props} />);

    expect(screen.getByTestId("botao-confirmar-ordenacao-lauda")).toBeDisabled();
  });
});
