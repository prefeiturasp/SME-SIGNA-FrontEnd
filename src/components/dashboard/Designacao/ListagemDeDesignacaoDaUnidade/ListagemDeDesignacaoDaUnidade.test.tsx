import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type AtosRelacionados from "@/app/pages/historico-ato-administrativo/components/AtosRelacionados";
import type { IAtosAdministrativosPrincipalType } from "@/app/pages/historico-ato-administrativo/components/AtosRelacionados";
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

const dados: IAtosAdministrativosPrincipalType[] = [
  {
    id: 1,
    tipo_ato_display: "Designação",
    realizada_em: "03/04/2026",
    data_cessacao: null,
    status: "EM_VIGENCIA",
    numero_portaria: "7625148/2026",
    cargo_display: "Professor",
    nome_servidor_indicado: "João da Silva",
    nome_social_servidor_indicado: "",
    atos_relacionados: [
      {
        id: 1,
        data: "03/04/2026",
        portaria: "7625148/2026",
        titulo: "Apostila",
        descricao: "Alteração de período informado na portaria.",
        principal: true,
        esta_vigente: true,
      },
      {
        id: 2,
        data: "03/04/2026",
        portaria: "7625148/2026",
        titulo: "Apostila",
        descricao: "Alteração de período informado na portaria.",
        principal: false,
        esta_vigente: false,
      },
    ],
  },
  {
    id: 2,
    tipo_ato_display: "Designação",
    realizada_em: "03/04/2026",
    data_cessacao: "03/04/2026",
    status: "CESSADA",
    numero_portaria: "7625148/2026",
    cargo_display: "Professor",
    nome_servidor_indicado: "João da Silva",
    nome_social_servidor_indicado: "",
    atos_relacionados: [
      {
        id: 5,
        data: "03/04/2026",
        portaria: "7625148/2026",
        titulo: "Apostila",
        descricao: "Alteração de período informado na portaria.",
        principal: true,
        esta_vigente: true,
      },
      {
        id: 6,
        data: "03/04/2026",
        portaria: "7625148/2026",
        titulo: "Apostila",
        descricao: "Alteração de período informado na portaria.",
        principal: false,
        esta_vigente: false,
      },
    ],
  },
];

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
    render(<ListagemDeDesignacaoDaUnidade data={dados} ue={ue} />);

    expect(screen.queryByText(/Unidade Educacional/)).not.toBeInTheDocument();
    expect(screen.getAllByTestId("atos-relacionados")).toHaveLength(2);
  });

  it("renderiza um card de designação para cada item recebido", () => {
    render(<ListagemDeDesignacaoDaUnidade data={dados} />);

    expect(screen.getAllByText("Designação")).toHaveLength(2);
    expect(document.querySelectorAll(".ant-card.designacao-card")).toHaveLength(2);
  });

  it("exibe estado vazio quando não há designações e não está carregando", () => {
    render(<ListagemDeDesignacaoDaUnidade data={[]} />);

    expect(screen.getByText("Não há dados.")).toBeInTheDocument();
  });

  it("exibe estado de carregamento enquanto busca as designações", () => {
    render(<ListagemDeDesignacaoDaUnidade data={[]} isLoading />);

    expect(screen.getByText("Carregando designações…")).toBeInTheDocument();
  });

  it("encaminha os atos relacionados de cada ato principal, sem carregamento por padrão", () => {
    render(<ListagemDeDesignacaoDaUnidade data={dados} />);

    expect(atosRelacionadosMock).toHaveBeenCalledTimes(2);

    expect(atosRelacionadosMock).toHaveBeenNthCalledWith(1, {
      atos: dados[0].atos_relacionados,
      isLoading: false,
    });

    expect(atosRelacionadosMock).toHaveBeenNthCalledWith(2, expect.objectContaining({
      atos: expect.arrayContaining([
        expect.objectContaining({ id: 5, principal: true, esta_vigente: true }),
        expect.objectContaining({ id: 6, principal: false, esta_vigente: false }),
      ]),
      isLoading: false,
    }));
  });

  it("exibe a tag de status conforme a vigência de cada ato principal", () => {
    render(<ListagemDeDesignacaoDaUnidade data={dados} />);

    expect(screen.getByText("Em vigência")).toBeInTheDocument();
    expect(screen.getByText("Cessada em 03/04/2026")).toBeInTheDocument();
  });

  it("propaga as mudanças de carregamento para os atos relacionados", () => {
    const { rerender } = render(<ListagemDeDesignacaoDaUnidade data={dados} isLoading />);

    expect(atosRelacionadosMock).toHaveBeenCalledWith(
      expect.objectContaining({ isLoading: true }),
    );

    vi.clearAllMocks();
    rerender(<ListagemDeDesignacaoDaUnidade data={dados} isLoading={false} />);

    expect(atosRelacionadosMock).toHaveBeenCalledWith(
      expect.objectContaining({ isLoading: false }),
    );
  });
});
