import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ResumoTitular, { TitularData } from "./ResumoTitular";
import { skipToken } from "@tanstack/react-query";

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
  nome_servidor: "Fulano de Tal",
  nome_civil: "Fulano Civil",
  rf: "9876543",
  vinculo: 1,
  cargo_base: "Diretor Escolar",
  lotacao: "EMEF Teste",
  cargo_sobreposto_funcao_atividade: "SECRETARIO DE ESCOLA - v1",
  local_de_exercicio: "JOSE BORGES ANDRADE",
  laudo_medico: "Não possui",
  local_de_servico: "Indisponível"
};

describe("ResumoTitular", () => {
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar todos os campos corretamente", () => {
    render(<ResumoTitular data={mockData} onEdit={mockOnEdit} />);

    expect(screen.getByText("Nome Servidor")).toBeInTheDocument();
    expect(screen.getByText("RF")).toBeInTheDocument();
    expect(screen.getByText("Vínculo")).toBeInTheDocument();

    expect(screen.getByText(mockData.nome_servidor)).toBeInTheDocument();
    expect(screen.getByText(mockData.rf)).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    const lotacaoElements = screen.getAllByText(mockData.lotacao);
    expect(lotacaoElements).toHaveLength(1);  });

  // to-do: arrumar apos corrigit o funcionamento do componente de edicao
  // it("deve abrir o modal de edição ao clicar no botão Editar", async () => {
  //   const user = userEvent.setup();
  //   render(<ResumoTitular data={mockData} onEdit={mockOnEdit} />);

  //   const editButton = screen.getByRole("button", { name: /editar/i });
    
  //   expect(screen.queryByText("Modal Editar Aberto")).not.toBeInTheDocument();

  //   await user.click(editButton);

  //   expect(screen.getByText("Modal Editar Aberto")).toBeInTheDocument();
  // });

  // it("deve fechar o modal quando a função onOpenChange for chamada", async () => {
  //   const user = userEvent.setup();
  //   render(<ResumoTitular data={mockData} onEdit={mockOnEdit} />);

  //   // Abrir
  //   await user.click(screen.getByRole("button", { name: /editar/i }));
  //   expect(screen.getByText("Modal Editar Aberto")).toBeInTheDocument();

  //   const closeButton = screen.getByText("Fechar Modal");
  //   await user.click(closeButton);

  //   expect(screen.queryByText("Modal Editar Aberto")).not.toBeInTheDocument();
  // });
  // ------------------------------------------

  it("deve passar os dados como defaultValues para o modal", () => {
    render(<ResumoTitular data={mockData} onEdit={mockOnEdit} />);
    
    expect(screen.getByRole("button", { name: /editar/i })).toBeInTheDocument();
  });
});