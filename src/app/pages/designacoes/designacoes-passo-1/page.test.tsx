import React, { type SVGProps } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import DesignacoesPasso1 from "./page";

const mockMutateAsync = vi.fn();
const mockRouterPush = vi.fn();
const mockSetFormDesignacaoData = vi.fn();
const mockResumoDesignacao = vi.fn();

const mockResponse = {
  nome: "Servidor Teste",
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

const mockFormValues = {
  dre: "dre-1",
  ue: "ue-1",
  codigo_estrutura_hierarquica: "123456",
  funcionarios_da_unidade: "123",
  quantidade_turmas: "40",
  cargo_sobreposto: "20",
  modulos: "2",
};

let isPending = false;

vi.mock("@/hooks/useServidorDesignacao", () => ({
  __esModule: true,
  default: () => ({
    mutateAsync: mockMutateAsync,
    isPending: isPending,
  }),
}));

vi.mock("../DesignacaoContext", () => ({
  useDesignacaoContext: () => ({
    setFormDesignacaoData: mockSetFormDesignacaoData,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

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

vi.mock(
  "@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado",
  () => ({
    __esModule: true,
    default: (props: any) => {
      mockResumoDesignacao(props);
      return (
        <div data-testid="resumo-designacao">
          {props.defaultValues?.nome}
        </div>
      );
    },
  })
);

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
      ref: React.ForwardedRef<{ getValues: () => typeof mockFormValues }>
    ) {
      const [dre, setDre] = React.useState("");
      const [ue, setUe] = React.useState("");

      React.useEffect(() => {
        setDisableProximo(true);
      }, [setDisableProximo]);

      React.useImperativeHandle(
        ref,
        () => ({
          getValues: () => ({
            ...mockFormValues,
            dre,
            ue,
          }),
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

          <button type="button">Pesquisar</button>
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
    onAnterior,
  }: any) => (
    <div>
      <button
        data-testid="botao-anterior"
        disabled={disableAnterior}
        onClick={onAnterior}
      >
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

vi.mock("antd", () => ({
  Card: ({ children, title }: any) => (
    <div data-testid="card">
      {title}
      {children}
    </div>
  ),
}));

describe("DesignacoesPasso1", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue({
      success: true,
      data: mockResponse,
    });
  });

  const clicarPesquisarServidor = async () => {
    const formBusca = screen.getByTestId("input-rf").closest("form")!;
    await userEvent.click(
      within(formBusca).getByRole("button", { name: /Pesquisar/i })
    );
  };

  it("renderiza o cabeçalho e o formulário inicial", () => {
    render(<DesignacoesPasso1 />);

    expect(screen.getByTestId("page-header")).toHaveTextContent("Designação");
    expect(screen.getByTestId("stepper-designacao")).toBeInTheDocument();
    expect(screen.getByTestId("input-rf")).toBeInTheDocument();
  });

  it("exibe o resumo após busca bem-sucedida", async () => {
    render(<DesignacoesPasso1 />);

    await userEvent.type(screen.getByTestId("input-rf"), "123");
    await clicarPesquisarServidor();

    expect(mockMutateAsync).toHaveBeenCalledWith({ rf: "123" });

    await waitFor(() => {
      expect(screen.getByTestId("resumo-designacao")).toBeInTheDocument();
    });

    expect(screen.getByText("Servidor Teste")).toBeInTheDocument();
  });

  it("mostra erro quando a busca falha", async () => {
    mockMutateAsync.mockResolvedValueOnce({
      success: false,
      error: "Servidor não encontrado",
    });

    render(<DesignacoesPasso1 />);

    await userEvent.type(screen.getByTestId("input-rf"), "123");
    await clicarPesquisarServidor();

    await waitFor(() => {
      expect(
        screen.getByText("Servidor não encontrado")
      ).toBeInTheDocument();
    });
  });

  it("envia dados da unidade e navega ao próximo passo", async () => {
    render(<DesignacoesPasso1 />);

    await userEvent.type(screen.getByTestId("input-rf"), "123");
    await clicarPesquisarServidor();

    await waitFor(() => {
      expect(
        screen.getByTestId("formulario-pesquisa-unidade")
      ).toBeInTheDocument();
    });

    await userEvent.selectOptions(screen.getByTestId("select-dre"), "dre-1");
    await userEvent.selectOptions(screen.getByTestId("select-ue"), "ue-1");

    await userEvent.click(screen.getByTestId("botao-proximo"));

    expect(mockSetFormDesignacaoData).toHaveBeenCalledWith({
      ...mockFormValues,
      dre: "dre-1",
      ue: "ue-1",
      servidorIndicado: mockResponse,
    });

    expect(mockRouterPush).toHaveBeenCalledWith(
      "/pages/designacoes/designacoes-passo-2?123"
    );
  });
});