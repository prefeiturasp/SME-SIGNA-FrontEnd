import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ResumoTitular from "./ResumoTitular";
import { Servidor } from "@/types/designacao-unidade";
import type { FormEditarServidorData } from "./ModalEditarServidor/schema";

const modalSubmitPayload: FormEditarServidorData = {
  nome_servidor: "Servidor Editado",
  rf: "9999999",
};

vi.mock("./ModalEditarServidor/ModalEditarServidor", () => ({
  default: ({
    open,
    onOpenChange,
    defaultValues,
    handleSubmitEditarServidor,
  }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    defaultValues: Servidor;
    handleSubmitEditarServidor: (data: FormEditarServidorData) => void;
  }) => (
    <div data-testid="modal-editar">
      <span data-testid="modal-default-rf">{defaultValues.rf}</span>
      {open && (
        <>
          <span>Modal Editar Aberto</span>
          <button onClick={() => handleSubmitEditarServidor(modalSubmitPayload)}>
            Salvar edição
          </button>
          <button onClick={() => onOpenChange(false)}>Fechar Modal</button>
        </>
      )}
    </div>
  ),
}));

vi.mock("@/components/ui/info-item", () => ({
  InfoItem: ({ label, value }: { label: string; value: string }) => (
    <div data-testid="info-item">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
    </div>
  ),
}));

const mockData: Servidor = {
  nome_servidor: "Fulano de Tal",
  nome_civil: "Fulano Civil",
  rf: "9876543",
  vinculo: 1,
  cd_cargo_base: 1,
  cargo_base: "Diretor Escolar",
  lotacao: "EMEF Teste",
  cd_cargo_sobreposto_funcao_atividade: 2,
  cargo_sobreposto_funcao_atividade: "SECRETARIO DE ESCOLA - v1",
  local_de_exercicio: "JOSE BORGES ANDRADE",
  laudo_medico: "Não possui",
  local_de_servico: "Indisponível",
  cursos_titulos: "Indisponível",
};

describe("ResumoTitular", () => {
  const mockOnSubmitEditarServidor = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar todos os campos corretamente", () => {
    render(
      <ResumoTitular
        data={mockData}
        onSubmitEditarServidor={mockOnSubmitEditarServidor}
      />
    );

    expect(screen.getByText("Nome Servidor")).toBeInTheDocument();
    expect(screen.getByText("RF")).toBeInTheDocument();
    expect(screen.getByText("Vínculo")).toBeInTheDocument();

    expect(screen.getByText("Fulano de Tal")).toBeInTheDocument();
    expect(screen.getAllByText("9876543").length).toBeGreaterThan(0);
    expect(screen.getByText("EMEF Teste")).toBeInTheDocument();

    const lotacaoElements = screen.getAllByText(mockData.lotacao);
    expect(lotacaoElements).toHaveLength(1);
  });

  it("deve abrir o modal de edição ao clicar no botão Editar", async () => {
    const user = userEvent.setup();
    render(
      <ResumoTitular
        data={mockData}
        onSubmitEditarServidor={mockOnSubmitEditarServidor}
      />
    );

    const editButton = screen.getByRole("button", { name: /editar/i });

    expect(screen.queryByText("Modal Editar Aberto")).not.toBeInTheDocument();

    await user.click(editButton);

    expect(screen.getByText("Modal Editar Aberto")).toBeInTheDocument();
  });

  it("deve fechar o modal quando a função onOpenChange for chamada", async () => {
    const user = userEvent.setup();
    render(
      <ResumoTitular
        data={mockData}
        onSubmitEditarServidor={mockOnSubmitEditarServidor}
      />
    );

    await user.click(screen.getByRole("button", { name: /editar/i }));
    expect(screen.getByText("Modal Editar Aberto")).toBeInTheDocument();

    await user.click(screen.getByText("Fechar Modal"));

    expect(screen.queryByText("Modal Editar Aberto")).not.toBeInTheDocument();
  });

  it("deve exibir o botão de editar", () => {
    render(
      <ResumoTitular
        data={mockData}
        onSubmitEditarServidor={mockOnSubmitEditarServidor}
      />
    );

    expect(screen.getByRole("button", { name: /editar/i })).toBeInTheDocument();
  });

  it("renderiza local de serviço apenas quando showLocalDeServico for true", () => {
    const { rerender } = render(
      <ResumoTitular
        data={mockData}
        onSubmitEditarServidor={mockOnSubmitEditarServidor}
        showLocalDeServico={false}
      />
    );

    expect(screen.queryByText("Local de serviço")).not.toBeInTheDocument();

    rerender(
      <ResumoTitular
        data={mockData}
        onSubmitEditarServidor={mockOnSubmitEditarServidor}
        showLocalDeServico={true}
      />
    );

    expect(screen.getByText("Local de serviço")).toBeInTheDocument();
    expect(screen.getByText("Indisponível")).toBeInTheDocument();
  });

  it("encaminha submit do modal para onSubmitEditarServidor", async () => {
    const user = userEvent.setup();
    render(
      <ResumoTitular
        data={mockData}
        onSubmitEditarServidor={mockOnSubmitEditarServidor}
      />
    );

    expect(screen.getByTestId("modal-default-rf")).toHaveTextContent("9876543");

    await user.click(screen.getByRole("button", { name: /editar/i }));
    await user.click(screen.getByRole("button", { name: /salvar edição/i }));

    expect(mockOnSubmitEditarServidor).toHaveBeenCalledWith(modalSubmitPayload);
  });
});