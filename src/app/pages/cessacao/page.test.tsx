import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import CessacaoPage from "./page";

const mockMutateAsync = vi.fn();
const mockRouterPush = vi.fn();

const mockDesignacao = {
  dre_nome: "DRE TESTE",
  numero_portaria: "123",
  ano_vigente: "2026",
  sei_numero: "SEI-001",
  doc: "DOC-001",
  data_inicio: "2026-01-01",
  data_fim: "2026-12-31",
  carater_excepcional: false,
  impedimento_substituicao: false,
  motivo_afastamento: "Licença",
  pendencias: null,

  titular_nome_servidor: "Titular Teste",
  titular_rf: "111",
  titular_nome_civil: "Titular Civil",
  titular_vinculo: "Ativo",
  titular_lotacao: "Unidade X",
  titular_cargo_base: "Professor",
  titular_codigo_cargo_base: "001",
  titular_codigo_cargo_sobreposto: 2,
  titular_cargo_sobreposto: "Diretor",
  titular_local_servico: "Escola A",
  titular_local_exercicio: "Escola A",

  indicado_rf: "222",
  indicado_nome_servidor: "Indicado Teste",
  indicado_nome_civil: "Indicado Civil",
  indicado_vinculo: "Ativo",
  indicado_cargo_base: "Professor",
  indicado_lotacao: "Unidade Y",
  indicado_cargo_sobreposto: "Coordenador",
  indicado_local_exercicio: "Escola B",
  indicado_local_servico: "Escola B",
};

vi.mock("@/hooks/useSalvarCessacao", () => ({
  useSalvarCessacao: () => ({
    mutateAsync: mockMutateAsync,
  }),
}));

const mockUseFetch = vi.fn();

vi.mock("@/hooks/useVisualizarDesignacoes", () => ({
  useFetchDesignacoesById: () => mockUseFetch(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: () => "1",
  }),
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

vi.mock("antd", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  message: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  __esModule: true,
  default: ({ title }: any) => <div data-testid="page-header">{title}</div>,
}));

vi.mock("@/components/dashboard/Designacao/CustomAccordionItem", () => ({
  CustomAccordionItem: ({ children }: any) => (
    <div data-testid="accordion-item">{children}</div>
  ),
}));

vi.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/assets/icons/Designacao", () => ({
  __esModule: true,
  default: () => <svg data-testid="icon" />,
}));

vi.mock("@/components/dashboard/Designacao/ResumoPortariaDesigacao", () => ({
  default: () => <div data-testid="resumo-portaria" />,
}));

vi.mock(
  "@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado",
  () => ({
    default: ({ onSubmitEditarServidor }: any) => {
      onSubmitEditarServidor?.();
      return <div data-testid="resumo-indicado" />;
    },
  })
);

vi.mock("@/components/dashboard/Designacao/ResumoTitular", () => ({
  default: ({ onSubmitEditarServidor }: any) => {
    onSubmitEditarServidor?.();
    return <div data-testid="resumo-titular" />;
  },
}));

vi.mock(
  "@/components/dashboard/Cessacao/PortariaCessacaoFields/PortariaCessacaoFields",
  () => ({
    default: () => <div data-testid="cessacao-fields" />,
  })
);

const mockTrigger = vi.fn();
const mockGetValues = vi.fn();

vi.mock("react-hook-form", async () => {
  const actual = await vi.importActual<any>("react-hook-form");

  return {
    ...actual,
    useForm: () => ({
      register: vi.fn(),
      handleSubmit: (fn: any) => (e: any) => fn(e),
      reset: vi.fn(),
      getValues: mockGetValues,
      trigger: mockTrigger,
      control: {},
    }),
    FormProvider: ({ children }: any) => children,
  };
});

const defaultGetValues = () => ({
  cessacao: {
    numero_portaria: "123",
    ano: "2026",
    numero_sei: "SEI",
    data_inicio: new Date(),
    a_pedido: "nao",
  },
});

describe("CessacaoPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFetch.mockReturnValue({
      data: mockDesignacao,
      isLoading: false,
    });
    mockGetValues.mockImplementation(defaultGetValues);
  });

  it("renderiza página corretamente", () => {
    render(<CessacaoPage />);

    expect(screen.getByTestId("page-header")).toBeInTheDocument();
    expect(screen.getByTestId("resumo-portaria")).toBeInTheDocument();
    expect(screen.getByTestId("resumo-indicado")).toBeInTheDocument();
    expect(screen.getByTestId("resumo-titular")).toBeInTheDocument();
    expect(screen.getByTestId("cessacao-fields")).toBeInTheDocument();
  });

  it("abre editor e permite salvar", async () => {
    mockTrigger.mockResolvedValue(true);
    mockMutateAsync.mockResolvedValueOnce({});

    render(<CessacaoPage />);

    await userEvent.click(screen.getByText("Trechos para o SEI"));

    await screen.findByText("PORTARIA");

    await userEvent.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
      expect(mockRouterPush).toHaveBeenCalled();
    });
  });

  it("não gera portaria se trigger for inválido", async () => {
    mockTrigger.mockResolvedValue(false);

    render(<CessacaoPage />);

    await userEvent.click(screen.getByText("Trechos para o SEI"));

    await waitFor(() => {
      expect(screen.queryByText("PORTARIA")).not.toBeInTheDocument();
    });
  });

  it("gera conteúdo da portaria corretamente", async () => {
    mockTrigger.mockResolvedValue(true);

    render(<CessacaoPage />);

    await userEvent.click(screen.getByText("Trechos para o SEI"));

    const editor = await screen.findByTestId("editor-sei");

    expect(editor).toHaveTextContent("PORTARIA");
  });

  it("gera portaria cobrindo transformação completa", async () => {
    mockTrigger.mockResolvedValue(true);

    mockUseFetch.mockReturnValue({
      data: {
        ...mockDesignacao,
        indicado_nome_servidor: "Maria Silva",
      },
      isLoading: false,
    });

    render(<CessacaoPage />);

    await userEvent.click(screen.getByText("Trechos para o SEI"));

    const editor = await screen.findByTestId("editor-sei");

    expect(editor).toHaveTextContent("Maria Silva");
  });

  it("cobre todos os branches da geração de portaria", async () => {
    mockTrigger.mockResolvedValue(true);

    mockUseFetch.mockReturnValue({
      data: {
        ...mockDesignacao,
        indicado_nome_servidor: "Maria Silva",
        indicado_rf: null,
        indicado_cargo_base: undefined,
      },
      isLoading: false,
    });

    render(<CessacaoPage />);

    await userEvent.click(screen.getByText("Trechos para o SEI"));

    const editor = await screen.findByTestId("editor-sei");

    expect(editor).toHaveTextContent("Maria Silva");
    expect(editor).not.toHaveTextContent("{{");
    expect(editor).not.toHaveTextContent("null");
    expect(editor).not.toHaveTextContent("undefined");
  });

  it("garante que todas as chaves do template são processadas", async () => {
    mockTrigger.mockResolvedValue(true);

    mockUseFetch.mockReturnValue({
      data: {
        ...mockDesignacao,
        indicado_nome_servidor: "Teste Completo",
        indicado_rf: null,
        indicado_cargo_base: null,
      },
      isLoading: false,
    });

    render(<CessacaoPage />);

    await userEvent.click(screen.getByText("Trechos para o SEI"));

    const editor = await screen.findByTestId("editor-sei");

    expect(editor).not.toHaveTextContent("{{");
  });

  it("exibe loader quando isLoading é true", () => {
    mockUseFetch.mockReturnValue({ data: undefined, isLoading: true });

    render(<CessacaoPage />);

    expect(screen.queryByTestId("page-header")).not.toBeInTheDocument();
  });

  it("exibe mensagem de erro quando salvar falha", async () => {
    const { message } = await import("antd");
    mockTrigger.mockResolvedValue(true);
    mockMutateAsync.mockRejectedValueOnce(new Error("Erro de rede"));

    render(<CessacaoPage />);

    await userEvent.click(screen.getByText("Trechos para o SEI"));
    await screen.findByText("PORTARIA");
    await userEvent.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith("Erro ao salvar");
    });
  });

  it("exibe 'Não há servidor titular' quando titular tem strings vazias", () => {
    mockUseFetch.mockReturnValue({
      data: {
        ...mockDesignacao,
        titular_nome_servidor: "",
        titular_rf: "",
      },
      isLoading: false,
    });

    render(<CessacaoPage />);

    expect(screen.getByText("Não há servidor titular")).toBeInTheDocument();
  });

  it("exibe 'Não há servidor titular' quando titular_nome_servidor é apenas espaços", () => {
    mockUseFetch.mockReturnValue({
      data: {
        ...mockDesignacao,
        titular_nome_servidor: "   ",
        titular_rf: "111",
      },
      isLoading: false,
    });

    render(<CessacaoPage />);

    expect(screen.getByText("Não há servidor titular")).toBeInTheDocument();
  });

  it("exibe 'Não há servidor titular' quando titular_nome_servidor é null", () => {
    mockUseFetch.mockReturnValue({
      data: {
        ...mockDesignacao,
        titular_nome_servidor: null,
        titular_rf: "111",
      },
      isLoading: false,
    });

    render(<CessacaoPage />);

    expect(screen.getByText("Não há servidor titular")).toBeInTheDocument();
  });

  it("exibe 'Não há servidor titular' quando titular_rf é null", () => {
    mockUseFetch.mockReturnValue({
      data: {
        ...mockDesignacao,
        titular_nome_servidor: "Titular Teste",
        titular_rf: null,
      },
      isLoading: false,
    });

    render(<CessacaoPage />);

    expect(screen.getByText("Não há servidor titular")).toBeInTheDocument();
  });

  it("não renderiza resumos quando designacao é undefined", () => {
    mockUseFetch.mockReturnValue({ data: undefined, isLoading: false });

    render(<CessacaoPage />);

    expect(screen.queryByTestId("resumo-portaria")).not.toBeInTheDocument();
    expect(screen.queryByTestId("resumo-indicado")).not.toBeInTheDocument();
    expect(screen.queryByTestId("resumo-titular")).not.toBeInTheDocument();
  });

  it("gera portaria com tipo_cessacao 'a pedido' quando a_pedido é sim", async () => {
    mockTrigger.mockResolvedValue(true);
    mockGetValues.mockReturnValue({
      cessacao: {
        numero_portaria: "456",
        ano: "2026",
        numero_sei: "SEI-002",
        data_inicio: new Date("2026-03-01"),
        a_pedido: "sim",
      },
    });

    render(<CessacaoPage />);

    await userEvent.click(screen.getByText("Trechos para o SEI"));

    const editor = await screen.findByTestId("editor-sei");

    expect(editor).toBeInTheDocument();
  });

  it("gera portaria com data_inicio indefinida cobrindo branch de optional chaining", async () => {
    mockTrigger.mockResolvedValue(true);
    mockGetValues.mockReturnValue({
      cessacao: {
        numero_portaria: "789",
        ano: "2026",
        numero_sei: "SEI-003",
        data_inicio: undefined,
        a_pedido: "nao",
      },
    });

    render(<CessacaoPage />);

    await userEvent.click(screen.getByText("Trechos para o SEI"));

    const editor = await screen.findByTestId("editor-sei");

    expect(editor).toBeInTheDocument();
    expect(editor).not.toHaveTextContent("{{");
  });

  it("constrói dadosTitular com titular_codigo_cargo_sobreposto nulo usando fallback 0", () => {
    mockUseFetch.mockReturnValue({
      data: {
        ...mockDesignacao,
        titular_codigo_cargo_sobreposto: null,
      },
      isLoading: false,
    });

    render(<CessacaoPage />);

    expect(screen.getByTestId("resumo-titular")).toBeInTheDocument();
  });

  it("gera portaria com campos opcionais nulos no designacao", async () => {
    mockTrigger.mockResolvedValue(true);

    mockUseFetch.mockReturnValue({
      data: {
        ...mockDesignacao,
        dre_nome: null,
        numero_portaria: null,
        doc: null,
        sei_numero: null,
        indicado_nome_servidor: null,
        indicado_rf: null,
        indicado_vinculo: null,
        indicado_cargo_base: null,
        indicado_cargo_sobreposto: null,
        indicado_local_exercicio: null,
      },
      isLoading: false,
    });

    render(<CessacaoPage />);

    await userEvent.click(screen.getByText("Trechos para o SEI"));

    const editor = await screen.findByTestId("editor-sei");

    expect(editor).toBeInTheDocument();
    expect(editor).not.toHaveTextContent("{{");
    expect(editor).not.toHaveTextContent("null");
  });
});
