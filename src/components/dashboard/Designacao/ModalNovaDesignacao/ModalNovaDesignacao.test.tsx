import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import ModalNovaDesignacao from "./ModalNovaDesignacao";

const onOpenChange = vi.fn();
const onContinuar = vi.fn();

const renderModal = (open = true) =>
  render(
    <ModalNovaDesignacao open={open} onOpenChange={onOpenChange} onContinuar={onContinuar} />
  );

describe("ModalNovaDesignacao", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza título, descrição e as duas opções", () => {
    renderModal();

    expect(screen.getByText("Nova designação")).toBeInTheDocument();
    expect(screen.getByText("Escolha como deseja criar a designação.")).toBeInTheDocument();
    expect(screen.getByText("Começar um novo cadastro")).toBeInTheDocument();
    expect(screen.getByText("Usar uma unidade educacional já cadastrada")).toBeInTheDocument();
  });

  it("não renderiza quando fechado", () => {
    renderModal(false);

    expect(screen.queryByText("Nova designação")).not.toBeInTheDocument();
  });

  it("mantém o botão Continuar desabilitado enquanto nenhuma opção é selecionada", () => {
    renderModal();

    expect(screen.getByTestId("botao-continuar-nova-designacao")).toBeDisabled();
  });

  it("seleciona a opção ao clicar no card", async () => {
    renderModal();

    const opcao = screen.getByTestId("opcao-novo_cadastro");
    await userEvent.click(opcao);

    expect(opcao).toBeChecked();
    expect(screen.getByTestId("opcao-unidade_cadastrada")).not.toBeChecked();
    expect(screen.getByTestId("botao-continuar-nova-designacao")).toBeEnabled();
  });

  it("seleciona a opção ao clicar no texto do card", async () => {
    renderModal();

    await userEvent.click(screen.getByText("Usar uma unidade educacional já cadastrada"));

    expect(screen.getByTestId("opcao-unidade_cadastrada")).toBeChecked();
  });

  it("limpa a seleção ao fechar e reabrir o modal", async () => {
    const { rerender } = renderModal();

    await userEvent.click(screen.getByTestId("opcao-novo_cadastro"));
    await userEvent.click(screen.getByTestId("botao-voltar-nova-designacao"));

    rerender(
      <ModalNovaDesignacao open={false} onOpenChange={onOpenChange} onContinuar={onContinuar} />
    );
    rerender(
      <ModalNovaDesignacao open onOpenChange={onOpenChange} onContinuar={onContinuar} />
    );

    expect(screen.getByTestId("opcao-novo_cadastro")).not.toBeChecked();
    expect(screen.getByTestId("botao-continuar-nova-designacao")).toBeDisabled();
  });

  it.each(["novo_cadastro", "unidade_cadastrada"])(
    "chama onContinuar com a opção %s",
    async (opcao) => {
      renderModal();

      await userEvent.click(screen.getByTestId(`opcao-${opcao}`));
      await userEvent.click(screen.getByTestId("botao-continuar-nova-designacao"));

      expect(onContinuar).toHaveBeenCalledWith(opcao);
    }
  );

  it("chama onOpenChange(false) ao clicar em Voltar", async () => {
    renderModal();

    await userEvent.click(screen.getByTestId("botao-voltar-nova-designacao"));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onContinuar).not.toHaveBeenCalled();
  });
});
