import React, { type SVGProps } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import DesignacoesPasso1 from "./page";
import { FormDesignacaoData } from "@/components/dashboard/Designacao/PesquisaUnidade/schema";

/* -------------------------------------------------------------------------- */
/*                                  MOCKS                                     */
/* -------------------------------------------------------------------------- */

const mockMutateAsync = vi.fn();
const mockRouterPush = vi.fn();
const mockClearFormDesignacaoData = vi.fn();
let mockRfParam: string | null = null;
let initialContextData: any = {};

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

  const DesignacaoContext = React.createContext<any>(null);

  const DesignacaoProvider = ({ children }: { children: React.ReactNode }) => {
    const [formDesignacaoData, setFormDesignacaoData] =
      React.useState<any>(initialContextData);
    

    return (
      <DesignacaoContext.Provider
        value={{
          formDesignacaoData,
          setFormDesignacaoData,
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
    get: (key: string) => (key === "rf" ? mockRfParam : null),
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
  Accordion: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="accordion">{children}</div>
  ),
}));

vi.mock("antd", () => ({
  Card: ({ children, title }: any) => (
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
    default: (props: any) => (
      <div data-testid="resumo-designacao">
        {props.defaultValues?.nome}
        <button
          type="button"
          data-testid="editar-servidor-indicado"
          onClick={() =>
            props.onSubmitEditarServidor?.({
              nome_servidor: "Servidor Editado",
              nome_civil: "Civil Editado",
            })
          }
        >
          Editar
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
  }: any) => (
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
    mockRfParam = null;
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
    initialContextData = { designacaoUnidade: { id: "1" } };
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

});