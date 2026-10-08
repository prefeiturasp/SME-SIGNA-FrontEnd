import React from "react";
import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DesignacoesPasso2 from "./page";
import type { DesignacaoResponse } from "@/types/designacao";

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
    cd_cargo_base?: number;
    cd_cargo_sobreposto_funcao_atividade?: number;
    possui_cargo_sobreposto?: boolean;
    cd_ue_lotacao?: string;
  };
  ue?: string;
  ue_nome?: string;
  dre_nome?: string;
  codigo_hierarquico?: string;
  a_partir_de?: Date;
  designacao_data_final?: Date | null;
  portaria_designacao?: string;
  numero_sei?: string;
};

const h = vi.hoisted(() => ({
  searchId: null as string | null,
  searchRf: null as string | null,
  designacao: null as DesignacaoResponse | null,
  isLoadingDesignacao: false,
  formDesignacaoData: null as DesignacaoContextData | null,
  mutateAsync: vi.fn(),
  setFormDesignacaoData: vi.fn(),
  clearFormDesignacaoData: vi.fn(),
  push: vi.fn(),
  cargosData: [{ codigoCargo: 1, nomeCargo: "Diretor de Escola" }] as { codigoCargo: number; nomeCargo: string }[],
  isLoadingCargos: false,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: h.push }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "id") return h.searchId;
      if (key === "rf") return h.searchRf;
      return null;
    },
  }),
}));

vi.mock("../DesignacaoContext", () => ({
  useDesignacaoContext: () => ({
    formDesignacaoData: h.formDesignacaoData,
    setFormDesignacaoData: h.setFormDesignacaoData,
    clearFormDesignacaoData: h.clearFormDesignacaoData,
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

vi.mock("@/hooks/useCargos", () => ({
  useFetchCargos: () => ({
    data: h.cargosData,
    isLoading: h.isLoadingCargos,
  }),
}));

vi.mock("antd", () => ({
  Card: ({ title, children }: { title: ReactNode; children: ReactNode }) => (
    <section>
      <div>{title}</div>
      {children}
    </section>
  ),
  Alert: ({ title, description, ...props }: { title: ReactNode; description?: ReactNode; "data-testid"?: string }) => (
    <div role="alert" data-testid={props["data-testid"]}>
      {title}
      {description}
    </div>
  ),
}));

vi.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children }: { children: ReactNode }) => <div data-testid="accordion">{children}</div>,
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  default: ({ title }: { title: ReactNode }) => <h1>{title}</h1>,
}));

vi.mock("@/components/dashboard/FundoBranco/QuadroBranco", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/dashboard/Designacao/StepperDesignacao", () => ({
  default: () => <div data-testid="stepper" />,
}));

vi.mock("@/components/dashboard/Designacao/CustomAccordionItem", () => ({
  CustomAccordionItem: ({ children, title }: { children: ReactNode; title: ReactNode }) => (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

vi.mock("@/components/dashboard/Designacao/PortariaDesigacaoFields/PortariaDesigacaoFields", () => ({
  default: ({ isLoading, diasPeriodo, mensagemDataFinal }: {
    isLoading?: boolean;
    diasPeriodo?: number | null;
    mensagemDataFinal?: string | null;
  }) => (
    <div>
      <div data-testid="portaria-fields">{String(Boolean(isLoading))}</div>
      {diasPeriodo != null && <span data-testid="dias-periodo">{diasPeriodo} dias</span>}
      {mensagemDataFinal && <span data-testid="mensagem-data-final">{mensagemDataFinal}</span>}
    </div>
  ),
}));

vi.mock("@/components/dashboard/Designacao/ResumoPesquisaDaUnidade", () => ({
  default: () => <div data-testid="resumo-unidade" />,
}));

vi.mock("@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado", () => ({
  default: ({ onSubmitEditarServidor }: { onSubmitEditarServidor: (data: { nome_servidor: string; nome_civil: string }) => void }) => (
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
  default: ({ onBuscaTitular, form, rf_default, errorCargoTitular }: {
    onBuscaTitular: (values: { rf: string }) => void;
    form: { setValue: (name: string, value: unknown) => void };
    rf_default?: string;
    errorCargoTitular?: string | null;
  }) => (
    <div>
      <span data-testid="rf-default">{rf_default}</span>
      {errorCargoTitular && <span data-testid="error-cargo-titular">{errorCargoTitular}</span>}
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
        data-testid="set-vago-diretor"
        onClick={() => {
          form.setValue("tipo_cargo", "vago");
          form.setValue("cargo_vago_selecionado", { id: 3360, label: "DIRETOR DE ESCOLA" });
        }}
      >
        Setar vago Diretor
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
  default: ({ disableProximo, onProximo, onAnterior }: {
    disableProximo?: boolean;
    onProximo: () => void;
    onAnterior: () => void;
  }) => (
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
  Button: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => <button {...props}>{children}</button>,
}));

vi.mock("@/assets/icons/Designacao", () => ({ default: () => <svg /> }));
vi.mock("@/assets/icons/Historico", () => ({ default: () => <svg /> }));

describe("DesignacoesPasso2", () => {
  const designacaoCompleta = {
    tipo_vaga: "VAGO",
    cargo_vaga: 321,
    cargo_vaga_display: "Diretor",
    numero_portaria: "100",
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
    h.searchRf = null;
    h.designacao = null;
    h.formDesignacaoData = null;
    h.isLoadingDesignacao = false;
    h.cargosData = [{ codigoCargo: 1, nomeCargo: "Diretor de Escola" }];
    h.isLoadingCargos = false;
    h.mutateAsync.mockResolvedValue({
      success: true,
      data: { rf: "1234567", cargo_sobreposto_funcao_atividade: "Diretor de Escola" },
    });
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
    } as unknown as DesignacaoResponse;
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
      expect(h.push).toHaveBeenCalledWith("/pages/designacoes/designacoes-passo-3?id=55&rf=1111111")
    );

    fireEvent.click(screen.getByTestId("anterior"));
    expect(h.push).toHaveBeenCalledWith("/pages/designacoes/designacoes-passo-1?id=55&rf=1111111")
    
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
    } as unknown as DesignacaoResponse;
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

  it("usa servidor indicado do contexto quando API não retorna indicado", async () => {
    h.searchId = "88";
    h.designacao = {
      ...designacaoCompleta,
      indicado_nome_servidor: "",
      indicado_nome_civil: "",
      indicado_rf: "",
    } as unknown as DesignacaoResponse;
    h.formDesignacaoData = {
      servidorIndicado: {
        nome_servidor: "Servidor Contexto",
        nome_civil: "Civil Contexto",
        rf: "9999999",
        vinculo: 1,
        cargo_base: "Cargo Contexto",
        lotacao: "Lotacao Contexto",
        cargo_sobreposto_funcao_atividade: "Sobreposto Contexto",
        local_de_exercicio: "LE",
        laudo_medico: "Sem",
        local_de_servico: "LS",
      },
    };

    render(<DesignacoesPasso2 />);

    await waitFor(() => {
      expect(h.setFormDesignacaoData).toHaveBeenCalledWith(
        expect.objectContaining({
          servidorIndicado: expect.objectContaining({
            nome_servidor: "Servidor Contexto",
            rf: "9999999",
          }),
        })
      );
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

  it("mantém próximo desabilitado e exibe aviso quando cargo do titular não corresponde a nenhum cargo de gestão", async () => {
    // designacao populada para que form.clearErrors() rode e o botão só fique
    // desabilitado pela validação de cargo do titular, não por erros residuais
    // do schema (ver teste de fallback abaixo para o cenário sem essa população).
    h.designacao = { ...designacaoCompleta, tipo_vaga: "DISPONIVEL" } as unknown as DesignacaoResponse;
    h.mutateAsync.mockResolvedValueOnce({
      success: true,
      data: { rf: "1234567", cargo_sobreposto_funcao_atividade: "Professor" },
    });
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

    await waitFor(() => expect(screen.getByTestId("error-cargo-titular")).toBeInTheDocument());
    expect(screen.getByTestId("proximo")).toBeDisabled();
  });

  it("exibe mensagem específica quando cargo do titular vem nulo (integração SME) e não há cargo_base para fallback", async () => {
    h.designacao = { ...designacaoCompleta, tipo_vaga: "DISPONIVEL" } as unknown as DesignacaoResponse;
    h.mutateAsync.mockResolvedValueOnce({
      success: true,
      data: { rf: "1234567", cargo_sobreposto_funcao_atividade: null, cargo_base: null },
    });
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

    await waitFor(() =>
      expect(screen.getByTestId("error-cargo-titular")).toHaveTextContent(
        "Não foi possível identificar o cargo de gestão do titular. Não é possível prosseguir com esta designação."
      )
    );
    expect(screen.getByTestId("proximo")).toBeDisabled();
  });

  it("usa cargo_base do titular como fallback e permite avançar quando cargo_sobreposto_funcao_atividade vem nulo", async () => {
    h.designacao = { ...designacaoCompleta, tipo_vaga: "DISPONIVEL" } as unknown as DesignacaoResponse;
    h.mutateAsync.mockResolvedValueOnce({
      success: true,
      data: { rf: "1234567", cargo_sobreposto_funcao_atividade: null, cargo_base: "Diretor de Escola" },
    });
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
    expect(screen.queryByTestId("error-cargo-titular")).not.toBeInTheDocument();
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
  describe("substituição do Diretor (cargo da vaga 3360)", () => {
    const contextoDiretor = (
      dataFinal: Date | null,
      indicado: Partial<NonNullable<DesignacaoContextData["servidorIndicado"]>> = {}
    ) => {
      h.formDesignacaoData = {
        servidorIndicado: {
          nome_servidor: "Servidor",
          nome_civil: "Civil",
          rf: "1111111",
          vinculo: 1,
          cargo_base: "PROF.ENS.FUND.II E MED.-PORTUGUES",
          cd_cargo_base: 3255,
          lotacao: "EMEF TESTE",
          cargo_sobreposto_funcao_atividade: "",
          cd_cargo_sobreposto_funcao_atividade: 0,
          possui_cargo_sobreposto: false,
          cd_ue_lotacao: "090450",
          local_de_exercicio: "LE",
          laudo_medico: "Sem",
          local_de_servico: "LS",
          ...indicado,
        },
        ue: "090450",
        ue_nome: "EMEF TESTE",
        portaria_designacao: "100",
        numero_sei: "6016.2026/0000001-0",
        a_partir_de: new Date(2026, 0, 1),
        designacao_data_final: dataFinal,
      };
    };

    it.each([16, 30])("Diretor com %i dias: mostra a contagem e permite avançar", async (dias) => {
      contextoDiretor(new Date(2026, 0, dias));
      render(<DesignacoesPasso2 />);
      fireEvent.click(screen.getByTestId("set-vago-diretor"));

      expect(await screen.findByTestId("dias-periodo")).toHaveTextContent(`${dias} dias`);
      expect(screen.queryByTestId("mensagem-data-final")).not.toBeInTheDocument();
      expect(screen.queryByTestId("alerta-eleicao-diretor")).not.toBeInTheDocument();
      await waitFor(() => expect(screen.getByTestId("proximo")).not.toBeDisabled());
    });

    it("Diretor com 15 dias: erro de período no campo e próximo desabilitado", async () => {
      contextoDiretor(new Date(2026, 0, 15));
      render(<DesignacoesPasso2 />);
      fireEvent.click(screen.getByTestId("set-vago-diretor"));

      expect(await screen.findByTestId("mensagem-data-final")).toHaveTextContent(
        "A designação para substituição do Diretor deve ter período de 16 a 30 dias."
      );
      expect(screen.queryByTestId("alerta-eleicao-diretor")).not.toBeInTheDocument();
      expect(screen.getByTestId("proximo")).toBeDisabled();
    });

    it("Diretor com 31 dias: alerta de eleição e próximo desabilitado", async () => {
      contextoDiretor(new Date(2026, 0, 31));
      render(<DesignacoesPasso2 />);
      fireEvent.click(screen.getByTestId("set-vago-diretor"));

      expect(await screen.findByTestId("alerta-eleicao-diretor")).toHaveTextContent(
        "É necessária a realização de eleição para o cargo de Diretor."
      );
      expect(screen.getByTestId("proximo")).toBeDisabled();
    });

    it("Diretor sem data fim: data fim obrigatória e alerta de eleição", async () => {
      contextoDiretor(null);
      render(<DesignacoesPasso2 />);
      fireEvent.click(screen.getByTestId("set-vago-diretor"));

      expect(await screen.findByTestId("alerta-eleicao-diretor")).toBeInTheDocument();
      expect(screen.getByTestId("mensagem-data-final")).toHaveTextContent("a data final é obrigatória");
      expect(screen.getByTestId("proximo")).toBeDisabled();
    });

    it("professor de outra unidade: bloqueio no bloco do indicado", async () => {
      contextoDiretor(new Date(2026, 0, 20), { cd_ue_lotacao: "019999" });
      render(<DesignacoesPasso2 />);
      fireEvent.click(screen.getByTestId("set-vago-diretor"));

      expect(await screen.findByTestId("erro-unidade-indicado")).toHaveTextContent(
        "O professor designado para substituir o Diretor deve ser da mesma unidade escolar."
      );
      expect(screen.getByTestId("proximo")).toBeDisabled();
    });

    it("professor da mesma UE (zeros à esquerda diferentes): permite avançar", async () => {
      contextoDiretor(new Date(2026, 0, 20), { cd_ue_lotacao: "90450" });
      render(<DesignacoesPasso2 />);
      fireEvent.click(screen.getByTestId("set-vago-diretor"));

      await waitFor(() => expect(screen.getByTestId("proximo")).not.toBeDisabled());
      expect(screen.queryByTestId("erro-unidade-indicado")).not.toBeInTheDocument();
    });

    it("cargo sobreposto Coordenador (3379): bloqueio de não professor", async () => {
      contextoDiretor(new Date(2026, 0, 20), {
        cargo_sobreposto_funcao_atividade: "COORDENADOR PEDAGOGICO",
        cd_cargo_sobreposto_funcao_atividade: 3379,
        possui_cargo_sobreposto: true,
      });
      render(<DesignacoesPasso2 />);
      fireEvent.click(screen.getByTestId("set-vago-diretor"));

      expect(await screen.findByTestId("erro-nao-professor-indicado")).toHaveTextContent(
        "Somente professor pode ser designado para substituir o Diretor."
      );
      expect(screen.queryByTestId("erro-unidade-indicado")).not.toBeInTheDocument();
      expect(screen.getByTestId("proximo")).toBeDisabled();
    });

    it("não professor (Secretário 3182) da mesma UE: bloqueio de não professor", async () => {
      contextoDiretor(new Date(2026, 0, 20), { cargo_base: "SECRETARIO DE ESCOLA", cd_cargo_base: 3182 });
      render(<DesignacoesPasso2 />);
      fireEvent.click(screen.getByTestId("set-vago-diretor"));

      expect(await screen.findByTestId("erro-nao-professor-indicado")).toBeInTheDocument();
      expect(screen.getByTestId("proximo")).toBeDisabled();
    });

    it("base professor + função/atividade, mesma UE: permite avançar", async () => {
      contextoDiretor(new Date(2026, 0, 20), {
        cargo_sobreposto_funcao_atividade: "COORDENADOR PEDAGOGICO",
        cd_cargo_sobreposto_funcao_atividade: 3379,
        possui_cargo_sobreposto: false,
      });
      render(<DesignacoesPasso2 />);
      fireEvent.click(screen.getByTestId("set-vago-diretor"));

      await waitFor(() => expect(screen.getByTestId("proximo")).not.toBeDisabled());
      expect(screen.queryByTestId("erro-nao-professor-indicado")).not.toBeInTheDocument();
    });

    const assistenteDiretor = {
      cargo_sobreposto_funcao_atividade: "ASSISTENTE DE DIRETOR DE ESCOLA",
      cd_cargo_sobreposto_funcao_atividade: 3085,
      possui_cargo_sobreposto: true,
    };

    it("Assistente de Diretor (sobreposto 3085): bloqueio no bloco do indicado", async () => {
      contextoDiretor(new Date(2026, 0, 20), assistenteDiretor);
      render(<DesignacoesPasso2 />);
      fireEvent.click(screen.getByTestId("set-vago-diretor"));

      expect(await screen.findByTestId("erro-assistente-diretor-indicado")).toHaveTextContent(
        "O servidor não pode ser designado para o cargo de Diretor por já possuir o cargo sobreposto de Assistente de Diretor."
      );
      expect(screen.getByTestId("proximo")).toBeDisabled();
    });

    it("Assistente de Diretor com período inválido: só a mensagem do AD aparece", async () => {
      contextoDiretor(new Date(2026, 0, 31), { ...assistenteDiretor, cd_ue_lotacao: "019999" });
      render(<DesignacoesPasso2 />);
      fireEvent.click(screen.getByTestId("set-vago-diretor"));

      expect(await screen.findByTestId("erro-assistente-diretor-indicado")).toBeInTheDocument();
      expect(screen.queryByTestId("alerta-eleicao-diretor")).not.toBeInTheDocument();
      expect(screen.queryByTestId("mensagem-data-final")).not.toBeInTheDocument();
      expect(screen.queryByTestId("erro-unidade-indicado")).not.toBeInTheDocument();
      expect(screen.queryByTestId("erro-nao-professor-indicado")).not.toBeInTheDocument();
      expect(screen.getByTestId("proximo")).toBeDisabled();
    });

    it("Assistente de Diretor + outra vaga: não bloqueia", async () => {
      contextoDiretor(null, assistenteDiretor);
      render(<DesignacoesPasso2 />);
      fireEvent.click(screen.getByTestId("set-vago"));

      await waitFor(() => expect(screen.getByTestId("proximo")).not.toBeDisabled());
      expect(screen.queryByTestId("erro-assistente-diretor-indicado")).not.toBeInTheDocument();
    });

    it("bloqueio do AD some ao trocar o cargo da vaga", async () => {
      contextoDiretor(new Date(2026, 0, 20), assistenteDiretor);
      render(<DesignacoesPasso2 />);
      fireEvent.click(screen.getByTestId("set-vago-diretor"));
      expect(await screen.findByTestId("erro-assistente-diretor-indicado")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("set-vago"));
      await waitFor(() =>
        expect(screen.queryByTestId("erro-assistente-diretor-indicado")).not.toBeInTheDocument()
      );
      expect(screen.getByTestId("proximo")).not.toBeDisabled();
    });

    it("3085 como função/atividade (sem cargo sobreposto): não bloqueia", async () => {
      contextoDiretor(new Date(2026, 0, 20), { ...assistenteDiretor, possui_cargo_sobreposto: false });
      render(<DesignacoesPasso2 />);
      fireEvent.click(screen.getByTestId("set-vago-diretor"));

      await waitFor(() => expect(screen.getByTestId("proximo")).not.toBeDisabled());
      expect(screen.queryByTestId("erro-assistente-diretor-indicado")).not.toBeInTheDocument();
    });

    it("outro cargo de vaga: nenhuma regra nova aparece", async () => {
      contextoDiretor(null, { cd_ue_lotacao: "019999" });
      render(<DesignacoesPasso2 />);
      fireEvent.click(screen.getByTestId("set-vago"));

      await waitFor(() => expect(screen.getByTestId("proximo")).not.toBeDisabled());
      expect(screen.queryByTestId("dias-periodo")).not.toBeInTheDocument();
      expect(screen.queryByTestId("alerta-eleicao-diretor")).not.toBeInTheDocument();
      expect(screen.queryByTestId("erro-unidade-indicado")).not.toBeInTheDocument();
      expect(screen.queryByTestId("erro-nao-professor-indicado")).not.toBeInTheDocument();
    });

    it("edição: mantém a UE escolhida no passo 1 em vez da UE salva", async () => {
      h.searchId = "55";
      h.formDesignacaoData = { ue: "019999", ue_nome: "OUTRA UE" };
      const { rerender } = render(<DesignacoesPasso2 />);
      h.designacao = { ...designacaoCompleta, ue: "090450" } as unknown as DesignacaoResponse;
      rerender(<DesignacoesPasso2 />);

      await waitFor(() =>
        expect(h.setFormDesignacaoData).toHaveBeenCalledWith(expect.objectContaining({ ue: "019999" }))
      );
    });

    it("edição: carrega os campos da regra a partir do GET da designação", async () => {
      h.searchId = "55";
      h.formDesignacaoData = null;
      const { rerender } = render(<DesignacoesPasso2 />);
      h.designacao = {
        ...designacaoCompleta,
        ue: "090450",
        indicado_codigo_ue_lotacao: "090450",
        indicado_possui_cargo_sobreposto: true,
      } as unknown as DesignacaoResponse;
      rerender(<DesignacoesPasso2 />);

      await waitFor(() =>
        expect(h.setFormDesignacaoData).toHaveBeenCalledWith(
          expect.objectContaining({
            ue: "090450",
            servidorIndicado: expect.objectContaining({
              cd_ue_lotacao: "090450",
              possui_cargo_sobreposto: true,
            }),
          })
        )
      );
    });

    it("edição estendendo para 31 dias: alerta de eleição", async () => {
      h.searchId = "55";
      h.cargosData = [{ codigoCargo: 3360, nomeCargo: "DIRETOR DE ESCOLA" }];
      contextoDiretor(null);

      // A designação chega depois do primeiro render, como no fetch real.
      const { rerender } = render(<DesignacoesPasso2 />);
      h.designacao = {
        ...designacaoCompleta,
        tipo_vaga: "VAGO",
        cargo_vaga: 3360,
        cargo_vaga_display: "DIRETOR DE ESCOLA",
        data_inicio: "2026-01-01",
        data_fim: "2026-01-31",
        ue: "090450",
        indicado_codigo_cargo_base: 3255,
        indicado_codigo_cargo_sobreposto: 0,
        indicado_possui_cargo_sobreposto: false,
        indicado_codigo_ue_lotacao: "090450",
      } as unknown as DesignacaoResponse;
      rerender(<DesignacoesPasso2 />);

      expect(await screen.findByTestId("alerta-eleicao-diretor")).toBeInTheDocument();
      expect(screen.getByTestId("dias-periodo")).toHaveTextContent("31 dias");
      expect(screen.getByTestId("proximo")).toBeDisabled();
    });
  });
});