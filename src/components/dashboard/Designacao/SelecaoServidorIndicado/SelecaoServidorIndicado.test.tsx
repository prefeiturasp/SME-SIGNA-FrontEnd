import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod"; // Importe o zod
import SelecaoServidorIndicado from "./SelecaoServidorIndicado";
import { TitularData } from "@/components/dashboard/Designacao/ResumoTitular";
import { BuscaDesignacaoRequest } from "@/types/designacao";

// 1. Crie um schema simples aqui para evitar o erro de 'undefined' no resolver
const testSchema = z.object({
  tipo_cargo: z.string(),
  rf_titular: z.string(),
  cargo_vago_selecionado: z.string().optional(),
});

// --- MOCKS ---
vi.mock("@/components/dashboard/Designacao/BuscaDesignacao/FormularioBuscaDesignacao", () => ({
  default: ({ onBuscaDesignacao }: { onBuscaDesignacao: (v: BuscaDesignacaoRequest) => void }) => (
    <button onClick={() => onBuscaDesignacao({ rf: "1234567" })}>
      Mock Busca RF
    </button>
  ),
}));

vi.mock("@/components/dashboard/Designacao/ResumoTitular", () => ({
  default: ({ data, onEdit }: { data: TitularData; onEdit: () => void }) => (
    <div>
      <p>Resumo de {data.nome}</p>
      <button onClick={onEdit}>Botão Editar Mock</button>
    </div>
  ),
}));

vi.mock("@/components/dashboard/Designacao/CustomAccordionItem", () => ({
  CustomAccordionItem: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div>
      <h3>{title}</h3>
      {children}
    </div>
  ),
}));

// --- WRAPPER ---
const TestWrapper = ({ children, tipoCargoInicial = "vago" }: { children: (form: any) => React.ReactNode, tipoCargoInicial?: string }) => {
  const form = useForm({
    resolver: zodResolver(testSchema), // Usando o schema local que sabemos que existe
    defaultValues: {
      tipo_cargo: tipoCargoInicial,
      rf_titular: "",
      cargo_vago_selecionado: "",
    },
  });

  return (
    <FormProvider {...form}>
      {children(form)}
    </FormProvider>
  );
};

describe("SelecaoServidorIndicado", () => {
  const mockOnBuscaTitular = vi.fn<[BuscaDesignacaoRequest], Promise<void>>();
  const mockSetDadosTitular = vi.fn<(val: TitularData | null) => void>();
  const mockSetErrorBusca = vi.fn<(val: string | null) => void>();

  const baseProps = {
    onBuscaTitular: mockOnBuscaTitular,
    setDadosTitular: mockSetDadosTitular,
    setErrorBusca: mockSetErrorBusca,
    errorBusca: null,
    dadosTitular: null,
  };

  const mockDadosSucesso: TitularData = {
    nome: "Jose da Silva",
    rf: "1234567",
    vinculo_cargo_sobreposto: 1,
    cargo_sobreposto: "Diretor",
    lotacao_cargo_sobreposto: "Escola A",
    lotacao_cargo_base: "DRE Norte",
    codigo_hierarquia: "3",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve alternar a exibição entre Select e Busca", async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        {(form) => (
          <SelecaoServidorIndicado 
            {...baseProps} 
            form={form} 
            tipoCargo={form.watch("tipo_cargo")} 
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByLabelText("Selecione o cargo")).toBeInTheDocument();

    const radioDisponivel = screen.getByLabelText(/Cargo Disponível/i);
    await user.click(radioDisponivel);

    expect(screen.getByText("Mock Busca RF")).toBeInTheDocument();
    
    expect(screen.queryByLabelText("Selecione o cargo")).not.toBeInTheDocument();
  });

  it("deve exibir a mensagem de erro", () => {
    render(
      <TestWrapper tipoCargoInicial="disponivel">
        {(form) => (
          <SelecaoServidorIndicado 
            {...baseProps} 
            form={form} 
            tipoCargo="disponivel" 
            errorBusca="Erro de teste"
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByText("Erro de teste")).toBeInTheDocument();
  });

  it("deve renderizar o ResumoTitular", () => {
    render(
      <TestWrapper tipoCargoInicial="disponivel">
        {(form) => (
          <SelecaoServidorIndicado 
            {...baseProps} 
            form={form} 
            tipoCargo="disponivel" 
            dadosTitular={mockDadosSucesso}
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByText(`Resumo de ${mockDadosSucesso.nome}`)).toBeInTheDocument();
  });
});