import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, type Mock } from "vitest";

import ModalListaCursosTitulos from "./ModalListaCursosTitulos";
import { BuscaServidorDesignacaoBody } from "@/types/busca-servidor-designacao";
import type { IConcursoType } from "./ModalListaCursosTitulos";

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
});


