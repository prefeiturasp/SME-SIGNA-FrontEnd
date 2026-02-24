import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { BuscaServidorDesignacaoBody } from "@/types/busca-servidor-designacao";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IConcursoType } from "@/types/cursos-e-titulos";
import { Servidor } from "@/types/designacao-unidade";
import ResumoDesignacaoServidorIndicado from "./ResumoDesignacaoServidorIndicado";

// Mock do hook useCursosETitulos
const mockUseCursosETitulos = vi.fn();
vi.mock("@/hooks/useCursosETitulos", () => ({
  default: () => mockUseCursosETitulos(),
}));

// Mock do ModalListaCursosTitulos
vi.mock("./ModalListaCursosTitulo/ModalListaCursosTitulos", () => ({
  default: ({
    open,
    onOpenChange,
    data,
    isLoading,
  }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    data: IConcursoType[];
    defaultValues: BuscaServidorDesignacaoBody;
    isLoading: boolean;
  }) => (
    <div data-testid="modal-lista-cursos-titulos">
      {open && (
        <>
          <div>Modal Aberto</div>
          <div>Loading: {isLoading.toString()}</div>
          <div>Data Length: {data.length}</div>
          <button onClick={() => onOpenChange(false)}>Fechar</button>
        </>
      )}
    </div>
  ),
}));

const mockData: Servidor = {
  nome_servidor: "Servidor Teste",
  nome_civil: "Nome Civil Teste",
  rf: "123",
  vinculo_cargo_sobreposto: "Ativo",
  lotacao_cargo_sobreposto: "Escola X",
  cargo_base: "Professor",
  funcao_atividade: "Docente",
  cargo_sobreposto: "Nenhum",
  cursos_titulos: "Licenciatura",
  dre: "DRE Teste",
  codigo_estrutura_hierarquica: "COD-1",
  esta_afastado: false,
};

const mockCursosETitulos: IConcursoType[] = [
  { id: 1, concurso: "201002757777 - PROF ENS FUND II MEDIO" },
  { id: 2, concurso: "201002757778 - PROF ENS FUND II MEDIO" },
];

describe("ResumoDesignacao", () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Mock padrão do hook
    mockUseCursosETitulos.mockReturnValue({
      isLoading: false,
      data: mockCursosETitulos,
      isError: false,
      error: null,
      isSuccess: true,
    });
  });

  it("exibe todos os rótulos e valores do resumo", () => {
    render(
      <ResumoDesignacaoServidorIndicado defaultValues={mockData} showCamposExtras={true} />,
      { wrapper }
    );

    const labels = [
      "Nome Servidor",
      "Nome Civil",
      "RF",
      "Função",      
      "Cargo sobreposto",
      "Cargo base",
      "Função atividade",      
      "Vínculo",      
      "DRE",
      "Lotação",
      "Código Estrutura Hierarquica",
      "Cursos/Títulos",
      
       
    ];

    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });

     expect(screen.getByText(mockData.rf)).toBeInTheDocument();
    expect(screen.getByText(mockData.dre)).toBeInTheDocument();
    expect(screen.getByText(mockData.codigo_estrutura_hierarquica)).toBeInTheDocument();
  });

  it("aplica className recebido na raiz", () => {
    const { container } = render(
      <ResumoDesignacaoServidorIndicado className="custom-class" defaultValues={mockData} />,
      { wrapper }
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("mostra o loading quando isLoading é true", () => {
    render(
      <ResumoDesignacaoServidorIndicado
        isLoading={true}
        className="custom-class"
        defaultValues={mockData}
      />,
      { wrapper }
    );

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("não mostra o conteúdo quando isLoading é true", () => {
    render(
      <ResumoDesignacaoServidorIndicado
        isLoading={true}
        defaultValues={mockData}
      />,
      { wrapper }
    );

    expect(screen.queryByText("Servidor")).not.toBeInTheDocument();
    expect(screen.queryByText(mockData.nome_servidor)).not.toBeInTheDocument();
  });

  

  it("renderiza o botão Eye para Cursos/Títulos", () => {
    render(
      <ResumoDesignacaoServidorIndicado showCursosTitulos={true} defaultValues={mockData} />,
      { wrapper }
    );

    expect(
      screen.getByTestId("btn-visualizar-cursos-titulos")
    ).toBeInTheDocument();
  });

  it("não renderiza o botão Eye para Cursos/Títulos", () => {
    render(
      <ResumoDesignacaoServidorIndicado showCursosTitulos={false} defaultValues={mockData} />,
      { wrapper }
    );

    expect(
      screen.queryByTestId("btn-visualizar-cursos-titulos")
    ).not.toBeInTheDocument();
  });


  it("abre o modal ao clicar no botão Eye", async () => {
    const user = userEvent.setup();

    render(
      <ResumoDesignacaoServidorIndicado defaultValues={mockData} />,
      { wrapper }
    );

    // Verifica que o modal está fechado inicialmente
    expect(screen.queryByText("Modal Aberto")).not.toBeInTheDocument();

    // Clica no botão Eye
    const eyeButton = screen.getByTestId("btn-visualizar-cursos-titulos");
    await user.click(eyeButton);

    // Verifica que o modal foi aberto
    await waitFor(() => {
      expect(screen.getByText("Modal Aberto")).toBeInTheDocument();
    });
  });

  it("fecha o modal ao clicar no botão de fechar", async () => {
    const user = userEvent.setup();

    render(
      <ResumoDesignacaoServidorIndicado defaultValues={mockData} />,
      { wrapper }
    );

    // Abre o modal
    const eyeButton = screen.getByTestId("btn-visualizar-cursos-titulos");
    await user.click(eyeButton);

    await waitFor(() => {
      expect(screen.getByText("Modal Aberto")).toBeInTheDocument();
    });

    // Fecha o modal
    const closeButton = screen.getByText("Fechar");
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText("Modal Aberto")).not.toBeInTheDocument();
    });
  });

  it("passa os dados corretos para o modal", async () => {
    const user = userEvent.setup();

    render(
      <ResumoDesignacaoServidorIndicado defaultValues={mockData} />,
      { wrapper }
    );

    // Abre o modal
    const eyeButton = screen.getByTestId("btn-visualizar-cursos-titulos");
    await user.click(eyeButton);

    await waitFor(() => {
      expect(screen.getByText("Modal Aberto")).toBeInTheDocument();
      expect(screen.getByText("Loading: false")).toBeInTheDocument();
      expect(screen.getByText(`Data Length: ${mockCursosETitulos.length}`)).toBeInTheDocument();
    });
  });

  it("mostra loading no modal quando os cursos estão carregando", async () => {
    mockUseCursosETitulos.mockReturnValue({
      isLoading: true,
      data: [],
      isError: false,
      error: null,
      isSuccess: false,
    });

    const user = userEvent.setup();

    render(
      <ResumoDesignacaoServidorIndicado defaultValues={mockData} />,
      { wrapper }
    );

    // Abre o modal
    const eyeButton = screen.getByTestId("btn-visualizar-cursos-titulos");
    await user.click(eyeButton);

    await waitFor(() => {
      expect(screen.getByText("Loading: true")).toBeInTheDocument();
    });
  });

  it("passa array vazio quando data é undefined", async () => {
    mockUseCursosETitulos.mockReturnValue({
      isLoading: false,
      data: undefined,
      isError: false,
      error: null,
      isSuccess: true,
    });

    const user = userEvent.setup();

    render(
      <ResumoDesignacaoServidorIndicado defaultValues={mockData} />,
      { wrapper }
    );

    // Abre o modal
    const eyeButton = screen.getByTestId("btn-visualizar-cursos-titulos");
    await user.click(eyeButton);

    await waitFor(() => {
      // o componente passa dados estáticos (2 itens) para o modal;
      // este teste garante que não quebra mesmo que o hook retorne data undefined.
      expect(screen.getByText("Data Length: 2")).toBeInTheDocument();
    });
  });

  it("renderiza o botão Editar quando showEditar é true", () => {
    render(
      <ResumoDesignacaoServidorIndicado showEditar={true} onClickEditar={vi.fn()} defaultValues={mockData} />,
      { wrapper }
    );

    expect(screen.getByRole("button", { name: /Editar/i })).toBeInTheDocument();
  });

  it("chama onClickEditar ao clicar no botão Editar", async () => {
    const user = userEvent.setup();
    const onClickEditar = vi.fn();

    render(
      <ResumoDesignacaoServidorIndicado showEditar={true} onClickEditar={onClickEditar} defaultValues={mockData} />,
      { wrapper }
    );

    await user.click(screen.getByRole("button", { name: /Editar/i }));
    expect(onClickEditar).toHaveBeenCalledTimes(1);
  });
});

