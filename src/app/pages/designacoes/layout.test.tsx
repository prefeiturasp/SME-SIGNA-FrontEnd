import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import DesignacoesLayout from "./layout";
import { useDesignacaoContext } from "./DesignacaoContext";

describe("DesignacoesLayout", () => {
  it("renderiza children corretamente", () => {
    render(
      <DesignacoesLayout>
        <div data-testid="child-content">Test Content</div>
      </DesignacoesLayout>
    );

    expect(screen.getByTestId("child-content")).toHaveTextContent(
      "Test Content"
    );
  });

  it("fornece o DesignacaoProvider para children", () => {
    function ChildThatUsesContext() {
      const context = useDesignacaoContext();
      return (
        <div data-testid="context-available">
          {context ? "Context Available" : "No Context"}
        </div>
      );
    }

    render(
      <DesignacoesLayout>
        <ChildThatUsesContext />
      </DesignacoesLayout>
    );

    expect(screen.getByTestId("context-available")).toHaveTextContent(
      "Context Available"
    );
  });

  it("renderiza múltiplos children", () => {
    render(
      <DesignacoesLayout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </DesignacoesLayout>
    );

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
    expect(screen.getByTestId("child-3")).toBeInTheDocument();
  });

  it("permite que children acessem o contexto", () => {
    function ChildComponent() {
      const { formDesignacaoData, setFormDesignacaoData } =
        useDesignacaoContext();

      return (
        <div>
          <div data-testid="context-data">
            {formDesignacaoData ? "Has Data" : "No Data"}
          </div>
          <button
            onClick={() =>
              setFormDesignacaoData({
                dre: "test-dre",
                ue: "test-ue",
                codigo_estrutura_hierarquica: "123",
                funcionarios_da_unidade: "func",
                quantidade_turmas: "10",
                cargo_sobreposto: "cargo",
                modulos: "2", 
                servidorIndicado: {
                  nome: "test-nome",
                  rf: "123",
                  esta_afastado: false,
                  vinculo_cargo_sobreposto: "Ativo",
                  lotacao_cargo_sobreposto: "Unidade X",
                  cargo_base: "Professor",
                  funcao_atividade: "Docente",
                  cargo_sobreposto: "Nenhum",
                  cursos_titulos: "Licenciatura",
                  dre: "DRE Teste",
                  codigo_estrutura_hierarquica: "COD-1",
                  
                },
              })
            }
            data-testid="set-context-button"
          >
            Set Data
          </button>
        </div>
      );
    }

    render(
      <DesignacoesLayout>
        <ChildComponent />
      </DesignacoesLayout>
    );
    fireEvent.click(screen.getByTestId("set-context-button"));

    // o provider atualmente inicia com dados (seed)
    expect(screen.getByTestId("context-data")).toHaveTextContent("Has Data");
    expect(screen.getByTestId("set-context-button")).toBeInTheDocument();
  });

  it("preserva a estrutura do layout", () => {
    const { container } = render(
      <DesignacoesLayout>
        <div>Content</div>
      </DesignacoesLayout>
    );

    expect(container.firstChild).toBeTruthy();
  });

  it("renderiza corretamente a estrutura do provider", () => {
    const { container } = render(
      <DesignacoesLayout>
        <div data-testid="child">Child Content</div>
      </DesignacoesLayout>
    );

    const child = screen.getByTestId("child");
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent("Child Content");
    
    // Verifica que o container tem conteúdo
    expect(container.firstChild).toBeTruthy();
  });
});

