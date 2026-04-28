import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import ApostilaPage from "./page";
import * as ReactHookForm from "react-hook-form";

let mockIsLoading = false;

const pushMock = vi.fn();
const mutateAsyncMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({ get: () => "1" }),
}));

vi.mock("@/hooks/useSalvarApostila", () => ({
  useSalvarApostila: () => ({
    mutateAsync: mutateAsyncMock,
  }),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => () => ({}),
}));

const mockDesignacao = {
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
  cessacao: null as any,
};

let mockDesignacaoAtual = mockDesignacao;

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
  Accordion: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/dashboard/Designacao/CustomAccordionItem", () => ({
  CustomAccordionItem: ({ children }: any) => <div>{children}</div>,
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
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/form", () => ({
  FormField: ({ render }: any) =>
    render({
      field: {
        value: "designacao",
        onChange: vi.fn(),
      },
    }),
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormControl: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/radio-group", () => ({
  RadioGroup: ({ children }: any) => <div>{children}</div>,
  RadioGroupItem: () => <input type="radio" />,
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("antd", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  message: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Tooltip: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loading" />,
}));

vi.mock("react-hook-form", async () => {
  const actual = await vi.importActual<any>("react-hook-form");

  return {
    ...actual,
    useForm: () => ({
      handleSubmit: (fn: any) => (e: any) => {
        e?.preventDefault?.();
        fn({
          apostila: {
            numero_sei: "123",
            doc: "DOC",
            tipo_apostila: "designacao",
            observacoes: "",
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
          tipo_apostila: "designacao",
          observacoes: "",
        },
      }),
      reset: vi.fn(),
    }),
    FormProvider: ({ children }: any) => <div>{children}</div>,
  };
});

describe("ApostilaPage", () => {
  beforeEach(() => {
    mockIsLoading = false;
    mutateAsyncMock.mockReset();
    pushMock.mockReset();
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

  it("mostra mensagem sem cessação", () => {
    render(<ApostilaPage />);
    expect(
      screen.getByText("Não há portaria de cessão")
    ).toBeInTheDocument();
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
      handleSubmit: (fn: any) => (e: any) => {
        e?.preventDefault?.();
      },
      control: {},
      formState: { errors: {} },
      trigger: triggerMock, // ✅ AQUI
      getValues: vi.fn(),
      reset: vi.fn(),
    });

    render(<ApostilaPage />);

    fireEvent.click(screen.getByText("Trechos para o SEI"));

    await waitFor(() => {
      expect(triggerMock).toHaveBeenCalled();
      expect(screen.queryByTestId("editor")).not.toBeInTheDocument();
    });
  });

  it("não quebra quando designacao é null", () => {
    mockDesignacaoAtual = null as any;

    render(<ApostilaPage />);

    expect(screen.getByText("Header")).toBeInTheDocument();
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
      handleSubmit: (fn: any) => (e: any) => {
        e?.preventDefault?.();
        fn({
          apostila: {
            numero_sei: "123",
            doc: "DOC",
            tipo_apostila: "cessacao",
            observacoes: "",
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
          tipo_apostila: "cessacao",
          observacoes: "",
        },
      }),
      reset: vi.fn(),
    });

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
        } as any;

        render(<ApostilaPage />);

        fireEvent.click(screen.getByText("Trechos para o SEI"));

        await waitFor(() => {
          expect(screen.getByTestId("editor")).toBeInTheDocument();
        });
      });

      it("reseta o form quando designacao muda", () => {
    const resetMock = vi.fn();

    vi.spyOn(ReactHookForm, "useForm").mockReturnValue({
      handleSubmit: (fn: any) => (e: any) => e?.preventDefault?.(),
      control: {},
      formState: { errors: {} },
      trigger: vi.fn().mockResolvedValue(true),
      getValues: vi.fn(),
      reset: resetMock,
    });

    render(<ApostilaPage />);

    expect(resetMock).toHaveBeenCalled();
  });

  it("usa fallback quando tipo é cessacao mas não existe cessacao", async () => {
    mockDesignacaoAtual = {
      ...mockDesignacao,
      cessacao: null,
    };

    vi.spyOn(ReactHookForm, "useForm").mockReturnValue({
      handleSubmit: (fn: any) => (e: any) => {
        e?.preventDefault?.();
        fn({
          apostila: {
            numero_sei: "123",
            doc: "DOC",
            tipo_apostila: "cessacao",
            observacoes: "",
          },
        });
      },
      control: {},
      formState: { errors: {} },
      trigger: vi.fn().mockResolvedValue(true),
      getValues: () => ({
        apostila: {
          tipo_apostila: "cessacao",
        },
      }),
      reset: vi.fn(),
    });

    render(<ApostilaPage />);

    fireEvent.click(screen.getByText("Trechos para o SEI"));

    await waitFor(() => {
      expect(screen.getByTestId("editor")).toBeInTheDocument();
    });
  });
});