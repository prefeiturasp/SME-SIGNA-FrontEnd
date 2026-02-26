import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import FormularioBuscaDesignacao from "./FormularioBuscaDesignacao";

describe("FormularioBuscaDesignacao", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("usa valores iniciais vazios", () => {
    render(<FormularioBuscaDesignacao onBuscaDesignacao={vi.fn()} />);

    expect(screen.getByTestId("input-rf"))
      .toHaveDisplayValue("");
  });

  it("renderiza o campo de RF e o botão de pesquisa", () => {
    render(<FormularioBuscaDesignacao onBuscaDesignacao={vi.fn()} />);

    expect(
      screen.getByText("RF do servidor indicado")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /Pesquisar/i })
    ).toBeInTheDocument();
  });

  it("submete o formulário chamando o handler com os valores informados", async () => {
    const onBuscaDesignacao = vi.fn();
    const user = userEvent.setup();

    render(<FormularioBuscaDesignacao onBuscaDesignacao={onBuscaDesignacao} />);

    const rfInput = screen.getByTestId("input-rf");

    await user.type(rfInput, "123");
    await user.click(
      screen.getByRole("button", { name: /Pesquisar/i })
    );

    await waitFor(() => {
      expect(onBuscaDesignacao).toHaveBeenCalledWith({
        rf: "123",
      });
    });
  });
});