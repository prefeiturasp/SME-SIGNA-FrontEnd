import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import AnularApostilaTornarSemEfeitoFormCard from "./AnularApostilaTornarSemEfeitoFormCard";

const triggerMock = vi.fn();
const onGerarPortariaMock = vi.fn();
const onSubmitMock = vi.fn();
const fieldsPropsMock = vi.fn();
const blocosPropsMock = vi.fn();
const editorPropsMock = vi.fn();

vi.mock("react-hook-form", async () => {
  const actual = await vi.importActual<any>("react-hook-form");
  return {
    ...actual,
    FormProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

vi.mock("antd", () => ({
  Card: ({ title, children }: { title: ReactNode; children: ReactNode }) => (
    <div>
      <div>{title}</div>
      {children}
    </div>
  ),
}));

vi.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children }: { children: ReactNode }) => <div data-testid="accordion">{children}</div>,
}));

vi.mock("@/components/dashboard/Designacao/CustomAccordionItem", () => ({
  CustomAccordionItem: ({ title, children }: { title: string; children: ReactNode }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

vi.mock("@/components/dashboard/Designacao/ResumoDesignacao/BlocosDesignacao", () => ({
  __esModule: true,
  default: (props: unknown) => {
    blocosPropsMock(props);
    return <div data-testid="blocos-designacao" />;
  },
}));

vi.mock("@/components/dashboard/apostila/PortariaApostilaFields/PortariaAnularApostilaFields", () => ({
  __esModule: true,
  default: (props: unknown) => {
    fieldsPropsMock(props);
    return <div data-testid="portaria-fields" />;
  },
}));

vi.mock("@/components/dashboard/EditorTextoSEI/EditorTextoSEI", () => ({
  __esModule: true,
  default: (props: unknown) => {
    editorPropsMock(props);
    return <div data-testid="editor-sei" />;
  },
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

const createFormMock = () =>
  ({
    handleSubmit: (fn: (values: unknown) => unknown) => (event?: Event) => {
      event?.preventDefault?.();
      return fn({ any: "value" });
    },
    trigger: (...args: unknown[]) => triggerMock(...args),
  }) as any;

describe("AnularApostilaTornarSemEfeitoFormCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    triggerMock.mockResolvedValue(true);
  });

  it("renderiza dados base, chama trigger e gera texto quando válido", async () => {
    const form = createFormMock();

    render(
      <AnularApostilaTornarSemEfeitoFormCard
        form={form}
        onSubmit={onSubmitMock}
        tipoPortaria="designacao"
        dadosIndicado={{} as any}
        dadosPortaria={{} as any}
        dadosPortariaCessacao={{} as any}
        triggerField={"apostila_insubsistencia" as any}
        onGerarPortaria={onGerarPortariaMock}
        mostrarEditor={false}
        htmlPortaria="<p>html</p>"
        tituloForm="Dados da portaria de anulação"
      />
    );

    expect(screen.getByText("Designação")).toBeInTheDocument();
    expect(screen.getByText("Dados da portaria de anulação")).toBeInTheDocument();
    expect(blocosPropsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        showCategoria: false,
        showExtraFields: true,
        showLotacao: true,
        showCessacaoExtraFields: true,
      })
    );

    fireEvent.click(screen.getByText("Gerar texto SEI"));
    await waitFor(() => expect(triggerMock).toHaveBeenCalledWith("apostila_insubsistencia"));
    expect(onGerarPortariaMock).toHaveBeenCalledTimes(1);

    const formElement = document.querySelector("form");
    expect(formElement).not.toBeNull();
    if (!formElement) return;
    fireEvent.submit(formElement);
    expect(onSubmitMock).toHaveBeenCalledWith({ any: "value" });
  });

  it("não chama geração de texto quando trigger retorna inválido", async () => {
    triggerMock.mockResolvedValue(false);

    render(
      <AnularApostilaTornarSemEfeitoFormCard
        form={createFormMock()}
        onSubmit={onSubmitMock}
        tipoPortaria="cessacao"
        dadosIndicado={{} as any}
        dadosPortaria={{} as any}
        dadosPortariaCessacao={null}
        triggerField={"apostila_insubsistencia" as any}
        onGerarPortaria={onGerarPortariaMock}
        mostrarEditor={false}
        htmlPortaria="<p>html</p>"
        showTextoParaApostila={false}
        tituloForm="Form cessação"
      />
    );

    expect(screen.getByText("Cessação")).toBeInTheDocument();
    expect(fieldsPropsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo_portaria: "cessacao",
        showTextoParaApostila: false,
      })
    );

    fireEvent.click(screen.getByText("Gerar texto SEI"));
    await waitFor(() => expect(triggerMock).toHaveBeenCalled());
    expect(onGerarPortariaMock).not.toHaveBeenCalled();
    expect(screen.queryByTestId("editor-sei")).not.toBeInTheDocument();
  });

  it("renderiza editor quando mostrarEditor for true", () => {
    render(
      <AnularApostilaTornarSemEfeitoFormCard
        form={createFormMock()}
        onSubmit={onSubmitMock}
        tipoPortaria="designacao"
        dadosIndicado={{} as any}
        dadosPortaria={{} as any}
        dadosPortariaCessacao={{} as any}
        triggerField={"apostila_insubsistencia" as any}
        onGerarPortaria={onGerarPortariaMock}
        mostrarEditor
        htmlPortaria="<p>texto gerado</p>"
        tituloForm="Form"
      />
    );

    expect(screen.getByTestId("editor-sei")).toBeInTheDocument();
    expect(editorPropsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        html: "<p>texto gerado</p>",
        titulo: "TEXTO",
        labelBotao: "Salvar",
        tipoBotao: "submit",
        testId: "botao-proximo",
      })
    );
  });
});
