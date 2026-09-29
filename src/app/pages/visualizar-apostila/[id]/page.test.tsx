import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VisualizarApostilaPage from "./page";
import { useFetchApostilaById } from "@/hooks/useVisualizarApostila";
import type { ApostilaDetailRead } from "@/types/apostila";
import type { Cessacao, DesignacaoResponse } from "@/types/designacao";

const pageHeaderSpy = vi.fn();
const resumoPortariaEIndicadoSpy = vi.fn();
const resumoPortariaApostilaSpy = vi.fn();
const customAccordionItemSpy = vi.fn();
const accordionSpy = vi.fn();
const editorSEISpy = vi.fn();
const gerarHtmlPortariaSpy = vi.fn((html: string) => html);

const useParamsMock = vi.fn();
const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => useParamsMock(),
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/hooks/useVisualizarApostila", () => ({
  useFetchApostilaById: vi.fn(),
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

vi.mock(
  "@/components/dashboard/Designacao/ResumoPortariaEServidorIndicado",
  () => ({
    __esModule: true,
    default: (props: unknown) => {
      resumoPortariaEIndicadoSpy(props);
      return <div data-testid="resumo-portaria-e-servidor" />;
    },
  }),
);

vi.mock("@/components/dashboard/Designacao/ResumoPortariaApostila", () => ({
  __esModule: true,
  default: (props: { defaultValues: unknown }) => {
    resumoPortariaApostilaSpy(props);
    return <div data-testid="resumo-portaria-apostila" />;
  },
}));

vi.mock("lucide-react", () => ({
  Loader2: ({ className }: { className?: string }) => (
    <div data-testid="loader" className={className} />
  ),
  History: () => <span data-testid="icon-history" />,
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
  }),
);

type ApostilaFetchData =
  | ApostilaDetailRead
  | (Omit<ApostilaDetailRead, "designacao"> & {
      designacao?: DesignacaoResponse | null;
    })
  | undefined;

function mockUseFetchApostilaById(state: {
  data: ApostilaFetchData;
  isLoading: boolean;
  error: Error | null;
}) {
  vi.mocked(useFetchApostilaById).mockReturnValue(
    state as ReturnType<typeof useFetchApostilaById>,
  );
}

describe("VisualizarApostila page", () => {
  const cessacaoMock: Cessacao = {
    id: 88,
    numero_portaria: 10,
    ano_vigente: "2025",
    sei_numero: "6016.2025/0001-1",
    a_pedido: false,
    remocao: false,
    aposentadoria: false,
    data_cessacao: "2025-10-10",
    doc: "2025-10-11",
    criado_em: "2025-10-11T10:00:00Z",
    status: "cessada",
    ato_pai_id: 70,
    apostilas: [],
    insubsistencia: null,
    texto_sei: "Texto da cessação",
    modelo_portaria: 1,
  };

  const designacaoMock: DesignacaoResponse = {
    id: 20,
    tipo: "DESIGNACAO",
    status: "ativo",
    ato_pai_id: null,
    ato_raiz_id: null,
    impedimento_substituicao_detail: null,
    impedimento_substituicao: null,
    impedimento_display: "",
    tipo_vaga_display: "Substituição",
    cargo_vaga_display: "",
    dre_nome: "DRE Centro",
    unidade_proponente: "EMEF Teste",
    dre: "DRE",
    ue: "UE",
    funcionarios_da_unidade: "",
    codigo_hierarquico: "1234",
    indicado_nome_civil: "Nome Civil",
    indicado_nome_servidor: "Servidor & Nome",
    indicado_rf: "1234567",
    indicado_vinculo: 1,
    indicado_cargo_base: "PROFESSOR",
    indicado_codigo_cargo_base: 1,
    indicado_lotacao: "Lotacao I",
    indicado_cargo_sobreposto: "COORDENADOR",
    indicado_codigo_cargo_sobreposto: 2,
    indicado_local_exercicio: "EMEF TESTE",
    indicado_local_servico: "Servico I",
    indicado_categoria: "3",
    titular_nome_civil: "",
    titular_nome_servidor: "",
    titular_rf: "",
    titular_vinculo: 0,
    titular_cargo_base: "",
    titular_codigo_cargo_base: 0,
    titular_lotacao: "",
    titular_cargo_sobreposto: "",
    titular_codigo_cargo_sobreposto: 0,
    titular_local_exercicio: "",
    titular_local_servico: "",
    numero_portaria: 1,
    ano_vigente: "2026",
    sei_numero: "6016.2026/0001-2",
    portaria: "PORTARIA-1",
    doc: "2026-01-11",
    data_inicio: "2026-01-01",
    data_fim: null,
    carater_excepcional: false,
    com_afastamento: false,
    possui_pendencia: false,
    pendencias: "",
    motivo_afastamento: "",
    informacoes_adicionais: "",
    detalhe_para_quadro_de_historico_por_ano: false,
    tipo_vaga: "SUBSTITUICAO",
    cargo_vaga: 0,
    criado_em: "2026-01-01T10:00:00Z",
    apostilas: [],
    insubsistencia: null,
    cessacao: cessacaoMock,
    texto_sei: "Texto da designação",
    modelo_portaria: 1,
  };

  const apostilaMock: ApostilaDetailRead = {
    id: 12,
    numero_portaria: 1,
    tipo: "APOSTILA",
    ato_apostilado: "CESSACAO",
    ato_apostilado_display: "Cessação",
    sei_numero: "6016.2026/0001-2",
    doc: "2026-01-11",
    status: "ativa",
    observacao: "Observação",
    criado_em: "2026-01-01T10:00:00Z",
    designacao: designacaoMock,
    cessacao: cessacaoMock,
    texto_sei: "Texto da apostila pronto vindo do backend",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useParamsMock.mockReturnValue({ id: "12" });
    pushMock.mockReset();
    gerarHtmlPortariaSpy.mockImplementation((html: string) => html);
  });

  it("renderiza loading quando consulta está carregando", () => {
    mockUseFetchApostilaById({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<VisualizarApostilaPage />);

    expect(useFetchApostilaById).toHaveBeenCalledWith(12);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });

  it("renderiza mensagem de erro quando a consulta falha", () => {
    mockUseFetchApostilaById({
      data: undefined,
      isLoading: false,
      error: new Error("Erro ao carregar"),
    });

    render(<VisualizarApostilaPage />);

    expect(screen.getByText("Erro ao carregar")).toBeInTheDocument();
  });

  it("renderiza o conteúdo completo quando há apostila e designação", () => {
    mockUseFetchApostilaById({
      data: apostilaMock,
      isLoading: false,
      error: null,
    });

    render(<VisualizarApostilaPage />);

    expect(screen.getByTestId("page-header")).toBeInTheDocument();
    expect(screen.getByTestId("accordion")).toBeInTheDocument();
    expect(screen.getByTestId("resumo-portaria-e-servidor")).toBeInTheDocument();
    expect(screen.getByTestId("resumo-portaria-apostila")).toBeInTheDocument();
    expect(screen.getByTestId("editor-sei")).toBeInTheDocument();
    expect(customAccordionItemSpy).toHaveBeenCalledTimes(1);
    expect(accordionSpy).toHaveBeenCalled();
    expect(pageHeaderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Detalhes da apostila",
      }),
    );
    expect(resumoPortariaApostilaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: apostilaMock,
      }),
    );
    expect(resumoPortariaEIndicadoSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        designacao: designacaoMock,
        isLoadingDesignacao: false,
      }),
    );
    expect(editorSEISpy).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: "PORTARIA",
        mostrarBotao: false,
      }),
    );
  });

  it("navega ao clicar em consultar histórico", () => {
    mockUseFetchApostilaById({
      data: apostilaMock,
      isLoading: false,
      error: null,
    });

    render(<VisualizarApostilaPage />);

    fireEvent.click(screen.getByText("Consultar histórico"));

    expect(pushMock).toHaveBeenCalledWith(
      "/pages/historico-ato-administrativo?id=12&tipo_display=da apostila&numero_portaria=1&servidor_indicado=Servidor & Nome",
    );
  });

  it("usa fallbacks no histórico quando apostila ou designação estão ausentes", () => {
    mockUseFetchApostilaById({
      data: undefined,
      isLoading: false,
      error: null,
    });

    render(<VisualizarApostilaPage />);

    fireEvent.click(screen.getByText("Consultar histórico"));

    expect(pushMock).toHaveBeenCalledWith(
      "/pages/historico-ato-administrativo?id=12&tipo_display=da apostila&numero_portaria=undefined&servidor_indicado=undefined",
    );
  });

  it("não renderiza accordion quando não há designação", () => {
    mockUseFetchApostilaById({
      data: {
        ...apostilaMock,
        designacao: null,
      },
      isLoading: false,
      error: null,
    });

    render(<VisualizarApostilaPage />);

    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
    expect(screen.getByTestId("editor-sei")).toBeInTheDocument();
  });

  it("exibe o texto_sei do backend no editor, sem montar template no cliente", () => {
    mockUseFetchApostilaById({
      data: apostilaMock,
      isLoading: false,
      error: null,
    });

    render(<VisualizarApostilaPage />);

    expect(gerarHtmlPortariaSpy).toHaveBeenCalledWith(apostilaMock.texto_sei);
    expect(editorSEISpy).toHaveBeenCalledWith(
      expect.objectContaining({
        html: apostilaMock.texto_sei,
        titulo: "PORTARIA",
        mostrarBotao: false,
      }),
    );
  });

  it("repassa string vazia para gerarHtmlPortaria quando texto_sei ainda não veio", () => {
    mockUseFetchApostilaById({
      data: { ...apostilaMock, texto_sei: "" },
      isLoading: false,
      error: null,
    });

    render(<VisualizarApostilaPage />);

    expect(gerarHtmlPortariaSpy).toHaveBeenCalledWith("");
    expect(editorSEISpy).toHaveBeenCalledWith(
      expect.objectContaining({
        html: "",
      }),
    );
  });

  it("mantém editor com html vazio quando não há apostila", () => {
    mockUseFetchApostilaById({
      data: undefined,
      isLoading: false,
      error: null,
    });

    render(<VisualizarApostilaPage />);

    expect(gerarHtmlPortariaSpy).toHaveBeenCalledWith("");
    expect(editorSEISpy).toHaveBeenCalledWith(
      expect.objectContaining({
        html: "",
      }),
    );
  });
});
