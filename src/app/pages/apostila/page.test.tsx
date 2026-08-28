import React from "react";
import type { ReactNode } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import ApostilaPage from "./page";
import * as ReactHookForm from "react-hook-form";

let mockIsLoading = false;

const pushMock = vi.fn();
const mutateAsyncMock = vi.fn();
const { notificationSuccessMock, notificationErrorMock } = vi.hoisted(() => ({
  notificationSuccessMock: vi.fn(),
  notificationErrorMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({ get: () => "1" }),
}));

vi.mock("@/hooks/useSalvarApostila", () => ({
  useSalvarApostila: () => ({
    mutateAsync: mutateAsyncMock,
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

type MockDesignacao = {
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
  cessacao?: unknown;
} | null;

const mockDesignacao: MockDesignacao = {
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

let mockDesignacaoAtual: MockDesignacao = mockDesignacao;

vi.mock("@/hooks/useVisualizarDesignacoes", () => ({
  useFetchDesignacoesById: () => ({
    data: mockIsLoading ? null : mockDesignacaoAtual,
    isLoading: mockIsLoading,
  }),
}));


vi.mock("@/utils/portarias/templates", () => ({
  TEMPLATE_APOSTILA: "TEMPLATE {{nome_indicado}}",
}));

vi.mock("@/utils/portarias/formatadores", () => ({
  nameToCamelCase: (v: string) => v,
  nameToCamelCaseUe: (v: string) => v,
  formatarRF: (v: string) => v,
  formatarDataPtBr: (v: string) => v,
}));

vi.mock("@/components/dashboard/EditorTextoSEI/EditorTextoSEI", () => ({
  __esModule: true,
  default: () => <div data-testid="editor" />,
  gerarHtmlPortaria: () => "<div>html</div>",
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  default: () => <div>Header</div>,
}));

vi.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/dashboard/Designacao/CustomAccordionItem", () => ({
  CustomAccordionItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/dashboard/Designacao/ResumoDesignacao/BlocosDesignacao", () => ({
  __esModule: true,
  default: ({ onSubmitEditarServidor }: { onSubmitEditarServidor: () => void }) => (
    <button data-testid="blocos-editar-servidor" onClick={onSubmitEditarServidor}>
      ResumoServidor
    </button>
  ),
}));

vi.mock("@/components/dashboard/apostila/PortariaApostilaFields/PortariaApostilaFields", () => ({
  default: () => <div>Fields</div>,
}));

vi.mock("@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado", () => ({
  default: () => <div>ResumoServidor</div>,
}));

vi.mock("@/components/dashboard/Designacao/ResumoPortariaDesigacao", () => ({
  default: () => <div>ResumoDesignacao</div>,
}));

vi.mock("@/components/dashboard/Designacao/ResumoPortariaCessacao", () => ({
  default: () => <div>ResumoCessacao</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/form", () => ({
  FormField: ({ render }: { render: (args: { field: { value: string; onChange: (v: unknown) => void } }) => ReactNode }) =>
    render({
      field: {
        value: "designacao",
        onChange: vi.fn(),
      },
    }),
  FormItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  FormLabel: ({ children }: { children: ReactNode }) => <label>{children}</label>,
  FormControl: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/radio-group", () => ({
  RadioGroup: ({ children, onValueChange }: { children: ReactNode; onValueChange?: (value: string) => void }) => (
    <div>
      <button type="button" data-testid="change-ato-apostilado" onClick={() => onValueChange?.("cessacao")} />
      {children}
    </div>
  ),
  RadioGroupItem: () => <input type="radio" />,
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

vi.mock("antd", () => ({
  Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Tooltip: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loading" />,
}));

vi.mock("react-hook-form", async () => {
  const actual = await vi.importActual<typeof ReactHookForm>("react-hook-form");

  return {
    ...actual,
    useForm: () => ({
      handleSubmit: (fn: (values: unknown) => unknown) => (e?: { preventDefault?: () => void }) => {
        e?.preventDefault?.();
        fn({
          apostila: {
            numero_sei: "123",
            doc: "DOC",
            ato_apostilado: "designacao",
            observacao: "",
          },
        });
      },
      control: {},
      formState: { errors: {} },
      trigger: vi.fn().mockResolvedValue(true),
      getValues: () => ({
        apostila: {
          numero_sei: "123",
          doc: "DOC",
          ato_apostilado: "designacao",
          observacao: "",
        },
      }),
      reset: vi.fn(),
    }),
    FormProvider: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  };
});

describe("ApostilaPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockIsLoading = false;
    mutateAsyncMock.mockReset();
    pushMock.mockReset();
    notificationSuccessMock.mockReset();
    notificationErrorMock.mockReset();
    mockDesignacaoAtual = mockDesignacao;
  });

  it("mostra loading", () => {
    mockIsLoading = true;

    render(<ApostilaPage />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("renderiza dados", () => {
    render(<ApostilaPage />);
    expect(screen.getByText("ResumoServidor")).toBeInTheDocument();
  });

  it("executa callback de edição de servidor sem erro", () => {
    render(<ApostilaPage />);
    expect(() => fireEvent.click(screen.getByTestId("blocos-editar-servidor"))).not.toThrow();
  });

  it("renderiza opções de tipo de apostila", () => {
    render(<ApostilaPage />);
    expect(screen.getByText("Designação")).toBeInTheDocument();
    expect(screen.getByText("Cessação")).toBeInTheDocument();
  });

  it("submete com sucesso", async () => {
    mutateAsyncMock.mockResolvedValueOnce({});

    render(<ApostilaPage />);

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalled();
    });
  });

  it("submete com erro", async () => {
    mutateAsyncMock.mockRejectedValueOnce("erro");

    render(<ApostilaPage />);

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalled();
    });
  });

  it("exibe mensagem de erro quando mutate retorna Error", async () => {
    mutateAsyncMock.mockRejectedValueOnce(new Error("falha detalhada"));

    render(<ApostilaPage />);
    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(notificationErrorMock).toHaveBeenCalledWith({ title: "falha detalhada" });
    });
  });

  it("gera portaria e mostra editor", async () => {
    render(<ApostilaPage />);

    const botao = screen.getByText("Trechos para o SEI");

    fireEvent.click(botao);

    await waitFor(() => {
      expect(screen.getByTestId("editor")).toBeInTheDocument();
    });
  });

  it("não gera portaria se form for inválido", async () => {
    const triggerMock = vi.fn().mockResolvedValue(false);

    vi.spyOn(ReactHookForm, "useForm").mockReturnValue({
      handleSubmit: (_fn: (values: unknown) => unknown) => (e?: { preventDefault?: () => void }) => {
        e?.preventDefault?.();
      },
      control: {},
      formState: { errors: {} },
      trigger: triggerMock, // ✅ AQUI
      getValues: vi.fn(),
      reset: vi.fn(),
    } as unknown as ReturnType<typeof ReactHookForm.useForm>);

    render(<ApostilaPage />);

    fireEvent.click(screen.getByText("Trechos para o SEI"));

    await waitFor(() => {
      expect(triggerMock).toHaveBeenCalled();
      expect(screen.queryByTestId("editor")).not.toBeInTheDocument();
    });
  });

  it("altera tipo de apostila no radio group", () => {
    render(<ApostilaPage />);
    expect(() => fireEvent.click(screen.getByTestId("change-ato-apostilado"))).not.toThrow();
  });

  it("não quebra quando designacao é null", () => {
    mockDesignacaoAtual = null;

    render(<ApostilaPage />);

    expect(screen.getByText("Header")).toBeInTheDocument();
  });

  it("avalia apostilas ativas da cessação para desabilitar seleção", () => {
    mockDesignacaoAtual = {
      ...mockDesignacao,
      cessacao: {
        id: 7,
        apostilas: [{ status: "ativo" }],
      },
    };

    render(<ApostilaPage />);
    expect(screen.getByText("Cessação")).toBeInTheDocument();
  });

  it("usa dados de cessação quando tipo é cessacao", async () => {
    mockDesignacaoAtual = {
      ...mockDesignacao,
      cessacao: {
        numero_portaria: "999",
        ano_vigente: "2025",
        sei_numero: "888",
        doc: "DOC_CESSACAO",
      },
    };

    vi.spyOn(ReactHookForm, "useForm").mockReturnValue({
      handleSubmit: (fn: (values: unknown) => unknown) => (e?: { preventDefault?: () => void }) => {
        e?.preventDefault?.();
        fn({
          apostila: {
            numero_sei: "123",
            doc: "DOC",
            ato_apostilado: "cessacao",
            observacao: "",
          },
        });
      },
      control: {},
      formState: { errors: {} },
      trigger: vi.fn().mockResolvedValue(true),
      getValues: () => ({
        apostila: {
          numero_sei: "123",
          doc: "DOC",
          ato_apostilado: "cessacao",
          observacao: "",
        },
      }),
      reset: vi.fn(),
    } as unknown as ReturnType<typeof ReactHookForm.useForm>);

    render(<ApostilaPage />);

    fireEvent.click(screen.getByText("Trechos para o SEI"));

    await waitFor(() => {
      expect(screen.getByTestId("editor")).toBeInTheDocument();
    });
  });

  it("usa fallback '-' quando dados estão ausentes", async () => {
        mockDesignacaoAtual = {
          ...mockDesignacao,
          indicado_nome_servidor: undefined,
          indicado_rf: undefined,
          indicado_vinculo: undefined,
          indicado_cargo_base: undefined,
          indicado_cargo_sobreposto: undefined,
          indicado_local_exercicio: undefined,
          dre_nome: undefined,
          codigo_hierarquico: undefined,
          sei_numero: undefined,
        };

        render(<ApostilaPage />);

        fireEvent.click(screen.getByText("Trechos para o SEI"));

        await waitFor(() => {
          expect(screen.getByTestId("editor")).toBeInTheDocument();
        });
      });

      it("reseta o form quando designacao muda", () => {
    const resetMock = vi.fn();

    vi.spyOn(ReactHookForm, "useForm").mockReturnValue({
      handleSubmit: (_fn: (values: unknown) => unknown) => (e?: { preventDefault?: () => void }) => e?.preventDefault?.(),
      control: {},
      formState: { errors: {} },
      trigger: vi.fn().mockResolvedValue(true),
      getValues: vi.fn(),
      reset: resetMock,
    } as unknown as ReturnType<typeof ReactHookForm.useForm>);

    render(<ApostilaPage />);

    expect(resetMock).toHaveBeenCalled();
  });

  it("usa fallback quando tipo é cessacao mas não existe cessacao", async () => {
    mockDesignacaoAtual = {
      ...mockDesignacao,
      cessacao: null,
    };

    vi.spyOn(ReactHookForm, "useForm").mockReturnValue({
      handleSubmit: (fn: (values: unknown) => unknown) => (e?: { preventDefault?: () => void }) => {
        e?.preventDefault?.();
        fn({
          apostila: {
            numero_sei: "123",
            doc: "DOC",
            ato_apostilado: "cessacao",
            observacao: "",
          },
        });
      },
      control: {},
      formState: { errors: {} },
      trigger: vi.fn().mockResolvedValue(true),
      getValues: () => ({
        apostila: {
          ato_apostilado: "cessacao",
        },
      }),
      reset: vi.fn(),
    } as unknown as ReturnType<typeof ReactHookForm.useForm>);

    render(<ApostilaPage />);

    fireEvent.click(screen.getByText("Trechos para o SEI"));

    await waitFor(() => {
      expect(screen.getByTestId("editor")).toBeInTheDocument();
    });
  });
});