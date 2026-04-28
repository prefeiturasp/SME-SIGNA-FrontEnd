import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DesignacoesPasso2 from "./page";

type DesignacaoContextData = {
  servidorIndicado?: {
    nome_servidor: string;
    nome_civil: string;
    rf: string;
    vinculo: number;
    cargo_base: string;
    lotacao: string;
    cargo_sobreposto_funcao_atividade: string;
    local_de_exercicio: string;
    laudo_medico: string;
    local_de_servico: string;
  };
  ue_nome?: string;
  dre_nome?: string;
  codigo_hierarquico?: string;
};

const h = vi.hoisted(() => ({
  searchId: null as string | null,
  designacao: null as any,
  isLoadingDesignacao: false,
  formDesignacaoData: null as DesignacaoContextData | null,
  mutateAsync: vi.fn(),
  setFormDesignacaoData: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: h.push }),
  useSearchParams: () => ({
    get: (key: string) => (key === "id" ? h.searchId : null),
  }),
}));

vi.mock("../DesignacaoContext", () => ({
  useDesignacaoContext: () => ({
    formDesignacaoData: h.formDesignacaoData,
    setFormDesignacaoData: h.setFormDesignacaoData,
  }),
}));

vi.mock("@/hooks/useServidorDesignacao", () => ({
  default: () => ({
    mutateAsync: h.mutateAsync,
  }),
}));

vi.mock("@/hooks/useVisualizarDesignacoes", () => ({
  useFetchDesignacoesById: () => ({
    data: h.designacao,
    isLoading: h.isLoadingDesignacao,
  }),
}));

vi.mock("antd", () => ({
  Card: ({ title, children }: any) => (
    <section>
      <div>{title}</div>
      {children}
    </section>
  ),
}));

vi.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children }: any) => <div data-testid="accordion">{children}</div>,
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  default: ({ title }: any) => <h1>{title}</h1>,
}));

vi.mock("@/components/dashboard/FundoBranco/QuadroBranco", () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/dashboard/Designacao/StepperDesignacao", () => ({
  default: () => <div data-testid="stepper" />,
}));

vi.mock("@/components/dashboard/Designacao/CustomAccordionItem", () => ({
  CustomAccordionItem: ({ children, title }: any) => (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

vi.mock("@/components/dashboard/Designacao/PortariaDesigacaoFields/PortariaDesigacaoFields", () => ({
  default: ({ isLoading }: any) => (
    <div data-testid="portaria-fields">{String(Boolean(isLoading))}</div>
  ),
}));

vi.mock("@/components/dashboard/Designacao/ResumoPesquisaDaUnidade", () => ({
  default: () => <div data-testid="resumo-unidade" />,
}));

vi.mock("@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado", () => ({
  default: ({ onSubmitEditarServidor }: any) => (
    <div>
      <button
        data-testid="editar-indicado"
        onClick={() =>
          onSubmitEditarServidor({
            nome_servidor: "Nome Atualizado",
            nome_civil: "Civil Atualizado",
          })
        }
      >
        Editar Indicado
      </button>
    </div>
  ),
}));

vi.mock("@/components/dashboard/Designacao/SelecaoServidorIndicado/SelecaoServidorIndicado", () => ({
  default: ({ onBuscaTitular, form, rf_default }: any) => (
    <div>
      <span data-testid="rf-default">{rf_default}</span>
      <button data-testid="buscar-titular" onClick={() => onBuscaTitular({ rf: "1234567" })}>
        Buscar titular
      </button>
      <button
        data-testid="set-vago"
        onClick={() => {
          form.setValue("tipo_cargo", "vago");
          form.setValue("cargo_vago_selecionado", { id: 99, label: "Diretor" });
        }}
      >
        Setar vago
      </button>
      <button
        data-testid="set-rf-undefined"
        onClick={() => {
          form.setValue("rf_titular", undefined);
        }}
      >
        Setar RF indefinido
      </button>
    </div>
  ),
}));

vi.mock("@/components/dashboard/Designacao/BotoesDeNavegacao", () => ({
  default: ({ disableProximo, onProximo, onAnterior }: any) => (
    <div>
      <button data-testid="anterior" onClick={onAnterior}>
        Anterior
      </button>
      <button data-testid="proximo" disabled={disableProximo} onClick={onProximo}>
        Proximo
      </button>
    </div>
  ),
}));

vi.mock("@/components/dashboard/Designacao/ModalHistoricoUltimaDesignacao/ModalHistoricoUltimaDesignacao", () => ({
  default: ({ open }: { open: boolean }) => (
    <div data-testid="modal-historico" data-open={String(open)} />
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock("@/assets/icons/Designacao", () => ({ default: () => <svg /> }));
vi.mock("@/assets/icons/Historico", () => ({ default: () => <svg /> }));

describe("DesignacoesPasso2", () => {
  const designacaoCompleta = {
    tipo_vaga: "VAGO",
    cargo_vaga: 321,
    cargo_vaga_display: "Diretor",
    numero_portaria: "100/2026",
    sei_numero: "6016.2026/000001",
    data_inicio: "2026-01-10",
    data_fim: "2026-12-20",
    ano_vigente: "2026",
    doc: "DOC",
    impedimento_substituicao: "Nenhum",
    carater_excepcional: true,
    com_afastamento: true,
    motivo_afastamento: "Licenca",
    possui_pendencia: false,
    pendencias: "",
    titular_rf: "1234567",
    titular_nome_servidor: "Titular A",
    titular_nome_civil: "Titular Civil",
    titular_vinculo: 1,
    titular_lotacao: "Lotacao A",
    titular_cargo_base: "Cargo Base",
    titular_codigo_cargo_base: "001",
    titular_codigo_cargo_sobreposto: "002",
    titular_cargo_sobreposto: "Cargo Sobreposto",
    titular_local_servico: "Local Servico",
    titular_local_exercicio: "Local Exercicio",
    indicado_nome_servidor: "Indicado",
    indicado_nome_civil: "Indicado Civil",
    indicado_rf: "7654321",
    indicado_vinculo: 2,
    indicado_cargo_base: "Cargo Base I",
    indicado_lotacao: "Lotacao I",
    indicado_cargo_sobreposto: "Cargo Sobreposto I",
    indicado_local_exercicio: "Local Exercicio I",
    indicado_local_servico: "Local Servico I",
    dre_nome: "DRE Centro",
    unidade_proponente: "UE 10",
    codigo_hierarquico: "12345",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    h.searchId = null;
    h.designacao = null;
    h.formDesignacaoData = null;
    h.isLoadingDesignacao = false;
    h.mutateAsync.mockResolvedValue({ success: true, data: { rf: "1234567" } });
  });

  it("renderiza e executa fluxo sem id", async () => {
    render(<DesignacoesPasso2 />);

    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
    expect(screen.getByTestId("proximo")).toBeDisabled();

    fireEvent.click(screen.getByTestId("buscar-titular"));
    await waitFor(() => expect(h.mutateAsync).toHaveBeenCalledWith({ rf: "1234567" }));

    fireEvent.click(screen.getByTestId("anterior"));
    expect(h.push).toHaveBeenCalledWith("/pages/designacoes/designacoes-passo-1?rf=undefined");

    const modal = screen.getByTestId("modal-historico");
    expect(modal).toHaveAttribute("data-open", "false");
    fireEvent.click(screen.getByRole("button", { name: /ver histórico da última designação/i }));
    await waitFor(() => expect(modal).toHaveAttribute("data-open", "true"));
  });

  it("executa fluxo com id, popula tela e salva em passo 3 com id", async () => {
    h.searchId = "55";
    h.designacao = {
      ...designacaoCompleta,
      tipo_vaga: "DISPONIVEL",
    };
    h.formDesignacaoData = {
      servidorIndicado: {
        nome_servidor: "Servidor Inicial",
        nome_civil: "Civil Inicial",
        rf: "1111111",
        vinculo: 1,
        cargo_base: "Cargo",
        lotacao: "Lotacao",
        cargo_sobreposto_funcao_atividade: "Sobreposto",
        local_de_exercicio: "LE",
        laudo_medico: "Sem",
        local_de_servico: "LS",
      },
      ue_nome: "UE X",
      dre_nome: "DRE Y",
      codigo_hierarquico: "abc",
    };

    render(<DesignacoesPasso2 />);

    expect(screen.getByTestId("accordion")).toBeInTheDocument();

    await waitFor(() => {
      expect(h.setFormDesignacaoData).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByTestId("editar-indicado"));
    expect(h.setFormDesignacaoData).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("buscar-titular"));
    await waitFor(() => expect(h.mutateAsync).toHaveBeenCalledWith({ rf: "1234567" }));

    await waitFor(() => expect(screen.getByTestId("proximo")).not.toBeDisabled());

    fireEvent.click(screen.getByTestId("proximo"));
    await waitFor(() =>
      expect(h.push).toHaveBeenCalledWith("/pages/designacoes/designacoes-passo-3?id=55")
    );

    fireEvent.click(screen.getByTestId("anterior"));
    expect(h.push).toHaveBeenCalledWith("/pages/listagem-designacoes");
  });

  it("salva sem id e navega para o passo 3 sem query", async () => {
    h.searchId = null;
    h.designacao = {
      ...designacaoCompleta,
      tipo_vaga: "DISPONIVEL",
      data_fim: null,
      carater_excepcional: false,
      com_afastamento: false,
      possui_pendencia: true,
      pendencias: "Pendencia A",
    };
    h.formDesignacaoData = {
      servidorIndicado: {
        nome_servidor: "Servidor Inicial",
        nome_civil: "Civil Inicial",
        rf: "1111111",
        vinculo: 1,
        cargo_base: "Cargo",
        lotacao: "Lotacao",
        cargo_sobreposto_funcao_atividade: "Sobreposto",
        local_de_exercicio: "LE",
        laudo_medico: "Sem",
        local_de_servico: "LS",
      },
    };

    render(<DesignacoesPasso2 />);

    fireEvent.click(screen.getByTestId("buscar-titular"));
    await waitFor(() => expect(h.mutateAsync).toHaveBeenCalledWith({ rf: "1234567" }));

    await waitFor(() => expect(screen.getByTestId("proximo")).not.toBeDisabled());

    fireEvent.click(screen.getByTestId("proximo"));

    await waitFor(() => {
      expect(h.push).toHaveBeenCalledWith("/pages/designacoes/designacoes-passo-3");
    });
  });

  it("trata erro ao buscar titular e mantém botão de próximo desabilitado", async () => {
    h.mutateAsync.mockResolvedValueOnce({ success: false, error: "Titular inválido" });
    h.formDesignacaoData = {
      servidorIndicado: {
        nome_servidor: "Servidor Inicial",
        nome_civil: "Civil Inicial",
        rf: "1111111",
        vinculo: 1,
        cargo_base: "Cargo",
        lotacao: "Lotacao",
        cargo_sobreposto_funcao_atividade: "Sobreposto",
        local_de_exercicio: "LE",
        laudo_medico: "Sem",
        local_de_servico: "LS",
      },
    };

    render(<DesignacoesPasso2 />);
    fireEvent.click(screen.getByTestId("buscar-titular"));

    await waitFor(() => {
      expect(h.mutateAsync).toHaveBeenCalledWith({ rf: "1234567" });
    });

    expect(screen.getByTestId("proximo")).toBeDisabled();
  });

  it("salva com tipo de cargo vago", async () => {
    h.formDesignacaoData = {
      servidorIndicado: {
        nome_servidor: "Servidor Inicial",
        nome_civil: "Civil Inicial",
        rf: "1111111",
        vinculo: 1,
        cargo_base: "Cargo",
        lotacao: "Lotacao",
        cargo_sobreposto_funcao_atividade: "Sobreposto",
        local_de_exercicio: "LE",
        laudo_medico: "Sem",
        local_de_servico: "LS",
      },
    };

    render(<DesignacoesPasso2 />);

    fireEvent.click(screen.getByTestId("set-vago"));
    fireEvent.click(screen.getByTestId("anterior"));

    await waitFor(() =>
      expect(h.setFormDesignacaoData).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo_cargo: "vago",
          dadosTitular: expect.objectContaining({
            rf: "",
            nome_servidor: "",
          }),
        })
      )
    );
  });

  it("usa fallback de rf_default quando rf_titular fica indefinido", async () => {
    h.formDesignacaoData = {
      servidorIndicado: {
        nome_servidor: "Servidor Inicial",
        nome_civil: "Civil Inicial",
        rf: "1111111",
        vinculo: 1,
        cargo_base: "Cargo",
        lotacao: "Lotacao",
        cargo_sobreposto_funcao_atividade: "Sobreposto",
        local_de_exercicio: "LE",
        laudo_medico: "Sem",
        local_de_servico: "LS",
      },
    };

    render(<DesignacoesPasso2 />);
    expect(screen.getByTestId("rf-default")).toHaveTextContent("");

    fireEvent.click(screen.getByTestId("set-rf-undefined"));
    await waitFor(() => {
      expect(screen.getByTestId("rf-default")).toHaveTextContent("");
    });
  });
});