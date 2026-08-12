import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ListagemDesignacoesRedirect from "./page";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("@/components/ui/FullPageLoader", () => ({
  default: () => <div data-testid="full-page-loader" />,
}));

describe("Página antiga de listagem de designações", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redireciona automaticamente para a nova tela de Atos Administrativos", () => {
    render(<ListagemDesignacoesRedirect />);

    expect(replaceMock).toHaveBeenCalledWith("/pages/atos-administrativos");
    expect(replaceMock).toHaveBeenCalledTimes(1);
  });

  it("exibe um loader em tela cheia enquanto redireciona", () => {
    render(<ListagemDesignacoesRedirect />);

    expect(screen.getByTestId("full-page-loader")).toBeInTheDocument();
  });
});
