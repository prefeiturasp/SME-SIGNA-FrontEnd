import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { DesignacaoProvider, useDesignacaoContext } from "./DesignacaoContext";
import { FormDesignacaoData } from "@/components/dashboard/Designacao/PesquisaUnidade/schema";

const mockFormData: FormDesignacaoData = {
  dre: "dre-1",
  ue: "ue-1",
  codigo_estrutura_hierarquica: "123456",
  funcionarios_da_unidade: "func-1",
  quantidade_turmas: "10",
  cargo_sobreposto: "cargo-1",
  modulos: "2",
};

function TestComponent() {
  const { formDesignacaoData, setFormDesignacaoData, clearFormDesignacaoData } =
    useDesignacaoContext();

  return (
    <div>
      <div data-testid="form-data">
        {formDesignacaoData ? JSON.stringify(formDesignacaoData) : "null"}
      </div>
      <button
        onClick={() => setFormDesignacaoData(mockFormData)}
        data-testid="set-data-button"
      >
        Set Data
      </button>
      <button
        onClick={clearFormDesignacaoData}
        data-testid="clear-data-button"
      >
        Clear Data
      </button>
    </div>
  );
}

describe("DesignacaoContext", () => {
  it("renderiza o provider com children", () => {
    render(
      <DesignacaoProvider>
        <div data-testid="child">Child Content</div>
      </DesignacaoProvider>
    );

    expect(screen.getByTestId("child")).toHaveTextContent("Child Content");
  });

  it("fornece valor inicial null para formDesignacaoData", () => {
    render(
      <DesignacaoProvider>
        <TestComponent />
      </DesignacaoProvider>
    );

    expect(screen.getByTestId("form-data")).toHaveTextContent("null");
  });

  it("atualiza formDesignacaoData quando setFormDesignacaoData é chamado", async () => {
    const user = userEvent.setup();

    render(
      <DesignacaoProvider>
        <TestComponent />
      </DesignacaoProvider>
    );

 
    await user.click(screen.getByTestId("set-data-button"));

    await waitFor(() => {
      expect(screen.getByTestId("form-data")).toHaveTextContent(
        JSON.stringify(mockFormData)
      );
    });
  });

  it("limpa formDesignacaoData quando clearFormDesignacaoData é chamado", async () => {
    const user = userEvent.setup();

    render(
      <DesignacaoProvider>
        <TestComponent />
      </DesignacaoProvider>
    );

    await user.click(screen.getByTestId("set-data-button"));

    await waitFor(() => {
      expect(screen.getByTestId("form-data")).not.toHaveTextContent("null");
    });

    await user.click(screen.getByTestId("clear-data-button"));

    await waitFor(() => {
      expect(screen.getByTestId("form-data")).toHaveTextContent("null");
    });
  });

  it("permite múltiplas atualizações de formDesignacaoData", async () => {
    const user = userEvent.setup();

    render(
      <DesignacaoProvider>
        <TestComponent />
      </DesignacaoProvider>
    );

    await user.click(screen.getByTestId("set-data-button"));

    await waitFor(() => {
      expect(screen.getByTestId("form-data")).toHaveTextContent(
        JSON.stringify(mockFormData)
      );
    });

    const updatedData = { ...mockFormData, dre: "dre-2" };

    function UpdateComponent() {
      const { setFormDesignacaoData } = useDesignacaoContext();
      return (
        <button
          onClick={() => setFormDesignacaoData(updatedData)}
          data-testid="update-data-button"
        >
          Update
        </button>
      );
    }

    render(
      <DesignacaoProvider>
        <TestComponent />
        <UpdateComponent />
      </DesignacaoProvider>
    );

    await user.click(screen.getAllByTestId("set-data-button")[1]);
    await user.click(screen.getByTestId("update-data-button"));

    await waitFor(() => {
      const formDataElements = screen.getAllByTestId("form-data");
      expect(formDataElements[1]).toHaveTextContent(JSON.stringify(updatedData));
    });
  });

  it("lança erro quando useDesignacaoContext é usado fora do provider", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    function ComponentWithoutProvider() {
      useDesignacaoContext();
      return <div>Content</div>;
    }

    expect(() => {
      render(<ComponentWithoutProvider />);
    }).toThrow("useDesignacaoContext must be used within DesignacaoProvider");

    consoleErrorSpy.mockRestore();
  });

  it("mantém o estado entre re-renderizações", async () => {
    const user = userEvent.setup();

    function Parent() {
      const [count, setCount] = React.useState(0);
      return (
        <DesignacaoProvider>
          <TestComponent />
          <button onClick={() => setCount(count + 1)} data-testid="rerender">
            Rerender {count}
          </button>
        </DesignacaoProvider>
      );
    }

    render(<Parent />);

    await user.click(screen.getByTestId("set-data-button"));

    await waitFor(() => {
      expect(screen.getByTestId("form-data")).toHaveTextContent(
        JSON.stringify(mockFormData)
      );
    });

    await user.click(screen.getByTestId("rerender"));

    expect(screen.getByTestId("form-data")).toHaveTextContent(
      JSON.stringify(mockFormData)
    );
  });

   
});

