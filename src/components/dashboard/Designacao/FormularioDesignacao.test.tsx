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


  it("renderiza todos os campos principais", () => {
    render(<FormDesignacao onSubmitDesignacao={vi.fn()} />);

    expect(screen.getByText("Nome da unidade")).toBeInTheDocument();
    
  });

});

