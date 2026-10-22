import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type AtosRelacionados from "./AtosRelacionados";
import type { IAtosAdministrativosPrincipalType } from "./AtosRelacionados";
import DesignacaoCard, { TagStatusDesignacao } from "./DesignacaoCard";

const atosRelacionadosMock = vi.fn();

vi.mock("./AtosRelacionados", () => ({
  default: (props: ComponentProps<typeof AtosRelacionados>) => {
    atosRelacionadosMock(props);
    return <div data-testid="atos-relacionados" />;
  },
}));

const atoBase: IAtosAdministrativosPrincipalType = {
  id: 1,
  tipo_ato_display: "Designação",
  realizada_em: "15/02/2026",
  data_cessacao: null,
  status: "EM_VIGENCIA",
  numero_portaria: "1234567/2026",
  cargo_display: "DIRETOR DE ESCOLA",
  nome_servidor_indicado: "TATIANE CRISTINA MARQUES",
  nome_social_servidor_indicado: "",
  atos_relacionados: [
    {
      id: 10,
      data: "03/04/2026",
      portaria: "7625148/2026",
      titulo: "Apostila",
      descricao: "Alteração de período informado na portaria.",
      principal: true,
      esta_vigente: true,
    },
  ],
};

describe("TagStatusDesignacao", () => {
  it("exibe 'Em vigência' com o fundo verde quando o ato está vigente", () => {
    render(<TagStatusDesignacao status="EM_VIGENCIA" />);

    const tag = screen.getByText("Em vigência");

    expect(tag).toHaveClass("designacao-status-tag");
    expect(tag).toHaveStyle({ backgroundColor: "rgba(0, 136, 9, 0.1)" });
    expect(tag.querySelector(".ant-badge")).toBeInTheDocument();
  });

  it("exibe 'Cessada' sem data quando o ato foi cessado sem data informada", () => {
    render(<TagStatusDesignacao status="CESSADA" />);

    const tag = screen.getByText("Cessada");

    expect(tag).toHaveClass("designacao-status-tag");
    expect(tag).toHaveStyle({ backgroundColor: "rgba(178, 43, 42, 0.1)" });
  });

  it("exibe 'Cessada em' com a data de cessação quando informada", () => {
    render(<TagStatusDesignacao status="CESSADA" dataCessacao="03/04/2026" />);

    expect(screen.getByText("Cessada em 03/04/2026")).toBeInTheDocument();
  });

  it("ignora a data de cessação quando o ato está vigente", () => {
    render(<TagStatusDesignacao status="EM_VIGENCIA" dataCessacao="03/04/2026" />);

    expect(screen.getByText("Em vigência")).toBeInTheDocument();
    expect(screen.queryByText(/Cessada/)).not.toBeInTheDocument();
  });
});

describe("DesignacaoCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza o título e a data de realização do ato", () => {
    render(<DesignacaoCard ato={atoBase} isLoading={false} />);

    expect(screen.getByText("Designação")).toBeInTheDocument();
    expect(screen.getByText("Realizada em 15/02/2026")).toBeInTheDocument();
  });

  it("renderiza os detalhes da designação", () => {
    render(<DesignacaoCard ato={atoBase} isLoading={false} />);

    ["Nº de portaria", "Cargo", "Servidor indicado", "1234567/2026", "DIRETOR DE ESCOLA", "TATIANE CRISTINA MARQUES"].forEach(
      (texto) => {
        expect(screen.getByText(texto)).toBeInTheDocument();
      },
    );
  });

  it("usa a classe do card de designação no Card do antd", () => {
    render(<DesignacaoCard ato={atoBase} isLoading={false} />);

    expect(document.querySelector(".ant-card.designacao-card")).toBeInTheDocument();
  });

  it("repassa o status do ato para a tag de status", () => {
    render(<DesignacaoCard ato={{ ...atoBase, status: "CESSADA", data_cessacao: "03/04/2026" }} isLoading={false} />);

    expect(screen.getByText("Cessada em 03/04/2026")).toBeInTheDocument();
    expect(screen.queryByText("Em vigência")).not.toBeInTheDocument();
  });

  it("encaminha os atos relacionados do ato principal para a listagem", () => {
    render(<DesignacaoCard ato={atoBase} isLoading={false} />);

    expect(atosRelacionadosMock).toHaveBeenCalledWith({
      atos: atoBase.atos_relacionados,
      isLoading: false,
    });
  });

  it("propaga o estado de carregamento para os atos relacionados", () => {
    const { rerender } = render(<DesignacaoCard ato={atoBase} isLoading />);

    expect(atosRelacionadosMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ isLoading: true }),
    );

    rerender(<DesignacaoCard ato={atoBase} isLoading={false} />);

    expect(atosRelacionadosMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ isLoading: false }),
    );
  });
});
