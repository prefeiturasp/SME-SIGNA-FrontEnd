import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import ModalEditarServidor from "./ModalEditarServidor";
import type { Servidor } from "@/types/designacao-unidade";
 
 
const mockSetFormDesignacaoData = vi.fn();
const handleSubmitEditarServidor = vi.fn();

 


const defaultServidor: Servidor = {
  rf: "12345",
  nome_servidor: "João da Silva",
  nome_civil: "João da Silva Civil",

  vinculo: 1,
  lotacao: "Escola Municipal X",
  cargo_base: "Professor I",
  cargo_sobreposto_funcao_atividade: "Diretor de Escola",
  cursos_titulos: "Licenciatura em Matemática",
  local_de_exercicio: "Diretoria Regi.de Educação São Mateus ",
  laudo_medico: "Laudo médico não informado",
  local_de_servico: "Regi.de Educação São Mateus ",
};


 
 
function renderModal(
  overrides: Partial<{
    isLoading: boolean;
    open: boolean;
    onOpenChange: (v: boolean) => void;
    defaultValues: Servidor;
    showLocalDeServico: boolean;
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
        handleSubmitEditarServidor={handleSubmitEditarServidor}
        showLocalDeServico={overrides.showLocalDeServico ?? false}
      />  
    ),
  };
}

 
describe("ModalEditarServidor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      "Vínculo",
       "Cargo base",

      "Lotação",
      "Cargo sobreposto/Função atividade",
      
      "Local de exercício",
      "Laudo médico",
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

   
  it("usa nome como fallback para nome_civil quando nome_civil é undefined", () => {
    const servidor: Servidor = { ...defaultServidor, nome_civil: undefined };
    renderModal({ defaultValues: servidor });

    expect(screen.getByPlaceholderText("Nome Civil")).toHaveValue(servidor.nome_servidor);
  });

 
  it("Verifica se os campos estão desabilitados", () => {
    renderModal({ showLocalDeServico: true });
    expect(screen.getByPlaceholderText("Nome servidor")).not.toBeDisabled();
 

    expect(screen.getByPlaceholderText("Nome Civil")).not.toBeDisabled();
    expect(screen.getByPlaceholderText("Digite o RF")).toBeDisabled();
   
    expect(screen.getByPlaceholderText("Vínculo")).toBeDisabled();

    expect(screen.getByPlaceholderText("Cargo base")).toBeDisabled();

    expect(screen.getByPlaceholderText(/Lotação/)).toBeDisabled();
    expect(screen.getByPlaceholderText("Cargo sobreposto")).toBeDisabled();
    expect(screen.getByPlaceholderText(/Local de exercício/)).toBeDisabled();
    expect(screen.getByPlaceholderText(/Laudo médico/)).toBeDisabled();
    expect(screen.getByPlaceholderText(/Local de serviço/)).toBeDisabled();
 

  });

  it("Verifica se o campo local de serviço não aparece quando showLocalDeServico é false", () => {
    renderModal({ showLocalDeServico: false });
 
    expect(screen.queryByPlaceholderText(/Local de serviço/)).not.toBeInTheDocument(); 

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
      expect(handleSubmitEditarServidor).toHaveBeenCalledWith(
        expect.objectContaining({
          ...defaultServidor,
            nome_civil: "Apenas Civil Alterado",
        })
      );
    });
  });

   
  it("altera o nome servidor corretamente e salva via submit", async () => {
    const user = userEvent.setup();
    renderModal();

    const inputNomeServidor = screen.getByPlaceholderText("Nome servidor");
    await user.clear(inputNomeServidor);
    await user.type(inputNomeServidor, "Novo Nome Servidor");

    await user.click(screen.getByTestId("botao-salvar"));

     await waitFor(() => {
      expect(handleSubmitEditarServidor).toHaveBeenCalledWith(
        expect.objectContaining({
          ...defaultServidor,
          nome_servidor: "Novo Nome Servidor",
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



 
  it("mantém os dados do submit ao salvar, sobrescrevendo apenas nome_servidor e nome_civil", async () => {
    const user = userEvent.setup();
    renderModal();

    const inputNomeCivil = screen.getByPlaceholderText("Nome Civil");
    await user.clear(inputNomeCivil);
    await user.type(inputNomeCivil, "Nome Civil Atualizado");

    await user.click(screen.getByTestId("botao-salvar"));

    await waitFor(() => {
      expect(handleSubmitEditarServidor).toHaveBeenCalledWith(
        expect.objectContaining({
          ...defaultServidor,
          nome_civil: "Nome Civil Atualizado",
        })
      );
    });
  });

  it("mantém os valores informados para local_de_exercicio, laudo_medico e local_de_servico", async () => {
    const user = userEvent.setup();
    const servidorComLocais: Servidor = {
      ...defaultServidor,
      local_de_exercicio: "Exercício personalizado",
      laudo_medico: "Laudo personalizado",
      local_de_servico: "Serviço personalizado",
    };

    renderModal({ defaultValues: servidorComLocais });

    await user.click(screen.getByTestId("botao-salvar"));

    await waitFor(() => {
      expect(handleSubmitEditarServidor).toHaveBeenCalledWith(
        expect.objectContaining({
          nome_servidor: servidorComLocais.nome_servidor,
          nome_civil: servidorComLocais.nome_civil,
          rf: servidorComLocais.rf,
          cargo_base: servidorComLocais.cargo_base,
          local_de_exercicio: servidorComLocais.local_de_exercicio,
          laudo_medico: servidorComLocais.laudo_medico,
          local_de_servico: servidorComLocais.local_de_servico,
        })
      );
    });
  });
});
