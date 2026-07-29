import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import type { ReactNode } from "react";

import ModalBuscaPortaria from "./ModalBuscaPortaria";

const onSubmit = vi.fn();

vi.mock("@/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    disabled,
    children,
  }: {
    value?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
    children: ReactNode;
  }) => (
    <select
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => onValueChange?.(e.target.value)}
    >
      <option value="" disabled>
        Selecione
      </option>
      {children}
    </select>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: ReactNode }) => <>{children}</>,
  SelectItem: ({ children, value }: { children: ReactNode; value: string }) => (
    <option value={value}>{children}</option>
  ),
}));

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
        description="Digite o número e selecione o ano da portaria de designação que deseja cessar."
        fieldLabel="Portaria de designação"
        anoFieldLabel="Ano da designação"
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

  it("renderiza título, descrição e labels dos campos quando open é true", () => {
    renderModal();

    expect(screen.getByRole("heading", { name: /nova cessação/i })).toBeInTheDocument();
    expect(
      screen.getByText(/digite o número e selecione o ano da portaria de designação que deseja cessar/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Portaria de designação")).toBeInTheDocument();
    expect(screen.getByText("Ano da designação")).toBeInTheDocument();
  });

  it("não renderiza quando open é false", () => {
    renderModal({ open: false });

    expect(screen.queryByRole("heading", { name: /nova cessação/i })).not.toBeInTheDocument();
  });

  it("exibe mensagens de validação ao buscar com os campos vazios", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByTestId("botao-buscar-portaria"));

    expect(await screen.findByText("Digite um número válido.")).toBeInTheDocument();
    expect(await screen.findByText("Selecione o ano.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("chama onSubmit com o número da portaria e o ano informados", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByTestId("input-busca-portaria"), "100");
    await user.selectOptions(screen.getByRole("combobox"), "2026");
    await user.click(screen.getByTestId("botao-buscar-portaria"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("100", "2026");
    });
  });

  it("desabilita input, select e botões quando isLoading é true", () => {
    renderModal({ isLoading: true });

    expect(screen.getByTestId("input-busca-portaria")).toBeDisabled();
    expect(screen.getByRole("combobox")).toBeDisabled();
    expect(screen.getByTestId("botao-buscar-portaria")).toBeDisabled();
    expect(screen.getByTestId("botao-cancelar-busca-portaria")).toBeDisabled();
  });

  it("exibe a mensagem de erro vinda do resultado da busca", () => {
    renderModal({ errorMessage: "Nenhum registro foi encontrado para essa portaria e ano." });

    expect(
      screen.getByTestId("erro-busca-portaria")
    ).toHaveTextContent("Nenhum registro foi encontrado para essa portaria e ano.");
  });

  it("chama onOpenChange(false) ao clicar em Cancelar", async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderModal();

    await user.click(screen.getByTestId("botao-cancelar-busca-portaria"));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("limpa os campos ao reabrir o modal", () => {
    const { rerender } = render(
      <ModalBuscaPortaria
        open={true}
        onOpenChange={vi.fn()}
        title="Nova cessação"
        description="desc"
        fieldLabel="Portaria de designação"
        anoFieldLabel="Ano da designação"
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
        anoFieldLabel="Ano da designação"
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
        anoFieldLabel="Ano da designação"
        isLoading={false}
        errorMessage={null}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByTestId("input-busca-portaria")).toHaveValue("");
    expect(screen.getByRole("combobox")).toHaveValue("");
  });
});
