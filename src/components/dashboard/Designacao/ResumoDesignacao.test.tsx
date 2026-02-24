import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import ResumoDesignacao from "./ResumoDesignacao";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IConcursoType } from "@/types/cursos-e-titulos";
import { Servidor } from "@/types/designacao-unidade";

// Mock do hook useCursosETitulos
const mockUseCursosETitulos = vi.fn();
vi.mock("@/hooks/useCursosETitulos", () => ({
  default: () => mockUseCursosETitulos(),
}));


const mockData: Servidor = {
  nome: "Servidor Teste",
  nome_servidor: "Nome Servidor Teste",
  nome_civil: "Nome Civil Teste",
  rf: "123",
  vinculo_cargo_sobreposto: "Ativo",
  lotacao_cargo_sobreposto: "Escola X",
  cargo_base: "Professor",
  funcao_atividade: "Docente",
  cargo_sobreposto: "Nenhum",
  cursos_titulos: "Licenciatura",
  dre: "DRE Teste",
  unidade: "Unidade Teste",
  codigo: "COD-1",
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
      <ResumoDesignacao defaultValues={mockData} showCamposExtras={true} />,
      { wrapper }
    );

    const labels = [
      "Nome Civil",
      "Nome Servidor",
      "RF",
      "Função",
      "Cargo sobreposto",
      "Cargo base",
      "Vínculo",
      "Lotação",
 
     ];

    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    expect(screen.getAllByText(mockData.nome).length).toBeGreaterThan(0);
    expect(screen.getByText(mockData.rf)).toBeInTheDocument();
 
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





});

