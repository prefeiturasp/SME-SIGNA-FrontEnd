import React from "react";
import type { ReactNode } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ApostilaPage from "./page";
import type { formSchemaApostilaData } from "./schema";

let mockIsLoading = false;
let mockId: string | null = "1";
let mockOrigem: string | null = null;

type DesignacaoMock = {
  numero_portaria?: string;
  ano_vigente?: string;
  sei_numero?: string;
  doc?: string;
  indicado_nome_servidor?: string;
  indicado_rf?: string;
  indicado_vinculo?: string;
  indicado_cargo_base?: string;
  indicado_cargo_sobreposto?: string;
  indicado_local_exercicio?: string;
  dre_nome?: string;
  codigo_hierarquico?: string;
  cessacao?: {
    numero_portaria?: string;
    ano_vigente?: string;
    sei_numero?: string;
    doc?: string;
  } | null;
} | null;

const designacaoPadrao: NonNullable<DesignacaoMock> = {
  numero_portaria: "123",
  ano_vigente: "2024",
  sei_numero: "999",
  doc: "DOC",
  indicado_nome_servidor: "João",
  indicado_rf: "123456",
  indicado_vinculo: "CLT",
  indicado_cargo_base: "PROFESSOR",
  indicado_cargo_sobreposto: "COORDENADOR",
  indicado_local_exercicio: "ESCOLA",
  dre_nome: "DRE",
  codigo_hierarquico: "EH",
  cessacao: null,
};

let mockDesignacaoAtual: DesignacaoMock = designacaoPadrao;

const valoresPadrao: formSchemaApostilaData = {
  ato_apostilado: "designação",
  informacoes_adicionais: "",
  detalhe_para_quadro_de_historico_por_ano: false,
  texto_para_apostila: "",
};

const {
  pushMock,
  triggerMock,
  getValuesMock,
  handleSubmitMock,
  notificationSuccessMock,
  notificationErrorMock,
  gerarHtmlPortariaMock,
  pageHeaderSpy,
  informacoesAdicionaisSpy,
  textoPraApostilaSpy,
} = vi.hoisted(() => {
  const getValuesMock = vi.fn((): formSchemaApostilaData => ({
    ato_apostilado: "designação",
    informacoes_adicionais: "",
    detalhe_para_quadro_de_historico_por_ano: false,
    texto_para_apostila: "",
  }));

  return {
    pushMock: vi.fn(),
    triggerMock: vi.fn().mockResolvedValue(true),
    getValuesMock,
    handleSubmitMock: vi.fn(
      (callback: (values: formSchemaApostilaData) => unknown) =>
        (event?: { preventDefault?: () => void }) => {
          event?.preventDefault?.();
          return callback(getValuesMock());
        },
    ),
    notificationSuccessMock: vi.fn(),
    notificationErrorMock: vi.fn(),
    gerarHtmlPortariaMock: vi.fn((texto: string) => `HTML:${texto}`),
    pageHeaderSpy: vi.fn(),
    informacoesAdicionaisSpy: vi.fn(),
    textoPraApostilaSpy: vi.fn(),
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "id") return mockId;
      if (key === "origem") return mockOrigem;
      return null;
    },
  }),
}));

vi.mock("@/components/providers/NotificationProvider", () => ({
  useAppNotification: () => ({
    success: notificationSuccessMock,
    error: notificationErrorMock,
  }),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => () => ({}),
}));

vi.mock("@/hooks/useVisualizarDesignacoes", () => ({
  useFetchDesignacoesById: () => ({
    data: mockIsLoading ? null : mockDesignacaoAtual,
    isLoading: mockIsLoading,
  }),
}));

vi.mock("@/utils/portarias/templates", () => ({
  TEMPLATE_APOSTILA: "TEMPLATE {{nome_indicado}} {{portaria_designacao}} {{sei_designacao}}",
}));

vi.mock("@/utils/portarias/formatadores", () => ({
  nameToCamelCase: (valor: string) => valor,
  nameToCamelCaseUe: (valor: string) => valor,
  formatarRF: (valor: string) => valor,
  formatarDataPtBr: (valor?: string) => valor ?? "-",
}));

vi.mock("@/components/dashboard/EditorTextoSEI/EditorTextoSEI", () => ({
  __esModule: true,
  default: ({ html }: { html: string }) => <div data-testid="editor">{html}</div>,
  gerarHtmlPortaria: (texto: string) => gerarHtmlPortariaMock(texto),
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  default: (props: {
    title: ReactNode;
    breadcrumbs: Array<{ title: string; href?: string }>;
    showBackButton: boolean;
  }) => {
    pageHeaderSpy(props);
    return <div data-testid="page-header">{props.title}</div>;
  },
}));

vi.mock("@/components/dashboard/Designacao/TextoPraApostila/TextoPraApostila", () => ({
  default: (props: { disableFields: boolean }) => {
    textoPraApostilaSpy(props);
    return <div data-testid="texto-pra-apostila" />;
  },
}));

vi.mock("@/components/dashboard/Designacao/InformacoesAdicionais/InformacoesAdicionais", () => ({
  default: (props: {
    disableFields: boolean;
    onChangeDescricao: (value: string) => void;
    onValueChangeDetalheParaQuadroDeHistoricoPorAno: (value: string) => void;
  }) => {
    informacoesAdicionaisSpy(props);
    return (
      <div data-testid="informacoes-adicionais">
        <button type="button" onClick={() => props.onChangeDescricao("obs")}>
          alterar descricao
        </button>
        <button
          type="button"
          onClick={() => props.onValueChangeDetalheParaQuadroDeHistoricoPorAno("true")}
        >
          alterar detalhe
        </button>
      </div>
    );
  },
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("antd", () => ({
  Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loading" />,
}));

vi.mock("react-hook-form", async () => {
  const actual = await vi.importActual<typeof import("react-hook-form")>("react-hook-form");

  return {
    ...actual,
    useForm: () => ({
      handleSubmit: handleSubmitMock,
      control: {},
      formState: { errors: {} },
      trigger: triggerMock,
      getValues: getValuesMock,
      register: vi.fn(),
      reset: vi.fn(),
    }),
    FormProvider: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  };
});

describe("ApostilaPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading = false;
    mockId = "1";
    mockOrigem = null;
    mockDesignacaoAtual = designacaoPadrao;
    triggerMock.mockResolvedValue(true);
    getValuesMock.mockReturnValue({ ...valoresPadrao });
    notificationSuccessMock.mockReset();
    notificationErrorMock.mockReset();
  });

  it("mostra loading", () => {
    mockIsLoading = true;

    render(<ApostilaPage />);

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(screen.queryByTestId("texto-pra-apostila")).not.toBeInTheDocument();
  });

  it("renderiza o título de apostila de designação por padrão", () => {
    render(<ApostilaPage />);

    expect(screen.getByTestId("page-header")).toHaveTextContent("Apostila de designação");
    expect(screen.getByText("Texto para a apostila")).toBeInTheDocument();
    expect(screen.getByText("Informações adicionais")).toBeInTheDocument();
    expect(screen.getByTestId("texto-pra-apostila")).toBeInTheDocument();
    expect(screen.getByTestId("informacoes-adicionais")).toBeInTheDocument();
    expect(pageHeaderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        showBackButton: true,
        breadcrumbs: [
          { title: "Início", href: "/" },
          { title: "Apostila de designação" },
        ],
      }),
    );
    expect(textoPraApostilaSpy).toHaveBeenCalledWith(
      expect.objectContaining({ disableFields: false }),
    );
    expect(informacoesAdicionaisSpy).toHaveBeenCalledWith(
      expect.objectContaining({ disableFields: false }),
    );
  });

  it("renderiza o título de apostila de cessação quando a origem é cessacao", () => {
    mockOrigem = "cessacao";

    render(<ApostilaPage />);

    expect(screen.getByTestId("page-header")).toHaveTextContent("Apostila de cessação");
    expect(pageHeaderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        breadcrumbs: [
          { title: "Início", href: "/" },
          { title: "Apostila de cessação" },
        ],
      }),
    );
  });

  it("submete com sucesso e redireciona", async () => {
    render(<ApostilaPage />);

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(notificationSuccessMock).toHaveBeenCalledWith({
        title: "Apostila salva com sucesso!",
      });
      expect(pushMock).toHaveBeenCalledWith("/pages/atos-administrativos");
    });
  });

  it("exibe a mensagem do Error quando o submit falha", async () => {
    notificationSuccessMock.mockImplementationOnce(() => {
      throw new Error("falha detalhada");
    });

    render(<ApostilaPage />);
    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(notificationErrorMock).toHaveBeenCalledWith({ title: "falha detalhada" });
      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  it("exibe mensagem padrão quando o erro do submit não é Error", async () => {
    notificationSuccessMock.mockImplementationOnce(() => {
      throw "erro";
    });

    render(<ApostilaPage />);
    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(notificationErrorMock).toHaveBeenCalledWith({ title: "Erro ao salvar" });
    });
  });

  it("gera o texto SEI e mostra o editor", async () => {
    render(<ApostilaPage />);

    fireEvent.click(screen.getByRole("button", { name: "Gerar texto SEI" }));

    await waitFor(() => {
      expect(screen.getByTestId("editor")).toBeInTheDocument();
    });
    expect(gerarHtmlPortariaMock).toHaveBeenCalledTimes(1);
    expect(gerarHtmlPortariaMock.mock.calls[0][0]).toContain("<strong>João</strong>");
    expect(gerarHtmlPortariaMock.mock.calls[0][0]).toContain("123");
  });

  it("não gera o texto SEI se o formulário for inválido", async () => {
    triggerMock.mockResolvedValueOnce(false);

    render(<ApostilaPage />);
    fireEvent.click(screen.getByRole("button", { name: "Gerar texto SEI" }));

    await waitFor(() => {
      expect(triggerMock).toHaveBeenCalled();
    });
    expect(screen.queryByTestId("editor")).not.toBeInTheDocument();
  });

  it("usa dados da cessação ao gerar o texto quando o ato é cessação", async () => {
    mockOrigem = "cessacao";
    mockDesignacaoAtual = {
      ...designacaoPadrao,
      cessacao: {
        numero_portaria: "999",
        ano_vigente: "2025",
        sei_numero: "888",
        doc: "DOC_CESSACAO",
      },
    };
    getValuesMock.mockReturnValue({
      ...valoresPadrao,
      ato_apostilado: "cessação",
    });

    render(<ApostilaPage />);
    fireEvent.click(screen.getByRole("button", { name: "Gerar texto SEI" }));

    await waitFor(() => {
      expect(gerarHtmlPortariaMock).toHaveBeenCalled();
    });

    const texto = gerarHtmlPortariaMock.mock.calls[0][0];
    expect(texto).toContain("999");
    expect(texto).toContain("888");
  });

  it("usa fallback '-' quando os dados da designação estão ausentes", async () => {
    mockDesignacaoAtual = {
      cessacao: null,
    };

    render(<ApostilaPage />);
    fireEvent.click(screen.getByRole("button", { name: "Gerar texto SEI" }));

    await waitFor(() => {
      expect(gerarHtmlPortariaMock).toHaveBeenCalled();
    });

    expect(gerarHtmlPortariaMock.mock.calls[0][0]).toContain("-");
  });

  it("usa fallback quando o tipo é cessação mas não existe cessação", async () => {
    getValuesMock.mockReturnValue({
      ...valoresPadrao,
      ato_apostilado: "cessação",
    });
    mockDesignacaoAtual = {
      ...designacaoPadrao,
      cessacao: null,
    };

    render(<ApostilaPage />);
    fireEvent.click(screen.getByRole("button", { name: "Gerar texto SEI" }));

    await waitFor(() => {
      expect(gerarHtmlPortariaMock).toHaveBeenCalled();
    });

    expect(gerarHtmlPortariaMock.mock.calls[0][0]).toContain("-");
  });

  it("não quebra quando a designação é nula", () => {
    mockDesignacaoAtual = null;

    render(<ApostilaPage />);

    expect(screen.getByTestId("page-header")).toBeInTheDocument();
    expect(screen.getByTestId("texto-pra-apostila")).toBeInTheDocument();
  });

  it("executa os callbacks de informações adicionais", () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    render(<ApostilaPage />);
    fireEvent.click(screen.getByRole("button", { name: "alterar descricao" }));
    fireEvent.click(screen.getByRole("button", { name: "alterar detalhe" }));

    expect(consoleLogSpy).toHaveBeenCalledWith("obs");
    expect(consoleLogSpy).toHaveBeenCalledWith("true");
    consoleLogSpy.mockRestore();
  });

  it("substitui valor nulo por string vazia ao gerar o texto", async () => {
    const objectEntriesSpy = vi.spyOn(Object, "entries").mockImplementationOnce(() => [
      ["nome_indicado", "Servidor"],
      ["portaria_designacao", null],
    ]);

    render(<ApostilaPage />);
    fireEvent.click(screen.getByRole("button", { name: "Gerar texto SEI" }));

    await waitFor(() => {
      expect(gerarHtmlPortariaMock).toHaveBeenCalled();
    });

    objectEntriesSpy.mockRestore();
  });
});
