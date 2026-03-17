import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import ListagemDesignacoesPage from "./page";

const mockListagemDeDesignacoes = vi.fn();

vi.mock(
  "@/components/dashboard/Designacao/ListagemDeDesignacoes/ListagemDeDesignacoes",
  () => ({
    __esModule: true,
    default: () => {
      mockListagemDeDesignacoes();
      return <div data-testid="listagem-de-designacoes" />;
    },
  })
);

describe("ListagemDesignacoesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza o componente de listagem de designações", () => {
    render(<ListagemDesignacoesPage />);

    expect(screen.getByTestId("listagem-de-designacoes")).toBeInTheDocument();
    expect(mockListagemDeDesignacoes).toHaveBeenCalledTimes(1);
  });
});
