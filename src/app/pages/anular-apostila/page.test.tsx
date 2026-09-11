import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import AnularApostilaPage from "./page";

const pushMock = vi.fn();
const notificationSuccessMock = vi.fn();
const notificationErrorMock = vi.fn();
const triggerMock = vi.fn();
const fetchByIdMock = vi.fn();
const formatarRFMock = vi.fn((value: string) => `RF(${value})`);
const getDadosPortariaMock = vi.fn((value?: unknown) => ({ origem: "designacao", value }));
const getDadosPortariaCessacaoMock = vi.fn((value?: unknown) => ({ origem: "cessacao", value }));
const getDadosIndicadoMock = vi.fn((value?: unknown) => ({ origem: "indicado", value }));
const blocosPropsMock = vi.fn();
const gerarHtmlPortariaMock = vi.fn((texto: string) => `HTML:${texto}`);
const mutateAsyncMock = vi.fn();

let mockId: string | null = "10";
let mockIsLoading = false;
let mockApostila: Record<string, unknown> | null = null;
let formValues: Record<string, unknown> = {
  apostila_insubsistencia: {
    portaria: "999",
    ano: "2026",
    sei_numero: "SEI-NOVO",
    doc: "DOC-NOVO",
    observacao: "Obs teste",
    texto_para_apostila: "É a presente portaria apostilada",
  },
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({ get: () => mockId }),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => () => ({}),
}));

vi.mock("@/hooks/useVisualizarApostilas", () => ({
  useFetchApostilasById: (id: number) => {
    fetchByIdMock(id);
    return {
      data: mockApostila,
      isLoading: mockIsLoading,
    };
  },
}));

vi.mock("@/utils/portarias/templates", () => ({
  TEMPLATE_ANULAR_APOSTILA:
    "PORT={{portaria}}|ANO={{ano}}|SEI={{numero_sei}}|PAP={{portaria_apostilada}}|AAP={{ano_apostilado}}|DOCA={{doc_apostilado}}|SEIA={{sei_apostilado}}|NOME={{nome_indicado}}|RF={{rf}}|DRE={{dre}}|VINC={{vinculo}}|TEXTO={{texto_para_apostila}}",
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
  default: (props: { onSubmitEditarServidor?: (data: { edited: boolean }) => void }) => {
    blocosPropsMock(props);
    props.onSubmitEditarServidor?.({ edited: true });
    return <div data-testid="blocos-designacao" />;
  },
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
    numero_portaria: "123",
    ano_vigente: "2024",
    doc: "DOC-DES",
    sei_numero: "SEI-DES",
    indicado_nome_servidor: "Maria Silva",
    indicado_nome_civil: "Nome Civil",
    indicado_rf: "1234567",
    indicado_vinculo: "Efetivo",
  },
  cessacao: null,
});

describe("AnularApostilaPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockId = "10";
    mockIsLoading = false;
    mockApostila = createApostila();
    formValues = {
      apostila_insubsistencia: {
        portaria: "999",
        ano: "2026",
        numero_sei: "SEI-NOVO",
        doc: new Date("2026-05-10"),
        observacao: "Obs teste",
        texto_para_apostila: "É a presente portaria apostilada",
      },
    };
    triggerMock.mockResolvedValue(true);
    mutateAsyncMock.mockResolvedValue({ id: 123 });
  });

  it("renderiza loading e usa id 0 quando query param não existe", () => {
    mockId = null;
    mockIsLoading = true;

    render(<AnularApostilaPage />);

    expect(fetchByIdMock).toHaveBeenCalledWith(0);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(screen.queryByText("Gerar texto SEI")).not.toBeInTheDocument();
  });

  it("gera html para designação com campos destacados em negrito", async () => {
    render(<AnularApostilaPage />);

    expect(screen.getByText("Anular Apostila")).toBeInTheDocument();
    expect(screen.getByText("Designação")).toBeInTheDocument();
    expect(screen.getByTestId("portaria-fields")).toHaveTextContent("designacao");
    expect(getDadosPortariaMock).toHaveBeenCalledWith(mockApostila!.designacao);
    expect(getDadosPortariaCessacaoMock).toHaveBeenCalledWith(mockApostila);
    expect(getDadosIndicadoMock).toHaveBeenCalledWith(mockApostila!.designacao);

    fireEvent.click(screen.getByText("Gerar texto SEI"));

    await waitFor(() => expect(triggerMock).toHaveBeenCalledWith("apostila_insubsistencia"));
    expect(gerarHtmlPortariaMock).toHaveBeenCalledTimes(1);

    const textoGerado = String(gerarHtmlPortariaMock.mock.calls[0][0]);
    expect(textoGerado).toContain("PAP=-");
    expect(textoGerado).toContain("AAP=2024");
    expect(textoGerado).toContain("SEIA=SEI-DES");
    expect(textoGerado).toContain("RF=RF(1234567)");
    expect(textoGerado).toContain("NOME=<strong>NOME CIVIL</strong>");
    expect(textoGerado).toContain("DRE=<strong>DRE TESTE</strong>");
    expect(textoGerado).toContain("TEXTO=É a presente portaria apostilada");
    expect(screen.getByTestId("editor")).toHaveTextContent(`HTML:${textoGerado}`);
    expect(blocosPropsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        showCessacaoExtraFields: true,
        showCessacao: expect.anything(),
      })
    );
  });

  it("gera html para cessação com fallback de dados e nome indicado por servidor", async () => {
    mockApostila = {
      ...createApostila(),
      designacao: {
        ...createApostila().designacao,
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
        numero_sei: undefined,
      },
    };

    render(<AnularApostilaPage />);

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

  it("gera html com fallback completo quando campos opcionais estão ausentes", async () => {
    mockApostila = {
      ...createApostila(),
      designacao: {
        ...createApostila().designacao,
        portaria: undefined,
        ano_vigente: undefined,
        doc: undefined,
        numero_sei: undefined,
        indicado_nome_civil: undefined,
        indicado_nome_servidor: undefined,
        indicado_rf: undefined,
        dre_nome: undefined,
      },
      cessacao: null,
    };
    formValues = {
      apostila_insubsistencia: {
        portaria: "1000",
        ano: "2026",
        numero_sei: "SEI-1000",
        texto_para_apostila: undefined,
      },
    };

    render(<AnularApostilaPage />);
    fireEvent.click(screen.getByText("Gerar texto SEI"));

    await waitFor(() => expect(gerarHtmlPortariaMock).toHaveBeenCalledTimes(1));

    const textoGerado = String(gerarHtmlPortariaMock.mock.calls[0][0]);
    expect(textoGerado).toContain("PAP=-");
    expect(textoGerado).toContain("AAP=-");
    expect(textoGerado).toContain("DOCA=-");
    expect(textoGerado).toContain("SEIA=SEI-DES");
    expect(textoGerado).toContain("NOME=<strong>-</strong>");
    expect(textoGerado).toContain("RF=RF(-)");
    expect(textoGerado).toContain("TEXTO=");
  });

  it("não gera texto quando validação do formulário falha", async () => {
    triggerMock.mockResolvedValue(false);

    render(<AnularApostilaPage />);
    fireEvent.click(screen.getByText("Gerar texto SEI"));

    await waitFor(() => expect(triggerMock).toHaveBeenCalledWith("apostila_insubsistencia"));
    expect(gerarHtmlPortariaMock).not.toHaveBeenCalled();
    expect(screen.queryByTestId("editor")).not.toBeInTheDocument();
  });

  it("submete com sucesso e redireciona", async () => {
    render(<AnularApostilaPage />);

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        values: formValues,
        atoPai: 10,
      });
      expect(notificationSuccessMock).toHaveBeenCalledWith({ title: "Anulação de apostila salva com sucesso!" });
      expect(pushMock).toHaveBeenCalledWith("/pages/atos-administrativos");
    });
  });

  it("mostra erro com mensagem lançada como Error", async () => {
    mutateAsyncMock.mockRejectedValueOnce(new Error("falha ao salvar"));

    render(<AnularApostilaPage />);
    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(notificationErrorMock).toHaveBeenCalledWith({ title: "falha ao salvar" });
    });
  });

  it("mostra erro padrão quando exceção não é Error", async () => {
    const unknownFailure = { reason: "erro-desconhecido" };
    mutateAsyncMock.mockRejectedValueOnce(unknownFailure);

    render(<AnularApostilaPage />);
    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(notificationErrorMock).toHaveBeenCalledWith({ title: "Erro ao salvar" });
    });
  });

  it("usa atoPai 0 quando apostila não possui id", async () => {
    mockApostila = {
      ...createApostila(),
      id: undefined,
    };

    render(<AnularApostilaPage />);
    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        values: formValues,
        atoPai: 0,
      });
    });
  });
});
