import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import AnularApostilaPage from "./page";

const pushMock = vi.fn();
const messageSuccessMock = vi.fn();
const messageErrorMock = vi.fn();
const triggerMock = vi.fn();
const resetMock = vi.fn();
const gerarHtmlPortariaMock = vi.fn((texto: string) => `HTML(${texto})`);

let mockId = "1";
let mockIsLoading = false;
let mockApostila: any = null;
let formValues = {
  apostila: {
    numero_sei: "SEI-NOVO",
    doc: "DOC-NOVO",
    observacao: "Obs teste",
  },
};

const getDadosPortariaMock = vi.fn((value?: unknown) => ({ numero_portaria: "PORT-D", value }));
const getDadosPortariaCessacaoMock = vi.fn((value?: unknown) => ({ numero_portaria: "PORT-C", value }));
const getDadosIndicadoMock = vi.fn((value?: unknown) => ({ nome_servidor: "Servidor resumo", value }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({ get: () => mockId }),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => () => ({}),
}));

vi.mock("@/hooks/useVisualizarApostilas", () => ({
  useFetchApostilasById: () => ({
    data: mockApostila,
    isLoading: mockIsLoading,
  }),
}));

vi.mock("@/utils/portarias/templates", () => ({
  TEMPLATE_APOSTILA:
    "SEI={{sei}}|ATO={{ato_apostilado}}|PORT={{portaria_designacao}}|ANO={{ano}}|DOC={{doc_designacao}}|NOME={{nome_indicado}}",
}));

vi.mock("@/utils/portarias/formatadores", () => ({
  nameToCamelCase: (value: string) => value,
  nameToCamelCaseUe: (value: string) => value,
  formatarRF: (value: string) => value,
}));

vi.mock("@/utils/designacao/getDadosPortaria", () => ({
  getDadosPortaria: (value: unknown) => getDadosPortariaMock(value),
}));

vi.mock("@/utils/cessacao/getDadosPortaria", () => ({
  getDadosPortariaCessacao: (value: unknown) => getDadosPortariaCessacaoMock(value),
}));

vi.mock("@/utils/ServidorIndicado/getDadosIndicado", () => ({
  getDadosIndicado: (value: unknown) => getDadosIndicadoMock(value),
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  default: ({ title }: { title: ReactNode }) => (
    <div>
      <div data-testid="page-header">PageHeader</div>
      <div>{title}</div>
    </div>
  ),
}));

vi.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children }: { children: ReactNode }) => <div>{children}</div>,
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
  default: ({ dadosIndicado, dadosPortaria, dadosPortariaCessacao }: any) => (
    <div data-testid="blocos-designacao">
      {dadosIndicado ? "tem-indicado" : "sem-indicado"}-
      {dadosPortaria ? "tem-portaria" : "sem-portaria"}-
      {dadosPortariaCessacao ? "tem-cessacao" : "sem-cessacao"}
    </div>
  ),
}));

vi.mock("@/components/dashboard/apostila/PortariaApostilaFields/PortariaAnularApostilaFields", () => ({
  __esModule: true,
  default: ({ tipo_portaria }: { tipo_portaria: string }) => (
    <div data-testid="portaria-fields">{tipo_portaria}</div>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock("@/components/dashboard/EditorTextoSEI/EditorTextoSEI", () => ({
  __esModule: true,
  default: ({ html }: { html: string }) => <div data-testid="editor">{html}</div>,
  gerarHtmlPortaria: (texto: string) => gerarHtmlPortariaMock(texto),
}));

vi.mock("antd", () => ({
  Card: ({ title, children }: { title: ReactNode; children: ReactNode }) => (
    <div>
      <div>{title}</div>
      {children}
    </div>
  ),
  message: {
    success: (value: string) => messageSuccessMock(value),
    error: (value: string) => messageErrorMock(value),
  },
}));

vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loading">loading</div>,
}));

vi.mock("react-hook-form", async () => {
  const actual = await vi.importActual<any>("react-hook-form");

  return {
    ...actual,
    useForm: () => ({
      handleSubmit: (fn: (values: unknown) => void) => (e?: Event) => {
        e?.preventDefault?.();
        fn(formValues);
      },
      getValues: () => formValues,
      trigger: (...args: unknown[]) => triggerMock(...args),
      reset: (...args: unknown[]) => resetMock(...args),
      control: {},
      formState: { errors: {} },
    }),
    FormProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

const createApostila = () => ({
  id: 10,
  designacao: {
    dre_nome: "DRE TESTE",
    codigo_hierarquico: "EH 01",
    numero_portaria: "123",
    ano_vigente: "2024",
    doc: "DOC-DES",
    sei_numero: "SEI-DES",
    indicado_nome_servidor: "Maria Silva",
    indicado_rf: "1234567",
    indicado_vinculo: "Efetivo",
    indicado_cargo_base: "PROFESSOR",
    indicado_cargo_sobreposto: "COORDENADOR",
    indicado_local_exercicio: "UE X",
    cessacao: {
      numero_portaria: "999",
      ano_vigente: "2026",
      doc: "DOC-CES",
      sei_numero: "SEI-CES",
    },
  },
  cessacao: null,
});

describe("AnularApostilaPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockId = "1";
    mockIsLoading = false;
    mockApostila = createApostila();
    formValues = {
      apostila: {
        numero_sei: "SEI-NOVO",
        doc: "DOC-NOVO",
        observacao: "Obs teste",
      },
    };
    triggerMock.mockResolvedValue(true);
  });

  it("renderiza estado de loading", () => {
    mockIsLoading = true;

    render(<AnularApostilaPage />);

    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("renderiza card como Designação quando não há cessação", () => {
    render(<AnularApostilaPage />);

    expect(screen.getByText("Anular Apostila")).toBeInTheDocument();
    expect(screen.getByText("Designação")).toBeInTheDocument();
    expect(screen.getByTestId("portaria-fields")).toHaveTextContent("designacao");
    expect(getDadosPortariaMock).toHaveBeenCalledWith(mockApostila.designacao);
    expect(getDadosPortariaCessacaoMock).toHaveBeenCalledWith(mockApostila);
    expect(getDadosIndicadoMock).toHaveBeenCalledWith(mockApostila.designacao);
    expect(resetMock).toHaveBeenCalledTimes(1);
  });

  it("renderiza card como Cessação quando apostila possui cessação", () => {
    mockApostila = { ...createApostila(), cessacao: { id: 99 } };

    render(<AnularApostilaPage />);

    expect(screen.getByText("Cessação")).toBeInTheDocument();
    expect(screen.getByTestId("portaria-fields")).toHaveTextContent("cessacao");
  });

  

 

  it("não gera texto se validação do formulário falhar", async () => {
    triggerMock.mockResolvedValue(false);

    render(<AnularApostilaPage />);

    fireEvent.click(screen.getByText("Gerar texto SEI"));

    await waitFor(() => expect(triggerMock).toHaveBeenCalledWith("apostila"));
    expect(gerarHtmlPortariaMock).not.toHaveBeenCalled();
    expect(screen.queryByTestId("editor")).not.toBeInTheDocument();
  });

  it("submete com sucesso e redireciona", async () => {
    render(<AnularApostilaPage />);

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(messageSuccessMock).toHaveBeenCalledWith("Apostila salva com sucesso!");
      expect(pushMock).toHaveBeenCalledWith("/pages/atos-administrativos");
    });
  });

  it("mostra mensagem de erro quando ocorre falha inesperada no submit", async () => {
    messageSuccessMock.mockImplementationOnce(() => {
      throw new Error("falha ao salvar");
    });

    render(<AnularApostilaPage />);

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(messageErrorMock).toHaveBeenCalledWith("falha ao salvar");
    });
  });
});
