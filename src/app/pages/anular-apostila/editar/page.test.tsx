import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EditarAnularApostilaPage, { gerarFormValuesAnularApostila } from "./page";
import type { InsubsistenciaRead } from "@/types/insubsistencia";

const fetchByIdMock = vi.fn();
const mutateAsyncMock = vi.fn();
const formPropsMock = vi.fn();

let mockParams: Record<string, string | null> = { id: "50", atoPai: "10" };
let mockIsLoading = false;
let mockInsubsistencia: Record<string, unknown> | null = null;

const formValues = {
  apostila_insubsistencia: { portaria: "999", ano: "2026" },
} as never;

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: (key: string) => mockParams[key] ?? null }),
}));

vi.mock("@/hooks/useVisualizarInsubsistencia", () => ({
  useFetchInsubsistenciasById: (id: number) => {
    fetchByIdMock(id);
    return { data: mockInsubsistencia, isLoading: mockIsLoading };
  },
}));

vi.mock("@/hooks/useSalvarInsubsistencias", () => ({
  useSalvarInsubsistencias: () => ({
    mutateAsync: (...args: unknown[]) => mutateAsyncMock(...args),
  }),
}));

vi.mock("@/components/dashboard/apostila/AnularApostilaForm", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    formPropsMock(props);
    return <div data-testid="anular-apostila-form">{String(props.titulo)}</div>;
  },
}));

const createInsubsistencia = () => ({
  id: 50,
  ato_pai_id: 10,
  numero_portaria: 999,
  ano_vigente: "2026",
  sei_numero: "SEI-ANULACAO",
  doc: "2026-05-10",
  observacoes: "Obs salva",
  texto_apostila: "É a presente portaria apostilada",
  texto_sei: "TEXTO SALVO",
  modelo_portaria: 3,
});

describe("EditarAnularApostilaPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams = { id: "50", atoPai: "10" };
    mockIsLoading = false;
    mockInsubsistencia = createInsubsistencia();
    mutateAsyncMock.mockResolvedValue({ id: 50 });
  });

  it("busca a anulação pelo id da query string", () => {
    render(<EditarAnularApostilaPage />);

    expect(fetchByIdMock).toHaveBeenCalledWith(50);
    expect(screen.getByTestId("anular-apostila-form")).toHaveTextContent(
      "Editar Anular Apostila"
    );
  });

  it("entrega ao formulário os valores iniciais e o texto SEI salvo", () => {
    render(<EditarAnularApostilaPage />);

    expect(formPropsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ato: mockInsubsistencia,
        titulo: "Editar Anular Apostila",
        mensagemSucesso: "Anulação de apostila editada com sucesso!",
        textoSeiSalvo: "TEXTO SALVO",
        valoresIniciais: {
          portaria: "999",
          ano: "2026",
          numero_sei: "SEI-ANULACAO",
          doc: new Date("2026/05/10"),
          observacao: "Obs salva",
          texto_para_apostila: "É a presente portaria apostilada",
        },
      })
    );
  });

  it("não envia valores iniciais enquanto a anulação não carregou", () => {
    mockInsubsistencia = null;
    mockIsLoading = true;

    render(<EditarAnularApostilaPage />);

    expect(formPropsMock).toHaveBeenCalledWith(
      expect.objectContaining({ valoresIniciais: null, isLoading: true })
    );
  });

  it("salva enviando o id da anulação e o ato pai da query string", async () => {
    render(<EditarAnularApostilaPage />);

    const { onSalvar } = formPropsMock.mock.calls[0][0];
    await onSalvar(formValues, { textoSei: "TEXTO", modeloPortaria: 7 });

    await waitFor(() =>
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        values: formValues,
        atoPai: 10,
        id: 50,
        textoSei: "TEXTO",
        modeloPortaria: 7,
      })
    );
  });

  it("usa o ato pai da anulação quando a query string não traz atoPai", async () => {
    mockParams = { id: "50", atoPai: null };

    render(<EditarAnularApostilaPage />);

    const { onSalvar } = formPropsMock.mock.calls[0][0];
    await onSalvar(formValues, { textoSei: "", modeloPortaria: null });

    await waitFor(() =>
      expect(mutateAsyncMock).toHaveBeenCalledWith(
        expect.objectContaining({ atoPai: 10 })
      )
    );
  });

  it("usa atoPai 0 quando nenhuma origem está disponível", async () => {
    mockParams = { id: "50", atoPai: null };
    mockInsubsistencia = { ...createInsubsistencia(), ato_pai_id: undefined };

    render(<EditarAnularApostilaPage />);

    const { onSalvar } = formPropsMock.mock.calls[0][0];
    await onSalvar(formValues, { textoSei: "", modeloPortaria: null });

    await waitFor(() =>
      expect(mutateAsyncMock).toHaveBeenCalledWith(
        expect.objectContaining({ atoPai: 0 })
      )
    );
  });

  it("mantém o modelo já gravado quando o texto não foi regerado", async () => {
    render(<EditarAnularApostilaPage />);

    const { onSalvar } = formPropsMock.mock.calls[0][0];
    await onSalvar(formValues, { textoSei: "TEXTO SALVO", modeloPortaria: null });

    await waitFor(() =>
      expect(mutateAsyncMock).toHaveBeenCalledWith(
        expect.objectContaining({ modeloPortaria: 3 })
      )
    );
  });
});

describe("gerarFormValuesAnularApostila", () => {
  it("usa fallbacks quando a anulação não tem dados preenchidos", () => {
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
