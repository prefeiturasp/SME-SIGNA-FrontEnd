import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import ModalEditarServidor from "./ModalEditarServidor";
import type { Servidor } from "@/types/designacao-unidade";

const handleSubmitEditarServidor = vi.fn();

const defaultServidor: Servidor = {
  rf: "12345",
  nome_servidor: "João da Silva",
  nome_civil: "João da Silva Civil",
  vinculo: 1,
  lotacao: "Escola Municipal X",
  cargo_base: "Professor I",
  cd_cargo_base: 10,
  cargo_sobreposto_funcao_atividade: "Diretor de Escola",
  cd_cargo_sobreposto_funcao_atividade: 20,
  cursos_titulos: "Licenciatura em Matemática",
  local_de_exercicio: "Diretoria Regi.de Educação São Mateus",
  laudo_medico: "Laudo médico não informado",
  local_de_servico: "Regi.de Educação São Mateus",
};

function renderModal(overrides: Partial<any> = {}) {
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
      />
    ),
  };
}

describe("ModalEditarServidor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza o modal quando open é true", () => {
    renderModal();

    expect(
      screen.getByRole("heading", {
        name: /editar dados servidor indicado/i,
      })
    ).toBeInTheDocument();
  });

  it("não renderiza quando open é false", () => {
    renderModal({ open: false });

    expect(
      screen.queryByRole("heading", {
        name: /editar dados servidor indicado/i,
      })
    ).not.toBeInTheDocument();
  });

  it("exibe os campos principais", () => {
    renderModal();

    expect(screen.getByRole("textbox", { name: /nome servidor/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /nome social/i })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /rf/i })).toBeInTheDocument();
  });

  it("preenche os valores iniciais corretamente", () => {
    renderModal();

    expect(screen.getByRole("textbox", { name: /nome servidor/i })).toHaveValue(
      defaultServidor.nome_servidor
    );

    expect(screen.getByRole("textbox", { name: /nome social/i })).toHaveValue(
      defaultServidor.nome_civil
    );
  });

  it("usa nome_servidor como fallback para nome_civil", () => {
    const servidor = { ...defaultServidor, nome_civil: undefined };

    renderModal({ defaultValues: servidor });

    expect(screen.getByRole("textbox", { name: /nome social/i })).toHaveValue(
      servidor.nome_servidor
    );
  });

  it("valida campos desabilitados corretamente", () => {
    renderModal();

    expect(screen.getByRole("textbox", { name: /nome servidor/i })).toBeEnabled();
    expect(screen.getByRole("textbox", { name: /nome social/i })).toBeEnabled();

    expect(screen.getByRole("spinbutton", { name: /rf/i })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: /vínculo/i })).toBeDisabled();
  });

  it("desabilita botão salvar quando isLoading", () => {
    renderModal({ isLoading: true });

    expect(screen.getByTestId("botao-salvar")).toBeDisabled();
  });

  it("clica em cancelar e fecha modal", async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderModal();

    await user.click(screen.getByTestId("botao-cancelar"));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("edita nome social e envia corretamente", async () => {
    const user = userEvent.setup();
    renderModal();

    const input = screen.getByRole("textbox", { name: /nome social/i });

    await user.clear(input);
    await user.type(input, "Novo Nome Social");

    await user.click(screen.getByTestId("botao-salvar"));

    await waitFor(() => {
      expect(handleSubmitEditarServidor).toHaveBeenCalledWith(
        expect.objectContaining({
          nome_civil: "Novo Nome Social",
        })
      );
    });
  });

  it("edita nome servidor e envia corretamente", async () => {
    const user = userEvent.setup();
    renderModal();

    const input = screen.getByRole("textbox", { name: /nome servidor/i });

    await user.clear(input);
    await user.type(input, "Novo Nome");

    await user.click(screen.getByTestId("botao-salvar"));

    await waitFor(() => {
      expect(handleSubmitEditarServidor).toHaveBeenCalledWith(
        expect.objectContaining({
          nome_servidor: "Novo Nome",
        })
      );
    });
  });

  it("fecha modal após submit", async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderModal();

    await user.click(screen.getByTestId("botao-salvar"));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("exibe erro ao deixar Nome Social vazio", async () => {
    const user = userEvent.setup();
    renderModal();

    const input = screen.getByRole("textbox", { name: /nome social/i });

    await user.clear(input);
    await user.click(screen.getByTestId("botao-salvar"));

    expect(
      await screen.findByText(/digite o nome social/i)
    ).toBeInTheDocument();
  });

  it("exibe erro ao deixar Nome Servidor vazio", async () => {
    const user = userEvent.setup();
    renderModal();

    const input = screen.getByRole("textbox", { name: /nome servidor/i });

    await user.clear(input);
    await user.click(screen.getByTestId("botao-salvar"));

    expect(
      await screen.findByText(/digite o nome do servidor/i)
    ).toBeInTheDocument();
  });
});