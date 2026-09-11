import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import VisualizarInsubsistenciaPage from "./page";
import { useFetchInsubsistenciasById } from "@/hooks/useVisualizarInsubsistencia";

const pushMock = vi.fn();
const useParamsMock = vi.fn();
const pageHeaderSpy = vi.fn();
const customAccordionSpy = vi.fn();
const resumoInsubsistenciaSpy = vi.fn();
const gerarHtmlPortariaSpy = vi.fn((value: string) => `HTML:${value}`);
const gerarDadosInsubsistenciaSpy = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => useParamsMock(),
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/hooks/useVisualizarInsubsistencia", () => ({
  useFetchInsubsistenciasById: vi.fn(),
}));

vi.mock("antd", () => ({
  Card: ({ title, children }: { title: ReactNode; children: ReactNode }) => (
    <section data-testid="card">
      <div>{title}</div>
      <div>{children}</div>
    </section>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children }: { children: ReactNode }) => (
    <div data-testid="accordion">{children}</div>
  ),
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  __esModule: true,
  default: (props: {
    title: string;
    breadcrumbs: Array<{ title: string; href?: string }>;
    createButton?: ReactNode;
  }) => {
    pageHeaderSpy(props);
    return (
      <header data-testid="page-header">
        <span>{props.title}</span>
        {props.createButton}
      </header>
    );
  },
}));

vi.mock("@/components/dashboard/Designacao/CustomAccordionItem", () => ({
  CustomAccordionItem: ({
    title,
    color,
    children,
  }: {
    title: string;
    color: string;
    children: ReactNode;
  }) => {
    customAccordionSpy({ title, color });
    return <article data-testid={`accordion-item-${title}`}>{children}</article>;
  },
}));

vi.mock(
  "@/components/dashboard/Designacao/ResumoPortariaEServidorIndicado",
  () => ({
    __esModule: true,
    default: () => <div data-testid="resumo-portaria-servidor-indicado" />,
  }),
);

vi.mock(
  "@/components/dashboard/Designacao/ResumoPortariaInsubsistencia",
  () => ({
    __esModule: true,
    default: (props: unknown) => {
      resumoInsubsistenciaSpy(props);
      return <div data-testid="resumo-portaria-insubsistencia" />;
    },
  }),
);

vi.mock("lucide-react", () => ({
  Loader2: ({ className }: { className?: string }) => (
    <div data-testid="loader" className={className} />
  ),
  History: () => <span data-testid="history-icon" />,
}));

vi.mock(
  "@/components/dashboard/EditorTextoSEI/EditorTextoSEI",
  () => ({
    __esModule: true,
    default: React.forwardRef(function EditorTextoSEIMock(
      props: { html: string; titulo: string; mostrarBotao: boolean },
      _ref,
    ) {
      return <div data-testid="editor-sei">{props.html}</div>;
    }),
    gerarHtmlPortaria: (texto: string) => gerarHtmlPortariaSpy(texto),
  }),
);

vi.mock("../../insubsistencia/page", () => ({
  gerarDadosInsubsistencia: (...args: unknown[]) =>
    gerarDadosInsubsistenciaSpy(...args),
}));

vi.mock("@/utils/portarias/templates", () => ({
  TEMPLATE_ANULAR_APOSTILA: "APOSTILA {{nome_indicado}} {{portaria_apostilada}}",
  TEMPLATE_INSUBSISTENCIA_CESSACAO:
    "CESSACAO {{nome_indicado}} {{portaria_apostilada}}",
  TEMPLATE_INSUBSISTENCIA_DESIGNACAO:
    "DESIGNACAO {{nome_indicado}} {{portaria_apostilada}}",
  TEMPLATE_TORNAR_SEM_EFEITO_INSUBSISTENCIA:
    "TORNAR_SEM_EFEITO {{nome_indicado}} {{portaria_apostilada}}",
}));

vi.mock("@/lib/utils", () => ({
  formatarData: (value: string) => `fmt:${value}`,
}));

describe("VisualizarInsubsistenciaPage", () => {
  const dataMock = {
    id: 12,
    tipo: "INSUBSISTENCIA",
    tipo_insubsistencia: "DESIGNACAO",
    numero_portaria: "100",
    ano_vigente: "2026",
    sei_numero: "SEI-100",
    doc: "2026-03-01",
    observacoes: "Observação",
    texto_apostila: "Texto apostila",
    designacao: {
      indicado_nome_servidor: "Servidor Teste",
      numero_portaria: "001",
      ano_vigente: "2025",
      sei_numero: "SEI-DES",
      doc: "2025-01-01",
    },
    cessacao: {
      numero_portaria: "050",
      ano_vigente: "2024",
      sei_numero: "SEI-CES",
      doc: "2024-01-01",
    },
    insubsistencia: {
      doc: "2026-02-01",
      sei_numero: "SEI-INSUB",
      doc_do_ato_insubstituido: "2026-02-02",
    },
    ato_apostilado: "DESIGNACAO",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useParamsMock.mockReturnValue({ id: "12" });
    gerarDadosInsubsistenciaSpy.mockReturnValue({
      nome_indicado: "Servidor Teste",
      portaria_apostilada: "valor-base",
    });
  });

  it("renderiza loading enquanto busca os dados", () => {
    vi.mocked(useFetchInsubsistenciasById).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as never);

    render(<VisualizarInsubsistenciaPage />);

    expect(useFetchInsubsistenciasById).toHaveBeenCalledWith(12);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });

  it("exibe mensagem de erro quando a consulta falha", () => {
    vi.mocked(useFetchInsubsistenciasById).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: "Erro ao carregar insubsistência" },
    } as never);

    render(<VisualizarInsubsistenciaPage />);

    expect(
      screen.getByText("Erro ao carregar insubsistência"),
    ).toBeInTheDocument();
  });

  it("renderiza conteúdo e navega para histórico ao clicar no botão", () => {
    vi.mocked(useFetchInsubsistenciasById).mockReturnValue({
      data: dataMock,
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarInsubsistenciaPage />);

    expect(screen.getByTestId("accordion")).toBeInTheDocument();
    expect(
      screen.getByTestId("resumo-portaria-servidor-indicado"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("resumo-portaria-insubsistencia")).toBeInTheDocument();
    expect(screen.getByTestId("editor-sei")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Consultar histórico"));

    expect(pushMock).toHaveBeenCalledWith(
      "/pages/historico-ato-administrativo?id=12&tipo=INSUBSISTENCIA&tipo_display=de insubsistência&numero_portaria=100&servidor_indicado=Servidor Teste",
    );
  });

  it("não renderiza accordion quando não há designação", () => {
    vi.mocked(useFetchInsubsistenciasById).mockReturnValue({
      data: { ...dataMock, designacao: null },
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarInsubsistenciaPage />);

    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
    expect(screen.getByTestId("editor-sei")).toBeInTheDocument();
  });

  it("usa template de cessação quando tipo_insubsistencia é CESSACAO", () => {
    vi.mocked(useFetchInsubsistenciasById).mockReturnValue({
      data: { ...dataMock, tipo_insubsistencia: "CESSACAO" },
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarInsubsistenciaPage />);

    const html = screen.getByTestId("editor-sei").textContent ?? "";
    expect(html).toContain("HTML:CESSACAO");
  });

  it("usa template de anulação da apostila e cor cinza", () => {
    vi.mocked(useFetchInsubsistenciasById).mockReturnValue({
      data: { ...dataMock, tipo_insubsistencia: "APOSTILA" },
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarInsubsistenciaPage />);

    expect(pageHeaderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Detalhes da anulação da apostila",
      }),
    );
    expect(customAccordionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Portaria da anulação da apostila",
        color: "gray",
      }),
    );
    expect(screen.getByTestId("editor-sei").textContent).toContain("HTML:APOSTILA");
  });

  it("usa template de tornar sem efeito e cor cinza", () => {
    vi.mocked(useFetchInsubsistenciasById).mockReturnValue({
      data: { ...dataMock, tipo_insubsistencia: "INSUBSISTENCIA" },
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarInsubsistenciaPage />);

    expect(pageHeaderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Detalhes do ato de tornar sem efeito",
      }),
    );
    expect(customAccordionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Portaria do ato de tornar sem efeito",
        color: "gray",
      }),
    );
    expect(screen.getByTestId("editor-sei").textContent).toContain(
      "HTML:TORNAR_SEM_EFEITO",
    );
  });

  it("usa dados de cessação para apostila quando ato_apostilado é CESSACAO", () => {
    vi.mocked(useFetchInsubsistenciasById).mockReturnValue({
      data: { ...dataMock, ato_apostilado: "CESSACAO" },
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarInsubsistenciaPage />);

    const html = screen.getByTestId("editor-sei").textContent ?? "";
    expect(html).toContain("<strong>Servidor Teste</strong>");
    expect(html).toContain("050");
  });
});
