import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import DesignacoesPasso2Page from "./page";

const h = vi.hoisted(() => ({
  formDesignacaoData: null as any,
  resumoCalls: [] as any[],
  botoesCalls: [] as any[],
}));

vi.mock("../DesignacaoContext", () => ({
  __esModule: true,
  useDesignacaoContext: () => ({
    formDesignacaoData: h.formDesignacaoData,
  }),
}));

vi.mock("@/assets/icons/Designacao", () => ({
  __esModule: true,
  default: () => <svg data-testid="designacao-icon" />,
}));

vi.mock("@/assets/icons/Historico", () => ({
  __esModule: true,
  default: () => <svg data-testid="historico-icon" />,
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => (
    <div data-testid="page-header">{title}</div>
  ),
}));

vi.mock("@/components/dashboard/Designacao/StepperDesignacao", () => ({
  __esModule: true,
  default: ({ current }: { current: number }) => (
    <div data-testid="stepper-designacao">current:{current}</div>
  ),
}));

vi.mock("@/components/dashboard/FundoBranco/QuadroBranco", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="fundo-branco">{children}</div>
  ),
}));

vi.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="accordion">{children}</div>
  ),
  AccordionItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AccordionTrigger: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
  AccordionContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("antd", () => ({
  Card: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title?: React.ReactNode;
  }) => (
    <div data-testid="card">
      <div data-testid="card-title">{title}</div>
      {children}
    </div>
  ),
}));

vi.mock("@/components/dashboard/Designacao/ResumoDesignacao", () => ({
  __esModule: true,
  default: (props: any) => {
    h.resumoCalls.push(props);
    return (
      <div data-testid="resumo-designacao">
        Resumo
        <button
          type="button"
          data-testid="resumo-editar"
          onClick={() => props.onClickEditar?.()}
        >
          Editar
        </button>
      </div>
    );
  },
}));

vi.mock("@/components/dashboard/Designacao/BotoesDeNavegacao", () => ({
  __esModule: true,
  default: (props: any) => {
    h.botoesCalls.push(props);
    return (
      <div>
        <button
          type="button"
          data-testid="btn-anterior"
          disabled={props.disableAnterior}
          onClick={props.onAnterior}
        >
          Anterior
        </button>
        {/* botão auxiliar: permite cobrir o callback mesmo quando o botão real está desabilitado */}
        <button
          type="button"
          data-testid="btn-anterior-force"
          onClick={props.onAnterior}
        >
          Anterior (force)
        </button>
        <button
          type="button"
          data-testid="btn-proximo"
          disabled={props.disableProximo}
          onClick={props.onProximo}
        >
          Próximo
        </button>
      </div>
    );
  },
}));

vi.mock(
  "@/components/dashboard/Designacao/PortariaDesigacaoFields/PortariaDesigacaoFields",
  async () => {
    const React = await import("react");
    const { useFormContext } = await import("react-hook-form");

    return {
      __esModule: true,
      default: ({ setDisableProximo }: { setDisableProximo: (v: boolean) => void }) => {
        const { setValue } = useFormContext();

        return (
          <div data-testid="portaria-fields">
            <button
              type="button"
              data-testid="fill-valid-form"
              onClick={() => {
                setDisableProximo(false);
                setValue("portaria_designacao", "P-1");
                setValue("numero_sei", "SEI-1");
                setValue("a_partir_de", new Date("2024-01-01T00:00:00.000Z"));
                setValue("designacao_data_final", new Date("2024-12-31T00:00:00.000Z"));
                setValue("ano", "2024");
                setValue("doc", "DOC-1");
                setValue("motivo_cancelamento", "Motivo");
                setValue("impedimento_substituicao", "1");
              }}
            >
              Preencher
            </button>
          </div>
        );
      },
    };
  }
);

describe("Designações - Passo 2 page", () => {
  beforeEach(() => {
    h.formDesignacaoData = null;
    h.resumoCalls.length = 0;
    h.botoesCalls.length = 0;
    vi.clearAllMocks();
  });

  it("não renderiza os accordions quando não há servidorIndicado no contexto", () => {
    render(<DesignacoesPasso2Page />);

    expect(screen.getByTestId("page-header")).toHaveTextContent("Designação");
    expect(screen.getByTestId("stepper-designacao")).toHaveTextContent("current:1");
    expect(screen.queryByTestId("resumo-designacao")).not.toBeInTheDocument();
    expect(screen.queryByTestId("portaria-fields")).not.toBeInTheDocument();

    expect(screen.getByTestId("btn-proximo")).toBeDisabled();
  });
 
});


