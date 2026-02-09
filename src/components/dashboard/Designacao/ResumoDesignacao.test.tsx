import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, type Mock } from "vitest";
import ResumoDesignacao from "./ResumoDesignacao";
import { BuscaServidorDesignacaoBody } from "@/types/busca-servidor-designacao";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IConcursoType } from "@/types/cursos-e-titulos";

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
    defaultValues,
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

const mockData: BuscaServidorDesignacaoBody = {
  nome: "Servidor Teste",
  rf: "123",
  vinculo_cargo_sobreposto: "Ativo",
  lotacao_cargo_sobreposto: "Escola X",
  cargo_base: "Professor",
  funcao_atividade: "Docente",
  cargo_sobreposto: "Nenhum",
  cursos_titulos: "Licenciatura",
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
      <ResumoDesignacao defaultValues={mockData} />,
      { wrapper }
    );

    const labels = [
      "Servidor",
      "RF",
      "Vínculo",
      "Lotação",
      "Cargo base",
      "Função",
      "Cargo sobreposto",
      "Cursos/Títulos",
    ];

    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    Object.values(mockData).forEach((value) => {
      expect(screen.getAllByText(value).length).toBeGreaterThan(0);
    });
  });

  it("aplica className recebido na raiz", () => {
    const { container } = render(
      <ResumoDesignacao className="custom-class" defaultValues={mockData} />,
      { wrapper }
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("mostra o loading quando isLoading é true", () => {
    render(
      <ResumoDesignacao
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
      <ResumoDesignacao
        isLoading={true}
        defaultValues={mockData}
      />,
      { wrapper }
    );

    expect(screen.queryByText("Servidor")).not.toBeInTheDocument();
    expect(screen.queryByText(mockData.nome)).not.toBeInTheDocument();
  });

  it("renderiza o botão Eye para Cursos/Títulos", () => {
    render(
      <ResumoDesignacao defaultValues={mockData} />,
      { wrapper }
    );

    // O botão Eye está dentro do InfoItem de Cursos/Títulos
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("abre o modal ao clicar no botão Eye", async () => {
    const user = userEvent.setup();

    render(
      <ResumoDesignacao defaultValues={mockData} />,
      { wrapper }
    );

    // Verifica que o modal está fechado inicialmente
    expect(screen.queryByText("Modal Aberto")).not.toBeInTheDocument();

    // Clica no botão Eye
    const eyeButton = screen.getAllByRole("button")[0];
    await user.click(eyeButton);

    // Verifica que o modal foi aberto
    await waitFor(() => {
      expect(screen.getByText("Modal Aberto")).toBeInTheDocument();
    });
  });

  it("fecha o modal ao clicar no botão de fechar", async () => {
    const user = userEvent.setup();

    render(
      <ResumoDesignacao defaultValues={mockData} />,
      { wrapper }
    );

    // Abre o modal
    const eyeButton = screen.getAllByRole("button")[0];
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
      <ResumoDesignacao defaultValues={mockData} />,
      { wrapper }
    );

    // Abre o modal
    const eyeButton = screen.getAllByRole("button")[0];
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
      <ResumoDesignacao defaultValues={mockData} />,
      { wrapper }
    );

    // Abre o modal
    const eyeButton = screen.getAllByRole("button")[0];
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
      <ResumoDesignacao defaultValues={mockData} />,
      { wrapper }
    );

    // Abre o modal
    const eyeButton = screen.getAllByRole("button")[0];
    await user.click(eyeButton);

    await waitFor(() => {
      expect(screen.getByText("Data Length: 0")).toBeInTheDocument();
    });
  });
});

