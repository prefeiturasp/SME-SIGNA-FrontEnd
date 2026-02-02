import { render, screen } from "@testing-library/react";
import ResumoDesignacao from "./ResumoDesignacao";
import { BuscaServidorDesignacaoBody } from "@/types/busca-servidor-designacao";

const mockData: BuscaServidorDesignacaoBody = {
  nome: "Servidor Teste",
  rf: "123",
  vinculo_cargo_sobreposto: "Ativo",
  lotacao_cargo_sobreposto: "Escola X",
  cargo_base: "Professor",
  funcao_atividade: "Docente",
  cargo_sobreposto: "Nenhum",
  cursos_titulos: "Licenciatura",
};

describe("ResumoDesignacao", () => {
  it("exibe todos os rótulos e valores do resumo", () => {
    render(<ResumoDesignacao defaultValues={mockData} />);

    const labels = [
      "Servidor",
      "RF",
      "Vínculo",
      "Lotação",
      "Cargo base",      
      "Função",
      "Cargo sobreposto",      
      "Cursos/Títulos",
      
    ];

    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    Object.values(mockData).forEach((value) => {
      expect(screen.getAllByText(value).length).toBeGreaterThan(0);
    });
  });

  it("aplica className recebido na raiz", () => {
    const { container } = render(
      <ResumoDesignacao className="custom-class" defaultValues={mockData} />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
  it("mostra o loading quando isLoading é true", () => {
     render(
      <ResumoDesignacao isLoading={true} className="custom-class" defaultValues={mockData} />
    );

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });
});

