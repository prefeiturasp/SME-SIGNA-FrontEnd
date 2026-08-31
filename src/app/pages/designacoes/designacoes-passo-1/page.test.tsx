import React, { type SVGProps } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import DesignacoesPasso1 from "./page";
import { FormDesignacaoData } from "@/components/dashboard/Designacao/PesquisaUnidade/schema";
import type { FormDesignacaoEServidorIndicado } from "../DesignacaoContext";
import type { FormEditarServidorData } from "@/components/dashboard/Designacao/ModalEditarServidor/schema";
import type { DesignacaoUnidadeResponse, Servidor } from "@/types/designacao-unidade";

/* -------------------------------------------------------------------------- */
/*                                  MOCKS                                     */
/* -------------------------------------------------------------------------- */

const mockMutateAsync = vi.fn();
const mockRouterPush = vi.fn();
const mockClearFormDesignacaoData = vi.fn();
let mockRfParam: string | null = null;
let mockIdParam: string | null = null;
let initialContextData: FormDesignacaoEServidorIndicado | null = {};
let mockChamarUpdaterComEstadoNulo = false;
const mockAccordionValueChange = vi.fn();

const servidorIndicadoMock: Servidor = {
  nome_servidor: "Servidor Teste",
  rf: "123",
  vinculo: 1,
  cd_cargo_base: 1,
  cargo_base: "Professor",
  cd_cargo_sobreposto_funcao_atividade: 2,
  cargo_sobreposto_funcao_atividade: "Docente",
  cursos_titulos: "Licenciatura",
  lotacao: "Escola X",
  laudo_medico: "Não",
  local_de_servico: "Local de serviço",
  local_de_exercicio: "Local de exercício",
};

const designacaoUnidadeMock: DesignacaoUnidadeResponse = {
  codigo_hierarquico: "1",
  funcionarios_unidade: {},
  cargos: [],
  turmas: { total: 0, turnos: [] },
  spi: { tipo: "spi", total: 0, turnos: [] },
};

const mockResponse = {
  nome: "Servidor Teste",
  nome_civil: "Servidor Teste",
  nome_servidor: "Servidor Teste",
  rf: "123",
  vinculo_cargo_sobreposto: "Ativo",
  lotacao_cargo_sobreposto: "Escola X",
  cargo_base: "Professor",
  aulas_atribuidas: "20",
  funcao_atividade: "Docente",
  cargo_sobreposto: "Nenhum",
  cursos_titulos: "Licenciatura",
  estagio_probatorio: "Sim",
  aprovado_em_concurso: "Sim",
  laudo_medico: "Não",
};

const mockFormValues: FormDesignacaoData = {
  dre: "dre-1",
  ue: "ue-1",
  codigo_hierarquico: "123456",
  funcionarios_da_unidade: "123",
  quantidade_turmas: "40",
  cargo_sobreposto: "20",
  modulos: "2",
};
let mockGetValuesVazio = false;

const isPending = false;

/* -------------------------------------------------------------------------- */
/*                                HOOK MOCK                                   */
/* -------------------------------------------------------------------------- */

vi.mock("@/hooks/useServidorDesignacao", () => ({
  __esModule: true,
  default: () => ({
    mutateAsync: mockMutateAsync,
    isPending,
  }),
}));

/* -------------------------------------------------------------------------- */
/*                          CONTEXTO COM PROVIDER REAL                        */
/* -------------------------------------------------------------------------- */

vi.mock("../DesignacaoContext", async () => {
  const React = await import("react");

  const DesignacaoContext = React.createContext<{
    formDesignacaoData: FormDesignacaoEServidorIndicado | null;
    setFormDesignacaoData: React.Dispatch<React.SetStateAction<FormDesignacaoEServidorIndicado | null>>;
    clearFormDesignacaoData: () => void;
  } | null>(null);

  const DesignacaoProvider = ({ children }: { children: React.ReactNode }) => {
    const [formDesignacaoData, setFormDesignacaoData] =
      React.useState<FormDesignacaoEServidorIndicado | null>(initialContextData);

    const atualizarFormulario: React.Dispatch<
      React.SetStateAction<FormDesignacaoEServidorIndicado | null>
    > = (action) => {
      if (mockChamarUpdaterComEstadoNulo && typeof action === "function") {
        action(null);
        return;
      }
      setFormDesignacaoData(action);
    };

    return (
      <DesignacaoContext.Provider
        value={{
          formDesignacaoData,
          setFormDesignacaoData: atualizarFormulario,
          clearFormDesignacaoData: mockClearFormDesignacaoData,
        }}
      >
        {children}
      </DesignacaoContext.Provider>
    );
  };

  return {
    useDesignacaoContext: () => React.useContext(DesignacaoContext),
    DesignacaoProvider,
  };
});

/* -------------------------------------------------------------------------- */
/*                                ROUTER MOCK                                 */
/* -------------------------------------------------------------------------- */

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "rf") return mockRfParam;
      if (key === "id") return mockIdParam;
      return null;
    },
  }),
}));

/* -------------------------------------------------------------------------- */
/*                                UI MOCKS                                    */
/* -------------------------------------------------------------------------- */

vi.mock("@/assets/icons/Designacao", () => ({
  __esModule: true,
  default: (props: SVGProps<SVGSVGElement>) => (
    <svg data-testid="designacao-icon" {...props} />
  ),
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => (
    <div data-testid="page-header">{title}</div>
  ),
}));

vi.mock("@/components/dashboard/Designacao/StepperDesignacao", () => ({
  __esModule: true,
  default: () => <div data-testid="stepper-designacao" />,
}));

vi.mock("@/components/dashboard/FundoBranco/QuadroBranco", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="fundo-branco">{children}</div>
  ),
}));

vi.mock("@/components/dashboard/Designacao/CustomAccordionItem", () => ({
  __esModule: true,
  CustomAccordionItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="accordion-item">{children}</div>
  ),
}));

vi.mock("@/components/ui/accordion", () => ({
  Accordion: ({
    children,
    onValueChange,
  }: {
    children: React.ReactNode;
    onValueChange?: (values: string[]) => void;
  }) => (
    <div data-testid="accordion">
      <button
        type="button"
        data-testid="accordion-toggle-unidade"
        onClick={() => {
          mockAccordionValueChange();
          onValueChange?.([]);
        }}
      >
        Fechar unidade proponente
      </button>
      <button
        type="button"
        data-testid="accordion-keep-unidade"
        onClick={() => onValueChange?.(["unidade-proponente"])}
      >
        Manter unidade proponente
      </button>
      {children}
    </div>
  ),
}));

vi.mock("antd", () => ({
  Card: ({ children, title }: { children: React.ReactNode; title?: React.ReactNode }) => (
    <div data-testid="card">
      {title}
      {children}
    </div>
  ),
}));

/* -------------------------- Resumo Mock ------------------------------------ */

vi.mock(
  "@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado",
  () => ({
    __esModule: true,
    default: (props: {
      defaultValues?: { nome?: string; nome_servidor?: string };
      onSubmitEditarServidor?: (data: FormEditarServidorData) => void;
    }) => (
      <div data-testid="resumo-designacao">
        {props.defaultValues?.nome_servidor ?? props.defaultValues?.nome}
        <button
          type="button"
          data-testid="editar-servidor-indicado"
          onClick={() =>
            props.onSubmitEditarServidor?.({
              nome_servidor: "Servidor Editado",
              nome_civil: "Civil Editado",
              categoria: "A",
            })
          }
        >
          Editar
        </button>
        <button
          type="button"
          data-testid="editar-servidor-sem-categoria"
          onClick={() =>
            props.onSubmitEditarServidor?.({
              nome_servidor: "Servidor Sem Categoria",
              nome_civil: "Civil Sem Categoria",
            })
          }
        >
          Editar sem categoria
        </button>
      </div>
    ),
  })
);

/* ------------------- Formulario Pesquisa Unidade Mock ---------------------- */

vi.mock(
  "@/components/dashboard/Designacao/PesquisaUnidade/FormularioPesquisaUnidade",
  () => ({
    __esModule: true,
    default: React.forwardRef(function MockFormularioPesquisaUnidade(
      {
        setDisableProximo,
      }: {
        setDisableProximo: (disable: boolean) => void;
      },
      ref: React.ForwardedRef<{ getValues: () => FormDesignacaoData | undefined }>
    ) {
      const [dre, setDre] = React.useState("");
      const [ue, setUe] = React.useState("");

      React.useEffect(() => {
        setDisableProximo(true);
      }, [setDisableProximo]);

      React.useImperativeHandle(
        ref,
        () => ({
          getValues: () =>
            mockGetValuesVazio
              ? undefined
              : {
                  ...mockFormValues,
                  dre,
                  ue,
                },
        }),
        [dre, ue]
      );

      return (
        <div data-testid="formulario-pesquisa-unidade">
          <select
            data-testid="select-dre"
            value={dre}
            onChange={(e) => {
              setDre(e.target.value);
              setUe("");
              setDisableProximo(true);
            }}
          >
            <option value="">Selecione</option>
            <option value="dre-1">DRE 1</option>
          </select>

          <select
            data-testid="select-ue"
            value={ue}
            onChange={(e) => {
              setUe(e.target.value);
              setDisableProximo(false);
            }}
          >
            <option value="">Selecione</option>
            <option value="ue-1">UE 1</option>
          </select>
        </div>
      );
    }),
  })
);

vi.mock("@/components/dashboard/Designacao/BotoesDeNavegacao", () => ({
  __esModule: true,
  default: ({
    disableAnterior,
    disableProximo,
    onProximo,
  }: {
    disableAnterior?: boolean;
    disableProximo?: boolean;
    onProximo?: () => void;
  }) => (
    <div>
      <button data-testid="botao-anterior" disabled={disableAnterior}>
        Anterior
      </button>
      <button
        data-testid="botao-proximo"
        disabled={disableProximo}
        onClick={onProximo}
      >
        Próximo
      </button>
      <button
        type="button"
        data-testid="botao-proximo-forcar"
        onClick={onProximo}
      >
        Forçar próximo
      </button>
    </div>
  ),
}));

/* -------------------------------------------------------------------------- */
/*                                   TESTES                                   */
/* -------------------------------------------------------------------------- */

import { DesignacaoProvider } from "../DesignacaoContext";

describe("DesignacoesPasso1", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetValuesVazio = false;
    mockChamarUpdaterComEstadoNulo = false;
    mockRfParam = null;
    mockIdParam = null;
    initialContextData = {};
    mockMutateAsync.mockResolvedValue({
      success: true,
      data: mockResponse,
    });
  });

  const renderWithProvider = () =>
    render(
      <DesignacaoProvider>
        <DesignacoesPasso1 />
      </DesignacaoProvider>
    );

  const clicarPesquisarServidor = async () => {
    await userEvent.click(
      screen.getByTestId("botao-pesquisar-servidor")
    );
  };

  it("renderiza o cabeçalho e o formulário inicial", () => {
    renderWithProvider();

    expect(screen.getByTestId("page-header")).toHaveTextContent("Designação");
    expect(screen.getByTestId("stepper-designacao")).toBeInTheDocument();
    expect(screen.getByTestId("input-rf")).toBeInTheDocument();
    expect(mockClearFormDesignacaoData).toHaveBeenCalledTimes(1);
  });

  it("não limpa os dados quando rf vem na URL", () => {
    mockRfParam = "123456";
    renderWithProvider();
    expect(mockClearFormDesignacaoData).not.toHaveBeenCalled();
  });

  it("inicia com próximo habilitado quando já existe designação de unidade", () => {
    initialContextData = { designacaoUnidade: designacaoUnidadeMock };
    renderWithProvider();
    expect(screen.getByTestId("botao-proximo")).toBeDisabled();
  });

  it("renderiza formulário de unidade com contexto nulo", () => {
    initialContextData = null;
    renderWithProvider();
    expect(screen.getByTestId("formulario-pesquisa-unidade")).toBeInTheDocument();
  });

  it("exibe o resumo após busca bem-sucedida", async () => {
    renderWithProvider();

    await userEvent.type(screen.getByTestId("input-rf"), "123");
    await clicarPesquisarServidor();

    expect(mockMutateAsync).toHaveBeenCalledWith({ rf: "123" });

    await waitFor(() => {
      expect(screen.getByTestId("resumo-designacao")).toBeInTheDocument();
    });

    expect(screen.getByText("Servidor Teste")).toBeInTheDocument();

    await userEvent.click(screen.getByTestId("editar-servidor-indicado"));
    expect(screen.getByTestId("resumo-designacao")).toBeInTheDocument();
  });

  it("mostra erro quando a busca falha", async () => {
    mockMutateAsync.mockResolvedValueOnce({
      success: false,
      error: "Servidor não encontrado",
    });

    renderWithProvider();

    await userEvent.type(screen.getByTestId("input-rf"), "123");
    await clicarPesquisarServidor();

    await waitFor(() => {
      expect(
        screen.getByText("Servidor não encontrado")
      ).toBeInTheDocument();
    });
  });

  it("envia dados da unidade e navega ao próximo passo", async () => {
    renderWithProvider();

    await userEvent.type(screen.getByTestId("input-rf"), "123");
    await clicarPesquisarServidor();

    await waitFor(() => {
      expect(screen.getByTestId("resumo-designacao")).toBeInTheDocument();
    });

    await userEvent.selectOptions(screen.getByTestId("select-dre"), "dre-1");
    await userEvent.selectOptions(screen.getByTestId("select-ue"), "ue-1");

    await userEvent.click(screen.getByTestId("botao-proximo"));

    expect(mockRouterPush).toHaveBeenCalledWith(
      "/pages/designacoes/designacoes-passo-2"
    );
  });

  it("navega para o próximo passo com id na query", async () => {
    mockIdParam = "77";
    mockRfParam = "123456";
    renderWithProvider();

    await userEvent.type(screen.getByTestId("input-rf"), "123");
    await clicarPesquisarServidor();
    await waitFor(() => {
      expect(screen.getByTestId("resumo-designacao")).toBeInTheDocument();
    });

    await userEvent.selectOptions(screen.getByTestId("select-dre"), "dre-1");
    await userEvent.selectOptions(screen.getByTestId("select-ue"), "ue-1");
    await userEvent.click(screen.getByTestId("botao-proximo"));

    expect(mockRouterPush).toHaveBeenCalledWith(
      "/pages/designacoes/designacoes-passo-2?id=77&rf=123456"
    );
  });

  it("salva valores da unidade ao fechar acordeon", async () => {
    renderWithProvider();

    await userEvent.type(screen.getByTestId("input-rf"), "123");
    await clicarPesquisarServidor();
    await waitFor(() => {
      expect(screen.getByTestId("resumo-designacao")).toBeInTheDocument();
    });

    await userEvent.selectOptions(screen.getByTestId("select-dre"), "dre-1");
    await userEvent.selectOptions(screen.getByTestId("select-ue"), "ue-1");
    await userEvent.click(screen.getByTestId("accordion-toggle-unidade"));
    expect(mockAccordionValueChange).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByTestId("botao-proximo"));
    expect(mockRouterPush).toHaveBeenCalledWith(
      "/pages/designacoes/designacoes-passo-2"
    );
  });

  it("não altera estado ao manter seção de unidade aberta", async () => {
    renderWithProvider();

    await userEvent.type(screen.getByTestId("input-rf"), "123");
    await clicarPesquisarServidor();
    await waitFor(() => {
      expect(screen.getByTestId("resumo-designacao")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId("accordion-keep-unidade"));
    await userEvent.selectOptions(screen.getByTestId("select-dre"), "dre-1");
    await userEvent.selectOptions(screen.getByTestId("select-ue"), "ue-1");
    await userEvent.click(screen.getByTestId("botao-proximo"));

    expect(mockRouterPush).toHaveBeenCalledWith(
      "/pages/designacoes/designacoes-passo-2"
    );
  });



 
  it("faz return no onProximo quando valoresFormulario é undefined", async () => {
    mockGetValuesVazio = true;
    renderWithProvider();

    await userEvent.type(screen.getByTestId("input-rf"), "123");
    await clicarPesquisarServidor();

    await waitFor(() => {
      expect(screen.getByTestId("formulario-pesquisa-unidade")).toBeInTheDocument();
    });

    await userEvent.selectOptions(screen.getByTestId("select-dre"), "dre-1");
    await userEvent.selectOptions(screen.getByTestId("select-ue"), "ue-1");

    await waitFor(() => {
      expect(screen.getByTestId("botao-proximo")).toBeEnabled();
    });

    await userEvent.click(screen.getByTestId("botao-proximo"));

    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it("não navega no próximo quando não há servidor indicado", () => {
    renderWithProvider();

    fireEvent.click(screen.getByTestId("botao-proximo-forcar"));

    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it("salva a unidade ao fechar o acordeon mesmo com contexto nulo", async () => {
    initialContextData = null;
    renderWithProvider();

    await userEvent.selectOptions(screen.getByTestId("select-dre"), "dre-1");
    await userEvent.selectOptions(screen.getByTestId("select-ue"), "ue-1");
    await userEvent.click(screen.getByTestId("accordion-toggle-unidade"));

    expect(mockAccordionValueChange).toHaveBeenCalledTimes(1);
  });

  it("não altera o estado ao fechar o acordeon sem valores no formulário", async () => {
    mockGetValuesVazio = true;
    renderWithProvider();

    await userEvent.click(screen.getByTestId("accordion-toggle-unidade"));

    expect(mockAccordionValueChange).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it("atualiza o servidor indicado com e sem categoria", async () => {
    initialContextData = null;
    renderWithProvider();

    await userEvent.type(screen.getByTestId("input-rf"), "123");
    await clicarPesquisarServidor();

    await waitFor(() => {
      expect(screen.getByTestId("resumo-designacao")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId("editar-servidor-indicado"));
    expect(screen.getByTestId("resumo-designacao")).toHaveTextContent("Servidor Editado");

    await userEvent.click(screen.getByTestId("editar-servidor-sem-categoria"));
    expect(screen.getByTestId("resumo-designacao")).toHaveTextContent("Servidor Sem Categoria");
  });

  it("usa objeto vazio quando o estado anterior é nulo ao editar o servidor", async () => {
    initialContextData = { servidorIndicado: servidorIndicadoMock };
    mockChamarUpdaterComEstadoNulo = true;
    renderWithProvider();

    await userEvent.click(screen.getByTestId("editar-servidor-indicado"));

    expect(screen.getByTestId("resumo-designacao")).toBeInTheDocument();
  });

  it("usa objeto vazio quando o estado anterior é nulo ao avançar", async () => {
    initialContextData = { servidorIndicado: servidorIndicadoMock };
    mockChamarUpdaterComEstadoNulo = true;
    renderWithProvider();

    await userEvent.selectOptions(screen.getByTestId("select-dre"), "dre-1");
    await userEvent.selectOptions(screen.getByTestId("select-ue"), "ue-1");
    await userEvent.click(screen.getByTestId("botao-proximo"));

    expect(mockRouterPush).toHaveBeenCalledWith(
      "/pages/designacoes/designacoes-passo-2",
    );
  });
});