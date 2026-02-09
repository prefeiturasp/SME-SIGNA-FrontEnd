import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import FormularioPesquisaUnidade from "./FormularioPesquisaUnidade";
import * as unidadesActions from "@/actions/unidades";
import * as designacaoActions from "@/actions/designacao-unidade";
import { createRef } from "react";
import type { FormularioPesquisaUnidadeRef } from "./FormularioPesquisaUnidade";

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

const clickSelectOption = async (
  user: ReturnType<typeof userEvent.setup>,
  text: string
) => {
  const options = await screen.findAllByText(text);
  const option = options.find((el) => el.tagName.toLowerCase() !== "option");
  if (option) await user.click(option);
};

describe("FormularioPesquisaUnidade", () => {
  let getDREsSpy: ReturnType<typeof vi.spyOn>;
  let getUEsSpy: ReturnType<typeof vi.spyOn>;
  let getDesignacaoUnidadeSpy: ReturnType<typeof vi.spyOn>;

  async function selectDreAndUe(
    user: ReturnType<typeof userEvent.setup>,
    dreName = "DRE Sul",
    ueName = "Escola Municipal A"
  ) {
    await waitFor(() => {
      expect(getDREsSpy).toHaveBeenCalled();
    });

    const dreSelect = screen.getByTestId("select-dre");
    await user.click(dreSelect);
    await clickSelectOption(user, dreName);

    await waitFor(() => {
      expect(screen.getByTestId("select-ue")).not.toBeDisabled();
    });

    const ueCombobox = screen.getByTestId("select-ue");
    await user.click(ueCombobox);
    await user.click(await screen.findByText(ueName));
  }

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
    vi.restoreAllMocks();

    getDREsSpy = vi
      .spyOn(unidadesActions, "getDREs")
      .mockResolvedValue(dreOptions as never);
    getUEsSpy = vi
      .spyOn(unidadesActions, "getUEs")
      .mockResolvedValue(ueOptions as never);
    getDesignacaoUnidadeSpy = vi
      .spyOn(designacaoActions, "getDesignacaoUnidadeAction")
      .mockResolvedValue({
        success: true,
        data: { cargos: [], funcionarios_unidade: {} },
      } as never);
  });

  it("renderiza campos iniciais e não exibe seção de funcionários antes do submit", async () => {
    renderWithQueryClient(
      <FormularioPesquisaUnidade
        onSubmitDesignacao={vi.fn()}
        setDisableProximo={vi.fn()}
      />
    );

    expect(screen.getByText("DRE")).toBeInTheDocument();
    expect(screen.getByText("Unidade escolar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pesquisar/i })).toBeInTheDocument();

    expect(
      screen.queryByText("Funcionários da unidade")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Código Estrutura hierárquica")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Qtd. Turmas")).not.toBeInTheDocument();
    expect(screen.queryByText("Cargo sobreposto")).not.toBeInTheDocument();
    expect(screen.queryByText("Módulos")).not.toBeInTheDocument();
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
      expect(getUEsSpy).toHaveBeenCalledWith("dre-1");
    });

    const ueCombobox = screen.getByTestId("select-ue");
    expect(ueCombobox).not.toBeDisabled();
  });

  it("limpa UE ao trocar DRE e desabilita botão próximo", async () => {
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

    await user.click(dreSelect);
    await clickSelectOption(user, "DRE Norte");

    expect(setDisableProximo).toHaveBeenCalledWith(true);
    expect(screen.getByTestId("select-ue")).toHaveTextContent(
      "Digite o nome da UE"
    );
  });

  it("exibe loading enquanto carrega UEs", async () => {
    const user = userEvent.setup();
    let resolveUEs!: (value: never) => void;

    getUEsSpy.mockReturnValue(
      new Promise((resolve) => {
        resolveUEs = resolve as never;
      }) as never
    );

    const { container } = renderWithQueryClient(
      <FormularioPesquisaUnidade
        onSubmitDesignacao={vi.fn()}
        setDisableProximo={vi.fn()}
      />
    );

    const dreSelect = screen.getByTestId("select-dre");
    await user.click(dreSelect);
    await clickSelectOption(user, "DRE Sul");

    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    expect(screen.queryByTestId("select-ue")).not.toBeInTheDocument();

    resolveUEs!(ueOptions as never);

    await waitFor(() => {
      expect(container.querySelector(".animate-spin")).not.toBeInTheDocument();
    });
    expect(await screen.findByTestId("select-ue")).toBeInTheDocument();
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

  it("submete formulário (sucesso) e exibe seção adicional com funcionários", async () => {
    const user = userEvent.setup();
    const onSubmitDesignacao = vi.fn();
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    getDesignacaoUnidadeSpy.mockResolvedValue({
      success: true,
      data: {
        cargos: [
          { codigoCargo: "cargo-1", nomeCargo: "Coordenador" },
          { codigoCargo: "cargo-2", nomeCargo: "Secretário" },
        ],
        funcionarios_unidade: {
          "cargo-1": {
            codigo_cargo: 1,
            nome_cargo: "Coordenador",
            modulo: "2",
            servidores: [
              {
                rf: "1",
                nome: "Fulano",
                esta_afastado: false,
                cargoSobreposto: "Cargo Sobreposto X",
              },
            ],
          },
          "cargo-2": {
            codigo_cargo: 2,
            nome_cargo: "Secretário",
            modulo: "3",
            servidores: [
              {
                rf: "2",
                nome: "Beltrano",
                esta_afastado: false,
                cargoSobreposto: "Cargo Sobreposto Y",
              },
            ],
          },
        },
      },
    } as never);

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        onSubmitDesignacao={onSubmitDesignacao}
        setDisableProximo={vi.fn()}
      />
    );

    await selectDreAndUe(user);

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

    await waitFor(() => {
      expect(getDesignacaoUnidadeSpy).toHaveBeenCalledWith("ue-1");
    });

    await waitFor(() => {
      expect(
        screen.getByText("Funcionários da unidade")
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Código Estrutura hierárquica")).toBeInTheDocument();
    expect(screen.getByText("Qtd. Turmas")).toBeInTheDocument();

    const codigoInput = screen.getByTestId("input-codigo") as HTMLInputElement;
    expect(codigoInput.value).toBe("");

    expect(screen.getAllByText("-").length).toBeGreaterThan(0);

    consoleErrorSpy.mockRestore();
  });

  it("permite selecionar funcionário e preenche Cargo sobreposto/Módulos", async () => {
    const user = userEvent.setup();

    getDesignacaoUnidadeSpy.mockResolvedValue({
      success: true,
      data: {
        cargos: [{ codigoCargo: "cargo-1", nomeCargo: "Coordenador" }],
        funcionarios_unidade: {
          "cargo-1": {
            codigo_cargo: 1,
            nome_cargo: "Coordenador",
            modulo: "4",
            servidores: [
              {
                rf: "123",
                nome: "Fulano",
                esta_afastado: false,
                cargoSobreposto: "Professor",
              },
            ],
          },
        },
      },
    } as never);

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        onSubmitDesignacao={vi.fn()}
        setDisableProximo={vi.fn()}
      />
    );

    await selectDreAndUe(user);

    await user.click(screen.getByRole("button", { name: /Pesquisar/i }));

    await waitFor(() => {
      const funcionariosSelect = screen.getByTestId("select-funcionarios");
      expect(funcionariosSelect).toBeInTheDocument();
    });

    const funcionariosSelect = screen.getByTestId("select-funcionarios");
    await user.click(funcionariosSelect);

    await clickSelectOption(user, "Coordenador");

    expect(screen.getByText("Cargo sobreposto")).toBeInTheDocument();
    expect(screen.getByText("Professor")).toBeInTheDocument();
    expect(screen.getByText("Módulos")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("não renderiza Cargo sobreposto/Módulos quando retorno não possui dados", async () => {
    const user = userEvent.setup();

    getDesignacaoUnidadeSpy.mockResolvedValue({
      success: true,
      data: {
        cargos: [{ codigoCargo: "cargo-1", nomeCargo: "Coordenador" }],
        funcionarios_unidade: {
          "cargo-1": {
            codigo_cargo: 1,
            nome_cargo: "Coordenador",
            modulo: "",
            servidores: [
              {
                rf: "123",
                nome: "Fulano",
                esta_afastado: false,
                cargoSobreposto: null,
              },
            ],
          },
        },
      },
    } as never);

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        onSubmitDesignacao={vi.fn()}
        setDisableProximo={vi.fn()}
      />
    );

    await selectDreAndUe(user);

    await user.click(screen.getByRole("button", { name: /Pesquisar/i }));

    await waitFor(() => {
      expect(screen.getByTestId("select-funcionarios")).toBeInTheDocument();
    });

    const funcionariosSelect = screen.getByTestId("select-funcionarios");
    await user.click(funcionariosSelect);
    await clickSelectOption(user, "Coordenador");

    expect(screen.queryByText("Cargo sobreposto")).not.toBeInTheDocument();
    expect(screen.queryByText("Módulos")).not.toBeInTheDocument();
  });

  it("permite editar código estrutura hierárquica", async () => {
    const user = userEvent.setup();

    getDesignacaoUnidadeSpy.mockResolvedValue({
      success: true,
      data: {
        cargos: [{ codigoCargo: "cargo-1", nomeCargo: "Coordenador" }],
        funcionarios_unidade: {
          "cargo-1": {
            codigo_cargo: 1,
            nome_cargo: "Coordenador",
            modulo: "1",
            servidores: [
              {
                rf: "123",
                nome: "Fulano",
                esta_afastado: false,
                cargoSobreposto: "Professor",
              },
            ],
          },
        },
      },
    } as never);

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        onSubmitDesignacao={vi.fn()}
        setDisableProximo={vi.fn()}
      />
    );

    await selectDreAndUe(user);
    await user.click(screen.getByRole("button", { name: /Pesquisar/i }));

    const codigoInput = (await screen.findByTestId(
      "input-codigo"
    )) as HTMLInputElement;

    await user.clear(codigoInput);
    await user.type(codigoInput, "999999");

    expect(codigoInput.value).toBe("999999");
  });

  it("quando API retorna success:false, trata erro e ainda chama onSubmitDesignacao", async () => {
    const user = userEvent.setup();
    const onSubmitDesignacao = vi.fn();
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    getDesignacaoUnidadeSpy.mockResolvedValue({
      success: false,
      error: "falha",
    } as never);

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        onSubmitDesignacao={onSubmitDesignacao}
        setDisableProximo={vi.fn()}
      />
    );

    await selectDreAndUe(user);
    await user.click(screen.getByRole("button", { name: /Pesquisar/i }));

    await waitFor(() => {
      expect(onSubmitDesignacao).toHaveBeenCalled();
    });
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(
      screen.queryByText("Funcionários da unidade")
    ).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it("quando API lança exceção, trata erro e ainda chama onSubmitDesignacao", async () => {
    const user = userEvent.setup();
    const onSubmitDesignacao = vi.fn();
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    getDesignacaoUnidadeSpy.mockRejectedValue(new Error("boom"));

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        onSubmitDesignacao={onSubmitDesignacao}
        setDisableProximo={vi.fn()}
      />
    );

    await selectDreAndUe(user);
    await user.click(screen.getByRole("button", { name: /Pesquisar/i }));

    await waitFor(() => {
      expect(onSubmitDesignacao).toHaveBeenCalled();
    });
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(
      screen.queryByText("Funcionários da unidade")
    ).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it("renderiza botão de visualização de turmas e abre o modal", async () => {
    const user = userEvent.setup();

    getDesignacaoUnidadeSpy.mockResolvedValue({
      success: true,
      data: {
        cargos: [{ codigoCargo: "cargo-1", nomeCargo: "Coordenador" }],
        funcionarios_unidade: {
          "cargo-1": {
            codigo_cargo: 1,
            nome_cargo: "Coordenador",
            modulo: "1",
            servidores: [
              {
                rf: "123",
                nome: "Fulano",
                esta_afastado: false,
                cargoSobreposto: "Professor",
              },
            ],
          },
        },
      },
    } as never);

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        onSubmitDesignacao={vi.fn()}
        setDisableProximo={vi.fn()}
      />
    );

    await selectDreAndUe(user);
    await user.click(screen.getByRole("button", { name: /Pesquisar/i }));

    const eyeButton = await screen.findByTestId("btn-visualizar-turmas");
    await user.click(eyeButton);

    expect(
      await screen.findByText("Detalhamento de turmas")
    ).toBeInTheDocument();
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

    await selectDreAndUe(user);

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