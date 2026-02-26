import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import ModalEditarServidor from "./ModalEditarServidor";
import type { Servidor } from "@/types/designacao-unidade";
import type { FormDesignacaoEServidorIndicado } from "@/app/pages/designacoes/DesignacaoContext";

 
const mockSetFormDesignacaoData = vi.fn();

 let mockFormDesignacaoDataValue: FormDesignacaoEServidorIndicado | null;

vi.mock("@/app/pages/designacoes/DesignacaoContext", () => ({
  useDesignacaoContext: () => ({
    setFormDesignacaoData: mockSetFormDesignacaoData,
    get formDesignacaoData() {
      return mockFormDesignacaoDataValue;
    },
  }),
}));

 
const defaultServidor: Servidor = {
  rf: "12345",
  nome: "João da Silva",
  nome_servidor: "João da Silva",
  nome_civil: "João da Silva Civil",
  esta_afastado: false,
  vinculo_cargo_sobreposto: 1,
  lotacao_cargo_sobreposto: "Escola Municipal X",
  cargo_base: "Professor I",
  funcao_atividade: "Docente",
  cargo_sobreposto: "Diretor de Escola",
  cursos_titulos: "Licenciatura em Matemática",
  dre: "DRE Ipiranga",
  codigo_estrutura_hierarquica: "COD-456",
};

const mockFormDesignacaoData: FormDesignacaoEServidorIndicado = {
  dre: "dre-1",
  ue: "ue-1",
  codigo_estrutura_hierarquica: "123456",
  funcionarios_da_unidade: "func-1",
  quantidade_turmas: "10",
  cargo_sobreposto: "cargo-1",
  modulos: "2",
  servidorIndicado: {
    nome: "Servidor Mock",
    rf: "12345",
    esta_afastado: false,
    vinculo_cargo_sobreposto: 1,
    lotacao_cargo_sobreposto: "Escola Municipal Mock",
    cargo_base: "Professor I",
    funcao_atividade: "Docente",
    cargo_sobreposto: "Diretor",
    cursos_titulos: "Licenciatura",
    dre: "DRE Mock",
    codigo_estrutura_hierarquica: "COD-MOCK",
  },
};

 
function renderModal(
  overrides: Partial<{
    isLoading: boolean;
    open: boolean;
    onOpenChange: (v: boolean) => void;
    defaultValues: Servidor;
  }> = {}
) {
  const onOpenChange = overrides.onOpenChange ?? vi.fn();
  return {
    onOpenChange,
    ...render(
      <ModalEditarServidor
        isLoading={overrides.isLoading ?? false}
        open={overrides.open ?? true}
        onOpenChange={onOpenChange}
        defaultValues={overrides.defaultValues ?? defaultServidor}
      />
    ),
  };
}

 
describe("ModalEditarServidor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
     mockFormDesignacaoDataValue = mockFormDesignacaoData;
  });

 
  it("renderiza o modal quando open é true", () => {
    renderModal({ open: true });

    expect(
      screen.getByText("Editar dados servidor indicado")
    ).toBeInTheDocument();
  });

  it("não renderiza o conteúdo quando open é false", () => {
    renderModal({ open: false });

    expect(
      screen.queryByText("Editar dados servidor indicado")
    ).not.toBeInTheDocument();
  });

  it("exibe todos os rótulos dos campos do formulário", () => {
    renderModal();

    const labels = [
      "Nome servidor",
      "Nome Civil",
      "RF",
      "Função",
      "Cargo sobreposto",
      "Cargo base",
      "Função atividade",
      "Vínculo",
      "DRE",
      "Lotação",
      "Código estrutura hierárquica",
      "Local de exercício",
      "Laudo médico",
      "Local de serviço",
    ];

    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("preenche os campos editáveis com os defaultValues informados", () => {
    renderModal();

    expect(
      screen.getByDisplayValue(defaultServidor.nome_servidor!)
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(defaultServidor.nome_civil!)
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue(defaultServidor.rf)).toBeInTheDocument();
  });

  it("usa nome como fallback para nome_servidor quando nome_servidor é undefined", () => {
    const servidor: Servidor = { ...defaultServidor, nome_servidor: undefined };
    renderModal({ defaultValues: servidor });

    expect(screen.getByPlaceholderText("Nome servidor")).toHaveValue(
      servidor.nome
    );
  });

  it("usa nome como fallback para nome_civil quando nome_civil é undefined", () => {
    const servidor: Servidor = { ...defaultServidor, nome_civil: undefined };
    renderModal({ defaultValues: servidor });

    expect(screen.getByPlaceholderText("Nome Civil")).toHaveValue(servidor.nome);
  });

 
  it("Verifica se os campos estão desabilitados", () => {
    renderModal();

    expect(screen.getByPlaceholderText("Digite o RF")).toBeDisabled();
   

    expect(screen.getByPlaceholderText("Função")).toBeDisabled();
   

    expect(screen.getByPlaceholderText("Cargo sobreposto")).toBeDisabled();
   

    expect(screen.getByPlaceholderText("Cargo base")).toBeDisabled();
  

    expect(screen.getByPlaceholderText("Função atividade")).toBeDisabled();
 

    expect(screen.getByPlaceholderText("Vínculo")).toBeDisabled();
  

    expect(screen.getByPlaceholderText("DRE")).toBeDisabled();
 
    expect(
      screen.getByPlaceholderText("Lotação cargo sobreposto")
    ).toBeDisabled();
 

    expect(
      screen.getByPlaceholderText("Código estrutura hierárquica")
    ).toBeDisabled();
 
    expect(screen.getByPlaceholderText("Local de exercício")).toBeDisabled();
 

    expect(screen.getByPlaceholderText("Laudo médico")).toBeDisabled();
  

    expect(screen.getByPlaceholderText("Local de serviço")).toBeDisabled();
 

    expect(screen.getByPlaceholderText("Nome servidor")).not.toBeDisabled();
 

    expect(screen.getByPlaceholderText("Nome Civil")).not.toBeDisabled();
  });

  
  it("desabilita o botão Salvar quando isLoading é true", () => {
    renderModal({ isLoading: true });

    expect(screen.getByTestId("botao-salvar")).toBeDisabled();
  });

  it("habilita o botão Salvar quando isLoading é false", () => {
    renderModal({ isLoading: false });

    expect(screen.getByTestId("botao-salvar")).not.toBeDisabled();
  });

 
  it("renderiza o botão Cancelar", () => {
    renderModal();

    expect(screen.getByTestId("botao-cancelar")).toBeInTheDocument();
  });

  it("chama onOpenChange(false) ao clicar em Cancelar", async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderModal();

    await user.click(screen.getByTestId("botao-cancelar"));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });

   
  it("preserva nome_servidor ao alterar somente o nome civil", async () => {
    const user = userEvent.setup();
    renderModal();

    const inputNomeCivil = screen.getByPlaceholderText("Nome Civil");
    await user.clear(inputNomeCivil);
    await user.type(inputNomeCivil, "Apenas Civil Alterado");

    await user.click(screen.getByTestId("botao-salvar"));

    await waitFor(() => {
      expect(mockSetFormDesignacaoData).toHaveBeenCalledWith(
        expect.objectContaining({
          servidorIndicado: expect.objectContaining({
            nome_servidor: defaultServidor.nome_servidor,
            nome_civil: "Apenas Civil Alterado",
          }),
        })
      );
    });
  });

 
  it("altera o nome servidor corretamente e salva via contexto", async () => {
    const user = userEvent.setup();
    renderModal();

    const inputNomeServidor = screen.getByPlaceholderText("Nome servidor");
    await user.clear(inputNomeServidor);
    await user.type(inputNomeServidor, "Novo Nome Servidor");

    await user.click(screen.getByTestId("botao-salvar"));

    await waitFor(() => {
      expect(mockSetFormDesignacaoData).toHaveBeenCalledWith(
        expect.objectContaining({
          servidorIndicado: expect.objectContaining({
            nome_servidor: "Novo Nome Servidor",
          }),
        })
      );
    });
  });

 
  it("chama onOpenChange(false) após submit bem-sucedido", async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderModal();

    await user.click(screen.getByTestId("botao-salvar"));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  // ── Validação do formulário ─────────────────────────────────────────────

  it("exibe erro de validação ao apagar o nome civil e tentar salvar", async () => {
    const user = userEvent.setup();
    renderModal();

    const inputNomeCivil = screen.getByPlaceholderText("Nome Civil");
    await user.clear(inputNomeCivil);

    await user.click(screen.getByTestId("botao-salvar"));

    await waitFor(() => {
      expect(
        screen.getByText("Digite o nome civil do servidor")
      ).toBeInTheDocument();
    });

    expect(mockSetFormDesignacaoData).not.toHaveBeenCalled();
  });

  it("exibe erro de validação ao apagar o nome servidor e tentar salvar", async () => {
    const user = userEvent.setup();
    renderModal();

    const inputNomeServidor = screen.getByPlaceholderText("Nome servidor");
    await user.clear(inputNomeServidor);

    await user.click(screen.getByTestId("botao-salvar"));

    await waitFor(() => {
      expect(
        screen.getByText("Digite o nome do servidor")
      ).toBeInTheDocument();
    });

    expect(mockSetFormDesignacaoData).not.toHaveBeenCalled();
  });

  // ── Contexto com formDesignacaoData nulo ────────────────────────────────

  it("não chama setFormDesignacaoData quando formDesignacaoData é null", async () => {
    // Sobrescreve o contexto para retornar null neste teste
    mockFormDesignacaoDataValue = null;

    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByTestId("botao-salvar"));

    await waitFor(() => {
      expect(mockSetFormDesignacaoData).not.toHaveBeenCalled();
    });
  });

  // ── Dados completos enviados ao contexto ────────────────────────────────

  it("mantém os dados do contexto ao salvar, sobrescrevendo apenas nome_servidor e nome_civil", async () => {
    const user = userEvent.setup();
    renderModal();

    const inputNomeCivil = screen.getByPlaceholderText("Nome Civil");
    await user.clear(inputNomeCivil);
    await user.type(inputNomeCivil, "Nome Civil Atualizado");

    await user.click(screen.getByTestId("botao-salvar"));

    await waitFor(() => {
      expect(mockSetFormDesignacaoData).toHaveBeenCalledWith({
        ...mockFormDesignacaoData,
        servidorIndicado: {
          ...mockFormDesignacaoData.servidorIndicado,
          nome_servidor: defaultServidor.nome_servidor,
          nome_civil: "Nome Civil Atualizado",
        },
      });
    });
  });
});
