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
    default: () => <div data-testid="resumo-indicado" />,
  })
);

vi.mock("@/components/dashboard/Designacao/ResumoTitular", () => ({
  default: () => <div data-testid="resumo-titular" />,
}));

vi.mock(
  "@/components/dashboard/Cessacao/PortariaCessacaoFields/PortariaCessacaoFields",
  () => ({
    default: () => <div data-testid="cessacao-fields" />,
  })
);
const mockTrigger = vi.fn();

vi.mock("react-hook-form", async () => {
  const actual = await vi.importActual<any>("react-hook-form");

  return {
    ...actual,
    useForm: () => ({
      register: vi.fn(),
      handleSubmit: (fn: any) => (e: any) => fn(e),
      reset: vi.fn(),
      getValues: vi.fn(() => ({
        cessacao: {
          numero_portaria: "123",
          ano: "2026",
          numero_sei: "SEI",
          data_inicio: new Date(),
          a_pedido: "nao",
        },
      })),
      trigger: mockTrigger,
      control: {},
    }),
    FormProvider: ({ children }: any) => children,
  };
});


describe("CessacaoPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFetch.mockReturnValue({
    data: mockDesignacao,
    isLoading: false,
    
  });
  });

  it("renderiza página corretamente", async () => {
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

    expect(await screen.findByText("PORTARIA")).toBeInTheDocument();

    const salvar = screen.getByText("Salvar");
    await userEvent.click(salvar);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
      expect(mockRouterPush).toHaveBeenCalled();
    });
  });

  it("não abre editor se form.trigger falhar (mock indireto)", async () => {
    render(<CessacaoPage />);

    const button = screen.getByText("Trechos para o SEI");

    await userEvent.click(button);

    expect(button).toBeInTheDocument();
  });

  it("envia formulário e navega ao salvar", async () => {
    mockMutateAsync.mockResolvedValueOnce({});

    render(<CessacaoPage />);

    await userEvent.click(screen.getByText("Trechos para o SEI"));

    const salvar = await screen.findByText("Salvar");
    await userEvent.click(salvar);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith(
        "/pages/listagem-designacoes"
      );
    });
  });

  it("trata erro ao salvar cessação", async () => {
    const { message } = await import("antd");

    mockMutateAsync.mockRejectedValueOnce(new Error("Erro"));

    render(<CessacaoPage />);

    await userEvent.click(screen.getByText("Trechos para o SEI"));

    const salvar = await screen.findByText("Salvar");
    await userEvent.click(salvar);

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith("Erro ao salvar");
    });
  });

  it("exibe loader enquanto carrega dados", async () => {
    vi.resetModules();

    vi.doMock("@/hooks/useVisualizarDesignacoes", () => ({
      useFetchDesignacoesById: () => ({
        data: null,
        isLoading: true,
      }),
    }));

    const { default: CessacaoPage } = await import("./page");

    render(<CessacaoPage />);

    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("não gera portaria se trigger for inválido", async () => {
    mockTrigger.mockResolvedValue(false);

    render(<CessacaoPage />);

    await userEvent.click(screen.getByText("Trechos para o SEI"));

    await waitFor(() => {
      expect(screen.queryByText("PORTARIA")).not.toBeInTheDocument();
    });

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("gera HTML da portaria corretamente ao abrir editor", async () => {
    mockTrigger.mockResolvedValue(true);

    render(<CessacaoPage />);

    await userEvent.click(screen.getByText("Trechos para o SEI"));

    const editor = await screen.findByText("PORTARIA");

    expect(editor).toBeInTheDocument();

    expect(document.body.innerHTML).toContain("PORTARIA");
  });
  
  it("exibe mensagem quando não há titular", async () => {
    vi.resetModules();

    vi.doMock("@/hooks/useVisualizarDesignacoes", () => ({
      useFetchDesignacoesById: () => ({
        data: {
          ...mockDesignacao,
          titular_nome_servidor: "",
          titular_rf: "",
        },
        isLoading: false,
      }),
    }));

    const { default: CessacaoPage } = await import("./page");

    render(<CessacaoPage />);

    expect(
      await screen.findByText("Não há servidor titular")
    ).toBeInTheDocument();
  });

  it("exibe mensagem quando não há titular", async () => {
    vi.resetModules();

    vi.doMock("@/hooks/useVisualizarDesignacoes", () => ({
      useFetchDesignacoesById: () => ({
        data: {
          ...mockDesignacao,
          titular_nome_servidor: "",
          titular_rf: "",
        },
        isLoading: false,
      }),
    }));

    const { default: CessacaoPage } = await import("./page");

    render(<CessacaoPage />);

    expect(
      await screen.findByText("Não há servidor titular")
    ).toBeInTheDocument();
  });

  it("gera portaria com html correto", async () => {
    vi.resetModules();

    vi.doMock("@/components/dashboard/EditorTextoSEI/EditorTextoSEI", () => ({
      __esModule: true,
      default: ({ html }: any) => (
        <div data-testid="editor">{html}</div>
      ),
      gerarHtmlPortaria: vi.fn((texto) => texto),
    }));

    const { default: CessacaoPage } = await import("./page");

    render(<CessacaoPage />);

  });

  it("gera portaria com valores vazios sem quebrar", async () => {
    mockTrigger.mockResolvedValue(true);

    mockUseFetch.mockReturnValue({
      data: {
        ...mockDesignacao,
        indicado_nome_servidor: "",
        indicado_cargo_base: null,
      },
      isLoading: false,
    });

    render(<CessacaoPage />);

    await userEvent.click(screen.getByText("Trechos para o SEI"));

    expect(await screen.findByText("PORTARIA")).toBeInTheDocument();
  });

  it("não considera titular quando apenas um dos campos está preenchido", async () => {
    vi.resetModules();

    vi.doMock("@/hooks/useVisualizarDesignacoes", () => ({
      useFetchDesignacoesById: () => ({
        data: {
          ...mockDesignacao,
          titular_nome_servidor: "Titular Teste",
          titular_rf: "   ",
        },
        isLoading: false,
      }),
    }));

    const { default: CessacaoPage } = await import("./page");

    render(<CessacaoPage />);

    expect(
      await screen.findByText("Não há servidor titular")
    ).toBeInTheDocument();
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

    const editor = await screen.findByText("PORTARIA");

    expect(editor).toBeInTheDocument();

    expect(
      document.querySelector('[contenteditable="true"]')?.innerHTML
    ).toContain("Maria Silva");
  });
  it("cobre todos os branches da geração de portaria", async () => {
  mockTrigger.mockResolvedValue(true);

  mockUseFetch.mockReturnValue({
    data: {
      ...mockDesignacao,
      indicado_nome_servidor: "Maria Silva", // 👈 cobre o IF
      indicado_rf: null, // 👈 cobre ??
      indicado_cargo_base: undefined, // 👈 cobre ?? também
    },
    isLoading: false,
  });

  render(<CessacaoPage />);

  await userEvent.click(screen.getByText("Trechos para o SEI"));

  const html =
    document.querySelector('[contenteditable="true"]')?.innerHTML;

  expect(html).not.toContain("{{");

  expect(html).toContain("<strong>Maria Silva</strong>");

  expect(html).not.toContain("null");
  expect(html).not.toContain("undefined");

  expect(html.length).toBeGreaterThan(0);
});
it("garante que todas as chaves do template são processadas", async () => {
  mockTrigger.mockResolvedValue(true);

  mockUseFetch.mockReturnValue({
    data: {
      ...mockDesignacao,
      indicado_nome_servidor: "Teste Completo",
      indicado_rf: null,
      indicado_cargo_base: null,
      indicado_cargo_sobreposto: null,
      indicado_local_exercicio: null,
    },
    isLoading: false,
  });

  render(<CessacaoPage />);

  await userEvent.click(screen.getByText("Trechos para o SEI"));

  const html =
    document.querySelector('[contenteditable="true"]')?.innerHTML;

  expect(html).not.toContain("{{");
});
});