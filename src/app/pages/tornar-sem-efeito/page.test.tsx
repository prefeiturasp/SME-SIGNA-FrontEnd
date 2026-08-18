import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import AnularApostilaPage from "./page";

const pushMock = vi.fn();
const notificationSuccessMock = vi.fn();
const notificationErrorMock = vi.fn();
const fetchByIdMock = vi.fn();
const mutateAsyncMock = vi.fn();
const getDadosPortariaMock = vi.fn((value?: unknown) => ({ origem: "designacao", value }));
const getDadosPortariaCessacaoMock = vi.fn((value?: unknown) => ({ origem: "cessacao", value }));
const getDadosIndicadoMock = vi.fn((value?: unknown) => ({ origem: "indicado", value }));
const formCardPropsMock = vi.fn();
const formatarDataMock = vi.fn((value?: string) => `data-${value}`);
const gerarHtmlPortariaMock = vi.fn((texto: string) => `HTML:${texto}`);

type FormValues = {
  apostila_insubsistencia: {
    portaria: string;
    ano: string;
    numero_sei: string;
    doc: string | Date;
    observacao: string;
  };
};

type InsubsistenciaMock = {
  id?: number;
  designacao: {
    dre_nome: string;
    numero_portaria: string;
    ano_vigente: string;
    doc: string;
    numero_sei: string;
    indicado_nome_servidor: string;
    indicado_nome_civil: string;
    indicado_rf: string;
    indicado_vinculo: string;
  };
  cessacao: { portaria: string } | null;
};

type FormCardPropsMock = {
  tipoPortaria: string;
  mostrarEditor: boolean;
  onGerarPortaria: () => void;
  onSubmit: (values: FormValues) => Promise<void> | void;
};

let mockId: string | null = "10";
let mockIsLoading = false;
let mockInsubsistencia: InsubsistenciaMock | null = null;
let formValues: FormValues = {
  apostila_insubsistencia: {
    portaria: "999",
    ano: "2026",
    numero_sei: "SEI-NOVO",
    doc: "DOC-NOVO",
    observacao: "Obs teste",
  },
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({ get: () => mockId }),
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

vi.mock("@/utils/designacao/getDadosPortaria", () => ({
  getDadosPortaria: (value: unknown) => getDadosPortariaMock(value),
}));

vi.mock("@/utils/cessacao/getDadosPortaria", () => ({
  getDadosPortariaCessacao: (value: unknown) => getDadosPortariaCessacaoMock(value),
}));

vi.mock("@/utils/ServidorIndicado/getDadosIndicado", () => ({
  getDadosIndicado: (value: unknown) => getDadosIndicadoMock(value),
}));

vi.mock("@/lib/utils", () => ({
  formatarData: (value?: string) => formatarDataMock(value),
}));

vi.mock("@/components/dashboard/EditorTextoSEI/EditorTextoSEI", () => ({
  gerarHtmlPortaria: (texto: string) => gerarHtmlPortariaMock(texto),
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  default: ({ title }: { title: ReactNode }) => <div data-testid="page-header">{title}</div>,
}));

vi.mock("@/components/dashboard/apostila/AnularApostilaTornarSemEfeitoFormCard", () => ({
  __esModule: true,
  default: (props: FormCardPropsMock) => {
    formCardPropsMock(props);
    return (
      <div data-testid="form-card">
        <div data-testid="tipo-portaria">{props.tipoPortaria}</div>
        <div data-testid="mostrar-editor">{String(props.mostrarEditor)}</div>
        <button type="button" onClick={props.onGerarPortaria}>
          Gerar texto SEI
        </button>
        <button type="button" onClick={() => props.onSubmit(formValues)}>
          Salvar
        </button>
      </div>
    );
  },
}));

vi.mock("lucide-react", () => ({
  Loader2: ({ className }: { className?: string }) => <div data-testid="loading" className={className} />,
}));

const createInsubsistencia = () => ({
  id: 10,
  designacao: {
    dre_nome: "DRE TESTE",
    numero_portaria: "123",
    ano_vigente: "2024",
    doc: "DOC-DES",
    numero_sei: "SEI-DES",
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
    mockInsubsistencia = createInsubsistencia();
    mutateAsyncMock.mockResolvedValue({ id: 123 });
    formValues = {
      apostila_insubsistencia: {
        portaria: "999",
        ano: "2026",
        numero_sei: "SEI-NOVO",
        doc: new Date("2026-05-10"),
        observacao: "Obs teste",
      },
    };
  });

  it("renderiza loading e usa id 0 quando query param não existe", () => {
    mockId = null;
    mockIsLoading = true;

    render(<AnularApostilaPage />);

    expect(fetchByIdMock).toHaveBeenCalledWith(0);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(screen.queryByTestId("form-card")).not.toBeInTheDocument();
  });

  it("renderiza dados da designação e passa props esperadas para o form card", () => {
    render(<AnularApostilaPage />);

    expect(fetchByIdMock).toHaveBeenCalledWith(10);
    expect(screen.getByTestId("page-header")).toHaveTextContent("Detalhes da insubsistência da designação");
    expect(screen.getByTestId("tipo-portaria")).toHaveTextContent("designacao");
    expect(screen.getByTestId("mostrar-editor")).toHaveTextContent("false");
    expect(formCardPropsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        triggerField: "apostila_insubsistencia",
        tituloForm: "Portaria do ato tornar sem efeito",
        showTextoParaApostila: false,
      })
    );
    expect(getDadosPortariaMock).toHaveBeenCalledWith(mockInsubsistencia!.designacao);
    expect(getDadosPortariaCessacaoMock).toHaveBeenCalledWith(mockInsubsistencia);
    expect(getDadosIndicadoMock).toHaveBeenCalledWith(mockInsubsistencia!.designacao);
  });

  it("define tipo da portaria como cessação quando houver dados de cessação", () => {
    mockInsubsistencia = {
      ...createInsubsistencia(),
      cessacao: {
        portaria: "777",
      },
    };

    render(<AnularApostilaPage />);

    expect(screen.getByTestId("page-header")).toHaveTextContent("Detalhes da insubsistência da cessação");
    expect(screen.getByTestId("tipo-portaria")).toHaveTextContent("cessacao");
  });

  it("ativa editor quando clica em gerar texto", async () => {
    render(<AnularApostilaPage />);

    fireEvent.click(screen.getByText("Gerar texto SEI"));

    await waitFor(() => {
      expect(screen.getByTestId("mostrar-editor")).toHaveTextContent("true");
    });
    expect(gerarHtmlPortariaMock).toHaveBeenCalledTimes(1);
  });

  it("aplica negrito quando chave nome_indicado aparece no template", async () => {
    const objectEntriesSpy = vi
      .spyOn(Object, "entries")
      .mockImplementationOnce(() => [
        ["nome_indicado", "Servidor Bold"],
        ["portaria", "123"],
      ]);

    render(<AnularApostilaPage />);

    fireEvent.click(screen.getByText("Gerar texto SEI"));

    await waitFor(() => {
      expect(screen.getByTestId("mostrar-editor")).toHaveTextContent("true");
    });
    expect(gerarHtmlPortariaMock).toHaveBeenCalledTimes(1);

    objectEntriesSpy.mockRestore();
  });

  it("usa doc da cessação ao gerar dados quando tipo_portaria for cessacao", async () => {
    mockInsubsistencia = {
      ...createInsubsistencia(),
      cessacao: {
        portaria: "777",
        doc: "DOC-CESSACAO",
      } as unknown as { portaria: string },
    };

    render(<AnularApostilaPage />);
    fireEvent.click(screen.getByText("Gerar texto SEI"));

    await waitFor(() => {
      expect(gerarHtmlPortariaMock).toHaveBeenCalled();
    });

    const texto = gerarHtmlPortariaMock.mock.calls.at(-1)?.[0] ?? "";
    expect(texto).toContain("data-DOC-CESSACAO");
  });

  it("usa '-' para docs quando dados estão ausentes", async () => {
    mockInsubsistencia = {
      ...createInsubsistencia(),
      doc: undefined,
      designacao: {
        ...createInsubsistencia().designacao,
        doc: undefined,
      },
    } as unknown as InsubsistenciaMock;

    render(<AnularApostilaPage />);
    fireEvent.click(screen.getByText("Gerar texto SEI"));

    await waitFor(() => {
      expect(gerarHtmlPortariaMock).toHaveBeenCalled();
    });

    const texto = gerarHtmlPortariaMock.mock.calls.at(-1)?.[0] ?? "";
    expect(texto).toContain("-");
  });

  it("submete com sucesso e redireciona", async () => {
    render(<AnularApostilaPage />);

    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        values: formValues,
        atoPai: 10,
      });
      expect(notificationSuccessMock).toHaveBeenCalledWith({
        title: "Tudo certo por aqui!",
        description: "O ato de tornar uma insubsistência sem efeito foi concluído.",
      });
      expect(pushMock).toHaveBeenCalledWith("/pages/atos-administrativos");
    });
  });

  it("mostra erro com mensagem lançada como Error", async () => {
    mutateAsyncMock.mockRejectedValueOnce(new Error("falha ao salvar"));

    render(<AnularApostilaPage />);
    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(notificationErrorMock).toHaveBeenCalledWith({
        title: "Erro!",
        description: "Não conseguimos concluir a ação. Por favor, tente novamente.",
      });
    });
  });

  it("mostra erro padrão quando exceção não é Error", async () => {
    mutateAsyncMock.mockRejectedValueOnce({ reason: "erro-desconhecido" });

    render(<AnularApostilaPage />);
    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(notificationErrorMock).toHaveBeenCalledWith({
        title: "Erro!",
        description: "Não conseguimos concluir a ação. Por favor, tente novamente.",
      });
    });
  });

  it("usa atoPai 0 quando insubsistência não possui id", async () => {
    mockInsubsistencia = {
      ...createInsubsistencia(),
      id: undefined,
    };

    render(<AnularApostilaPage />);
    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        values: formValues,
        atoPai: 0,
      });
    });
  });
});
