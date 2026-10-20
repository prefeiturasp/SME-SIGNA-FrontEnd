import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type AtosRelacionados from "@/app/pages/historico-ato-administrativo/components/AtosRelacionados";
import ListagemDeDesignacaoDaUnidade from "./ListagemDeDesignacaoDaUnidade";

const atosRelacionadosMock = vi.fn();

vi.mock("@/app/pages/historico-ato-administrativo/components/AtosRelacionados", () => ({
  default: (props: ComponentProps<typeof AtosRelacionados>) => {
    atosRelacionadosMock(props);
    return <div data-testid="atos-relacionados" />;
  },
}));

vi.mock("../ListagemDeAtosAdministrativos/ListagemDeAtosAdministrativos", () => ({
  SimpleTag: ({ titulo, valor }: { titulo: string; valor: string }) => (
    <span>{titulo}: {valor}</span>
  ),
}));

describe("ListagemDeDesignacaoDaUnidade", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exibe título, subtítulo e identificação da unidade informados", () => {
    render(<ListagemDeDesignacaoDaUnidade data={[]} titulo="Histórico da unidade" subtitulo="Atos administrativos da unidade" ue="EMEF Machado de Assis" />);

    expect(screen.getByText("Histórico da unidade")).toBeInTheDocument();
    expect(screen.getByText("Atos administrativos da unidade")).toBeInTheDocument();
    expect(screen.getByText("Unidade Educacional: EMEF Machado de Assis")).toBeInTheDocument();
  });

  it.each([undefined, ""])("omite identificação quando a unidade é %s", (ue) => {
    render(<ListagemDeDesignacaoDaUnidade data={[]} ue={ue} />);
    expect(screen.queryByText(/Unidade Educacional/)).not.toBeInTheDocument();
    expect(screen.getByTestId("atos-relacionados")).toBeInTheDocument();
  });

  it("encaminha os atos fixos atuais com edição e carregamento desativados por padrão", () => {
    render(<ListagemDeDesignacaoDaUnidade data={[]} />);

    expect(atosRelacionadosMock).toHaveBeenCalledWith({
      atos: [
        { id: 1, data: "03/04/2026", portaria: "7625148/2026", titulo: "Apostila", descricao: "Alteração de período informado na portaria.", principal: true },
        { id: 2, data: "03/04/2026", portaria: "7625148/2026", titulo: "Apostila", descricao: "Alteração de período informado na portaria.", principal: false },
      ],
      isEditing: false,
      isLoading: false,
    });
  });

  it("propaga as mudanças de carregamento para os atos relacionados", () => {
    const { rerender } = render(<ListagemDeDesignacaoDaUnidade data={[]} isLoading />);
    expect(atosRelacionadosMock).toHaveBeenLastCalledWith(expect.objectContaining({ isLoading: true }));

    rerender(<ListagemDeDesignacaoDaUnidade data={[]} isLoading={false} />);
    expect(atosRelacionadosMock).toHaveBeenLastCalledWith(expect.objectContaining({ isLoading: false }));
  });
});
