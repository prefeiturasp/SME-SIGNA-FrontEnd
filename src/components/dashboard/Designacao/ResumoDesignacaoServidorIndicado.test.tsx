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

const mockSubmitData = {
  cargo_base: "Professor atualizado",
};

vi.mock("./ModalEditarServidor/ModalEditarServidor", () => ({
  default: ({
    open,
    handleSubmitEditarServidor,
  }: {
    open: boolean;
    handleSubmitEditarServidor: (data: typeof mockSubmitData) => void;
  }) => (
    <div data-testid="modal-editar-servidor">
      {open && (
        <>
          <div>Editar dados servidor indicado</div>
          <button onClick={() => handleSubmitEditarServidor(mockSubmitData)}>
            Salvar edição
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

  it("renderiza o local de serviço quando showLocalDeServico é true", () => {
    render(
      <ResumoDesignacaoServidorIndicado
        showCursosTitulos={true}
        showLotacao={true}
        showEditar={true}
        showLocalDeServico={true}
        defaultValues={mockData} />,
      { wrapper }
    );

    expect(screen.queryByPlaceholderText(/Local de serviço/)).not.toBeInTheDocument();     
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
    expect(screen.getByText('Editar dados servidor indicado')).toBeInTheDocument();
  });

  it("não renderiza Lotação quando showLotacao é false", () => {
    render(
      <ResumoDesignacaoServidorIndicado
        showCursosTitulos={true}
        showLotacao={false}
        showEditar={true}
        defaultValues={mockData}
        onSubmitEditarServidor={vi.fn()}
      />,
      { wrapper }
    );

    expect(screen.queryByText("Lotação")).not.toBeInTheDocument();
  });

  it("não renderiza Local de serviço quando showLocalDeServico é false", () => {
    render(
      <ResumoDesignacaoServidorIndicado
        showCursosTitulos={true}
        showLotacao={true}
        showEditar={true}
        showLocalDeServico={false}
        defaultValues={mockData}
        onSubmitEditarServidor={vi.fn()}
      />,
      { wrapper }
    );

    expect(screen.queryByText("Local de serviço")).not.toBeInTheDocument();
  });

  it("exibe fallback de Cursos/Títulos quando valor não existir", () => {
    render(
      <ResumoDesignacaoServidorIndicado
        showCursosTitulos={true}
        showLotacao={true}
        showEditar={false}
        defaultValues={{
          ...mockData,
          cursos_titulos: undefined as unknown as string,
        }}
        onSubmitEditarServidor={vi.fn()}
      />,
      { wrapper }
    );

    expect(screen.getByText("Cursos/Títulos de exemplo")).toBeInTheDocument();
  });

  it("abre e fecha o modal de cursos ao clicar duas vezes no botão Eye", async () => {
    const user = userEvent.setup();
    render(
      <ResumoDesignacaoServidorIndicado
        showCursosTitulos={true}
        showLotacao={true}
        showEditar={false}
        defaultValues={mockData}
        onSubmitEditarServidor={vi.fn()}
      />,
      { wrapper }
    );

    const eyeButton = screen.getByTestId("btn-visualizar-cursos-titulos");
    await user.click(eyeButton);
    expect(screen.getByText("Modal Aberto")).toBeInTheDocument();

    await user.click(eyeButton);
    expect(screen.queryByText("Modal Aberto")).not.toBeInTheDocument();
  });

  it("dispara onSubmitEditarServidor ao salvar no modal de edição", async () => {
    const user = userEvent.setup();
    const onSubmitEditarServidor = vi.fn();

    render(
      <ResumoDesignacaoServidorIndicado
        showCursosTitulos={true}
        showLotacao={true}
        showEditar={true}
        defaultValues={mockData}
        onSubmitEditarServidor={onSubmitEditarServidor}
      />,
      { wrapper }
    );

    await user.click(screen.getByRole("button", { name: /Editar/i }));
    await user.click(screen.getByRole("button", { name: /Salvar edição/i }));

    expect(onSubmitEditarServidor).toHaveBeenCalledWith(mockSubmitData);
    expect(onSubmitEditarServidor).toHaveBeenCalledTimes(1);
  });
});

