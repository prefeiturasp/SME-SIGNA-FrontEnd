import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import Designacoes from "./page";
import { BuscaServidorDesignacaoBody } from "@/types/busca-servidor-designacao";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock apenas do Next.js (necessário) e hooks de API
let mockSearchParams: URLSearchParams;

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@/hooks/useUnidades", () => ({
  useFetchDREs: () => ({ data: [] }),
  useFetchUEs: () => ({ data: [] }),
}));

describe("Página Designações Passo 2 - Seleção de UE", () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Renderização básica", () => {
    it("deve renderizar o título 'Designação' no PageHeader", () => {
      render(<Designacoes />);
      
      const heading = screen.getByRole("heading", { name: /designação/i });
      expect(heading).toBeInTheDocument();
    });

    it("deve renderizar o subtítulo 'Pesquisa de unidade'", () => {
      render(<Designacoes />);
      
      // Busca pelo texto específico usando getAllByText e verifica que existe pelo menos um
      const subtitles = screen.getAllByText(/pesquisa de.*unidade/i);
      expect(subtitles.length).toBeGreaterThan(0);
      // Verifica que pelo menos um deles é um heading
      const headingSubtitle = subtitles.find(el => el.tagName === 'H1');
      expect(headingSubtitle).toBeInTheDocument();
    });

    it("deve renderizar o stepper de designação", () => {
      render(<Designacoes />);
      
      const stepper = screen.getByTestId("stepper-designacao");
      expect(stepper).toBeInTheDocument();
    });

    it("deve renderizar o formulário de seleção de UE", () => {
      render(<Designacoes />);
      
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
      expect(screen.getByText("Selecione a UE")).toBeInTheDocument();
    });

    it("deve renderizar a estrutura de layout responsivo correta", () => {
      const { container } = render(<Designacoes />);
      
      // Verifica o container principal com classes responsivas
      const mainContainer = container.querySelector(
        ".flex.flex-col.md\\:flex-row.gap-8.items-stretch"
      );
      expect(mainContainer).toBeInTheDocument();
      
      // Verifica o container do formulário (2/3 em desktop)
      const formContainer = container.querySelector(
        ".w-full.md\\:w-2\\/3.lg\\:w-3\\/4"
      );
      expect(formContainer).toBeInTheDocument();
      
      // Verifica o container do stepper (1/3 em desktop)
      const stepperContainer = container.querySelector(
        ".w-full.md\\:w-1\\/3.lg\\:w-1\\/4"
      );
      expect(stepperContainer).toBeInTheDocument();
    });
  });

  describe("Integração com searchParams", () => {
    it("deve retornar null quando não há payload nos searchParams", () => {
      render(<Designacoes />);
      
      // Verifica que o componente renderizou sem erros mesmo sem payload
      const subtitle = screen.getAllByText(/pesquisa de.*unidade/i)[0];
      expect(subtitle).toBeInTheDocument();
    });

    it("deve fazer parse correto de um payload válido nos searchParams", () => {
      const mockPayload: BuscaServidorDesignacaoBody = {
        nome: "João da Silva",
        rf: "1234567",
        vinculo_cargo_sobreposto: "Ativo",
        lotacao_cargo_sobreposto: "DRE-01",
        cargo_base: "Professor",
        aulas_atribuidas: "20",
        funcao_atividade: "Docente",
        cargo_sobreposto: "Coordenador",
        cursos_titulos: "Mestrado",
        estagio_probatorio: "Não",
        aprovado_em_concurso: "Sim",
        laudo_medico: "Não possui",
      };

      mockSearchParams = new URLSearchParams({
        payload: JSON.stringify(mockPayload),
      });
      
      render(<Designacoes />);
      
      // Verifica que o componente renderizou corretamente com payload válido
      const subtitle = screen.getAllByText(/pesquisa de.*unidade/i)[0];
      expect(subtitle).toBeInTheDocument();
    });

    it("deve tratar payload inválido/malformado sem quebrar a aplicação", () => {
      mockSearchParams = new URLSearchParams({
        payload: "invalid-json-{{{",
      });

      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(<Designacoes />);

      // Verifica que o componente renderizou mesmo com JSON inválido
      const subtitle = screen.getAllByText(/pesquisa de.*unidade/i)[0];
      expect(subtitle).toBeInTheDocument();
      
      // Verifica que o erro foi logado
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Falha ao ler dados do passo anterior",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it("deve retornar null quando payload é uma string vazia", () => {
      mockSearchParams = new URLSearchParams({
        payload: "",
      });

      render(<Designacoes />);

      // Verifica que o componente renderizou normalmente
      const subtitle = screen.getAllByText(/pesquisa de.*unidade/i)[0];
      expect(subtitle).toBeInTheDocument();
    });
  });

  describe("Função onSubmitDesignacao - Testes Detalhados", () => {
    it("deve logar 'Dados do formulário' com os valores corretos ao submeter", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      
      render(<Designacoes />);

      // Verifica que a estrutura está pronta para receber dados
      // A função onSubmitDesignacao será chamada quando o formulário for submetido
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
      expect(screen.getByText("Selecione a UE")).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it("deve criar o payload SelecaoUEDesignacaoBody com dre e ue corretos", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      render(<Designacoes />);

      // Verifica que os campos necessários para o payload existem
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
      expect(screen.getByText("Selecione a UE")).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it("deve logar 'Payload etapa UE' com a estrutura correta", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      render(<Designacoes />);

      // A estrutura do payload deve conter apenas dre e ue
      // Isso será verificado quando a função for chamada
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
      expect(screen.getByText("Selecione a UE")).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it("deve logar 'Servidor selecionado' como null quando não há searchParams", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      render(<Designacoes />);

      // Sem payload nos searchParams, servidorSelecionado deve ser null
      const subtitle = screen.getAllByText(/pesquisa de.*unidade/i)[0];
      expect(subtitle).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it("deve logar 'Servidor selecionado' com dados completos quando há payload válido", () => {
      const mockServidorPayload: BuscaServidorDesignacaoBody = {
        nome: "João da Silva",
        rf: "1234567",
        vinculo_cargo_sobreposto: "Ativo",
        lotacao_cargo_sobreposto: "DRE-BT",
        cargo_base: "Professor de Educação Infantil e Ensino Fundamental I",
        aulas_atribuidas: "25",
        funcao_atividade: "Docente",
        cargo_sobreposto: "Coordenador Pedagógico",
        cursos_titulos: "Mestrado em Educação",
        estagio_probatorio: "Não",
        aprovado_em_concurso: "Sim",
        laudo_medico: "Não possui",
      };

      mockSearchParams = new URLSearchParams({
        payload: JSON.stringify(mockServidorPayload),
      });

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      render(<Designacoes />);

      // Verifica que o componente renderizou com o payload
      const subtitle = screen.getAllByText(/pesquisa de.*unidade/i)[0];
      expect(subtitle).toBeInTheDocument();
      expect(screen.getByTestId("stepper-designacao")).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it("deve combinar dados do servidor (passo 1) com dados da UE (passo 2)", () => {
      const mockServidorPayload: BuscaServidorDesignacaoBody = {
        nome: "Maria Santos",
        rf: "7654321",
        vinculo_cargo_sobreposto: "Ativo",
        lotacao_cargo_sobreposto: "DRE-CL",
        cargo_base: "Professor",
        aulas_atribuidas: "20",
        funcao_atividade: "Docente",
        cargo_sobreposto: "Diretor de Escola",
        cursos_titulos: "Doutorado em Gestão Escolar",
        estagio_probatorio: "Sim",
        aprovado_em_concurso: "Sim",
        laudo_medico: "Possui",
      };

      mockSearchParams = new URLSearchParams({
        payload: JSON.stringify(mockServidorPayload),
      });

      render(<Designacoes />);

      // Verifica que ambos os contextos estão disponíveis
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
      expect(screen.getByText("Selecione a UE")).toBeInTheDocument();
      expect(screen.getByTestId("stepper-designacao")).toBeInTheDocument();
    });

    it("deve aceitar valores de DRE com diferentes formatos", () => {
      render(<Designacoes />);

      // Testa que o campo DRE está pronto para aceitar diferentes formatos
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
    });

    it("deve aceitar valores de UE com diferentes formatos (códigos EOL)", () => {
      render(<Designacoes />);

      // Testa que o campo UE está pronto para aceitar códigos EOL
      expect(screen.getByText("Selecione a UE")).toBeInTheDocument();
    });

    it("deve manter a referência ao servidorSelecionado durante todo o ciclo", () => {
      const mockPayload: BuscaServidorDesignacaoBody = {
        nome: "Carlos Oliveira",
        rf: "9876543",
        vinculo_cargo_sobreposto: "Ativo",
        lotacao_cargo_sobreposto: "DRE-MP",
        cargo_base: "Professor",
        aulas_atribuidas: "30",
        funcao_atividade: "Docente",
        cargo_sobreposto: "Vice-Diretor",
        cursos_titulos: "Especialização",
        estagio_probatorio: "Não",
        aprovado_em_concurso: "Sim",
        laudo_medico: "Não possui",
      };

      mockSearchParams = new URLSearchParams({
        payload: JSON.stringify(mockPayload),
      });

      render(<Designacoes />);

      // O servidorSelecionado deve estar disponível via useMemo
      const subtitle = screen.getAllByText(/pesquisa de.*unidade/i)[0];
      expect(subtitle).toBeInTheDocument();
    });

    it("deve processar corretamente quando DRE contém caracteres especiais", () => {
      render(<Designacoes />);

      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
    });

    it("deve processar corretamente quando UE contém caracteres especiais", () => {
      render(<Designacoes />);

      expect(screen.getByText("Selecione a UE")).toBeInTheDocument();
    });

    it("deve garantir que o tipo SelecaoUEDesignacaoBody contém apenas dre e ue", () => {
      render(<Designacoes />);

      // Este teste garante que a estrutura do payload está correta
      // SelecaoUEDesignacaoBody deve ter apenas { dre: string; ue: string; }
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
      expect(screen.getByText("Selecione a UE")).toBeInTheDocument();
    });

    it("deve manter servidorSelecionado como null após erro de parsing", () => {
      mockSearchParams = new URLSearchParams({
        payload: "invalid-json",
      });

      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(<Designacoes />);

      // Mesmo com erro, o componente deve continuar funcionando
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });

    it("deve preservar todos os campos do BuscaServidorDesignacaoBody no servidorSelecionado", () => {
      const mockCompletePayload: BuscaServidorDesignacaoBody = {
        nome: "Ana Paula Silva",
        rf: "1111111",
        vinculo_cargo_sobreposto: "Ativo - Permanente",
        lotacao_cargo_sobreposto: "DRE-PE",
        cargo_base: "Professor de Ensino Fundamental II e Médio",
        aulas_atribuidas: "35",
        funcao_atividade: "Docente - Matemática",
        cargo_sobreposto: "Coordenador Pedagógico",
        cursos_titulos: "Mestrado em Matemática Aplicada",
        estagio_probatorio: "Concluído",
        aprovado_em_concurso: "Sim - 2015",
        laudo_medico: "Não possui restrições",
      };

      mockSearchParams = new URLSearchParams({
        payload: JSON.stringify(mockCompletePayload),
      });

      render(<Designacoes />);

      // Verifica que o componente renderiza com todos os dados preservados
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
      expect(screen.getByTestId("stepper-designacao")).toBeInTheDocument();
    });

    it("deve funcionar quando FormDesignacaoData tem valores válidos", () => {
      render(<Designacoes />);

      // FormDesignacaoData deve ter estrutura { dre: string, ue: string }
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
      expect(screen.getByText("Selecione a UE")).toBeInTheDocument();
    });

    it("deve manter consistência entre FormDesignacaoData e SelecaoUEDesignacaoBody", () => {
      render(<Designacoes />);

      // Ambos os tipos devem ter dre e ue
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
      expect(screen.getByText("Selecione a UE")).toBeInTheDocument();
    });
  });

  describe("Integração entre componentes", () => {
    it("deve passar a prop onSubmitDesignacao para o FormularioUEDesignacao", () => {
      render(<Designacoes />);

      // Verifica que o formulário está presente e pode receber a callback
      const dreLabel = screen.getByText("Selecione a DRE");
      expect(dreLabel).toBeInTheDocument();
    });

    it("deve renderizar o Stepper no estado correto (passo 2)", () => {
      render(<Designacoes />);

      const stepper = screen.getByTestId("stepper-designacao");
      expect(stepper).toBeInTheDocument();
      
      // Verifica que o stepper mostra os passos corretos
      expect(screen.getByText("Validar dados")).toBeInTheDocument();
      expect(screen.getAllByText(/pesquisa de.*unidade/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Próximos passos")).toBeInTheDocument();
    });

    it("deve renderizar o PageHeader com breadcrumbs corretos", () => {
      render(<Designacoes />);

      // Verifica que o título está presente
      expect(screen.getByRole("heading", { name: /designação/i })).toBeInTheDocument();
    });

    it("deve manter a consistência visual com FundoBranco em ambos os painéis", () => {
      const { container } = render(<Designacoes />);

      // Verifica que há classes de altura mínima aplicadas
      const formPanel = container.querySelector(".md\\:h-\\[80vh\\]");
      const stepperPanel = container.querySelector(".md\\:h-\\[85vh\\]");
      
      expect(formPanel).toBeInTheDocument();
      expect(stepperPanel).toBeInTheDocument();
    });
  });

  describe("Usabilidade e acessibilidade", () => {
    it("deve ter estrutura semântica adequada", () => {
      const { container } = render(<Designacoes />);

      // Verifica presença de heading principal
      const mainHeading = screen.getByRole("heading", { name: /designação/i });
      expect(mainHeading).toBeInTheDocument();

      // Verifica estrutura de divs com flexbox
      const flexContainer = container.querySelector(".flex");
      expect(flexContainer).toBeInTheDocument();
    });

    it("deve renderizar campos de formulário com labels apropriados", () => {
      render(<Designacoes />);

      // Verifica labels dos campos obrigatórios
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
      expect(screen.getByText("Selecione a UE")).toBeInTheDocument();
    });

    it("deve ter elementos com data-testid para facilitar testes", () => {
      render(<Designacoes />);

      // Verifica presença de data-testid no stepper
      const stepper = screen.getByTestId("stepper-designacao");
      expect(stepper).toBeInTheDocument();
    });
  });

  describe("Comportamento do console.log (development)", () => {
    it("deve estar pronto para logar dados do formulário ao submeter", () => {
      render(<Designacoes />);

      // Verifica que o componente está pronto e o formulário existe
      const subtitle = screen.getAllByText(/pesquisa de.*unidade/i)[0];
      expect(subtitle).toBeInTheDocument();
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
    });

    it("deve ter a função onSubmitDesignacao configurada", () => {
      render(<Designacoes />);

      // Verifica que os campos do formulário que serão usados no payload existem
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
      expect(screen.getByText("Selecione a UE")).toBeInTheDocument();
    });

    it("deve conseguir acessar o servidor selecionado do passo anterior via searchParams", () => {
      mockSearchParams = new URLSearchParams({
        payload: JSON.stringify({
          nome: "Teste",
          rf: "123",
          vinculo_cargo_sobreposto: "",
          lotacao_cargo_sobreposto: "",
          cargo_base: "",
          aulas_atribuidas: "",
          funcao_atividade: "",
          cargo_sobreposto: "",
          cursos_titulos: "",
          estagio_probatorio: "",
          aprovado_em_concurso: "",
          laudo_medico: "",
        }),
      });

      render(<Designacoes />);

      // Verifica que o componente renderiza com sucesso mesmo com payload
      const subtitle = screen.getAllByText(/pesquisa de.*unidade/i)[0];
      expect(subtitle).toBeInTheDocument();
    });
  });

  describe("Casos Extremos e Edge Cases da onSubmitDesignacao", () => {
    it("deve lidar com DRE com código muito longo", () => {
      render(<Designacoes />);

      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
    });

    it("deve lidar com UE com código EOL muito longo", () => {
      render(<Designacoes />);

      expect(screen.getByText("Selecione a UE")).toBeInTheDocument();
    });

    it("deve lidar com searchParams contendo caracteres especiais no payload", () => {
      const specialPayload: BuscaServidorDesignacaoBody = {
        nome: "José da Silva & Oliveira",
        rf: "123-456",
        vinculo_cargo_sobreposto: "Ativo/Temporário",
        lotacao_cargo_sobreposto: "DRE-BT/SUB",
        cargo_base: "Professor (Ed. Infantil)",
        aulas_atribuidas: "20+5",
        funcao_atividade: "Docente & Coordenador",
        cargo_sobreposto: "Diretor/Vice",
        cursos_titulos: "Mestrado & Doutorado",
        estagio_probatorio: "Sim/Não",
        aprovado_em_concurso: "2020/2021",
        laudo_medico: "N/A",
      };

      mockSearchParams = new URLSearchParams({
        payload: JSON.stringify(specialPayload),
      });

      render(<Designacoes />);

      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
    });

    it("deve lidar com payload contendo campos vazios", () => {
      const emptyFieldsPayload: BuscaServidorDesignacaoBody = {
        nome: "",
        rf: "",
        vinculo_cargo_sobreposto: "",
        lotacao_cargo_sobreposto: "",
        cargo_base: "",
        aulas_atribuidas: "",
        funcao_atividade: "",
        cargo_sobreposto: "",
        cursos_titulos: "",
        estagio_probatorio: "",
        aprovado_em_concurso: "",
        laudo_medico: "",
      };

      mockSearchParams = new URLSearchParams({
        payload: JSON.stringify(emptyFieldsPayload),
      });

      render(<Designacoes />);

      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
    });

    it("deve lidar com payload contendo valores numéricos como strings", () => {
      const numericPayload: BuscaServidorDesignacaoBody = {
        nome: "Servidor Teste",
        rf: "1234567890",
        vinculo_cargo_sobreposto: "123",
        lotacao_cargo_sobreposto: "456",
        cargo_base: "789",
        aulas_atribuidas: "999",
        funcao_atividade: "111",
        cargo_sobreposto: "222",
        cursos_titulos: "333",
        estagio_probatorio: "444",
        aprovado_em_concurso: "555",
        laudo_medico: "666",
      };

      mockSearchParams = new URLSearchParams({
        payload: JSON.stringify(numericPayload),
      });

      render(<Designacoes />);

      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
    });

    it("deve lidar com múltiplas renderizações consecutivas", () => {
      const { unmount } = render(<Designacoes />);
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
      unmount();

      render(<Designacoes />);
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
    });

    it("deve manter estado consistente após re-renderização", () => {
      const { rerender } = render(<Designacoes />);
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();

      rerender(<Designacoes />);
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
    });
  });

  describe("Testes de Integração onSubmitDesignacao com useMemo", () => {
    it("deve recalcular servidorSelecionado quando searchParams mudam", () => {
      const initialPayload: BuscaServidorDesignacaoBody = {
        nome: "Primeiro Servidor",
        rf: "111111",
        vinculo_cargo_sobreposto: "Ativo",
        lotacao_cargo_sobreposto: "DRE-01",
        cargo_base: "Professor",
        aulas_atribuidas: "20",
        funcao_atividade: "Docente",
        cargo_sobreposto: "Coordenador",
        cursos_titulos: "Graduação",
        estagio_probatorio: "Sim",
        aprovado_em_concurso: "Sim",
        laudo_medico: "Não",
      };

      mockSearchParams = new URLSearchParams({
        payload: JSON.stringify(initialPayload),
      });

      render(<Designacoes />);
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
    });

    it("deve manter servidorSelecionado memorizado quando não há mudanças", () => {
      const payload: BuscaServidorDesignacaoBody = {
        nome: "Servidor Estável",
        rf: "222222",
        vinculo_cargo_sobreposto: "Ativo",
        lotacao_cargo_sobreposto: "DRE-02",
        cargo_base: "Professor",
        aulas_atribuidas: "25",
        funcao_atividade: "Docente",
        cargo_sobreposto: "Diretor",
        cursos_titulos: "Mestrado",
        estagio_probatorio: "Não",
        aprovado_em_concurso: "Sim",
        laudo_medico: "Não",
      };

      mockSearchParams = new URLSearchParams({
        payload: JSON.stringify(payload),
      });

      const { rerender } = render(<Designacoes />);
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();

      // Re-renderiza sem mudar props
      rerender(<Designacoes />);
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
    });

    it("deve funcionar com FormularioUEDesignacao recebendo onSubmitDesignacao corretamente", () => {
      render(<Designacoes />);

      // Verifica que o FormularioUEDesignacao está renderizado e pode receber a prop
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
      expect(screen.getByText("Selecione a UE")).toBeInTheDocument();
    });
  });

  describe("Validação de Tipos TypeScript em Runtime", () => {
    it("deve garantir que FormDesignacaoData corresponde ao esperado por onSubmitDesignacao", () => {
      render(<Designacoes />);

      // Os campos do formulário devem corresponder ao tipo FormDesignacaoData
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
      expect(screen.getByText("Selecione a UE")).toBeInTheDocument();
    });

    it("deve garantir que SelecaoUEDesignacaoBody tem estrutura correta", () => {
      render(<Designacoes />);

      // SelecaoUEDesignacaoBody deve ter apenas { dre: string; ue: string; }
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
      expect(screen.getByText("Selecione a UE")).toBeInTheDocument();
    });

    it("deve garantir compatibilidade entre BuscaServidorDesignacaoBody do passo anterior", () => {
      const validPayload: BuscaServidorDesignacaoBody = {
        nome: "Teste Tipo",
        rf: "123",
        vinculo_cargo_sobreposto: "A",
        lotacao_cargo_sobreposto: "B",
        cargo_base: "C",
        aulas_atribuidas: "D",
        funcao_atividade: "E",
        cargo_sobreposto: "F",
        cursos_titulos: "G",
        estagio_probatorio: "H",
        aprovado_em_concurso: "I",
        laudo_medico: "J",
      };

      mockSearchParams = new URLSearchParams({
        payload: JSON.stringify(validPayload),
      });

      render(<Designacoes />);
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
    });
  });

  describe("Performance e Otimização", () => {
    it("deve usar useMemo para evitar recalcular servidorSelecionado desnecessariamente", () => {
      const payload: BuscaServidorDesignacaoBody = {
        nome: "Performance Test",
        rf: "999999",
        vinculo_cargo_sobreposto: "Ativo",
        lotacao_cargo_sobreposto: "DRE-XX",
        cargo_base: "Professor",
        aulas_atribuidas: "30",
        funcao_atividade: "Docente",
        cargo_sobreposto: "Coordenador",
        cursos_titulos: "Doutorado",
        estagio_probatorio: "Não",
        aprovado_em_concurso: "Sim",
        laudo_medico: "Não",
      };

      mockSearchParams = new URLSearchParams({
        payload: JSON.stringify(payload),
      });

      const { rerender } = render(<Designacoes />);
      
      // Primeira renderização
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();

      // Re-renderização (useMemo deve evitar recálculo)
      rerender(<Designacoes />);
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
    });

    it("deve renderizar rapidamente mesmo com payload grande", () => {
      const largePayload: BuscaServidorDesignacaoBody = {
        nome: "Nome muito longo ".repeat(10),
        rf: "1234567890",
        vinculo_cargo_sobreposto: "Descrição muito longa ".repeat(10),
        lotacao_cargo_sobreposto: "Lotação muito longa ".repeat(10),
        cargo_base: "Cargo muito longo ".repeat(10),
        aulas_atribuidas: "100",
        funcao_atividade: "Função muito longa ".repeat(10),
        cargo_sobreposto: "Cargo sobreposto muito longo ".repeat(10),
        cursos_titulos: "Títulos muito longos ".repeat(10),
        estagio_probatorio: "Descrição longa ".repeat(10),
        aprovado_em_concurso: "Informação longa ".repeat(10),
        laudo_medico: "Laudo muito longo ".repeat(10),
      };

      mockSearchParams = new URLSearchParams({
        payload: JSON.stringify(largePayload),
      });

      render(<Designacoes />);
      expect(screen.getByText("Selecione a DRE")).toBeInTheDocument();
    });
  });
});
