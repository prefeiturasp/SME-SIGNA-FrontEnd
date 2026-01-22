import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import FormularioBuscaDesignacao from "./FormularioBuscaDesignacao";

describe("FormularioBuscaDesignacao", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("usa valores iniciais vazios", () => {
    render(<FormularioBuscaDesignacao onBuscaDesignacao={vi.fn()} />);

    expect(
      (screen.getByPlaceholderText("Entre com RF") as HTMLInputElement).value,
    ).toBe("");
  });

  it("renderiza o campo de RF e o botão de pesquisa", () => {
    render(<FormularioBuscaDesignacao onBuscaDesignacao={vi.fn()} />);

    expect(screen.getByText("RF do servidor")).toBeInTheDocument();
    expect(screen.getByText("Pesquisar")).toBeInTheDocument();
  });

  it("submete o formulário chamando o handler com os valores mockados", () => {
    const onBuscaDesignacao = vi.fn();

    render(<FormularioBuscaDesignacao onBuscaDesignacao={onBuscaDesignacao} />);

    const rfInput = screen.getByPlaceholderText("Entre com RF") as HTMLInputElement;

    fireEvent.change(rfInput, { target: { value: "test" } });

    const submitButton = screen.getByRole("button", { name: /Pesquisar/i });
    fireEvent.click(submitButton);

    return waitFor(() => {
      expect(onBuscaDesignacao).toHaveBeenCalledWith({
        rf: "test"
      });
    });
  });
});

