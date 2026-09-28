import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AnularApostilaPage from "./page";

const fetchByIdMock = vi.fn();
const mutateAsyncMock = vi.fn();
const formPropsMock = vi.fn();

let mockId: string | null = "10";
let mockIsLoading = false;
let mockApostila: Record<string, unknown> | null = null;

const formValues = {
  apostila_insubsistencia: { portaria: "999", ano: "2026" },
} as never;

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: () => mockId }),
}));

vi.mock("@/hooks/useVisualizarApostilas", () => ({
  useFetchApostilasById: (id: number) => {
    fetchByIdMock(id);
    return { data: mockApostila, isLoading: mockIsLoading };
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

describe("AnularApostilaPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockId = "10";
    mockIsLoading = false;
    mockApostila = { id: 10 };
    mutateAsyncMock.mockResolvedValue({ id: 123 });
  });

  it("busca a apostila pelo id da query string", () => {
    render(<AnularApostilaPage />);

    expect(fetchByIdMock).toHaveBeenCalledWith(10);
  });

  it("usa id 0 quando a query string não traz o id", () => {
    mockId = null;

    render(<AnularApostilaPage />);

    expect(fetchByIdMock).toHaveBeenCalledWith(0);
  });

  it("entrega ao formulário o título, a mensagem e o estado de carregamento", () => {
    mockIsLoading = true;

    render(<AnularApostilaPage />);

    expect(screen.getByTestId("anular-apostila-form")).toHaveTextContent("Anular Apostila");
    expect(formPropsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ato: mockApostila,
        isLoading: true,
        titulo: "Anular Apostila",
        mensagemSucesso: "Anulação de apostila salva com sucesso!",
      })
    );
  });

  it("salva usando a apostila como ato pai", async () => {
    render(<AnularApostilaPage />);

    const { onSalvar } = formPropsMock.mock.calls[0][0];
    await onSalvar(formValues, { textoSei: "TEXTO", modeloPortaria: 7 });

    await waitFor(() =>
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        values: formValues,
        atoPai: 10,
        textoSei: "TEXTO",
        modeloPortaria: 7,
      })
    );
  });

  it("usa atoPai 0 quando a apostila não tem id", async () => {
    mockApostila = { id: undefined };

    render(<AnularApostilaPage />);

    const { onSalvar } = formPropsMock.mock.calls[0][0];
    await onSalvar(formValues, { textoSei: "", modeloPortaria: null });

    await waitFor(() =>
      expect(mutateAsyncMock).toHaveBeenCalledWith(
        expect.objectContaining({ atoPai: 0 })
      )
    );
  });
});
