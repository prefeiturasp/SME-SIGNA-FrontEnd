import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ResumoTitular, { TitularData } from "./ResumoTitular";

vi.mock("./ModalEditarServidor/ModalEditarServidor", () => ({
  default: ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => (
    <div data-testid="modal-editar">
      {open && (
        <>
          <span>Modal Editar Aberto</span>
          <button onClick={() => onOpenChange(false)}>Fechar Modal</button>
        </>
      )}
    </div>
  ),
}));

vi.mock("./ResumoDesignacaoServidorIndicado", () => ({
  InfoItem: ({ label, value }: { label: string; value: string }) => (
    <div data-testid="info-item">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
    </div>
  ),
}));

const mockData: TitularData = {
  nome: "Fulano de Tal",
  nome_civil: "Fulano Civil",
  rf: "9876543",
  vinculo_cargo_sobreposto: 1,
  cargo_sobreposto: "Diretor Escolar",
  lotacao_cargo_sobreposto: "EMEF Teste",
  codigo_hierarquia: "3",
  laudo_medico: "Não possui",
  lotacao_cargo_base: "DRE Pirituba",
};

describe("ResumoTitular", () => {
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar todos os campos corretamente", () => {
    render(<ResumoTitular data={mockData} onEdit={mockOnEdit} />);

    expect(screen.getByText("Nome")).toBeInTheDocument();
    expect(screen.getByText("RF")).toBeInTheDocument();
    expect(screen.getByText("Vínculo")).toBeInTheDocument();

    expect(screen.getByText(mockData.nome)).toBeInTheDocument();
    expect(screen.getByText(mockData.rf)).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    const lotacaoElements = screen.getAllByText(mockData.lotacao_cargo_sobreposto);
    expect(lotacaoElements).toHaveLength(3);  });

  it("deve abrir o modal de edição ao clicar no botão Editar", async () => {
    const user = userEvent.setup();
    render(<ResumoTitular data={mockData} onEdit={mockOnEdit} />);

    const editButton = screen.getByRole("button", { name: /editar/i });
    
    expect(screen.queryByText("Modal Editar Aberto")).not.toBeInTheDocument();

    await user.click(editButton);

    expect(screen.getByText("Modal Editar Aberto")).toBeInTheDocument();
  });

  it("deve fechar o modal quando a função onOpenChange for chamada", async () => {
    const user = userEvent.setup();
    render(<ResumoTitular data={mockData} onEdit={mockOnEdit} />);

    // Abrir
    await user.click(screen.getByRole("button", { name: /editar/i }));
    expect(screen.getByText("Modal Editar Aberto")).toBeInTheDocument();

    const closeButton = screen.getByText("Fechar Modal");
    await user.click(closeButton);

    expect(screen.queryByText("Modal Editar Aberto")).not.toBeInTheDocument();
  });

  it("deve passar os dados como defaultValues para o modal", () => {
    render(<ResumoTitular data={mockData} onEdit={mockOnEdit} />);
    
    expect(screen.getByRole("button", { name: /editar/i })).toBeInTheDocument();
  });
});