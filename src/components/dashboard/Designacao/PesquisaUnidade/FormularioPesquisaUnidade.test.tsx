import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import FormularioPesquisaUnidade from "./FormularioPesquisaUnidade";
import * as unidadesActions from "@/actions/unidades";

vi.mock("@/actions/unidades", () => ({
  getDREs: vi.fn(),
  getUEs: vi.fn(),
}));

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

const dreOptions = [
  { codigoDRE: "dre-1", nomeDRE: "DRE 1", siglaDRE: "DRE1" },
  { codigoDRE: "dre-2", nomeDRE: "DRE 2", siglaDRE: "DRE2" },
];

const ueOptions = [
  { codigoEol: "ue-1", nomeOficial: "UE 1" },
  { codigoEol: "ue-2", nomeOficial: "UE 2" },
];

const getSelectTriggerByLabel = (labelText: string) => {
  const label = screen.getByText(labelText);
  const container = label.closest("div");

  if (!container) {
    throw new Error(`Não foi possível encontrar o campo: ${labelText}`);
  }

  return within(container).getByRole("combobox");
};

describe("FormularioPesquisaUnidade", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(unidadesActions.getDREs).mockResolvedValue(dreOptions as never);
    vi.mocked(unidadesActions.getUEs).mockResolvedValue(ueOptions as never);
  });

  it("renderiza os campos iniciais e mantém UE desabilitada", async () => {
    renderWithQueryClient(
      <FormularioPesquisaUnidade onSubmitDesignacao={vi.fn()} />
    );

    expect(screen.getByText("DRE")).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /Digite o nome da UE/i })
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: /Pesquisar/i })).toBeInTheDocument();
  });

  it("seleciona DRE e UE e submete o formulário", async () => {
    const user = userEvent.setup();
    const onSubmitDesignacao = vi.fn();

    renderWithQueryClient(
      <FormularioPesquisaUnidade onSubmitDesignacao={onSubmitDesignacao} />
    );

    const dreTrigger = getSelectTriggerByLabel("DRE");
    await user.click(dreTrigger);
    await user.click(await screen.findByText("DRE 1"));

    await waitFor(() => {
      expect(unidadesActions.getUEs).toHaveBeenCalledWith("dre-1");
    });

    const ueTrigger = screen.getByRole("combobox", {
      name: /Digite o nome da UE/i,
    });
    await user.click(ueTrigger);
    await user.click(await screen.findByText("UE 1"));

    await user.click(screen.getByRole("button", { name: /Pesquisar/i }));

    await waitFor(() => {
      expect(onSubmitDesignacao).toHaveBeenCalledWith(
        expect.objectContaining({
          dre: "dre-1",
          ue: "ue-1",
        })
      );
    });
  });

  it("preenche campos derivados e opções de funcionários após pesquisar", async () => {
    const user = userEvent.setup();

    renderWithQueryClient(
      <FormularioPesquisaUnidade onSubmitDesignacao={vi.fn()} />
    );

    const dreTrigger = getSelectTriggerByLabel("DRE");
    await user.click(dreTrigger);
    await user.click(await screen.findByText("DRE 1"));

    const ueTrigger = screen.getByRole("combobox", {
      name: /Digite o nome da UE/i,
    });
    await user.click(ueTrigger);
    await user.click(await screen.findByText("UE 1"));

    await user.click(screen.getByRole("button", { name: /Pesquisar/i }));

    await waitFor(() => {
      const codigoInput = screen.getByTestId("input-codigo") as HTMLInputElement;
      expect(codigoInput.value).toBe("123456");
    });

    expect(screen.getByText("40")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();

    const modulosLabel = screen.getByText("Módulos");
    const modulosContainer = modulosLabel.closest("div")?.parentElement;
    if (!modulosContainer) {
      throw new Error("Não foi possível localizar o campo Módulos");
    }
    const modulosValues = within(modulosContainer).getAllByText(/.+/);
    expect(modulosValues[modulosValues.length - 1]).toHaveTextContent("2");

    const funcionariosTrigger = getSelectTriggerByLabel("Funcionários da unidade");
    await user.click(funcionariosTrigger);
    expect(await screen.findByText("João da Silva")).toBeInTheDocument();
  });
});

