import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import FormularioBuscaDesignacao from "./FormularioBuscaDesignacao";

describe("FormularioBuscaDesignacao", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar com os labels e placeholders padrão", () => {
    render(<FormularioBuscaDesignacao onBuscaDesignacao={vi.fn()} />);

    expect(screen.getByText("RF do servidor indicado")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Entre com RF")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pesquisar/i })).toBeInTheDocument();
  });

  it("deve renderizar com labels e placeholders customizados via props", () => {
    render(
      <FormularioBuscaDesignacao 
        onBuscaDesignacao={vi.fn()} 
        label="Novo Label" 
        placeholder="Novo Placeholder"
      />
    );

    expect(screen.getByText("Novo Label")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Novo Placeholder")).toBeInTheDocument();
  });

  it("deve exibir mensagem de erro quando o RF for inválido (validação do schema)", async () => {
    const user = userEvent.setup();
    render(<FormularioBuscaDesignacao onBuscaDesignacao={vi.fn()} />);

    const button = screen.getByRole("button", { name: /Pesquisar/i });
    
    await user.click(button);

    await waitFor(() => {
      expect(screen.queryAllByText(/obrigatório|inválido/i).length).toBeGreaterThan(0);
    });
  });

  it("deve chamar onBuscaDesignacao apenas quando o campo for válido", async () => {
    const onBuscaDesignacao = vi.fn();
    const user = userEvent.setup();

    render(<FormularioBuscaDesignacao onBuscaDesignacao={onBuscaDesignacao} />);

    const input = screen.getByPlaceholderText("Entre com RF");
    const button = screen.getByRole("button", { name: /Pesquisar/i });

    // Digita um valor válido
    await user.type(input, "1234567");
    await user.click(button);

    await waitFor(() => {
      expect(onBuscaDesignacao).toHaveBeenCalledWith({
        rf: "1234567",
      });
    });
    
    expect(onBuscaDesignacao).toHaveBeenCalledTimes(1);
  });
});