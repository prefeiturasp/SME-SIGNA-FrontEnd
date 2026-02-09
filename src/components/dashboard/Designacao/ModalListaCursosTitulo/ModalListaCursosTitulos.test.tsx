import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, type Mock } from "vitest";

import ModalListaCursosTitulos from "./ModalListaCursosTitulos";
import { BuscaServidorDesignacaoBody } from "@/types/busca-servidor-designacao";
import { IConcursoType } from "@/types/cursos-e-titulos";


const tableMock = vi.fn();

vi.mock("antd", () => ({
  Table: (props: any) => {
    tableMock(props);
    return (
      <div data-testid="antd-table">
        {(props?.dataSource ?? []).map((row: any) => (
          <div key={row.key}>{row.concurso}</div>
        ))}
      </div>
    );
  },
}));

describe("ModalListaCursosTitulos", () => {
  const defaultValues: BuscaServidorDesignacaoBody = {
    nome: "Servidor Teste",
    rf: "123456",
    vinculo_cargo_sobreposto: "Ativo",
    lotacao_cargo_sobreposto: "UE X",
    cargo_base: "Professor",
    funcao_atividade: "Docente",
    cargo_sobreposto: "Nenhum",
    cursos_titulos: "Licenciatura",
  };

  const data: IConcursoType[] = [
    { id: 1, concurso: "201002757777 - PROF ENS FUND II MEDIO" },
    { id: 2, concurso: "201002757778 - PROF ENS FUND II MEDIO" },
  ];

  const makeProps = (overrides?: Partial<React.ComponentProps<typeof ModalListaCursosTitulos>>) => ({
    open: true,
    onOpenChange: vi.fn(),
    defaultValues,
     data,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("não renderiza o conteúdo quando open=false", () => {
    render(<ModalListaCursosTitulos {...makeProps({ open: false })} />);
    expect(screen.queryByText("Lista de cursos/títulos")).not.toBeInTheDocument();
  });

  it("renderiza título, infos do servidor e lista de concursos", () => {
    render(<ModalListaCursosTitulos {...makeProps()} />);

    expect(screen.getByText("Lista de cursos/títulos")).toBeInTheDocument();

    expect(screen.getByText("Servidor")).toBeInTheDocument();
    expect(screen.getByText(defaultValues.nome)).toBeInTheDocument();

    expect(screen.getByText("RF")).toBeInTheDocument();
    expect(screen.getByText(defaultValues.rf)).toBeInTheDocument();

    expect(screen.getByText("Função")).toBeInTheDocument();
    expect(screen.getByText(defaultValues.funcao_atividade)).toBeInTheDocument();

    expect(screen.getByTestId("antd-table")).toBeInTheDocument();
    expect(screen.getByText(data[0].concurso)).toBeInTheDocument();
    expect(screen.getByText(data[1].concurso)).toBeInTheDocument();
  });

  it("passa columns e dataSource para o Table do antd", () => {
    render(<ModalListaCursosTitulos {...makeProps()} />);

    expect(tableMock).toHaveBeenCalledTimes(1);
    const calledWith = (tableMock as unknown as Mock).mock.calls[0][0];

    expect(calledWith.pagination).toBe(false);
    expect(calledWith.dataSource).toEqual(data);
    expect(calledWith.columns).toHaveLength(1);
    expect(calledWith.columns[0].title).toBe("Concurso");
    expect(calledWith.columns[0].dataIndex).toBe("concurso");
    expect(typeof calledWith.columns[0].sorter).toBe("function");
  });

 

  it("chama onOpenChange(false) ao clicar no botão Close do Dialog", async () => {
    const props = makeProps();
    const user = userEvent.setup();

    render(<ModalListaCursosTitulos {...props} />);

    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(props.onOpenChange).toHaveBeenCalled();
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("chama onOpenChange(false) ao clicar no botão Sair", async () => {
     const props=makeProps();
     const user= userEvent.setup()
     render(<ModalListaCursosTitulos {...props} />);

     await user.click(screen.getByRole("button", {name: /sair/i}))
     expect(props.onOpenChange).toHaveBeenCalledTimes(1);
     expect(props.onOpenChange).toHaveBeenCalledWith(false)

   });

  it("passa isLoading para o componente Table", () => {
    render(<ModalListaCursosTitulos {...makeProps({ isLoading: true })} />);

    expect(tableMock).toHaveBeenCalledTimes(1);
    const calledWith = (tableMock as unknown as Mock).mock.calls[0][0];

    expect(calledWith.loading).toBe(true);
  });

  it("passa isLoading como false quando não está carregando", () => {
    render(<ModalListaCursosTitulos {...makeProps({ isLoading: false })} />);

    expect(tableMock).toHaveBeenCalledTimes(1);
    const calledWith = (tableMock as unknown as Mock).mock.calls[0][0];

    expect(calledWith.loading).toBe(false);
  });

  it("renderiza a tabela com dados vazios quando data é array vazio", () => {
    render(<ModalListaCursosTitulos {...makeProps({ data: [] })} />);

    expect(tableMock).toHaveBeenCalledTimes(1);
    const calledWith = (tableMock as unknown as Mock).mock.calls[0][0];

    expect(calledWith.dataSource).toEqual([]);
    expect(calledWith.dataSource).toHaveLength(0);
  });

  it("aplica sorter corretamente na coluna Concurso", () => {
    render(<ModalListaCursosTitulos {...makeProps()} />);

    const calledWith = (tableMock as unknown as Mock).mock.calls[0][0];
    const sorter = calledWith.columns[0].sorter;

    // Testa a função sorter
    const resultado1 = sorter({ id: 1 }, { id: 2 });
    expect(resultado1).toBe(-1); // 1 - 2 = -1

    const resultado2 = sorter({ id: 3 }, { id: 1 });
    expect(resultado2).toBe(2); // 3 - 1 = 2

    const resultado3 = sorter({ id: 5 }, { id: 5 });
    expect(resultado3).toBe(0); // 5 - 5 = 0
  });

  it("verifica que showSorterTooltip está configurado", () => {
    render(<ModalListaCursosTitulos {...makeProps()} />);

    const calledWith = (tableMock as unknown as Mock).mock.calls[0][0];

    expect(calledWith.showSorterTooltip).toEqual({ target: 'sorter-icon' });
  });

  
  it("renderiza todas as informações do servidor no modal", () => {
    render(<ModalListaCursosTitulos {...makeProps()} />);

    // Verifica se as labels estão presentes
    expect(screen.getByText("Servidor")).toBeInTheDocument();
    expect(screen.getByText("RF")).toBeInTheDocument();
    expect(screen.getByText("Função")).toBeInTheDocument();

    // Verifica se os valores estão presentes
    expect(screen.getByText(defaultValues.nome)).toBeInTheDocument();
    expect(screen.getByText(defaultValues.rf)).toBeInTheDocument();
    expect(screen.getByText(defaultValues.funcao_atividade)).toBeInTheDocument();
  });

  it("renderiza o DialogContent quando open é true", () => {
    render(<ModalListaCursosTitulos {...makeProps()} />);

    // Verifica que o conteúdo do modal está renderizado
    expect(screen.getByText("Lista de cursos/títulos")).toBeInTheDocument();
    expect(screen.getByTestId("antd-table")).toBeInTheDocument();
  });
 
});


