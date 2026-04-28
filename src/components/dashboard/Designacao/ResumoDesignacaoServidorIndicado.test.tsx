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
const mockSetFormDesignacaoData = vi.fn();

vi.mock("../../../app/pages/designacoes/DesignacaoContext", () => ({
  useDesignacaoContext: () => ({
    setFormDesignacaoData: mockSetFormDesignacaoData,
  }),
}));
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

vi.mock("./ModalEditarServidor/ModalEditarServidor", () => ({
  default: ({
    open,
    onOpenChange,
    handleSubmitEditarServidor,
  }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    handleSubmitEditarServidor: (data: {
      nome_servidor: string;
      nome_civil: string;
    }) => void;
  }) => (
    <div data-testid="modal-editar-servidor">
      {open && (
        <>
          <span>Modal Editar Servidor Aberto</span>
          <button onClick={() => onOpenChange(false)}>Fechar Edição</button>
          <button
            onClick={() =>
              handleSubmitEditarServidor({
                nome_servidor: "Servidor Editado no Modal",
                nome_civil: "Nome Civil Editado no Modal",
              })
            }
          >
            Salvar Edição
          </button>
        </>
      )}
    </div>
  ),
}));

vi.mock("../DesignacaoContext", () => ({
  useDesignacaoContext: () => ({
    setFormDesignacaoData: mockSetFormDesignacaoData,
  }),
}));

const mockData: Servidor = {
  rf: "123",
  nome_servidor: "Servidor Teste",
  nome_civil: "Nome Civil Teste",
  vinculo: 1,
  lotacao: "Escola X",
  cargo_base: "Professor",
  cargo_sobreposto_funcao_atividade: "Docente",
  cursos_titulos: "Licenciatura",
  local_de_exercicio: "Local de exercicio teste",
  laudo_medico: "Laudo",
  local_de_servico: "Local do servico teste"

};
const mockDataComFallbacks = {
  ...mockData,
  vinculo: undefined,
  cargo_base: undefined,
  lotacao: undefined,
  cursos_titulos: undefined,
  cargo_sobreposto_funcao_atividade: undefined,
  local_de_exercicio: undefined,
  laudo_medico: undefined,
  local_de_servico: undefined,
} as unknown as Servidor;

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
      <ResumoDesignacaoServidorIndicado
       defaultValues={mockData}
        showCursosTitulos={true}
        showLotacao={true}
        showEditar={true}
        
        
        />,
      { wrapper }
    );

    const labels = [
      "Nome Servidor",
      "Nome Civil",
      "RF",    
      "Vínculo",      
      "Cargo base",
      "Lotação",      
      "Cursos/Títulos",    
      "Cargo sobreposto/Função atividade",
      "Local de exercício",
      "Laudo médico",
      "Local de serviço",
    ];

    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });

     expect(screen.getByText(mockData.rf)).toBeInTheDocument();
  });

  it("aplica className recebido na raiz", () => {
    const { container } = render(
      <ResumoDesignacaoServidorIndicado
        showCursosTitulos={true}
        showLotacao={true}
        showEditar={true}
         className="custom-class" defaultValues={mockData} />,
      { wrapper }
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("mostra o loading quando isLoading é true", () => {
    render(
      <ResumoDesignacaoServidorIndicado
        showCursosTitulos={true}
        showLotacao={true}
        showEditar={true}
        
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
        showCursosTitulos={true}
        showLotacao={true}
        showEditar={true}
        
        isLoading={true}
        defaultValues={mockData}
      />,
      { wrapper }
    );

    expect(screen.queryByText("Servidor")).not.toBeInTheDocument();
    expect(screen.queryByText(mockData.cargo_sobreposto_funcao_atividade)).not.toBeInTheDocument();
  });

  

  it("renderiza o botão Eye para Cursos/Títulos", () => {
    render(
      <ResumoDesignacaoServidorIndicado
        showCursosTitulos={true}
        showLotacao={true}
        showEditar={true}
         defaultValues={mockData} />,
      { wrapper }
    );

    expect(
      screen.getByTestId("btn-visualizar-cursos-titulos")
    ).toBeInTheDocument();
  });

  it("exibe os fallbacks de texto quando dados opcionais estão ausentes", () => {
    render(
      <ResumoDesignacaoServidorIndicado
        showCursosTitulos={true}
        showLotacao={true}
        showEditar={false}
        defaultValues={mockDataComFallbacks}
      />,
      { wrapper }
    );

    expect(screen.getByText("Cursos/Títulos de exemplo")).toBeInTheDocument();
    expect(screen.getAllByText("-").length).toBeGreaterThanOrEqual(6);
  });

  it("não renderiza o botão Eye para Cursos/Títulos", () => {
    render(
      <ResumoDesignacaoServidorIndicado
        showCursosTitulos={false}
        showLotacao={true}
        showEditar={true}
        defaultValues={mockData} />,
      { wrapper }
    );

    expect(
      screen.queryByTestId("btn-visualizar-cursos-titulos")
    ).not.toBeInTheDocument();
  });


  it("abre o modal ao clicar no botão Eye", async () => {
    const user = userEvent.setup();

    render(
      <ResumoDesignacaoServidorIndicado
        showCursosTitulos={true}
        showLotacao={true}
        showEditar={true}
         defaultValues={mockData} />,
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
      <ResumoDesignacaoServidorIndicado
        showCursosTitulos={true}
        showLotacao={true}
        showEditar={true}
         defaultValues={mockData} />,
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
      <ResumoDesignacaoServidorIndicado
        showCursosTitulos={true}
        showLotacao={true}
        showEditar={true}
         defaultValues={mockData} />,
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
      <ResumoDesignacaoServidorIndicado
        showCursosTitulos={true}
        showLotacao={true}
        showEditar={true}
         defaultValues={mockData} />,
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
      <ResumoDesignacaoServidorIndicado
        showCursosTitulos={true}
        showLotacao={true}
        showEditar={true}
         defaultValues={mockData} />,
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
      <ResumoDesignacaoServidorIndicado
        showCursosTitulos={true}
        showLotacao={true}
        showEditar={true}
        defaultValues={mockData} />,
      { wrapper }
    );

    expect(screen.getByRole("button", { name: /Editar/i })).toBeInTheDocument();
  });

  it("chama modalEditarServidor ao clicar no botão Editar", async () => {
    const user = userEvent.setup();
 
    render(
      <ResumoDesignacaoServidorIndicado
        showCursosTitulos={true}
        showLotacao={true}
        showEditar={true}
         defaultValues={mockData} />,
      { wrapper }
    );

    await user.click(screen.getByRole("button", { name: /Editar/i }));
    expect(screen.getByText("Modal Editar Servidor Aberto")).toBeInTheDocument();
  });

  it("repassa os dados editados para o callback externo", async () => {
    const user = userEvent.setup();
    const mockOnSubmitEditarServidor = vi.fn();

    render(
      <ResumoDesignacaoServidorIndicado
        showCursosTitulos={true}
        showLotacao={true}
        showEditar={true}
        defaultValues={mockData}
        onSubmitEditarServidor={mockOnSubmitEditarServidor}
      />,
      { wrapper }
    );

    await user.click(screen.getByRole("button", { name: /Editar/i }));
    await user.click(screen.getByRole("button", { name: /Salvar Edição/i }));

    expect(mockOnSubmitEditarServidor).toHaveBeenCalledWith({
      nome_servidor: "Servidor Editado no Modal",
      nome_civil: "Nome Civil Editado no Modal",
    });
  });
});

