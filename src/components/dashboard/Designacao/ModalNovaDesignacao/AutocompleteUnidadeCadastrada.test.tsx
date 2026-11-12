import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import AutocompleteUnidadeCadastrada from "./AutocompleteUnidadeCadastrada";
import type { UnidadeCadastrada } from "@/types/designacao-unidade";

const hookMock = vi.hoisted(() => ({
  result: {
    data: [] as UnidadeCadastrada[],
    isLoading: false,
    isError: false,
  },
}));

vi.mock("@/hooks/useUnidadesCadastradas", () => ({
  useUnidadesCadastradas: () => hookMock.result,
}));

const ALIPIO: UnidadeCadastrada = {
  dre: "108800",
  dre_nome: "DRE BUTANTA",
  ue: "019453",
  ue_nome: "EMEF - Alípio Correa Neto, Prof.",
};
const BENEDITO: UnidadeCadastrada = {
  dre: "108100",
  dre_nome: "DRE PENHA",
  ue: "000191",
  ue_nome: "EMEI - Benedito Calixto",
};

const onChange = vi.fn();

const renderAutocomplete = (value: UnidadeCadastrada | null = null) =>
  render(<AutocompleteUnidadeCadastrada value={value} onChange={onChange} />);

describe("AutocompleteUnidadeCadastrada", () => {
  beforeAll(() => {
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = () => {};
    }
    if (!globalThis.ResizeObserver) {
      globalThis.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
    hookMock.result = { data: [ALIPIO, BENEDITO], isLoading: false, isError: false };
  });

  it("renderiza o campo com label", () => {
    renderAutocomplete();

    expect(screen.getByLabelText("Unidade Proponente")).toBeInTheDocument();
  });

  it("não mostra a lista enquanto nada é digitado", async () => {
    renderAutocomplete();

    await userEvent.click(screen.getByTestId("input-busca-unidade-cadastrada"));

    expect(screen.queryByTestId("opcao-unidade-019453")).not.toBeInTheDocument();
  });

  it("filtra ignorando acentos e maiúsculas e destaca o trecho buscado", async () => {
    renderAutocomplete();

    await userEvent.type(screen.getByTestId("input-busca-unidade-cadastrada"), "alipio corr");

    const opcao = screen.getByTestId("opcao-unidade-019453");
    expect(opcao).toHaveTextContent("EMEF - Alípio Correa Neto, Prof.");
    expect(opcao.querySelector("strong")).toHaveTextContent("Alípio Corr");
    expect(screen.queryByTestId("opcao-unidade-000191")).not.toBeInTheDocument();
  });

  it("chama onChange com a unidade ao selecionar e fecha a lista", async () => {
    const { rerender } = renderAutocomplete();

    await userEvent.type(screen.getByTestId("input-busca-unidade-cadastrada"), "alipio");
    await userEvent.click(screen.getByTestId("opcao-unidade-019453"));

    expect(onChange).toHaveBeenCalledWith(ALIPIO);
    rerender(<AutocompleteUnidadeCadastrada value={ALIPIO} onChange={onChange} />);
    expect(screen.getByTestId("input-busca-unidade-cadastrada")).toHaveValue(ALIPIO.ue_nome);
    expect(screen.queryByTestId("opcao-unidade-019453")).not.toBeInTheDocument();
  });

  it("limpa a seleção ao editar o texto depois de escolher", async () => {
    renderAutocomplete(ALIPIO);

    await userEvent.type(screen.getByTestId("input-busca-unidade-cadastrada"), "x");

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("mostra mensagem quando nenhuma unidade corresponde", async () => {
    renderAutocomplete();

    await userEvent.type(screen.getByTestId("input-busca-unidade-cadastrada"), "zzz");

    expect(screen.getByText("Nenhuma unidade encontrada.")).toBeInTheDocument();
  });

  it("mostra carregamento enquanto a lista é buscada", async () => {
    hookMock.result = { data: [], isLoading: true, isError: false };
    renderAutocomplete();

    await userEvent.type(screen.getByTestId("input-busca-unidade-cadastrada"), "a");

    expect(screen.getByText("Carregando unidades...")).toBeInTheDocument();
  });

  it("mostra mensagem de erro quando a busca falha", async () => {
    hookMock.result = { data: [], isLoading: false, isError: true };
    renderAutocomplete();

    await userEvent.type(screen.getByTestId("input-busca-unidade-cadastrada"), "a");

    expect(screen.getByText("Não foi possível carregar as unidades.")).toBeInTheDocument();
  });

  it("fecha a lista ao sair do campo", async () => {
    renderAutocomplete();

    await userEvent.type(screen.getByTestId("input-busca-unidade-cadastrada"), "alipio");
    await userEvent.tab();

    expect(screen.queryByTestId("opcao-unidade-019453")).not.toBeInTheDocument();
  });
});
