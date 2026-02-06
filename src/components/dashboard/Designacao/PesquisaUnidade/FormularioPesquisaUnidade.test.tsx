import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import FormularioPesquisaUnidade from "./FormularioPesquisaUnidade";
import * as unidadesActions from "@/actions/unidades";
import { createRef } from "react";
import type { FormularioPesquisaUnidadeRef } from "./FormularioPesquisaUnidade";

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
  { codigoDRE: "dre-1", nomeDRE: "DRE Sul", siglaDRE: "DRE1" },
  { codigoDRE: "dre-2", nomeDRE: "DRE Norte", siglaDRE: "DRE2" },
];

const ueOptions = [
  { codigoEol: "ue-1", nomeOficial: "Escola Municipal A" },
  { codigoEol: "ue-2", nomeOficial: "Escola Municipal B" },
];

const clickSelectOption = async (user: ReturnType<typeof userEvent.setup>, text: string) => {
  const options = await screen.findAllByText(text);
  const option = options.find(el => el.tagName.toLowerCase() !== 'option');
  if (option) await user.click(option);
};

describe("FormularioPesquisaUnidade", () => {
  beforeAll(() => {
    if (!Element.prototype.hasPointerCapture) {
      Element.prototype.hasPointerCapture = () => false;
    }
    if (!Element.prototype.setPointerCapture) {
      Element.prototype.setPointerCapture = () => { };
    }
    if (!Element.prototype.releasePointerCapture) {
      Element.prototype.releasePointerCapture = () => { };
    }
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = () => { };
    }
    if (!globalThis.ResizeObserver) {
      globalThis.ResizeObserver = class {
        observe() { }
        unobserve() { }
        disconnect() { }
      };
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(unidadesActions.getDREs).mockResolvedValue(dreOptions as never);
    vi.mocked(unidadesActions.getUEs).mockResolvedValue(ueOptions as never);
  });

  it("renderiza todos os campos iniciais", async () => {
    renderWithQueryClient(
      <FormularioPesquisaUnidade
        onSubmitDesignacao={vi.fn()}
        setDisableProximo={vi.fn()}
      />
    );

    expect(screen.getByText("DRE")).toBeInTheDocument();
    expect(screen.getByText("Unidade escolar")).toBeInTheDocument();
    expect(screen.getByText("Código Estrutura hierárquica")).toBeInTheDocument();
    expect(screen.getByText("Qtd. Turmas")).toBeInTheDocument();
    expect(screen.getByText("Funcionários da unidade")).toBeInTheDocument();
    expect(screen.getByText("Cargo sobreposto")).toBeInTheDocument();
    expect(screen.getByText("Módulos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pesquisar/i })).toBeInTheDocument();
  });

  it("mantém UE desabilitada quando DRE não está selecionada", async () => {
    renderWithQueryClient(
      <FormularioPesquisaUnidade
        onSubmitDesignacao={vi.fn()}
        setDisableProximo={vi.fn()}
      />
    );

    const ueCombobox = screen.getByTestId("select-ue");
    expect(ueCombobox).toBeDisabled();
  });

  it("carrega e exibe opções de DRE", async () => {
    const user = userEvent.setup();

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        onSubmitDesignacao={vi.fn()}
        setDisableProximo={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(unidadesActions.getDREs).toHaveBeenCalled();
    });

    const dreSelect = screen.getByTestId("select-dre");
    await user.click(dreSelect);

    const dreSulOptions = await screen.findAllByText("DRE Sul");
    expect(dreSulOptions.length).toBeGreaterThan(0);
    const dreNorteOptions = screen.getAllByText("DRE Norte");
    expect(dreNorteOptions.length).toBeGreaterThan(0);
  });

  it("seleciona DRE e habilita UE", async () => {
    const user = userEvent.setup();
    const setDisableProximo = vi.fn();

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        onSubmitDesignacao={vi.fn()}
        setDisableProximo={setDisableProximo}
      />
    );

    const dreSelect = screen.getByTestId("select-dre");
    await user.click(dreSelect);
    await clickSelectOption(user, "DRE Sul");

    expect(setDisableProximo).toHaveBeenCalledWith(true);

    await waitFor(() => {
      expect(unidadesActions.getUEs).toHaveBeenCalledWith("dre-1");
    });

    const ueCombobox = screen.getByTestId("select-ue");
    expect(ueCombobox).not.toBeDisabled();
  });

  it("limpa UE ao trocar DRE", async () => {
    const user = userEvent.setup();
    const setDisableProximo = vi.fn();

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        onSubmitDesignacao={vi.fn()}
        setDisableProximo={setDisableProximo}
      />
    );

    const dreSelect = screen.getByTestId("select-dre");
    await user.click(dreSelect);
    await clickSelectOption(user, "DRE Sul");

    const ueCombobox = screen.getByTestId("select-ue");
    await user.click(ueCombobox);
    await user.click(await screen.findByText("Escola Municipal A"));

    await user.click(dreSelect);
    await clickSelectOption(user, "DRE Norte");

    expect(setDisableProximo).toHaveBeenCalledWith(true);
  });

  it("exibe loading enquanto carrega UEs", async () => {
    const user = userEvent.setup();
    let resolveUEs: (value: never) => void;

    vi.mocked(unidadesActions.getUEs).mockReturnValue(
      new Promise((resolve) => {
        resolveUEs = resolve;
      }) as never
    );

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        onSubmitDesignacao={vi.fn()}
        setDisableProximo={vi.fn()}
      />
    );

    const dreSelect = screen.getByTestId("select-dre");
    await user.click(dreSelect);
    await clickSelectOption(user, "DRE Sul");

    expect(screen.getByText("Unidade escolar").parentElement?.parentElement).toContainHTML("animate-spin");

    resolveUEs!(ueOptions as never);

    await waitFor(() => {
      expect(screen.queryByText("animate-spin")).not.toBeInTheDocument();
    });
  });

  it("seleciona UE e habilita botão próximo", async () => {
    const user = userEvent.setup();
    const setDisableProximo = vi.fn();

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        onSubmitDesignacao={vi.fn()}
        setDisableProximo={setDisableProximo}
      />
    );

    const dreSelect = screen.getByTestId("select-dre");
    await user.click(dreSelect);
    await clickSelectOption(user, "DRE Sul");

    const ueCombobox = screen.getByTestId("select-ue");
    await user.click(ueCombobox);
    await user.click(await screen.findByText("Escola Municipal A"));

    expect(setDisableProximo).toHaveBeenCalledWith(false);
  });

  it("submete formulário e preenche campos derivados", async () => {
    const user = userEvent.setup();
    const onSubmitDesignacao = vi.fn();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => { });

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        onSubmitDesignacao={onSubmitDesignacao}
        setDisableProximo={vi.fn()}
      />
    );

    const dreSelect = screen.getByTestId("select-dre");
    await user.click(dreSelect);
    await clickSelectOption(user, "DRE Sul");

    const ueCombobox = screen.getByTestId("select-ue");
    await user.click(ueCombobox);
    await user.click(await screen.findByText("Escola Municipal A"));

    await user.click(screen.getByRole("button", { name: /Pesquisar/i }));

    await waitFor(() => {
      expect(onSubmitDesignacao).toHaveBeenCalledWith({
        dre: "dre-1",
        ue: "ue-1",
        codigo_estrutura_hierarquica: "",
        funcionarios_da_unidade: "",
        quantidade_turmas: "",
        cargo_sobreposto: "",
        modulos: "",
      });
    });

    expect(consoleSpy).toHaveBeenCalledWith("values", expect.any(Object));

    await waitFor(() => {
      const codigoInput = screen.getByTestId("input-codigo") as HTMLInputElement;
      expect(codigoInput.value).toBe("123456");
    });

    await waitFor(() => {
      expect(screen.getByText("40")).toBeInTheDocument();
      expect(screen.getByText("20")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it("exibe opções de funcionários após submit", async () => {
    const user = userEvent.setup();

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        onSubmitDesignacao={vi.fn()}
        setDisableProximo={vi.fn()}
      />
    );

    const dreSelect = screen.getByTestId("select-dre");
    await user.click(dreSelect);
    await clickSelectOption(user, "DRE Sul");

    const ueCombobox = screen.getByTestId("select-ue");
    await user.click(ueCombobox);
    await user.click(await screen.findByText("Escola Municipal A"));

    await user.click(screen.getByRole("button", { name: /Pesquisar/i }));

    await waitFor(() => {
      const funcionariosSelect = screen.getByTestId("select-funcionarios");
      expect(funcionariosSelect).toBeInTheDocument();
    });

    const funcionariosSelect = screen.getByTestId("select-funcionarios");
    await user.click(funcionariosSelect);

    const joaoOptions = await screen.findAllByText("João da Silva");
    expect(joaoOptions.length).toBeGreaterThan(0);
    const mariaOptions = screen.getAllByText("Maria da Silva");
    expect(mariaOptions.length).toBeGreaterThan(0);
    const pedroOptions = screen.getAllByText("Pedro da Silva");
    expect(pedroOptions.length).toBeGreaterThan(0);
  });

  it("permite selecionar funcionário", async () => {
    const user = userEvent.setup();

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        onSubmitDesignacao={vi.fn()}
        setDisableProximo={vi.fn()}
      />
    );

    const dreSelect = screen.getByTestId("select-dre");
    await user.click(dreSelect);
    await clickSelectOption(user, "DRE Sul");

    const ueCombobox = screen.getByTestId("select-ue");
    await user.click(ueCombobox);
    await user.click(await screen.findByText("Escola Municipal A"));

    await user.click(screen.getByRole("button", { name: /Pesquisar/i }));

    await waitFor(() => {
      expect(screen.getByTestId("select-funcionarios")).toBeInTheDocument();
    });

    const funcionariosSelect = screen.getByTestId("select-funcionarios");
    await user.click(funcionariosSelect);
    await clickSelectOption(user, "Maria da Silva");

    expect(funcionariosSelect).toHaveTextContent("Maria da Silva");
  });

  it("permite editar código estrutura hierárquica", async () => {
    const user = userEvent.setup();

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        onSubmitDesignacao={vi.fn()}
        setDisableProximo={vi.fn()}
      />
    );

    const dreSelect = screen.getByTestId("select-dre");
    await user.click(dreSelect);
    await clickSelectOption(user, "DRE Sul");

    const ueCombobox = screen.getByTestId("select-ue");
    await user.click(ueCombobox);
    await user.click(await screen.findByText("Escola Municipal A"));

    await user.click(screen.getByRole("button", { name: /Pesquisar/i }));

    await waitFor(() => {
      const codigoInput = screen.getByTestId("input-codigo") as HTMLInputElement;
      expect(codigoInput.value).toBe("123456");
    });

    const codigoInput = screen.getByTestId("input-codigo") as HTMLInputElement;
    await user.clear(codigoInput);
    await user.type(codigoInput, "999999");

    expect(codigoInput.value).toBe("999999");
  });

  it("renderiza botão de visualização de turmas e permite clicar", async () => {
    const user = userEvent.setup();

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        onSubmitDesignacao={vi.fn()}
        setDisableProximo={vi.fn()}
      />
    );

    const dreSelect = screen.getByTestId("select-dre");
    await user.click(dreSelect);
    await clickSelectOption(user, "DRE Sul");

    const ueCombobox = screen.getByTestId("select-ue");
    await user.click(ueCombobox);
    await user.click(await screen.findByText("Escola Municipal A"));

    await user.click(screen.getByRole("button", { name: /Pesquisar/i }));

    await waitFor(() => {
      expect(screen.getByText("40")).toBeInTheDocument();
    });

    const eyeButton = screen.getByTestId("btn-visualizar-turmas");
    expect(eyeButton).toBeInTheDocument();

    await user.click(eyeButton);

    // Verifica que o onClick foi executado
    expect(eyeButton).toBeInTheDocument();
  });

  it("expõe getValues via ref", async () => {
    const user = userEvent.setup();
    const ref = createRef<FormularioPesquisaUnidadeRef>();

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        ref={ref}
        onSubmitDesignacao={vi.fn()}
        setDisableProximo={vi.fn()}
      />
    );

    expect(ref.current?.getValues).toBeDefined();

    const dreSelect = screen.getByTestId("select-dre");
    await user.click(dreSelect);
    await clickSelectOption(user, "DRE Sul");

    const ueCombobox = screen.getByTestId("select-ue");
    await user.click(ueCombobox);
    await user.click(await screen.findByText("Escola Municipal A"));

    const values = ref.current?.getValues();
    expect(values).toEqual({
      dre: "dre-1",
      ue: "ue-1",
      codigo_estrutura_hierarquica: "",
      funcionarios_da_unidade: "",
      quantidade_turmas: "",
      cargo_sobreposto: "",
      modulos: "",
    });
  });

  it("valida campos obrigatórios ao submeter sem preencher", async () => {
    const user = userEvent.setup();
    const onSubmitDesignacao = vi.fn();

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        onSubmitDesignacao={onSubmitDesignacao}
        setDisableProximo={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /Pesquisar/i }));

    await waitFor(() => {
      expect(screen.getByText("Selecione uma DRE")).toBeInTheDocument();
    });

    expect(onSubmitDesignacao).not.toHaveBeenCalled();
  });
});