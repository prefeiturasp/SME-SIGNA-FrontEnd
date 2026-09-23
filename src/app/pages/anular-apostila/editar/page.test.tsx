import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import EditarAnularApostilaPage, { gerarFormValuesAnularApostila } from "./page";
import type { InsubsistenciaRead } from "@/types/insubsistencia";

const pushMock = vi.fn();
const notificationSuccessMock = vi.fn();
const notificationErrorMock = vi.fn();
const triggerMock = vi.fn();
const resetMock = vi.fn();
const fetchByIdMock = vi.fn();
const formatarRFMock = vi.fn((value: string) => `RF(${value})`);
const getDadosPortariaMock = vi.fn((value?: unknown) => ({ origem: "designacao", value }));
const getDadosPortariaCessacaoMock = vi.fn((value?: unknown) => ({ origem: "cessacao", value }));
const getDadosIndicadoMock = vi.fn((value?: unknown) => ({ origem: "indicado", value }));
const gerarHtmlPortariaMock = vi.fn((texto: string) => `HTML:${texto}`);
const mutateAsyncMock = vi.fn();

let mockParams: Record<string, string | null> = { id: "50", atoPai: "10" };
let mockIsLoading = false;
let mockInsubsistencia: Record<string, unknown> | null = null;
let formValues: Record<string, unknown> = {};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({ get: (key: string) => mockParams[key] ?? null }),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => () => ({}),
}));

vi.mock("@/hooks/useVisualizarInsubsistencia", () => ({
  useFetchInsubsistenciasById: (id: number) => {
    fetchByIdMock(id);
    return {
      data: mockInsubsistencia,
      isLoading: mockIsLoading,
    };
  },
}));

vi.mock("@/utils/portarias/templates", () => ({
  TEMPLATE_ANULAR_APOSTILA:
    "PORT={{portaria}}|ANO={{ano}}|SEI={{sei}}|PAP={{portaria_apostilada}}|AAP={{ano_apostilado}}|DOCA={{doc_apostilado}}|SEIA={{sei_apostilado}}|NOME={{nome_indicado}}|RF={{rf}}|DRE={{dre}}|VINC={{vinculo}}|TEXTO={{texto_para_apostila}}",
}));

vi.mock("@/utils/portarias/formatadores", () => ({
  formatarRF: (value: string) => formatarRFMock(value),
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

vi.mock("@/hooks/useSalvarInsubsistencias", () => ({
  useSalvarInsubsistencias: () => ({
    mutateAsync: (...args: unknown[]) => mutateAsyncMock(...args),
  }),
}));

vi.mock("@/components/providers/NotificationProvider", () => ({
  useAppNotification: () => ({
    success: notificationSuccessMock,
    error: notificationErrorMock,
  }),
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  default: ({ title }: { title: ReactNode }) => (
    <div data-testid="page-header">
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
  default: () => <div data-testid="blocos-designacao" />,
}));

vi.mock("@/components/dashboard/apostila/PortariaApostilaFields/PortariaAnularApostilaFields", () => ({
  __esModule: true,
  default: ({ tipo_portaria }: { tipo_portaria: string }) => (
    <div data-testid="portaria-fields">{tipo_portaria}</div>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => <button {...props}>{children}</button>,
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
}));

vi.mock("lucide-react", () => ({
  Loader2: ({ className }: { className?: string }) => <div data-testid="loading" className={className} />,
}));

vi.mock("react-hook-form", async () => {
  const actual = await vi.importActual<typeof import("react-hook-form")>("react-hook-form");

  return {
    ...actual,
    useForm: () => ({
      handleSubmit: (fn: (values: unknown) => unknown) => (e?: Event) => {
        e?.preventDefault?.();
        return fn(formValues);
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

const createInsubsistencia = () => ({
  id: 50,
  ato_pai_id: 10,
  numero_portaria: 999,
  ano_vigente: "2026",
  sei_numero: "SEI-ANULACAO",
  doc: "2026-05-10",
  observacoes: "Obs salva",
  texto_apostila: "É a presente portaria apostilada",
  designacao: {
    dre_nome: "DRE TESTE",
    portaria: "123",
    ano_vigente: "2024",
    doc: "2024-01-02",
    sei_numero: "SEI-DES",
    indicado_nome_servidor: "Maria Silva",
    indicado_nome_civil: "Nome Civil",
    indicado_rf: "1234567",
    indicado_vinculo: "Efetivo",
  },
  cessacao: null,
});

describe("EditarAnularApostilaPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams = { id: "50", atoPai: "10" };
    mockIsLoading = false;
    mockInsubsistencia = createInsubsistencia();
    formValues = {
      apostila_insubsistencia: {
        portaria: "999",
        ano: "2026",
        numero_sei: "SEI-ANULACAO",
        doc: new Date("2026-05-10"),
        observacao: "Obs salva",
        texto_para_apostila: "É a presente portaria apostilada",
      },
    };
    triggerMock.mockResolvedValue(true);
    mutateAsyncMock.mockResolvedValue({ id: 50 });
  });

  it("renderiza loading e usa id 0 quando query param não existe", () => {
    mockParams = { id: null, atoPai: null };
    mockIsLoading = true;
    mockInsubsistencia = null;

    render(<EditarAnularApostilaPage />);

    expect(fetchByIdMock).toHaveBeenCalledWith(0);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(screen.queryByText("Gerar texto SEI")).not.toBeInTheDocument();
    expect(resetMock).not.toHaveBeenCalled();
  });

  it("preenche o formulário com os dados da anulação existente", () => {
    render(<EditarAnularApostilaPage />);

    expect(screen.getByText("Editar Anular Apostila")).toBeInTheDocument();
    expect(fetchByIdMock).toHaveBeenCalledWith(50);
    expect(resetMock).toHaveBeenCalledWith({
      apostila_insubsistencia: {
        portaria: "999",
        ano: "2026",
        numero_sei: "SEI-ANULACAO",
        doc: new Date("2026/05/10"),
        observacao: "Obs salva",
        texto_para_apostila: "É a presente portaria apostilada",
      },
    });
    expect(getDadosPortariaMock).toHaveBeenCalledWith(mockInsubsistencia!.designacao);
    expect(getDadosPortariaCessacaoMock).toHaveBeenCalledWith(mockInsubsistencia);
    expect(getDadosIndicadoMock).toHaveBeenCalledWith(mockInsubsistencia!.designacao);
  });

  it("gera html para designação com campos destacados em negrito", async () => {
    render(<EditarAnularApostilaPage />);

    expect(screen.getByText("Designação")).toBeInTheDocument();
    expect(screen.getByTestId("portaria-fields")).toHaveTextContent("designacao");

    fireEvent.click(screen.getByText("Gerar texto SEI"));

    await waitFor(() => expect(triggerMock).toHaveBeenCalledWith("apostila_insubsistencia"));
    expect(gerarHtmlPortariaMock).toHaveBeenCalledTimes(1);

    const textoGerado = String(gerarHtmlPortariaMock.mock.calls[0][0]);
    expect(textoGerado).toContain("PORT=999");
    expect(textoGerado).toContain("SEI=SEI-ANULACAO");
    expect(textoGerado).toContain("PAP=123");
    expect(textoGerado).toContain("AAP=2024");
    expect(textoGerado).toContain("SEIA=SEI-DES");
    expect(textoGerado).toContain("RF=RF(1234567)");
    expect(textoGerado).toContain("NOME=<strong>NOME CIVIL</strong>");
    expect(textoGerado).toContain("DRE=<strong>DRE TESTE</strong>");
    expect(screen.getByTestId("editor")).toHaveTextContent(`HTML:${textoGerado}`);
  });

  it("gera html para cessação com fallback de dados e nome indicado por servidor", async () => {
    mockInsubsistencia = {
      ...createInsubsistencia(),
      designacao: {
        ...createInsubsistencia().designacao,
        dre_nome: null,
        indicado_nome_civil: "   ",
        indicado_nome_servidor: "Servidor Sem Nome Civil",
        indicado_rf: null,
        indicado_vinculo: null,
      },
      cessacao: {
        portaria: "777",
        ano_vigente: "2025",
        doc: undefined,
        sei_numero: undefined,
      },
    };

    render(<EditarAnularApostilaPage />);

    expect(screen.getByText("Cessação")).toBeInTheDocument();
    expect(screen.getByTestId("portaria-fields")).toHaveTextContent("cessacao");

    fireEvent.click(screen.getByText("Gerar texto SEI"));
    await waitFor(() => expect(gerarHtmlPortariaMock).toHaveBeenCalledTimes(1));

    const textoGerado = String(gerarHtmlPortariaMock.mock.calls[0][0]);
    expect(textoGerado).toContain("PAP=777");
    expect(textoGerado).toContain("AAP=2025");
    expect(textoGerado).toContain("DOCA=-");
    expect(textoGerado).toContain("SEIA=-");
    expect(textoGerado).toContain("RF=RF(-)");
    expect(textoGerado).toContain("NOME=<strong>SERVIDOR SEM NOME CIVIL</strong>");
    expect(textoGerado).toContain("DRE=<strong>-</strong>");
  });

  it("não gera texto quando validação do formulário falha", async () => {
    triggerMock.mockResolvedValue(false);

    render(<EditarAnularApostilaPage />);
    fireEvent.click(screen.getByText("Gerar texto SEI"));

    await waitFor(() => expect(triggerMock).toHaveBeenCalledWith("apostila_insubsistencia"));
    expect(gerarHtmlPortariaMock).not.toHaveBeenCalled();
    expect(screen.queryByTestId("editor")).not.toBeInTheDocument();
  });

  it("salva a edição enviando o id da insubsistência e redireciona", async () => {
    render(<EditarAnularApostilaPage />);

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        values: formValues,
        atoPai: 10,
        id: 50,
      });
      expect(notificationSuccessMock).toHaveBeenCalledWith({
        title: "Anulação de apostila editada com sucesso!",
      });
      expect(pushMock).toHaveBeenCalledWith("/pages/atos-administrativos");
    });
  });

  it("usa o ato pai da insubsistência quando o query param não é informado", async () => {
    mockParams = { id: "50", atoPai: null };

    render(<EditarAnularApostilaPage />);
    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith(
        expect.objectContaining({ atoPai: 10 })
      );
    });
  });

  it("usa atoPai 0 quando nenhuma origem está disponível", async () => {
    mockParams = { id: "50", atoPai: null };
    mockInsubsistencia = {
      ...createInsubsistencia(),
      ato_pai_id: undefined,
    };

    render(<EditarAnularApostilaPage />);
    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith(
        expect.objectContaining({ atoPai: 0 })
      );
    });
  });

  it("mostra erro com mensagem lançada como Error", async () => {
    mutateAsyncMock.mockRejectedValueOnce(new Error("falha ao salvar"));

    render(<EditarAnularApostilaPage />);
    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(notificationErrorMock).toHaveBeenCalledWith({ title: "falha ao salvar" });
    });
  });

  it("mostra erro padrão quando exceção não é Error", async () => {
    mutateAsyncMock.mockRejectedValueOnce({ reason: "erro-desconhecido" });

    render(<EditarAnularApostilaPage />);
    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(notificationErrorMock).toHaveBeenCalledWith({ title: "Erro ao salvar" });
    });
  });
});

describe("gerarFormValuesAnularApostila", () => {
  it("usa fallbacks quando a insubsistência não tem dados preenchidos", () => {
    const antes = new Date();
    const values = gerarFormValuesAnularApostila({} as InsubsistenciaRead);

    expect(values).toEqual(
      expect.objectContaining({
        portaria: "",
        ano: "",
        numero_sei: "",
        observacao: "",
        texto_para_apostila: "",
      })
    );
    expect(values.doc.getTime()).toBeGreaterThanOrEqual(antes.getTime());
  });
});
