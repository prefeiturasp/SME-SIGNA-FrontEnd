import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import FormularioPesquisaUnidade from "./FormularioPesquisaUnidade";
import * as unidadesActions from "@/actions/unidades";
import * as designacaoActions from "@/actions/designacao-unidade";
import { createRef } from "react";
import type { FormularioPesquisaUnidadeRef } from "./FormularioPesquisaUnidade";

const designacaoContextMock = vi.hoisted(() => ({
  formDesignacaoData: null as any,
  setFormDesignacaoData: vi.fn(),
}));

vi.mock("@/app/pages/designacoes/DesignacaoContext", () => ({
  useDesignacaoContext: () => ({
    formDesignacaoData: designacaoContextMock.formDesignacaoData,
    setFormDesignacaoData: designacaoContextMock.setFormDesignacaoData,
  }),
}));


vi.mock("@/hooks/useDesignacaoUnidade", async () => {
  const React = await import("react");
  const actions = await import("@/actions/designacao-unidade");

  const useFetchDesignacaoUnidadeMutationMock = () => {
    const [isPending, setIsPending] = React.useState(false);

    const mutateAsync = async (codigoUe: string) => {
      setIsPending(true);
      try {
        return await actions.getDesignacaoUnidadeAction(codigoUe);
      } finally {
        setIsPending(false);
      }
    };

    return { mutateAsync, isPending };
  };

  return {
    __esModule: true,
    default: useFetchDesignacaoUnidadeMutationMock,
  };
});

vi.doMock("@/components/detalhamentoTurmas/detalhamentoTurmas", () => ({
  __esModule: true,
  default: ({
    dre,
    unidadeEscolar,
    qtdTotalTurmas,
    spi,
    rows,
    spiRows,
  }: {
    dre: string;
    unidadeEscolar: string;
    qtdTotalTurmas: string;
    spi: string;
    rows: unknown[];
    spiRows: unknown[];
  }) => (
    <div data-testid="detalhamento-props">
      {dre}|{unidadeEscolar}|{qtdTotalTurmas}|{spi}|{rows.length}|{spiRows.length}
    </div>
  ),
}));

vi.mock("../ModalResumoServidor/ModalResumoServidor", () => ({
  __esModule: true,
  default: ({
    open,
    servidores,
  }: {
    open: boolean;
    servidores: { nome?: string; rf?: string }[];
  }) =>
    open ? (
      <div data-testid="modal-resumo-servidor">
        {servidores?.[0]?.nome} - {servidores?.[0]?.rf}
      </div>
    ) : null,
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
  { codigoEscola: 'ue-1', nomeEscola: 'UE 1 da DRE Selecionada', siglaTipoEscola: 'EMEI' },
  { codigoEscola: 'ue-2', nomeEscola: 'UE 2 da DRE Selecionada', siglaTipoEscola: 'EMEF' },
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
    ueName = "UE 1 da DRE Selecionada",
    siglaTipoEscola = "EMEI"
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
    await user.click(await screen.findByText(`${siglaTipoEscola} - ${ueName}`));
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
    designacaoContextMock.formDesignacaoData = null;
    designacaoContextMock.setFormDesignacaoData.mockReset();

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
        isLoading={false}

        setDisableProximo={vi.fn()}
      />
    );

    expect(screen.getByText("DRE")).toBeInTheDocument();
    expect(screen.getByText("Unidade proponente")).toBeInTheDocument();
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
        isLoading={false}

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
        isLoading={false}

        setDisableProximo={setDisableProximo}
      />
    );

    const dreSelect = screen.getByTestId("select-dre");
    await user.click(dreSelect);
    await clickSelectOption(user, "DRE Sul");


    await waitFor(() => {
      expect(getUEsSpy).toHaveBeenCalledWith("dre-1");
    });

    const ueCombobox = screen.getByTestId("select-ue");
    expect(ueCombobox).not.toBeDisabled();
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
        isLoading={false}

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



  it("submete formulário (sucesso) e exibe seção adicional com funcionários", async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => { });

    getDesignacaoUnidadeSpy.mockResolvedValue({
      success: true,
      data: {
        codigo_hierarquico: "COD-HIER-01",
        turmas: { total: 0, turnos: [] },
        spi: { tipo: "-", total: 0, turnos: [] },
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
                vinculo_cargo_sobreposto: "string",
                lotacao_cargo_sobreposto: "string",
                cargo_base: "string",
                funcao_atividade: "string",
                cargo_sobreposto: "Cargo Sobreposto X",
                cursos_titulos: "string",
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
                vinculo_cargo_sobreposto: "string",
                lotacao_cargo_sobreposto: "string",
                cargo_base: "string",
                funcao_atividade: "string",
                cargo_sobreposto: "Cargo Sobreposto Y",
                cursos_titulos: "string",
              },
            ],
          },
        },
      },
    } as never);

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        isLoading={false}

        setDisableProximo={vi.fn()}
      />
    );

    await selectDreAndUe(user);

    await user.click(screen.getByRole("button", { name: /Pesquisar/i }));



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
    expect(screen.getByText("COD-HIER-01")).toBeInTheDocument();

    expect(
      screen.getByText("Código Estrutura hierárquica")
    ).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it("exibe loading no botão Pesquisar enquanto a mutation está pendente", async () => {
    const user = userEvent.setup();

    // mantém a mutation pendente
    getDesignacaoUnidadeSpy.mockReturnValue(
      new Promise(() => { }) as never
    );

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        isLoading={false}

        setDisableProximo={vi.fn()}
      />
    );

    await selectDreAndUe(user);

    const submitBtn = screen.getByRole("button", { name: /Pesquisar/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(submitBtn).toBeDisabled();
      expect(submitBtn.querySelector(".animate-spin")).toBeInTheDocument();
    });
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

                vinculo_cargo_sobreposto: "string",
                lotacao_cargo_sobreposto: "string",
                cargo_base: "string",
                funcao_atividade: "string",
                cargo_sobreposto: "Professor",
                cursos_titulos: "string",
              },
            ],
          },
        },
      },
    } as never);

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        isLoading={false}

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
    // expect(screen.getByText("Professor")).toBeInTheDocument();
    expect(screen.getByText("Módulos")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("habilita visualização do servidor após selecionar funcionário e abre o modal", async () => {
    const user = userEvent.setup();

    getDesignacaoUnidadeSpy.mockResolvedValue({
      success: true,
      data: {
        cargos: [{ codigoCargo: "cargo-1", nomeCargo: "Coordenador" }],
        funcionarios_unidade: {
          "cargo-1": {
            codigo_cargo: 1,
            nome_cargo: "Coordenador",
            modulo: "2",
            servidores: [
              {
                rf: "123",
                nome: "Fulano",
                esta_afastado: false,
                vinculo_cargo_sobreposto: "string",
                lotacao_cargo_sobreposto: "string",
                cargo_base: "string",
                funcao_atividade: "string",
                cargo_sobreposto: "Professor",
                cursos_titulos: "string",
              },
            ],
          },
        },
      },
    } as never);

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        isLoading={false}

        setDisableProximo={vi.fn()}
      />
    );

    await selectDreAndUe(user);
    await user.click(screen.getByRole("button", { name: /Pesquisar/i }));

    const viewServidorBtn = await screen.findByTestId("btn-visualizar-servidor");
    expect(viewServidorBtn).toBeDisabled();

    const funcionariosSelect = await screen.findByTestId("select-funcionarios");
    await user.click(funcionariosSelect);
    await clickSelectOption(user, "Coordenador");

    expect(viewServidorBtn).not.toBeDisabled();
    await user.click(viewServidorBtn);

    expect(await screen.findByTestId("modal-resumo-servidor")).toHaveTextContent(
      "Fulano - 123"
    );
  });

  it("quando não há servidor no cargo selecionado, usa fallback e não ainda permite abrir modal", async () => {
    const user = userEvent.setup();

    getDesignacaoUnidadeSpy.mockResolvedValue({
      success: true,
      data: {
        cargos: [{ codigoCargo: "cargo-1", nomeCargo: "Coordenador" }],
        funcionarios_unidade: {
          "cargo-1": {
            codigo_cargo: 1,
            nome_cargo: "Coordenador",
            // modulo ausente  
            servidores: [],
          },
        },
      },
    } as never);

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        isLoading={false}

        setDisableProximo={vi.fn()}
      />
    );

    await selectDreAndUe(user);
    await user.click(screen.getByRole("button", { name: /Pesquisar/i }));

    const funcionariosSelect = await screen.findByTestId("select-funcionarios");
    await user.click(funcionariosSelect);
    await clickSelectOption(user, "Coordenador");

    const viewServidorBtn = screen.getByTestId("btn-visualizar-servidor");
    expect(viewServidorBtn).toBeDisabled();



  });



  it("permite selecionar funcionários de outra unidade e não preenche Cargo sobreposto/Módulos", async () => {
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

                vinculo_cargo_sobreposto: "string",
                lotacao_cargo_sobreposto: "string",
                cargo_base: "string",
                funcao_atividade: "string",
                cargo_sobreposto: "Professor",
                cursos_titulos: "string",
              },
            ],
          },
        },
      },
    } as never);

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        isLoading={false}

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



    await selectDreAndUe(user, "DRE Norte", "UE 2 da DRE Selecionada", "EMEF");


    expect(screen.queryByText("Cargo sobreposto")).not.toBeInTheDocument();

    expect(screen.queryByText("Módulos")).not.toBeInTheDocument();
  });


  it("quando servidor não possui cargo_sobreposto, preenche com '-'", async () => {
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
                vinculo_cargo_sobreposto: "string",
                lotacao_cargo_sobreposto: "string",
                cargo_base: "string",
                funcao_atividade: "string",
                cargo_sobreposto: null,
                cursos_titulos: "string",
              },
            ],
          },
        },
      },
    } as never);

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        isLoading={false}

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

    // InfoItem: <div flex-col> -> <div flex-row><p label/></div> + <p value/>
    const cargoLabelRow = screen.getByText("Cargo sobreposto").closest("div");
    const cargoInfoItem = cargoLabelRow?.parentElement;
    expect(cargoInfoItem).toBeTruthy();
    if (cargoInfoItem) {
      expect(within(cargoInfoItem).getByText("-")).toBeInTheDocument();
    }
  });

  it("quando API retorna success:false, trata erro ", async () => {
    const user = userEvent.setup();


    getDesignacaoUnidadeSpy.mockResolvedValue({
      success: false,
      error: "Erro interno do servidor",
    } as never);

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        isLoading={false}

        setDisableProximo={vi.fn()}
      />
    );

    await selectDreAndUe(user);
    await user.click(screen.getByRole("button", { name: /Pesquisar/i }));


    expect(screen.getByText("Erro interno do servidor")).toBeInTheDocument();
    expect(
      screen.queryByText("Funcionários da unidade")
    ).not.toBeInTheDocument();

  });

  it("quando API lança exceção, trata erro (catch)  ", async () => {
    const user = userEvent.setup();
    const consoleLogSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => { });

    getDesignacaoUnidadeSpy.mockRejectedValue(new Error("boom"));

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        isLoading={false}

        setDisableProximo={vi.fn()}
      />
    );

    await selectDreAndUe(user);
    await user.click(screen.getByRole("button", { name: /Pesquisar/i }));


    expect(
      screen.queryByText("Funcionários da unidade")
    ).not.toBeInTheDocument();

    expect(consoleLogSpy).toHaveBeenCalledWith("error", expect.any(Error));
    consoleLogSpy.mockRestore();
  });

  it("ao trocar a DRE após carregar funcionários, limpa a seção adicional", async () => {
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
                vinculo_cargo_sobreposto: "string",
                lotacao_cargo_sobreposto: "string",
                cargo_base: "string",
                funcao_atividade: "string",
                cargo_sobreposto: "Professor",
                cursos_titulos: "string",
              },
            ],
          },
        },
      },
    } as never);

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        isLoading={false}

        setDisableProximo={vi.fn()}
      />
    );

    await selectDreAndUe(user);
    await user.click(screen.getByRole("button", { name: /Pesquisar/i }));
    expect(await screen.findByTestId("select-funcionarios")).toBeInTheDocument();

    // troca DRE -> deve limpar UE e também sumir com a seção de funcionários
    const dreSelect = screen.getByTestId("select-dre");
    await user.click(dreSelect);
    await clickSelectOption(user, "DRE Norte");

    await waitFor(() => {
      expect(screen.queryByTestId("select-funcionarios")).not.toBeInTheDocument();
    });
  });

  it("ao trocar a UE, limpa mensagem de erro e dados adicionais (limpa_dados_funcionarios)", async () => {
    const user = userEvent.setup();

    // força erro via success:false
    getDesignacaoUnidadeSpy.mockResolvedValue({
      success: false,
      error: "Falha ao buscar dados",
    } as never);

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        isLoading={false}

        setDisableProximo={vi.fn()}
      />
    );

    await selectDreAndUe(user);
    await user.click(screen.getByRole("button", { name: /Pesquisar/i }));
    expect(await screen.findByText("Falha ao buscar dados")).toBeInTheDocument();

    // troca UE -> deve limpar mensagem de erro
    const ueCombobox = screen.getByTestId("select-ue");
    await user.click(ueCombobox);
    await user.click(await screen.findByText("EMEF - UE 2 da DRE Selecionada"));

    await waitFor(() => {
      expect(screen.queryByText("Falha ao buscar dados")).not.toBeInTheDocument();
    });
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
                vinculo_cargo_sobreposto: "string",
                lotacao_cargo_sobreposto: "string",
                cargo_base: "string",
                funcao_atividade: "string",
                cargo_sobreposto: "Professor",
                cursos_titulos: "string",
              },
            ],
          },
        },
      },
    } as never);

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        isLoading={false}

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

  it("coverage: usa fallback '-' no DetalhamentoTurmasModal quando valores são nullish", async () => {
    vi.resetModules();
    vi.clearAllMocks();

    vi.doMock("@/hooks/useUnidades", () => ({
      useFetchDREs: () => ({ data: [] }),
      useFetchUEs: () => ({ data: [], isLoading: false }),
    }));

    vi.doMock("@/hooks/useDesignacaoUnidade", () => ({
      __esModule: true,
      default: () => ({ mutateAsync: vi.fn(), isPending: false }),
    }));

    vi.doMock("@/components/detalhamentoTurmas/detalhamentoTurmas", () => ({
      __esModule: true,
      default: (props: any) => {
        const {
          dre,
          unidadeEscolar,
          qtdTotalTurmas,
          spi,
          rows,
          spiRows,
        } = props;

        return (
          <div data-testid="detalhamento-props">
            {dre}|{unidadeEscolar}|{qtdTotalTurmas}|{spi}|{rows.length}|{spiRows.length}
          </div>
        );
      },
    }));

    vi.doMock("@/components/ui/form", () => ({
      Form: ({ children }: any) => <div>{children}</div>,
      FormControl: ({ children }: any) => <div>{children}</div>,
      FormField: ({ render }: any) =>
        render({ field: { value: "", onChange: vi.fn() } }),
      FormItem: ({ children }: any) => <div>{children}</div>,
      FormLabel: ({ children }: any) => <div>{children}</div>,
      FormMessage: () => null,
    }));

    vi.doMock("@/components/ui/select", () => ({
      Select: ({ children }: any) => <div>{children}</div>,
      SelectTrigger: ({ children }: any) => <button>{children}</button>,
      SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
      SelectContent: ({ children }: any) => <div>{children}</div>,
      SelectItem: ({ children }: any) => <div>{children}</div>,
    }));

    vi.doMock("@/components/ui/Combobox", () => ({
      Combobox: () => <div data-testid="mock-combobox" />,
    }));

    vi.doMock("@/components/ui/button", () => ({
      Button: ({ children, ...rest }: any) => (
        <button {...rest}>{children}</button>
      ),
    }));

    vi.doMock("@/assets/icons/Eye", () => ({
      __esModule: true,
      default: () => <svg />,
    }));

    vi.doMock("../ModalResumoServidor/ModalResumoServidor", () => ({
      __esModule: true,
      default: () => null,
    }));

    vi.doMock("react-hook-form", () => ({
      useForm: () => ({
        watch: () => ({
          dre: undefined,
          ue: undefined,
          funcionarios_da_unidade: "",
          quantidade_turmas: undefined,
          codigo_hierarquico: "",
          cargo_sobreposto: "",
          modulos: "",
        }),
        handleSubmit:
          (fn: any) =>
            (e?: any) => {
              e?.preventDefault?.();
              return fn({
                dre: undefined,
                ue: undefined,
                funcionarios_da_unidade: "",
                quantidade_turmas: undefined,
                codigo_hierarquico: "",
                cargo_sobreposto: "",
                modulos: "",
              });
            },
        control: {},
        clearErrors: vi.fn(),
        setValue: vi.fn(),
        getValues: vi.fn(() => ({})),
      }),
    }));

    const { default: FormularioPesquisaUnidadeIsolated } = await import(
      "./FormularioPesquisaUnidade"
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <FormularioPesquisaUnidadeIsolated
          isLoading={false}
          setDisableProximo={vi.fn()}
        />
      </QueryClientProvider>
    );

    expect(screen.getByTestId("detalhamento-props")).toHaveTextContent(
      "-|-|-|-|0|0"
    );
  });

  it("expõe getValues via ref", async () => {
    const user = userEvent.setup();
    const ref = createRef<FormularioPesquisaUnidadeRef>();

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        isLoading={false}
        ref={ref}

        setDisableProximo={vi.fn()}
      />
    );

    expect(ref.current?.getValues).toBeDefined();

    await selectDreAndUe(user);

    const values = ref.current?.getValues();
    expect(values).toEqual({
      dre: "dre-1",
      dre_nome: "DRE Sul",
      ue: "ue-1",
      ue_nome: "EMEI - UE 1 da DRE Selecionada",
      codigo_hierarquico: "",
      funcionarios_da_unidade: "",
      quantidade_turmas: "",
      cargo_sobreposto: "",
      modulos: "",
    });
  });

  it("valida campos obrigatórios ao submeter sem preencher", async () => {
    const user = userEvent.setup();

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        isLoading={false}

        setDisableProximo={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /Pesquisar/i }));

    await waitFor(() => {
      expect(screen.getByText("Selecione uma DRE")).toBeInTheDocument();
    });

  });

  it("valida loading", async () => {

    renderWithQueryClient(
      <FormularioPesquisaUnidade
        isLoading={true}

        setDisableProximo={vi.fn()}
      />
    );


    await waitFor(() => {
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

  });



  it("cobre fallback de DRE/UE não encontrados e código hierárquico preenchido", async () => {
    vi.resetModules();
    vi.clearAllMocks();

    const setValueSpy = vi.fn();

    vi.doMock("@/app/pages/designacoes/DesignacaoContext", () => ({
      useDesignacaoContext: () => ({
        formDesignacaoData: {
          designacaoUnidade: {
            codigo_hierarquico: "CTX-123",
            cargos: [],
            funcionarios_unidade: {
              "1": {
                codigo_cargo: 1,
                nome_cargo: "Cargo Contexto",
                modulo: "2",
                servidores: [],
              },
            },
            turmas: { total: 0, turnos: [] },
            spi: { tipo: "SPI", total: 0, turnos: [] },
          },
        },
        setFormDesignacaoData: vi.fn(),
      }),
    }));

    vi.doMock("@/hooks/useUnidades", () => ({
      useFetchDREs: () => ({
        data: [{ codigoDRE: "dre-1", nomeDRE: "DRE Sul", siglaDRE: "DRE1" }],
      }),
      useFetchUEs: () => ({
        data: [
          {
            codigoEscola: "ue-1",
            nomeEscola: "UE 1",
            siglaTipoEscola: "EMEI",
          },
        ],
        isLoading: false,
      }),
    }));

    vi.doMock("@/hooks/useDesignacaoUnidade", () => ({
      __esModule: true,
      default: () => ({ mutateAsync: vi.fn(), isPending: false }),
    }));

    vi.doMock("@/components/ui/form", () => ({
      Form: ({ children }: any) => <div>{children}</div>,
      FormControl: ({ children }: any) => <div>{children}</div>,
      FormField: ({ render }: any) =>
        render({ field: { value: "", onChange: vi.fn() } }),
      FormItem: ({ children }: any) => <div>{children}</div>,
      FormLabel: ({ children }: any) => <div>{children}</div>,
      FormMessage: () => null,
    }));

    vi.doMock("@/components/ui/select", () => ({
      Select: ({ children, onValueChange }: any) => (
        <div>
          <button
            type="button"
            data-testid="mock-select-trigger"
            onClick={() => onValueChange?.("valor-inexistente")}
          >
            selecionar
          </button>
          {children}
        </div>
      ),
      SelectTrigger: ({ children }: any) => <div>{children}</div>,
      SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
      SelectContent: ({ children }: any) => <div>{children}</div>,
      SelectItem: ({ children }: any) => <div>{children}</div>,
    }));

    vi.doMock("@/components/ui/Combobox", () => ({
      Combobox: ({ onChange }: any) => (
        <button
          type="button"
          data-testid="mock-combobox-trigger"
          onClick={() => onChange("ue-inexistente")}
        >
          alterar ue
        </button>
      ),
    }));

    vi.doMock("@/components/ui/button", () => ({
      Button: ({ children, ...rest }: any) => (
        <button {...rest}>{children}</button>
      ),
    }));

    vi.doMock("@/components/ui/info-item", () => ({
      InfoItem: ({ label, value }: any) => (
        <div data-testid={`info-${label}`}>{`${label}:${String(value)}`}</div>
      ),
    }));

    vi.doMock("@/assets/icons/Eye", () => ({
      __esModule: true,
      default: () => <svg />,
    }));

    vi.doMock("@/components/detalhamentoTurmas/detalhamentoTurmas", () => ({
      __esModule: true,
      default: () => null,
    }));

    vi.doMock("../ModalResumoServidor/ModalResumoServidor", () => ({
      __esModule: true,
      default: () => null,
    }));

    vi.doMock("react-hook-form", () => ({
      useForm: () => ({
        watch: (name?: string) => {
          if (name === "codigo_hierarquico") return "COD-123";
          if (name) return "";
          return {
            dre: "",
            ue: "",
            funcionarios_da_unidade: "",
            quantidade_turmas: "",
            codigo_hierarquico: "COD-123",
            cargo_sobreposto: "",
            modulos: "",
          };
        },
        handleSubmit:
          (fn: any) =>
          (e?: any) => {
            e?.preventDefault?.();
            return fn({
              dre: "",
              ue: "",
              funcionarios_da_unidade: "",
              quantidade_turmas: "",
              codigo_hierarquico: "COD-123",
              cargo_sobreposto: "",
              modulos: "",
            });
          },
        control: {},
        clearErrors: vi.fn(),
        setValue: setValueSpy,
        getValues: vi.fn(() => ({})),
      }),
    }));

    const { default: FormularioPesquisaUnidadeIsolated } = await import(
      "./FormularioPesquisaUnidade"
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <FormularioPesquisaUnidadeIsolated
          isLoading={false}
          setDisableProximo={vi.fn()}
        />
      </QueryClientProvider>
    );

    await userEvent.click(screen.getAllByTestId("mock-select-trigger")[0]);
    await userEvent.click(screen.getByTestId("mock-combobox-trigger"));

    expect(setValueSpy).toHaveBeenCalledWith("dre_nome", "");
    expect(setValueSpy).toHaveBeenCalledWith("ue_nome", "");
  });
});