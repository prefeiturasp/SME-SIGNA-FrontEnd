import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FormProvider } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useHistoricoDeDesignacoes } from "./useHistoricoDeDesignacoes";

const fetchHistoricoDeDesignacoesMock = vi.fn();

vi.mock("@/actions/designacao", () => ({
  fetchHistoricoDeDesignacoes: (...args: unknown[]) =>
    fetchHistoricoDeDesignacoesMock(...args),
}));

function FormularioDoHistorico() {
  const { filterForm, onSubmitFilterForm } = useHistoricoDeDesignacoes("014591");

  return (
    <FormProvider {...filterForm}>
      <form onSubmit={filterForm.handleSubmit(onSubmitFilterForm)}>
        <select data-testid="campo-tipo" {...filterForm.register("tipo")}>
          <option value="TODOS">Todos os atos</option>
          <option value="APOSTILA">Apostila</option>
          <option value="CESSACAO">Cessação</option>
        </select>
        <input data-testid="campo-observacao" {...filterForm.register("observacao")} />
        <button type="submit">Pesquisar</button>
      </form>
    </FormProvider>
  );
}

describe("useHistoricoDeDesignacoes com formulário real", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchHistoricoDeDesignacoesMock.mockResolvedValue({ success: true, data: [] });
  });

  it("envia o tipo escolhido no select ao submeter a pesquisa", async () => {
    render(<FormularioDoHistorico />);

    await waitFor(() => expect(fetchHistoricoDeDesignacoesMock).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByTestId("campo-tipo"), {
      target: { value: "APOSTILA" },
    });
    fireEvent.click(screen.getByText("Pesquisar"));

    await waitFor(() => {
      expect(fetchHistoricoDeDesignacoesMock).toHaveBeenLastCalledWith(
        "014591",
        expect.objectContaining({ tipo: "APOSTILA" })
      );
    });
  });

  it("não envia tipo quando o filtro está em Todos os atos", async () => {
    render(<FormularioDoHistorico />);

    await waitFor(() => expect(fetchHistoricoDeDesignacoesMock).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByText("Pesquisar"));

    await waitFor(() => {
      expect(fetchHistoricoDeDesignacoesMock).toHaveBeenLastCalledWith(
        "014591",
        expect.objectContaining({ tipo: undefined })
      );
    });
  });

  it("envia o formulário completo ao pesquisar após alterar mais de um campo", async () => {
    render(<FormularioDoHistorico />);

    await waitFor(() => expect(fetchHistoricoDeDesignacoesMock).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByTestId("campo-tipo"), {
      target: { value: "CESSACAO" },
    });
    fireEvent.change(screen.getByTestId("campo-observacao"), {
      target: { value: "alteração de período" },
    });
    fireEvent.click(screen.getByText("Pesquisar"));

    await waitFor(() => {
      expect(fetchHistoricoDeDesignacoesMock).toHaveBeenLastCalledWith("014591", {
        cargo: undefined,
        tipo: "CESSACAO",
        portaria: "",
        numero_sei: "",
        nome_titular_e_indicado: "",
        status_publicacao: "",
        periodo_after: undefined,
        periodo_before: undefined,
        rf: "",
        observacao: "alteração de período",
      });
    });
  });
});
