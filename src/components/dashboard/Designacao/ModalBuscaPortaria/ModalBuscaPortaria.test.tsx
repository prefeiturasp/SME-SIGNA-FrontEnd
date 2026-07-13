import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import ModalBuscaPortaria from "./ModalBuscaPortaria";

const onSubmit = vi.fn();

function renderModal(
  overrides: Partial<{
    open: boolean;
    onOpenChange: (v: boolean) => void;
    isLoading: boolean;
    errorMessage: string | null;
  }> = {}
) {
  const onOpenChange = overrides.onOpenChange ?? vi.fn();

  return {
    onOpenChange,
    ...render(
      <ModalBuscaPortaria
        open={overrides.open ?? true}
        onOpenChange={onOpenChange}
        title="Nova cessação"
        description="Digite o número da portaria de designação que deseja cessar."
        fieldLabel="Portaria de designação"
        isLoading={overrides.isLoading ?? false}
        errorMessage={overrides.errorMessage ?? null}
        onSubmit={onSubmit}
      />
    ),
  };
}

describe("ModalBuscaPortaria", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza título, descrição e label do campo quando open é true", () => {
    renderModal();

    expect(screen.getByRole("heading", { name: /nova cessação/i })).toBeInTheDocument();
    expect(
      screen.getByText(/digite o número da portaria de designação que deseja cessar/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Portaria de designação")).toBeInTheDocument();
  });

  it("não renderiza quando open é false", () => {
    renderModal({ open: false });

    expect(screen.queryByRole("heading", { name: /nova cessação/i })).not.toBeInTheDocument();
  });

  it("exibe mensagem de validação ao buscar com o campo vazio", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByTestId("botao-buscar-portaria"));

    expect(await screen.findByText("Digite um número válido.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("chama onSubmit com o número da portaria informado", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByTestId("input-busca-portaria"), "100/2026");
    await user.click(screen.getByTestId("botao-buscar-portaria"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("100/2026");
    });
  });

  it("desabilita input e botão quando isLoading é true", () => {
    renderModal({ isLoading: true });

    expect(screen.getByTestId("input-busca-portaria")).toBeDisabled();
    expect(screen.getByTestId("botao-buscar-portaria")).toBeDisabled();
  });

  it("exibe a mensagem de erro vinda do resultado da busca", () => {
    renderModal({ errorMessage: "Nenhum registro foi encontrado para essa portaria." });

    expect(
      screen.getByTestId("erro-busca-portaria")
    ).toHaveTextContent("Nenhum registro foi encontrado para essa portaria.");
  });

  it("limpa o campo ao reabrir o modal", () => {
    const { rerender } = render(
      <ModalBuscaPortaria
        open={true}
        onOpenChange={vi.fn()}
        title="Nova cessação"
        description="desc"
        fieldLabel="Portaria de designação"
        isLoading={false}
        errorMessage={null}
        onSubmit={onSubmit}
      />
    );

    rerender(
      <ModalBuscaPortaria
        open={false}
        onOpenChange={vi.fn()}
        title="Nova cessação"
        description="desc"
        fieldLabel="Portaria de designação"
        isLoading={false}
        errorMessage={null}
        onSubmit={onSubmit}
      />
    );

    rerender(
      <ModalBuscaPortaria
        open={true}
        onOpenChange={vi.fn()}
        title="Nova cessação"
        description="desc"
        fieldLabel="Portaria de designação"
        isLoading={false}
        errorMessage={null}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByTestId("input-busca-portaria")).toHaveValue("");
  });
});
