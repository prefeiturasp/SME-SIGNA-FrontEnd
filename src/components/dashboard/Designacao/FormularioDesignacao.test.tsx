import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import FormDesignacao from "./FormularioDesignacao";

type SubmitValues = {
  nome_da_unidade: string;
  estrutura_hierarquica: string;
  turmas: string;
  funcionarios_da_unidade: string;
  assistente_de_diretor_escolar: string;
  secretario_da_escola: string;
  funcao_atividade: string;
  cargo_sobreposto: string;
  modulos: string;
};

const submitValues: SubmitValues = {
  nome_da_unidade: "123",
  estrutura_hierarquica: "123",
  turmas: "123",
  funcionarios_da_unidade: "123",
  assistente_de_diretor_escolar: "123",
  secretario_da_escola: "123",
  funcao_atividade: "123",
  cargo_sobreposto: "123",
  modulos: "123",
};

describe("FormDesignacao", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("usa valores iniciais vazios", () => {
    render(<FormDesignacao onSubmitDesignacao={vi.fn()} />);

    expect(
      (screen.getByPlaceholderText("Nome da unidade") as HTMLInputElement).value
    ).toBe("");
    expect(
      (
        screen.getByPlaceholderText(
          "Entre com a estrutura hierárquica",
        ) as HTMLInputElement
      ).value,
    ).toBe("");
  });

  it("renderiza todos os campos principais", () => {
    render(<FormDesignacao onSubmitDesignacao={vi.fn()} />);

    expect(screen.getByText("Nome da unidade")).toBeInTheDocument();
    expect(screen.getByText("Estrutura hierárquica")).toBeInTheDocument();
    expect(screen.getByText("Turmas")).toBeInTheDocument();
    expect(screen.getByText("Funcionários da unidade")).toBeInTheDocument();
    expect(screen.getByText("Assistente de diretor escolar")).toBeInTheDocument();
    expect(screen.getByText("Secretário da escola")).toBeInTheDocument();
    expect(screen.getByText("Função atividade")).toBeInTheDocument();
    expect(screen.getByText("Cargo sobreposto")).toBeInTheDocument();
    expect(screen.getByText("Módulos")).toBeInTheDocument();
  });

  it("submete o formulário chamando o handler com os valores mockados", () => {
    const onSubmitDesignacao = vi.fn();
    
    render(<FormDesignacao onSubmitDesignacao={onSubmitDesignacao} />);  

    const form = screen.getByTestId("form-designacao");
    expect(form).toBeTruthy();

    if (form) {
      fireEvent.change(form.querySelector("input[name='nome_da_unidade']") as HTMLInputElement, { target: { value: "123" } });
      fireEvent.change(form.querySelector("input[name='estrutura_hierarquica']") as HTMLInputElement, { target: { value: "123" } });
      fireEvent.change(form.querySelector("input[name='turmas']") as HTMLInputElement, { target: { value: "123" } });
      fireEvent.change(form.querySelector("input[name='funcionarios_da_unidade']") as HTMLInputElement, { target: { value: "123" } });
      fireEvent.change(form.querySelector("input[name='assistente_de_diretor_escolar']") as HTMLInputElement, { target: { value: "123" } });
      fireEvent.change(form.querySelector("input[name='secretario_da_escola']") as HTMLInputElement, { target: { value: "123" } });
      fireEvent.change(form.querySelector("input[name='funcao_atividade']") as HTMLInputElement, { target: { value: "123" } });
      fireEvent.change(form.querySelector("input[name='cargo_sobreposto']") as HTMLInputElement, { target: { value: "123" } });
      fireEvent.change(form.querySelector("input[name='modulos']") as HTMLInputElement, { target: { value: "123" } });
      fireEvent.submit(form);
    }

    return waitFor(() => {
      expect(onSubmitDesignacao).toHaveBeenCalledWith(submitValues);
    });

  
  });
});

