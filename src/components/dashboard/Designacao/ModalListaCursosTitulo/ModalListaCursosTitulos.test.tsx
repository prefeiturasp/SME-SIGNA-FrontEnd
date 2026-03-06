import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import ModalListaCursosTitulos from "./ModalListaCursosTitulos";
import { IConcursoType } from "@/types/cursos-e-titulos";
import { Servidor } from "@/types/designacao-unidade";

describe("ModalListaCursosTitulos", () => {
  const defaultValues: Servidor = {
    nome_servidor: "Servidor Teste",
    rf: "123456",
    vinculo: 1,
    lotacao: "UE X",
    cargo_base: "Professor",
    funcao_atividade: "Docente",
    cargo_sobreposto_funcao_atividade: "Nenhum",
    cursos_titulos: "Licenciatura",
    dre: "DRE Teste",
    esta_afastado: false,
    codigo_estrutura_hierarquica: "123456",
  };

  const data: IConcursoType[] = [
    { id: 1, concurso: "201002757777 - PROF ENS FUND II MEDIO" },
    { id: 2, concurso: "201002757778 - PROF ENS FUND II MEDIO" },
  ];

  const makeProps = (
    overrides?: Partial<React.ComponentProps<typeof ModalListaCursosTitulos>>
  ) => ({
    open: true,
    isLoading: false,
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
    expect(
      screen.queryByText("Lista de cursos/títulos")
    ).not.toBeInTheDocument();
  });

  it("renderiza título, infos do servidor e lista de concursos", () => {
    render(<ModalListaCursosTitulos {...makeProps()} />);

    expect(
      screen.getByText("Lista de cursos/títulos")
    ).toBeInTheDocument();

    expect(screen.getByText("Servidor")).toBeInTheDocument();
    expect(screen.getByText(defaultValues.nome_servidor)).toBeInTheDocument();

    expect(screen.getByText("RF")).toBeInTheDocument();
    expect(screen.getByText(defaultValues.rf)).toBeInTheDocument();

    expect(screen.getByText("Função")).toBeInTheDocument();
    expect(
      screen.getByText(defaultValues.funcao_atividade)
    ).toBeInTheDocument();

    // Verifica se os concursos aparecem na tela
    expect(screen.getByText(data[0].concurso)).toBeInTheDocument();
    expect(screen.getByText(data[1].concurso)).toBeInTheDocument();
  });

  it("chama onOpenChange(false) ao clicar no botão Close do Dialog", async () => {
    const props = makeProps();
    const user = userEvent.setup();

    render(<ModalListaCursosTitulos {...props} />);

    await user.click(screen.getByRole("button", { name: /close/i }));

    expect(props.onOpenChange).toHaveBeenCalledTimes(1);
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("chama onOpenChange(false) ao clicar no botão Sair", async () => {
    const props = makeProps();
    const user = userEvent.setup();

    render(<ModalListaCursosTitulos {...props} />);

    await user.click(screen.getByRole("button", { name: /sair/i }));

    expect(props.onOpenChange).toHaveBeenCalledTimes(1);
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renderiza estado de loading quando isLoading=true", () => {
    render(<ModalListaCursosTitulos {...makeProps({ isLoading: true })} />);

    const spinner = document.querySelector(".ant-spin-nested-loading");
    expect(spinner).toBeInTheDocument();
  });

  it("renderiza tabela vazia quando data é array vazio", () => {
    render(<ModalListaCursosTitulos {...makeProps({ data: [] })} />);

    // Nenhum concurso deve aparecer
    expect(
      screen.queryByText("201002757777 - PROF ENS FUND II MEDIO")
    ).not.toBeInTheDocument();
  });

  it("permite ordenar pela coluna Concurso", async () => {
    const user = userEvent.setup();
    render(<ModalListaCursosTitulos {...makeProps()} />);

    // Clica no header da coluna Concurso
    const header = screen.getByText("Concurso");
    await user.click(header);

    // Após ordenar, ainda deve conter os registros
    expect(screen.getByText(data[0].concurso)).toBeInTheDocument();
    expect(screen.getByText(data[1].concurso)).toBeInTheDocument();
  });

  it("renderiza todas as informações do servidor no modal", () => {
    render(<ModalListaCursosTitulos {...makeProps()} />);

    expect(screen.getByText("Servidor")).toBeInTheDocument();
    expect(screen.getByText("RF")).toBeInTheDocument();
    expect(screen.getByText("Função")).toBeInTheDocument();

    expect(screen.getByText(defaultValues.nome_servidor)).toBeInTheDocument();
    expect(screen.getByText(defaultValues.rf)).toBeInTheDocument();
    expect(
      screen.getByText(defaultValues.funcao_atividade)
    ).toBeInTheDocument();
  });

  it("renderiza o DialogContent quando open é true", () => {
    render(<ModalListaCursosTitulos {...makeProps()} />);

    expect(
      screen.getByText("Lista de cursos/títulos")
    ).toBeInTheDocument();
  });
});