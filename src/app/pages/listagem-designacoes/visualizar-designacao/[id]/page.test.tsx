import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VisualizarDesignacao from "./page";
import { useFetchDesignacoesById } from "@/hooks/useVisualizarDesignacoes";

const pageHeaderSpy = vi.fn();
const resumoPesquisaSpy = vi.fn();
const resumoPortariaSpy = vi.fn();
const resumoServidorSpy = vi.fn();
const customAccordionItemSpy = vi.fn();
const accordionSpy = vi.fn();
const infoItemSpy = vi.fn();
const editorSEISpy = vi.fn();
const gerarHtmlPortariaSpy = vi.fn((html: string) => html);
const informacoesAdicionaisSpy = vi.fn();

const useParamsMock = vi.fn();
const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => useParamsMock(),
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/hooks/useVisualizarDesignacoes", () => ({
  useFetchDesignacoesById: vi.fn(),
}));

vi.mock("antd", () => ({
  Card: ({ title, children }: { title: ReactNode; children: ReactNode }) => (
    <section data-testid="card">
      <div>{title}</div>
      <div>{children}</div>
    </section>
  ),
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  __esModule: true,
  default: (props: {
    title: string;
    breadcrumbs: Array<{ title: string; href?: string }>;
    showBackButton: boolean;
    createButton?: ReactNode;
    icon?: ReactNode;
  }) => {
    pageHeaderSpy(props);
    return (
      <header data-testid="page-header">
        {props.title}
        {props.createButton}
      </header>
    );
  },
}));

vi.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children, ...props }: { children: ReactNode }) => {
    accordionSpy(props);
    return <div data-testid="accordion">{children}</div>;
  },
}));

vi.mock("@/components/dashboard/Designacao/CustomAccordionItem", () => ({
  CustomAccordionItem: ({
    title,
    children,
    ...props
  }: {
    title: string;
    children: ReactNode;
  }) => {
    customAccordionItemSpy({ title, ...props });
    return (
      <article data-testid={`accordion-item-${title}`}>
        <h2>{title}</h2>
        {children}
      </article>
    );
  },
}));

vi.mock("@/components/dashboard/Designacao/ResumoPesquisaDaUnidade", () => ({
  __esModule: true,
  default: (props: { defaultValues: unknown; isLoading: boolean }) => {
    resumoPesquisaSpy(props);
    return <div data-testid="resumo-unidade" />;
  },
}));

vi.mock("@/components/dashboard/Designacao/ResumoPortariaDesigacao", () => ({
  __esModule: true,
  default: (props: { defaultValues: unknown; isLoading: boolean }) => {
    resumoPortariaSpy(props);
    return <div data-testid="resumo-portaria" />;
  },
}));

vi.mock(
  "@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado",
  () => ({
    __esModule: true,
    default: (props: unknown) => {
      resumoServidorSpy(props);
      return <div data-testid="resumo-servidor" />;
    },
  })
);

vi.mock("@/assets/icons/Designacao", () => ({
  __esModule: true,
  default: () => <span data-testid="icon-designacao" />,
}));

vi.mock("@/components/ui/info-item", () => ({
  InfoItem: (props: { label: string; value?: string | number | null }) => {
    infoItemSpy(props);
    return (
      <div data-testid="info-item">
        {props.label}: {props.value}
      </div>
    );
  },
}));

vi.mock("lucide-react", () => ({
  Loader2: ({ className }: { className?: string }) => (
    <div data-testid="loader" className={className} />
  ),
  ArrowLeft: () => <span data-testid="icon-arrow-left" />,
  History: () => <span data-testid="icon-history" />,
  X: () => <span data-testid="icon-close" />,
}));

vi.mock(
  "@/components/dashboard/EditorTextoSEI/EditorTextoSEI",
  () => ({
    __esModule: true,
    default: (props: { html: string; titulo: string; mostrarBotao: boolean }) => {
      editorSEISpy(props);
      return <div data-testid="editor-sei" />;
    },
    gerarHtmlPortaria: (html: string) => gerarHtmlPortariaSpy(html),
  })
);

vi.mock(
  "@/components/dashboard/Designacao/InformacoesAdicionais/InformacoesAdicionais",
  () => ({
    __esModule: true,
    default: (props: unknown) => {
      informacoesAdicionaisSpy(props);
      return <div data-testid="informacoes-adicionais" />;
    },
  })
);

describe("VisualizarDesignacao page", () => {
  const designacaoMock = {
    dre_nome: "DRE Centro",
    unidade_proponente: "EMEF Teste",
    codigo_hierarquico: "1234",
    numero_portaria: "001",
    ano_vigente: "2026",
    sei_numero: "6016.2026/0001-2",
    doc: "DOC X",
    data_inicio: "2026-01-01",
    data_fim: null,
    carater_excepcional: false,
    impedimento_substituicao: null,
    impedimento_display: "",
    motivo_afastamento: "Motivo",
    pendencias: "Nenhuma",
    tipo_vaga: "SUBSTITUICAO",
    tipo_vaga_display: "Substituição",
    cargo_vaga: null,
    cargo_vaga_display: "",
    indicado_rf: "123456",
    indicado_nome_servidor: "INDICADO",
    indicado_nome_civil: "Indicado Civil",
    indicado_vinculo: 1,
    indicado_lotacao: "Lotacao I",
    indicado_cargo_base: "Cargo I",
    indicado_cargo_sobreposto: "Sobreposto I",
    indicado_codigo_cargo_base: 1,
    indicado_codigo_cargo_sobreposto: 2,
    indicado_local_servico: "Servico I",
    indicado_local_exercicio: "Exercicio I",
    titular_rf: "654321",
    titular_nome_servidor: "TITULAR",
    titular_nome_civil: "Titular Civil",
    titular_vinculo: 2,
    titular_lotacao: "Lotacao T",
    titular_cargo_base: "Cargo T",
    titular_cargo_sobreposto: "Sobreposto T",
    titular_codigo_cargo_base: 3,
    titular_codigo_cargo_sobreposto: 4,
    titular_local_servico: "Servico T",
    titular_local_exercicio: "Exercicio T",
    texto_sei: "Texto da portaria pronto vindo do backend",
    modelo_portaria: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useParamsMock.mockReturnValue({ id: "12" });
    pushMock.mockReset();
    gerarHtmlPortariaSpy.mockImplementation((html: string) => html);
  });

  it("renderiza loading quando consulta está carregando", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as never);

    render(<VisualizarDesignacao />);

    expect(useFetchDesignacoesById).toHaveBeenCalledWith(12);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });

  it("renderiza mensagem de erro quando a consulta falha", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: "Erro ao carregar" },
    } as never);

    render(<VisualizarDesignacao />);

    expect(screen.getByText("Erro ao carregar")).toBeInTheDocument();
  });

  it("renderiza o conteúdo completo quando há designação", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: designacaoMock,
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarDesignacao />);

    expect(screen.getByTestId("page-header")).toBeInTheDocument();
    expect(screen.getByTestId("accordion")).toBeInTheDocument();
    expect(screen.getByTestId("resumo-unidade")).toBeInTheDocument();
    expect(screen.getByTestId("resumo-portaria")).toBeInTheDocument();
    expect(screen.getAllByTestId("resumo-servidor")).toHaveLength(2);
    expect(screen.getByTestId("editor-sei")).toBeInTheDocument();
    expect(screen.getByTestId("informacoes-adicionais")).toBeInTheDocument();
    expect(customAccordionItemSpy.mock.calls.length).toBeGreaterThanOrEqual(4);
    expect(accordionSpy).toHaveBeenCalled();
    expect(pageHeaderSpy).toHaveBeenCalled();
    expect(resumoPesquisaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: {
          lotacao: "EMEF Teste",
          dre: "DRE Centro",
          estrutura_hierarquica: "1234",
        },
      })
    );
    expect(editorSEISpy).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: "PORTARIA",
        mostrarBotao: false,
      })
    );
    expect(informacoesAdicionaisSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        disableFields: true,
        onChangeDescricao: expect.any(Function),
        onValueChangeDetalheParaQuadroDeHistoricoPorAno: expect.any(Function),
      })
    );
  });

  it("navega ao clicar nos botões do cabeçalho", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: designacaoMock,
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarDesignacao />);

    fireEvent.click(screen.getByText("Consultar histórico"));

    expect(pushMock).toHaveBeenNthCalledWith(1, "/pages/historico-ato-administrativo?id=12&tipo_display=da designação&numero_portaria=001&servidor_indicado=INDICADO");
  });

  it("aplica fallback vazio no resumo da unidade quando campos vêm indefinidos", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: {
        ...designacaoMock,
        unidade_proponente: undefined,
        dre_nome: undefined,
        codigo_hierarquico: undefined,
      },
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarDesignacao />);

    expect(resumoPesquisaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: {
          lotacao: "",
          dre: "",
          estrutura_hierarquica: "",
        },
      })
    );
  });

  it("não renderiza o accordion quando não está loading e não há designação", () => {
    useParamsMock.mockReturnValue({ id: "0" });
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarDesignacao />);

    expect(useFetchDesignacoesById).toHaveBeenCalledWith(0);
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });

  it('renderiza "Cargo Disponível" quando tipo_vaga é VAGO', () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: {
        ...designacaoMock,
        tipo_vaga: "VAGO",
        cargo_vaga_display: "Professor Adjunto",
      },
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarDesignacao />);

    expect(screen.getByText("Cargo Disponível")).toBeInTheDocument();
    expect(screen.getByTestId("info-item")).toHaveTextContent(
      "Nome do Cargo Disponível: Professor Adjunto"
    );
    expect(infoItemSpy).toHaveBeenCalledWith({
      label: "Nome do Cargo Disponível",
      value: "Professor Adjunto",
    });
    expect(screen.getAllByTestId("resumo-servidor")).toHaveLength(1);
  });

  it("exibe o texto da portaria retornado pelo backend, sem remontá-lo no cliente", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: designacaoMock,
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarDesignacao />);

    expect(gerarHtmlPortariaSpy).toHaveBeenCalledWith(designacaoMock.texto_sei);
    expect(editorSEISpy).toHaveBeenCalledWith(
      expect.objectContaining({
        html: designacaoMock.texto_sei,
      }),
    );
  });

  it("não chama a montagem de html quando o backend ainda não retornou texto_sei", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: { ...designacaoMock, texto_sei: "" },
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarDesignacao />);

    expect(gerarHtmlPortariaSpy).not.toHaveBeenCalled();
    expect(editorSEISpy).toHaveBeenCalledWith(
      expect.objectContaining({ html: "" }),
    );
  });

  it("aplica fallback zero para códigos de cargo e dadosTitular nulo sem titular", () => {
    vi.mocked(useFetchDesignacoesById).mockReturnValue({
      data: {
        ...designacaoMock,
        titular_rf: "",
        titular_codigo_cargo_base: undefined,
        titular_codigo_cargo_sobreposto: undefined,
        indicado_codigo_cargo_base: undefined,
        indicado_codigo_cargo_sobreposto: undefined,
      },
      isLoading: false,
      error: null,
    } as never);

    render(<VisualizarDesignacao />);

    type ResumoServidorProps = {
      defaultValues?: {
        rf?: string;
        cd_cargo_base?: number;
        cd_cargo_sobreposto_funcao_atividade?: number;
      };
    };

    const chamadasResumoServidor = resumoServidorSpy.mock.calls.map(
      ([props]) => props as ResumoServidorProps,
    );
    const indicado = chamadasResumoServidor.find(
      (props) => props?.defaultValues?.rf === designacaoMock.indicado_rf,
    );
    const titular = chamadasResumoServidor.find(
      (props) => props?.defaultValues?.rf === "",
    );

    expect(indicado?.defaultValues?.cd_cargo_base).toBe(0);
    expect(indicado?.defaultValues?.cd_cargo_sobreposto_funcao_atividade).toBe(0);
    expect(titular?.defaultValues?.cd_cargo_base).toBe(0);
    expect(titular?.defaultValues?.cd_cargo_sobreposto_funcao_atividade).toBe(0);
  });

});
