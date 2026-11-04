import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FiltroAcoes from "./FiltroAcoes";

describe("FiltroAcoes", () => {
  it("desabilita limpar e pesquisar quando não há filtros", () => {
    render(<FiltroAcoes hasFilters={false} />);

    expect(screen.getByTestId("btn-limpar-filtros")).toBeDisabled();
    expect(screen.getByTestId("btn-pesquisar")).toBeDisabled();
  });

  it("habilita as duas ações e limpa os filtros quando há filtros preenchidos", () => {
    const onClear = vi.fn();
    render(<FiltroAcoes hasFilters onClear={onClear} />);

    expect(screen.getByTestId("btn-limpar-filtros")).toBeEnabled();
    expect(screen.getByTestId("btn-pesquisar")).toBeEnabled();

    fireEvent.click(screen.getByTestId("btn-limpar-filtros"));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("mantém a pesquisa habilitada sem filtros quando a busca sem filtros é permitida", () => {
    render(<FiltroAcoes hasFilters={false} allowSearchWithoutFilters />);

    expect(screen.getByTestId("btn-limpar-filtros")).toBeDisabled();
    expect(screen.getByTestId("btn-pesquisar")).toBeEnabled();
  });
});
