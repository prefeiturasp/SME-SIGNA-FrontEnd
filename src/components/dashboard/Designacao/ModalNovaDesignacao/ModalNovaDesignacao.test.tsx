import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import ModalNovaDesignacao from "./ModalNovaDesignacao";
import type { UnidadeCadastrada } from "@/types/designacao-unidade";

const UNIDADE: UnidadeCadastrada = {
  dre: "108800",
  dre_nome: "DRE BUTANTA",
  ue: "019453",
  ue_nome: "EMEF - ALIPIO CORREA NETO, PROF.",
};

vi.mock("./AutocompleteUnidadeCadastrada", () => ({
  default: ({ onChange }: { onChange: (unidade: UnidadeCadastrada | null) => void }) => (
    <div data-testid="autocomplete-unidade">
      <button type="button" data-testid="selecionar-unidade" onClick={() => onChange(UNIDADE)}>
        selecionar
      </button>
      <button type="button" data-testid="limpar-unidade" onClick={() => onChange(null)}>
        limpar
      </button>
    </div>
  ),
}));

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

  it("chama onContinuar com novo_cadastro e sem unidade", async () => {
    renderModal();

    await userEvent.click(screen.getByTestId("opcao-novo_cadastro"));
    await userEvent.click(screen.getByTestId("botao-continuar-nova-designacao"));

    expect(onContinuar).toHaveBeenCalledWith("novo_cadastro", null);
  });

  it("mostra o autocomplete só quando 'unidade já cadastrada' está selecionada", async () => {
    renderModal();

    expect(screen.queryByTestId("autocomplete-unidade")).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId("opcao-unidade_cadastrada"));
    expect(screen.getByTestId("autocomplete-unidade")).toBeInTheDocument();

    await userEvent.click(screen.getByTestId("opcao-novo_cadastro"));
    expect(screen.queryByTestId("autocomplete-unidade")).not.toBeInTheDocument();
  });

  it("exige a escolha de uma unidade antes de continuar com 'unidade já cadastrada'", async () => {
    renderModal();

    await userEvent.click(screen.getByTestId("opcao-unidade_cadastrada"));
    expect(screen.getByTestId("botao-continuar-nova-designacao")).toBeDisabled();

    await userEvent.click(screen.getByTestId("selecionar-unidade"));
    expect(screen.getByTestId("botao-continuar-nova-designacao")).toBeEnabled();

    await userEvent.click(screen.getByTestId("limpar-unidade"));
    expect(screen.getByTestId("botao-continuar-nova-designacao")).toBeDisabled();
  });

  it("chama onContinuar com a unidade selecionada", async () => {
    renderModal();

    await userEvent.click(screen.getByTestId("opcao-unidade_cadastrada"));
    await userEvent.click(screen.getByTestId("selecionar-unidade"));
    await userEvent.click(screen.getByTestId("botao-continuar-nova-designacao"));

    expect(onContinuar).toHaveBeenCalledWith("unidade_cadastrada", UNIDADE);
  });

  it("descarta a unidade ao trocar para 'novo cadastro'", async () => {
    renderModal();

    await userEvent.click(screen.getByTestId("opcao-unidade_cadastrada"));
    await userEvent.click(screen.getByTestId("selecionar-unidade"));
    await userEvent.click(screen.getByTestId("opcao-novo_cadastro"));
    await userEvent.click(screen.getByTestId("opcao-unidade_cadastrada"));

    expect(screen.getByTestId("botao-continuar-nova-designacao")).toBeDisabled();
  });

  it("chama onOpenChange(false) ao clicar em Voltar", async () => {
    renderModal();

    await userEvent.click(screen.getByTestId("botao-voltar-nova-designacao"));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onContinuar).not.toHaveBeenCalled();
  });
});
