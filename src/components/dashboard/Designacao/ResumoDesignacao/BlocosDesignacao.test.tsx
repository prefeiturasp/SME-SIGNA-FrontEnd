import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BlocosDesignacao from "./BlocosDesignacao";

const resumoServidorPropsMock = vi.fn();
const resumoPortariaPropsMock = vi.fn();
const resumoCessacaoPropsMock = vi.fn();

vi.mock("@/components/dashboard/Designacao/CustomAccordionItem", () => ({
  CustomAccordionItem: ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <section data-testid={`accordion-${title}`}>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

vi.mock("@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado", () => ({
  __esModule: true,
  default: (props: any) => {
    resumoServidorPropsMock(props);
    return (
      <button onClick={() => props.onSubmitEditarServidor({ atualizado: true })}>
        Resumo servidor
      </button>
    );
  },
}));

vi.mock("@/components/dashboard/Designacao/ResumoPortariaDesigacao", () => ({
  __esModule: true,
  default: (props: any) => {
    resumoPortariaPropsMock(props);
    return <div>Resumo portaria designacao</div>;
  },
}));

vi.mock("@/components/dashboard/Designacao/ResumoPortariaCessacao", () => ({
  __esModule: true,
  default: (props: any) => {
    resumoCessacaoPropsMock(props);
    return <div>Resumo portaria cessacao</div>;
  },
}));

const baseProps = {
  dadosIndicado: { nome_servidor: "Servidor" } as any,
  dadosPortaria: { numero_portaria: "100" },
  dadosPortariaCessacao: { numero_portaria: "200" },
};

describe("BlocosDesignacao", () => {
  it("renderiza os três blocos com componentes internos quando há dados", () => {
    render(<BlocosDesignacao {...baseProps} />);

    expect(screen.getByText("Dados do servidor indicado")).toBeInTheDocument();
    expect(screen.getByText("Portaria de designação")).toBeInTheDocument();
    expect(screen.getByText("Portarias de Cessação")).toBeInTheDocument();
    expect(screen.getByText("Resumo servidor")).toBeInTheDocument();
    expect(screen.getByText("Resumo portaria designacao")).toBeInTheDocument();
    expect(screen.getByText("Resumo portaria cessacao")).toBeInTheDocument();

    expect(resumoServidorPropsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: baseProps.dadosIndicado,
        showCursosTitulos: false,
        showLotacao: false,
        showCategoria: true,
      })
    );
    expect(resumoPortariaPropsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: baseProps.dadosPortaria,
        showExtraFields: false,
      })
    );
    expect(resumoCessacaoPropsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: baseProps.dadosPortariaCessacao,
      })
    );
  });

  it("não renderiza resumo quando dados indicados/portaria estão ausentes", () => {
    render(
      <BlocosDesignacao
        {...baseProps}
        dadosIndicado={null}
        dadosPortaria={null}
        dadosPortariaCessacao={null}
      />
    );

    expect(screen.queryByText("Resumo servidor")).not.toBeInTheDocument();
    expect(screen.queryByText("Resumo portaria designacao")).not.toBeInTheDocument();
    expect(screen.getByText("Não há portaria de cessão")).toBeInTheDocument();
  });

  it("não renderiza bloco de cessação quando showCessacao é false", () => {
    render(<BlocosDesignacao {...baseProps} showCessacao={false} />);

    expect(screen.queryByText("Portarias de Cessação")).not.toBeInTheDocument();
    expect(screen.queryByText("Resumo portaria cessacao")).not.toBeInTheDocument();
  });

  it("repassa callback de edição quando informado", () => {
    const onSubmitEditarServidor = vi.fn();
    render(<BlocosDesignacao {...baseProps} onSubmitEditarServidor={onSubmitEditarServidor} />);

    fireEvent.click(screen.getByText("Resumo servidor"));
    expect(onSubmitEditarServidor).toHaveBeenCalledWith({ atualizado: true });
  });
});
