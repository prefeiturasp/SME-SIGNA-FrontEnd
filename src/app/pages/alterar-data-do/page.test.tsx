import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AlterarDataDoPage from "./page";
import { PORTARIAS_SEM_DATA_DE_PUBLICACAO } from "@/components/dashboard/Designacao/MainDOForm/MainDOForm";

const pushMock = vi.fn();
const fetchPortariasDOMock = vi.fn();
const mutateAsyncMock = vi.fn();
const messageLoadingMock = vi.fn();
const messageDestroyMock = vi.fn();
const filterResetMock = vi.fn();
const filterTriggerMock = vi.fn().mockResolvedValue(true);

const selectedRowsMock = [
  {
    id: 1,
    portaria_designacao: "100",
    doc: "DOC",
    tipo_ato: "DESIGNACAO_CESSACAO",
    titular_nome_servidor: "Servidor A",
    cargo_vaga_display: "Diretor",
    do: "DO",
    data_designacao: "",
    data_cessacao: "",
    sei_numero: "SEI-1",
  },
];

let filterValues = {
  numero_sei: "",
  portaria_inicial: "",
  portaria_final: "",
  ano: "2026",
  tipo_ato: "",
};

let mainValues = {
  portarias_selecionadas: PORTARIAS_SEM_DATA_DE_PUBLICACAO,
  data_considerada_portaria: undefined as Date | undefined,
  data_publicacao: new Date("2026-05-20T00:00:00.000Z"),
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/actions/designacao", () => ({
  fetchPortariasDO: (...args: unknown[]) => fetchPortariasDOMock(...args),
}));

vi.mock("@/hooks/useSalvarPortariasDO", () => ({
  useSalvarPortariasDo: () => ({
    mutateAsync: (...args: unknown[]) => mutateAsyncMock(...args),
  }),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => () => ({}),
}));

vi.mock("react-hook-form", async () => {
  const actual = await vi.importActual<any>("react-hook-form");

  return {
    ...actual,
    useForm: (options?: { defaultValues?: Record<string, unknown> }) => {
      const isMainForm = Boolean(options?.defaultValues?.portarias_selecionadas);

      if (isMainForm) {
        return {
          handleSubmit: (fn: (values: typeof mainValues) => void) => (e?: Event) => {
            e?.preventDefault?.();
            fn(mainValues);
          },
          control: {},
          watch: (field: keyof typeof mainValues) => mainValues[field],
          getValues: () => mainValues,
          reset: vi.fn(),
          trigger: vi.fn().mockResolvedValue(true),
          formState: { errors: {} },
        };
      }

      return {
        handleSubmit: (fn: (values: typeof filterValues) => void) => (e?: Event) => {
          e?.preventDefault?.();
          fn(filterValues);
        },
        control: {},
        watch: (field: keyof typeof filterValues) => filterValues[field],
        getValues: () => filterValues,
        reset: filterResetMock,
        trigger: filterTriggerMock,
        formState: { errors: {} },
      };
    },
    FormProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

vi.mock("@/components/dashboard/FundoBranco/QuadroBranco", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

vi.mock("@/components/dashboard/Designacao/FiltroDeDo/FiltroDeDo", () => ({
  __esModule: true,
  default: ({ onClear }: { onClear?: () => void }) => (
    <div>
      <button type="button" data-testid="clear-filters" onClick={onClear}>
        Limpar
      </button>
      <button data-testid="submit-filters" type="submit">
        Pesquisar
      </button>
    </div>
  ),
}));

vi.mock("@/components/dashboard/Designacao/MainDOForm/MainDOForm", () => ({
  __esModule: true,
  PORTARIAS_SEM_DATA_DE_PUBLICACAO: 1,
  default: () => <div data-testid="main-do-form">Main DO Form</div>,
}));

vi.mock("@/components/dashboard/Designacao/ListagemDeDo/ListagemDeDo", () => ({
  __esModule: true,
  default: ({
    onClickButton,
    isDisabled,
  }: {
    onClickButton?: (rows: typeof selectedRowsMock) => void;
    isDisabled?: boolean;
  }) => (
    <div>
      <span data-testid="is-disabled-listagem">{String(isDisabled)}</span>
      <button data-testid="submit-main-action" onClick={() => onClickButton?.(selectedRowsMock)}>
        Alterar data
      </button>
    </div>
  ),
}));

vi.mock("antd", () => ({
  message: {
    loading: (...args: unknown[]) => messageLoadingMock(...args),
    destroy: (...args: unknown[]) => messageDestroyMock(...args),
  },
  Modal: ({
    open,
    children,
  }: {
    open: boolean;
    children: React.ReactNode;
  }) => (open ? <div>{children}</div> : null),
  Result: ({
    title,
    subTitle,
    extra,
  }: {
    title: string;
    subTitle?: string;
    extra?: React.ReactNode;
  }) => (
    <div>
      <p>{title}</p>
      {subTitle ? <p>{subTitle}</p> : null}
      {extra}
    </div>
  ),
}));

describe("AlterarDataDo page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    filterValues = {
      numero_sei: "",
      portaria_inicial: "",
      portaria_final: "",
      ano: "2026",
      tipo_ato: "",
    };

    mainValues = {
      portarias_selecionadas: PORTARIAS_SEM_DATA_DE_PUBLICACAO,
      data_considerada_portaria: undefined,
      data_publicacao: new Date("2026-05-20T00:00:00.000Z"),
    };

    fetchPortariasDOMock.mockResolvedValue({
      success: true,
      data: selectedRowsMock,
    });
  });

  it("busca portarias na carga inicial com filtros padrão", async () => {
    render(<AlterarDataDoPage />);

    await waitFor(() => {
      expect(fetchPortariasDOMock).toHaveBeenCalledWith({
        numero_sei: "",
        portaria_inicial: "",
        portaria_final: "",
        ano: "2026",
        tipo_ato: "",
      });
    });

    expect(screen.getByRole("heading", { name: "Alterar data do D.O" })).toBeInTheDocument();
  });

  it("limpa filtros e busca novamente ao executar onClear", async () => {
    filterValues.numero_sei = "1111.1111/1111111-1";
    render(<AlterarDataDoPage />);

    fireEvent.click(screen.getByTestId("clear-filters"));

    expect(filterResetMock).toHaveBeenCalled();
    await waitFor(() => {
      expect(fetchPortariasDOMock).toHaveBeenCalledTimes(2);
    });
  });

  it("salva portarias com sucesso e agenda redirecionamento", async () => {
    vi.useFakeTimers();
    mutateAsyncMock.mockResolvedValueOnce({});
    render(<AlterarDataDoPage />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("submit-main-action"));
      await Promise.resolve();
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      values: selectedRowsMock,
      data_publicacao: "2026-05-20T00:00:00.000Z",
    });

    expect(messageLoadingMock).toHaveBeenCalledWith({
      content: "Salvando portaria...",
      duration: 0,
    });
    expect(messageDestroyMock).toHaveBeenCalled();
    expect(screen.getByText("Tudo certo por aqui!")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2200);
    });
    expect(pushMock).toHaveBeenCalledWith("/pages/listagem-designacoes");
    vi.useRealTimers();
  });

  it("abre modal de erro quando salvar falha", async () => {
    mutateAsyncMock.mockRejectedValueOnce(new Error("Erro"));
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(<AlterarDataDoPage />);
    fireEvent.click(screen.getByTestId("submit-main-action"));

    await waitFor(() => {
      expect(screen.getByText("Ocorreu um erro!")).toBeInTheDocument();
    });

    expect(messageDestroyMock).toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
