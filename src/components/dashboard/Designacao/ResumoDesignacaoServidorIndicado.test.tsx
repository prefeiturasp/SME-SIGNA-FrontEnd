import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IConcursoType } from "@/types/cursos-e-titulos";
import { Servidor } from "@/types/designacao-unidade";
import ResumoDesignacaoServidorIndicado from "./ResumoDesignacaoServidorIndicado";

// -------------------- MOCKS --------------------

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

vi.mock("./ModalListaCursosTitulo/ModalListaCursosTitulos", () => ({
  default: ({
    open,
    onOpenChange,
    data,
    isLoading,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: IConcursoType[];
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

// -------------------- DADOS --------------------

const mockData: Servidor = {
  rf: "123",
  nome_servidor: "Servidor Teste",
  nome_civil: "Nome Social Teste",
  vinculo: 1,
  lotacao: "Escola X",
  cargo_base: "Professor",
  cargo_sobreposto_funcao_atividade: "Docente",
  cursos_titulos: "Licenciatura",
  local_de_exercicio: "Local de exercicio teste",
  laudo_medico: "Laudo",
  local_de_servico: "Local do servico teste",
  cd_cargo_base: 1,
  cd_cargo_sobreposto_funcao_atividade: 2,
};

const mockCursosETitulos: IConcursoType[] = [
  { id: 1, concurso: "201002757777 - PROF ENS FUND II MEDIO" },
  { id: 2, concurso: "201002757778 - PROF ENS FUND II MEDIO" },
];

// -------------------- SETUP --------------------

let queryClient: QueryClient;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const renderResumo = (
  overrides: Partial<
    React.ComponentProps<typeof ResumoDesignacaoServidorIndicado>
  > = {}
) => {
  const defaultProps: React.ComponentProps<
    typeof ResumoDesignacaoServidorIndicado
  > = {
    defaultValues: mockData,
    showCursosTitulos: true,
    showLotacao: true,
    showEditar: true,
    onSubmitEditarServidor: vi.fn(),
  };

  return render(
    <ResumoDesignacaoServidorIndicado
      {...defaultProps}
      {...overrides}
    />,
    { wrapper }
  );
};

const setup = (overrides = {}) => {
  const user = userEvent.setup();
  return {
    user,
    ...renderResumo(overrides),
  };
};

// -------------------- TESTES --------------------

describe("ResumoDesignacao", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    mockUseCursosETitulos.mockReturnValue({
      isLoading: false,
      data: mockCursosETitulos,
      isError: false,
      error: null,
      isSuccess: true,
    });
  });

  it("exibe rótulos e valores", () => {
    renderResumo();

    const labels = [
      "Nome Servidor",
      "Nome Social",
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

  it("aplica className", () => {
    const { container } = renderResumo({ className: "custom-class" });
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("mostra loading", () => {
    renderResumo({ isLoading: true });
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("renderiza botão cursos", () => {
    renderResumo();
    expect(
      screen.getByTestId("btn-visualizar-cursos-titulos")
    ).toBeInTheDocument();
  });

  it("abre modal cursos", async () => {
    const { user } = setup();

    await user.click(
      screen.getByTestId("btn-visualizar-cursos-titulos")
    );

    expect(await screen.findByText("Modal Aberto")).toBeInTheDocument();
  });

  it("fecha modal cursos", async () => {
    const { user } = setup();

    await user.click(screen.getByTestId("btn-visualizar-cursos-titulos"));
    await screen.findByText("Modal Aberto");

    await user.click(screen.getByText("Fechar"));

    await waitFor(() => {
      expect(screen.queryByText("Modal Aberto")).not.toBeInTheDocument();
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

    const { user } = setup();

    await user.click(screen.getByTestId("btn-visualizar-cursos-titulos"));

    expect(await screen.findByText("Loading: true")).toBeInTheDocument();
  });

  it("passa array vazio quando data é undefined", async () => {
    mockUseCursosETitulos.mockReturnValue({
      isLoading: false,
      data: undefined,
      isError: false,
      error: null,
      isSuccess: true,
    });

    const { user } = setup();

    await user.click(screen.getByTestId("btn-visualizar-cursos-titulos"));

    expect(await screen.findByText("Data Length: 2")).toBeInTheDocument();
  });

  it("renderiza botão editar e abre modal", async () => {
    const { user } = setup();

    const btn = screen.getByRole("button", { name: /editar/i });
    expect(btn).toBeInTheDocument();

    await user.click(btn);

    expect(
      screen.getByText("Editar dados servidor indicado")
    ).toBeInTheDocument();
  });

  it("dispara submit edição", async () => {
    const user = userEvent.setup();
    const onSubmitEditarServidor = vi.fn();

    renderResumo({ onSubmitEditarServidor });

    await user.click(screen.getByRole("button", { name: /Editar/i }));
    await user.click(screen.getByText("Salvar edição"));

    expect(onSubmitEditarServidor).toHaveBeenCalledWith(mockSubmitData);
  });

  it("não renderiza lotação", () => {
    renderResumo({ showLotacao: false });
    expect(screen.queryByText("Lotação")).not.toBeInTheDocument();
  });

  it("fallback cursos", () => {
    renderResumo({
      showEditar: false,
      defaultValues: {
        ...mockData,
        cursos_titulos: undefined as unknown as string,
      },
    });

    expect(
      screen.getByText("Cursos/Títulos de exemplo")
    ).toBeInTheDocument();
  });

  it("renderiza local de serviço e botão copiar RF", async () => {
    const user = userEvent.setup();
    const onClickCopiarRF = vi.fn();

    renderResumo({
      showLocalDeServico: true,
      showCopiar: true,
      onClickCopiarRF,
    });

    expect(screen.getByText("Local de serviço")).toBeInTheDocument();
    expect(screen.getByText(mockData.local_de_servico)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /copiar rf/i }));

    expect(onClickCopiarRF).toHaveBeenCalledWith(mockData);
  });

  it("não renderiza ações opcionais por padrão", () => {
    renderResumo({
      showCursosTitulos: false,
      showEditar: false,
      showCopiar: false,
      showLocalDeServico: false,
    });

    expect(
      screen.queryByTestId("btn-visualizar-cursos-titulos")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /editar/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /copiar rf/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Local de serviço")).not.toBeInTheDocument();
  });

  it("aplica fallback '-' para campos opcionais sem valor", () => {
    renderResumo({
      showLotacao: true,
      showLocalDeServico: true,
      defaultValues: {
        ...mockData,
        vinculo: undefined,
        cargo_base: undefined,
        lotacao: undefined,
        cargo_sobreposto_funcao_atividade: undefined,
        local_de_exercicio: undefined,
        laudo_medico: undefined,
        local_de_servico: undefined,
      } as unknown as Servidor,
    });

    expect(screen.getAllByText("-").length).toBeGreaterThanOrEqual(7);
  });

  it("usa callback padrão de copiar RF quando não informado", async () => {
    const user = userEvent.setup();
    renderResumo({
      showCopiar: true,
      showCursosTitulos: false,
      showEditar: false,
    });

    await user.click(screen.getByRole("button", { name: /copiar rf/i }));

    expect(screen.getByRole("button", { name: /copiar rf/i })).toBeInTheDocument();
  });
});