import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import Designacoes from "./page_old";
import { BuscaServidorDesignacaoBody } from "@/types/busca-servidor-designacao";

let mockSearchParams: URLSearchParams;
const mockFormDesignacaoData = { dre: "dre-1", ue: "ue-1" };

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

vi.mock("../DesignacaoContext", () => ({
  useDesignacaoContext: () => ({
    formDesignacaoData: mockFormDesignacaoData,
  }),
}));

vi.mock("@/components/dashboard/Designacao/BuscaUE/FormularioUEDesignacao", () => ({
  __esModule: true,
  default: ({ onSubmitDesignacao }: { onSubmitDesignacao: (values: { dre: string; ue: string }) => void }) => (
    <button
      data-testid="submit-ue"
      onClick={() => onSubmitDesignacao({ dre: "dre-1", ue: "ue-1" })}
    >
      Submeter
    </button>
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

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => (
    <div data-testid="page-header">{title}</div>
  ),
}));

vi.mock("@/assets/icons/Designacao", () => ({
  __esModule: true,
  default: () => <svg data-testid="designacao-icon" />,
}));

vi.mock("antd", () => ({
  Divider: () => <div data-testid="divider" />,
}));

describe("Designacoes Passo 2", () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams();
    vi.clearAllMocks();
  });

  it("renderiza o cabeçalho, o título e o stepper", () => {
    render(<Designacoes />);

    expect(screen.getByTestId("page-header")).toHaveTextContent("Designação");
    expect(screen.getByText("Pesquisa de unidade")).toBeInTheDocument();
    expect(screen.getByTestId("stepper-designacao")).toBeInTheDocument();
  });

  it("faz parse do payload válido sem logar erro", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const payload: BuscaServidorDesignacaoBody = {
      nome: "João da Silva",
      rf: "1234567",
      vinculo_cargo_sobreposto: "Ativo",
      lotacao_cargo_sobreposto: "DRE-01",
      cargo_base: "Professor",
      funcao_atividade: "Docente",
      cargo_sobreposto: "Coordenador",
      cursos_titulos: "Mestrado",
    };

    mockSearchParams = new URLSearchParams({
      payload: JSON.stringify(payload),
    });

    render(<Designacoes />);

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("logar payload e servidor selecionado ao submeter o formulário", async () => {
    const consoleLogSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => {});

    const payload: BuscaServidorDesignacaoBody = {
      nome: "Maria Santos",
      rf: "7654321",
      vinculo_cargo_sobreposto: "Ativo",
      lotacao_cargo_sobreposto: "DRE-CL",
      cargo_base: "Professor",
      funcao_atividade: "Docente",
      cargo_sobreposto: "Diretor",
      cursos_titulos: "Doutorado",
    };

    mockSearchParams = new URLSearchParams({
      payload: JSON.stringify(payload),
    });

    render(<Designacoes />);

    await userEvent.click(screen.getByTestId("submit-ue"));

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Payload etapa UE",
      expect.objectContaining({
        dre: "dre-1",
        ue: "ue-1",
      })
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Servidor selecionado",
      payload
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Dados da etapa 1",
      mockFormDesignacaoData
    );

    consoleLogSpy.mockRestore();
  });

  it("loga erro quando payload é inválido", () => {
    mockSearchParams = new URLSearchParams({
      payload: "invalid-json",
    });

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<Designacoes />);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Falha ao ler dados do passo anterior",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});

