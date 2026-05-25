import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import SelecaoServidorIndicado from "./SelecaoServidorIndicado";
import { Servidor } from "@/types/designacao-unidade";
import { BuscaDesignacaoRequest } from "@/types/designacao";
import { FormEditarServidorData } from "../ModalEditarServidor/schema";

const testSchema = z.object({
  tipo_cargo: z.string(),
  rf_titular: z.string(),
  cargo_vago_selecionado: z.any().optional(),
});

// --- MOCKS ---
vi.mock("@/hooks/useCargos", () => ({
  useFetchCargos: vi.fn(() => ({
    data: [
      { codigoCargo: 1, nomeCargo: "Diretor de Escola" },
      { codigoCargo: 2, nomeCargo: "Assistente de Diretor" },
    ],
  })),
}));

vi.mock(
  "@/components/dashboard/Designacao/BuscaDesignacao/FormularioBuscaDesignacao",
  () => ({
    default: ({
      onBuscaDesignacao,
    }: {
      onBuscaDesignacao: (v: BuscaDesignacaoRequest) => void;
    }) => (
      <button onClick={() => onBuscaDesignacao({ rf: "1234567" })}>
        Mock Busca RF
      </button>
    ),
  })
);

vi.mock("@/components/dashboard/Designacao/ResumoTitular", () => ({
  default: ({
    data,
    onSubmitEditarServidor,
  }: {
    data: Servidor;
    onSubmitEditarServidor: (data: FormEditarServidorData) => void;
  }) => (
    <div>
      <p>Resumo de {data.nome_servidor}</p>
      <button
        onClick={() =>
          onSubmitEditarServidor({
            nome_servidor: "Nome Editado",
            nome_civil: "Civil Editado",
          })
        }
      >
        Botão Editar Mock
      </button>
    </div>
  ),
}));

vi.mock("@/components/dashboard/Designacao/CustomAccordionItem", () => ({
  CustomAccordionItem: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) => (
    <div>
      <h3>{title}</h3>
      {children}
    </div>
  ),
}));

// --- WRAPPER ---
const TestWrapper = ({
  children,
  tipoCargoInicial = "vago",
}: {
  children: (form: any) => React.ReactNode;
  tipoCargoInicial?: string;
}) => {
  const form = useForm({
    resolver: zodResolver(testSchema),
    defaultValues: {
      tipo_cargo: tipoCargoInicial,
      rf_titular: "",
      cargo_vago_selecionado: {
        id: undefined,
        label: "",
      },
    },
  });

  return <FormProvider {...form}>{children(form)}</FormProvider>;
};

describe("SelecaoServidorIndicado", () => {
  beforeAll(() => {
    if (!Element.prototype.hasPointerCapture) {
      Element.prototype.hasPointerCapture = () => false;
    }
    if (!Element.prototype.setPointerCapture) {
      Element.prototype.setPointerCapture = () => {};
    }
    if (!Element.prototype.releasePointerCapture) {
      Element.prototype.releasePointerCapture = () => {};
    }
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = () => {};
    }
  });

  const mockOnBuscaTitular = vi.fn((_values: BuscaDesignacaoRequest): Promise<void> => Promise.resolve());
  const mockSetDadosTitular = vi.fn((_val: Servidor | null): void => { });
  const mockSetErrorBusca = vi.fn((_val: string | null): void => { });

  const baseProps = {
    onBuscaTitular: mockOnBuscaTitular,
    setDadosTitular: mockSetDadosTitular,
    setErrorBusca: mockSetErrorBusca,
    errorBusca: null,
    dadosTitular: null,
  };

  const mockDadosSucesso: Servidor = {
    nome_servidor: "Jose da Silva",
    nome_civil: "Jose Civil",
    rf: "1234567",
    vinculo: 1,
    cargo_base: "Diretor",
    lotacao: "Escola A",
    cargo_sobreposto_funcao_atividade: "Diretor Escolar",
    local_de_exercicio: "DRE Norte",
    laudo_medico: "Não possui",
    local_de_servico: "Indisponível",
    cursos_titulos: "Não possui",
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
    expect(
      screen.queryByLabelText("Selecione o cargo")
    ).not.toBeInTheDocument();
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

    expect(
      screen.getByText(`Resumo de ${mockDadosSucesso.nome_servidor}`)
    ).toBeInTheDocument();
  });

  it("deve chamar setDadosTitular ao confirmar edição do servidor", async () => {
    const user = userEvent.setup();

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

    await user.click(screen.getByText("Botão Editar Mock"));

    expect(mockSetDadosTitular).toHaveBeenCalledWith({
      ...mockDadosSucesso,
      nome_servidor: "Nome Editado",
      nome_civil: "Civil Editado",
    });
  });

  it("deve atualizar o campo ao selecionar um cargo vago", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper tipoCargoInicial="vago">
        {(form) => (
          <SelecaoServidorIndicado
            {...baseProps}
            form={form}
            tipoCargo="vago"
          />
        )}
      </TestWrapper>
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByText("Diretor de Escola"));

    expect(
      screen.getByText("Diretor de Escola")
    ).toBeInTheDocument();
  });

  it("deve renderizar spinner quando isLoading for true", () => {
    render(
      <TestWrapper tipoCargoInicial="vago">
        {(form) => (
          <SelecaoServidorIndicado
            {...baseProps}
            form={form}
            tipoCargo="vago"
            isLoading={true}
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(screen.queryByLabelText("Selecione o cargo")).not.toBeInTheDocument();
  });
});