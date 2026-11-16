import React from "react";
import type { ReactNode } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import dayjs from "dayjs";
import DesignacoesPasso3 from "./page";
import { designacaoAction } from "@/actions/cadastro-designacao";
import { gerarPreviewTextoSeiAction } from "@/actions/textos-sei";
import type { FormDesignacaoEServidorIndicado } from "../DesignacaoContext";

// ── Mocks de Navegação ───────────────────────────
const h = vi.hoisted(() => ({
  pushMock: vi.fn(),
  searchId: null as string | null,
  searchRf: "1234567" as string | null,
  clearFormDesignacaoDataMock: vi.fn(),
  setFormDesignacaoDataMock: vi.fn(),
  formData: {
    dre_nome: "DRE CENTRO",
    ue_nome: "EMEF TESTE",
    portaria_designacao: "123/2024",
    numero_sei: "6016.2024/0001-2",
    servidorIndicado: { nome_civil: "JOÃO SILVA" },
  } as unknown as FormDesignacaoEServidorIndicado | null,
}));
const defaultFormData = {
  dre_nome: "DRE CENTRO",
  ue_nome: "EMEF TESTE",
  portaria_designacao: "123/2024",
  numero_sei: "6016.2024/0001-2",
  servidorIndicado: { nome_civil: "JOÃO SILVA" },
} as const;

const textoPreviewPadrao =
  "PORTARIA Nº 123/2024\nSEI Nº 6016.2024/0001-2\nEXPEDE:\nTexto da portaria para JOÃO SILVA";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: h.pushMock }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "id") return h.searchId;
      if (key === "rf") return h.searchRf;
      return null;
    },
  }),
}));

// ── Contexto ───────────────────────────
vi.mock("../DesignacaoContext", () => ({
  useDesignacaoContext: () => ({
    formDesignacaoData: h.formData,
    clearFormDesignacaoData: h.clearFormDesignacaoDataMock,
    setFormDesignacaoData: h.setFormDesignacaoDataMock,
  }),
}));

// ── UI mocks ───────────────────────────
vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  default: ({ title }: { title: ReactNode }) => <h1>{title}</h1>,
}));

vi.mock("@/components/dashboard/FundoBranco/QuadroBranco", () => ({
  default: ({ children }: { children: ReactNode }) => <section>{children}</section>,
}));

vi.mock("@/components/dashboard/Designacao/StepperDesignacao", () => ({
  default: ({ current }: { current: number }) => <div data-testid="stepper">Passo {current}</div>,
}));

vi.mock("@/components/dashboard/Designacao/BotoesDeNavegacao", () => ({
  default: ({ onAnterior, onProximo, disableProximo, labelProximo }: {
    onAnterior: () => void;
    onProximo: () => void;
    disableProximo?: boolean;
    labelProximo?: string;
  }) => (
    <nav>
      <button onClick={onAnterior}>Anterior</button>
      <button onClick={onProximo} disabled={disableProximo}>
        {labelProximo ?? "Próximo"}
      </button>
    </nav>
  ),
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange }: { children: ReactNode; onValueChange?: (value: string) => void }) => (
    <div>
      <button
        type="button"
        data-testid="select-detalhe-true"
        onClick={() => onValueChange?.("true")}
      >
        Selecionar contabilizar
      </button>
      <button
        type="button"
        data-testid="select-detalhe-false"
        onClick={() => onValueChange?.("false")}
      >
        Selecionar nao contabilizar
      </button>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: ReactNode; value: string }) => <div data-value={value}>{children}</div>,
  SelectTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
}));

vi.mock("@/assets/icons/Designacao", () => ({
  default: () => <svg />,
}));

// ── Action de preview do texto SEI ───────────────────────────
vi.mock("@/actions/textos-sei", () => ({
  gerarPreviewTextoSeiAction: vi.fn(),
}));

// ── Descrições de Gestão de cargos base ─────────
const { buscarDescricoesMock } = vi.hoisted(() => ({ buscarDescricoesMock: vi.fn() }));
const MENSAGEM_ERRO_DESCRICOES_CARGOS = "Não foi possível consultar os cargos em Gestão de cargos base. A portaria não foi gerada.";

vi.mock("@/hooks/useBuscarDescricoesCargosBase", () => ({
  MENSAGEM_ERRO_DESCRICOES_CARGOS: "Não foi possível consultar os cargos em Gestão de cargos base. A portaria não foi gerada.",
  useBuscarDescricoesCargosBase: () => buscarDescricoesMock,
}));

// Devolve "CARGO <código>" para todo código válido pedido.
async function descricoesFalsas(codigos: unknown[]) {
  return Object.fromEntries(
    codigos
      .filter((codigo) => codigo != null && String(codigo).trim() !== "" && Number(codigo) !== 0)
      .map((codigo) => [String(Number(codigo)), `CARGO ${Number(codigo)}`])
  );
}

// ── Action de salvar ───────────────────────────
vi.mock("@/actions/cadastro-designacao", () => ({
  designacaoAction: vi.fn(),
}));

// ── Antd mock ───────────────────────────
vi.mock("antd", () => ({
  Card: ({ title, children }: { title: ReactNode; children: ReactNode }) => (
    <article>
      <h3>{title}</h3>
      {children}
    </article>
  ),
  Alert: ({ title, description }: { title: ReactNode; description?: ReactNode }) => (
    <div role="alert">
      <strong>{title}</strong>
      {description && <p>{description}</p>}
    </div>
  ),
}));

vi.mock("@/hooks/useCargos", () => ({
  useFetchCargos: () => ({ data: [{ codigoCargo: 3360, nomeCargo: "DIRETOR DE ESCOLA" }] }),
}));

// ── Notification mock ───────────────────────────
const { notificationSuccessMock, notificationErrorMock } = vi.hoisted(() => ({
  notificationSuccessMock: vi.fn(),
  notificationErrorMock: vi.fn(),
}));

vi.mock("@/components/providers/NotificationProvider", () => ({
  useAppNotification: () => ({
    success: notificationSuccessMock,
    error: notificationErrorMock,
  }),
}));

// ── TESTES ───────────────────────────

describe("DesignacoesPasso3 - Testes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buscarDescricoesMock.mockImplementation(descricoesFalsas);
    h.searchId = null;
    h.searchRf = "1234567";
    h.formData = { ...defaultFormData } as unknown as FormDesignacaoEServidorIndicado;
    notificationSuccessMock.mockReset();
    notificationErrorMock.mockReset();
    vi.mocked(gerarPreviewTextoSeiAction).mockResolvedValue({
      success: true,
      data: { modelo_portaria_id: 7, texto: textoPreviewPadrao },
    });
  });

  it("busca a prévia do texto SEI no back e exibe o texto retornado", async () => {
    render(<DesignacoesPasso3 />);
    const editor = await screen.findByTestId("editor-sei");

    expect(gerarPreviewTextoSeiAction).toHaveBeenCalledWith(
      expect.objectContaining({ tipo_portaria: "DESIGNACAO" })
    );
    await waitFor(() => {
      expect(editor).toHaveTextContent("PORTARIA Nº");
      expect(editor).toHaveTextContent("EXPEDE:");
      expect(editor).toHaveTextContent("SEI Nº");
    });

    const strongs = editor.querySelectorAll("strong");
    expect(strongs.length).toBeGreaterThan(0);
  });

  it("envia tipo_cargo=CARGO_VAGO quando o tipo_cargo do formulário é 'vago'", async () => {
    h.formData = {
      ...defaultFormData,
      tipo_cargo: "vago",
    } as unknown as FormDesignacaoEServidorIndicado;

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");

    expect(gerarPreviewTextoSeiAction).toHaveBeenCalledWith(
      expect.objectContaining({ tipo_cargo: "CARGO_VAGO" })
    );
  });

  it("envia tipo_cargo=CARGO_DISPONIVEL quando o tipo_cargo do formulário é 'disponivel'", async () => {
    h.formData = {
      ...defaultFormData,
      tipo_cargo: "disponivel",
    } as unknown as FormDesignacaoEServidorIndicado;

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");

    expect(gerarPreviewTextoSeiAction).toHaveBeenCalledWith(
      expect.objectContaining({ tipo_cargo: "CARGO_DISPONIVEL" })
    );
  });

  it("busca a prévia apenas uma vez, mesmo com re-render do contexto", async () => {
    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");

    fireEvent.change(screen.getByTestId("input-descricao-pendencia"), {
      target: { value: "Observacao complementar" },
    });

    await waitFor(() => {
      expect(h.setFormDesignacaoDataMock).toHaveBeenCalled();
    });

    expect(gerarPreviewTextoSeiAction).toHaveBeenCalledTimes(1);
  });

  it("busca as descrições dos cargos antes da prévia e as usa nas variáveis de cargo", async () => {
    h.formData = {
      ...defaultFormData,
      tipo_cargo: "vago",
      cargo_vago_selecionado: { id: 3360, label: "Diretor (label da tela)" },
      servidorIndicado: { nome_civil: "JOÃO SILVA", cd_cargo_base: 3212, categoria: "3" },
    } as unknown as FormDesignacaoEServidorIndicado;

    render(<DesignacoesPasso3 />);

    await waitFor(() => expect(gerarPreviewTextoSeiAction).toHaveBeenCalledTimes(1));
    expect(buscarDescricoesMock).toHaveBeenCalledWith([3360, 3212]);
    expect(vi.mocked(gerarPreviewTextoSeiAction).mock.calls[0][0].dados).toMatchObject({
      CARGO: "CARGO 3360",
      CARGO_DESIGNACAO: "CARGO 3360",
      CARGO_INDICADO: "CARGO 3212 - CATEGORIA 3",
    });
  });

  it("mostra erro, não gera a prévia e não deixa salvar quando a consulta dos cargos falha", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    buscarDescricoesMock.mockRejectedValueOnce(new Error("falha de rede"));

    render(<DesignacoesPasso3 />);

    await waitFor(() =>
      expect(notificationErrorMock).toHaveBeenCalledWith({ title: MENSAGEM_ERRO_DESCRICOES_CARGOS })
    );
    expect(gerarPreviewTextoSeiAction).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(MENSAGEM_ERRO_DESCRICOES_CARGOS);
    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
    expect(h.pushMock).not.toHaveBeenCalled();
  });

  it("avisa que não há modelo de portaria e volta para o passo 2 quando a prévia falha", async () => {
    vi.mocked(gerarPreviewTextoSeiAction).mockResolvedValueOnce({
      success: false,
      error: "Não há modelo de portaria ativo cadastrado para este tipo de ato.",
    });

    render(<DesignacoesPasso3 />);

    await waitFor(() => {
      expect(notificationErrorMock).toHaveBeenCalledWith({
        title: "Não existe modelo de portaria criado",
        description: "Certifique-se de criar um modelo de portaria para designação antes de prosseguir.",
      });
    });

    expect(h.pushMock).toHaveBeenCalledWith(
      "/pages/designacoes/designacoes-passo-2?rf=1234567"
    );
  });

  it("volta para o passo 2 preservando o id quando a prévia falha em edição", async () => {
    h.searchId = "42";
    vi.mocked(gerarPreviewTextoSeiAction).mockResolvedValueOnce({
      success: false,
      error: "Não há modelo de portaria ativo cadastrado para este tipo de ato.",
    });

    render(<DesignacoesPasso3 />);

    await waitFor(() => {
      expect(h.pushMock).toHaveBeenCalledWith(
        "/pages/designacoes/designacoes-passo-2?id=42&rf=1234567"
      );
    });
  });

  it("chama action ao salvar incluindo o texto e o modelo gerados", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({ success: true, data: {} });

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");
    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() =>
      expect(designacaoAction).toHaveBeenCalledWith(
        {
          ...h.formData,
          texto_sei: textoPreviewPadrao,
          modelo_portaria: 7,
        },
        null
      )
    );
  });

  it("envia id quando existir", async () => {
    h.searchId = "42";
    vi.mocked(designacaoAction).mockResolvedValueOnce({ success: true, data: {} });

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");
    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() =>
      expect(designacaoAction).toHaveBeenCalledWith(
        expect.objectContaining({ texto_sei: textoPreviewPadrao, modelo_portaria: 7 }),
        "42"
      )
    );
  });

  it("bloqueia botão durante loading do salvamento", async () => {
    let resolveFn!: (value: Awaited<ReturnType<typeof designacaoAction>>) => void;
    vi.mocked(designacaoAction).mockImplementation(
      () => new Promise((r) => (resolveFn = r))
    );

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");
    const btn = screen.getByText("Salvar");

    fireEvent.click(btn);
    expect(btn).toBeDisabled();

    resolveFn({ success: true, data: {} });

    await waitFor(() => expect(btn).not.toBeDisabled());
  });

  it("redireciona após sucesso", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({ success: true, data: {} });

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");
    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(h.pushMock).toHaveBeenCalledWith("/pages/atos-administrativos");
    });
  });

  it("exibe notificação de sucesso", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({ success: true, data: {} });

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");
    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(notificationSuccessMock).toHaveBeenCalledWith({
        title: "Portaria salva com sucesso!",
      });
    });
  });

  it("exibe notificação de erro", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({
      success: false,
      error: "Erro teste",
    });

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");
    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(notificationErrorMock).toHaveBeenCalledWith({
        title: "Erro ao salvar portaria: Erro teste",
      });
    });
  });

  it("mostra o alerta de eleição quando o backend retorna eleicao_necessaria", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({
      success: false,
      error: "Data fim: texto do backend",
      errosSubstituicaoDiretor: { eleicao: "Mensagem de eleição do backend" },
    });

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");
    fireEvent.click(screen.getByText("Salvar"));

    expect(await screen.findByText("Necessária eleição para o cargo de Diretor")).toBeInTheDocument();
    expect(screen.getByText("Mensagem de eleição do backend")).toBeInTheDocument();
    expect(notificationErrorMock).not.toHaveBeenCalled();
    expect(h.pushMock).not.toHaveBeenCalled();
  });

  it("mostra os erros de período e de unidade retornados pelo backend", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({
      success: false,
      error: "erro",
      errosSubstituicaoDiretor: {
        dataFim: "Erro de período do backend",
        indicado: "Erro de unidade do backend",
      },
    });

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");
    fireEvent.click(screen.getByText("Salvar"));

    expect(await screen.findByText("Erro de período do backend")).toBeInTheDocument();
    expect(screen.getByText("Erro de unidade do backend")).toBeInTheDocument();
    expect(screen.queryByText("Necessária eleição para o cargo de Diretor")).not.toBeInTheDocument();
  });

  it("abre o modal com a mensagem de período sobreposto retornada pelo backend", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({
      success: false,
      error: "Data inicio: texto do backend",
      erroPeriodoSobreposto: "Mensagem de sobreposição do backend",
    });

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");
    fireEvent.click(screen.getByText("Salvar"));

    expect(await screen.findByText("Período em conflito com outra designação")).toBeInTheDocument();
    expect(screen.getByTestId("mensagem-periodo-sobreposto")).toHaveTextContent(
      "Mensagem de sobreposição do backend"
    );
    expect(notificationErrorMock).not.toHaveBeenCalled();
    expect(h.pushMock).not.toHaveBeenCalled();
  });

  it("fecha o modal de período sobreposto sem sair do passo 3", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({
      success: false,
      error: "Data inicio: texto do backend",
      erroPeriodoSobreposto: "Mensagem de sobreposição do backend",
    });

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");
    fireEvent.click(screen.getByText("Salvar"));
    fireEvent.click(await screen.findByTestId("botao-fechar-periodo-sobreposto"));

    await waitFor(() => {
      expect(screen.queryByTestId("mensagem-periodo-sobreposto")).not.toBeInTheDocument();
    });
    expect(h.pushMock).not.toHaveBeenCalled();
  });

  it("volta ao passo 2 ao clicar em Alterar período no modal de período sobreposto", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({
      success: false,
      error: "Data inicio: texto do backend",
      erroPeriodoSobreposto: "Mensagem de sobreposição do backend",
    });

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");
    fireEvent.click(screen.getByText("Salvar"));
    fireEvent.click(await screen.findByTestId("botao-alterar-periodo-sobreposto"));

    expect(h.pushMock).toHaveBeenCalledWith(expect.stringContaining("/pages/designacoes/designacoes-passo-2"));
  });

  it("desabilita o Salvar e mostra o bloqueio quando o indicado é Assistente de Diretor", async () => {
    h.formData = {
      ...defaultFormData,
      tipo_cargo: "vago",
      cargo_vago_selecionado: { id: 3360, label: "DIRETOR DE ESCOLA" },
      a_partir_de: "2026-01-01T03:00:00.000Z",
      designacao_data_final: "2026-01-20T03:00:00.000Z",
      servidorIndicado: {
        ...defaultFormData.servidorIndicado,
        cd_cargo_sobreposto_funcao_atividade: 3085,
        possui_cargo_sobreposto: true,
      },
    } as unknown as FormDesignacaoEServidorIndicado;

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");

    expect(
      screen.getByText(
        "O servidor não pode ser designado para o cargo de Diretor por já possuir o cargo sobreposto de Assistente de Diretor."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Salvar")).toBeDisabled();
  });

  it("mostra o bloqueio do Assistente de Diretor retornado pelo backend", async () => {
    vi.mocked(designacaoAction).mockResolvedValueOnce({
      success: false,
      error: "erro",
      errosSubstituicaoDiretor: { indicado: "Mensagem do AD do backend" },
    });

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");
    fireEvent.click(screen.getByText("Salvar"));

    expect(await screen.findByText("Mensagem do AD do backend")).toBeInTheDocument();
    expect(notificationErrorMock).not.toHaveBeenCalled();
    expect(h.pushMock).not.toHaveBeenCalled();
  });

  it("desabilita o Salvar quando a substituição do Diretor passa de 30 dias", async () => {
    h.formData = {
      ...defaultFormData,
      tipo_cargo: "vago",
      cargo_vago_selecionado: { id: 3360, label: "DIRETOR DE ESCOLA" },
      a_partir_de: "2026-01-01T03:00:00.000Z",
      designacao_data_final: "2026-01-31T03:00:00.000Z",
    } as unknown as FormDesignacaoEServidorIndicado;

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");

    expect(screen.getByText("Salvar")).toBeDisabled();
  });

  it("permite salvar substituição do Diretor de 30 dias", async () => {
    h.formData = {
      ...defaultFormData,
      tipo_cargo: "vago",
      cargo_vago_selecionado: { id: 3360, label: "DIRETOR DE ESCOLA" },
      a_partir_de: "2026-01-01T03:00:00.000Z",
      designacao_data_final: "2026-01-30T03:00:00.000Z",
      ue: "090450",
      servidorIndicado: {
        ...defaultFormData.servidorIndicado,
        cd_cargo_base: 3255,
        possui_cargo_sobreposto: false,
        cd_ue_lotacao: "090450",
      },
    } as unknown as FormDesignacaoEServidorIndicado;

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");

    expect(screen.getByText("Salvar")).not.toBeDisabled();
  });

  describe("bloqueio de designação futura sem data final", () => {
    const emDias = (dias: number) => dayjs().startOf("day").add(dias, "day").toISOString();

    const formFuturoSemAte = () =>
      ({
        ...defaultFormData,
        a_partir_de: emDias(1),
        designacao_data_final: null,
      }) as unknown as FormDesignacaoEServidorIndicado;

    it("bloqueia o salvar e abre o modal quando o início é futuro e não há Até", async () => {
      h.formData = formFuturoSemAte();

      render(<DesignacoesPasso3 />);
      await screen.findByTestId("editor-sei");
      fireEvent.click(screen.getByText("Salvar"));

      expect(await screen.findByText("Data final obrigatória")).toBeInTheDocument();
      expect(screen.getByTestId("mensagem-data-futura-sem-periodo")).toHaveTextContent(
        'Não é possível criar uma designação com data futura sem informar a data "Até".'
      );
      expect(designacaoAction).not.toHaveBeenCalled();
      expect(notificationErrorMock).not.toHaveBeenCalled();
      expect(h.pushMock).not.toHaveBeenCalled();
    });

    it("permite salvar quando o início é futuro e o Até está preenchido", async () => {
      vi.mocked(designacaoAction).mockResolvedValueOnce({ success: true, data: {} });
      h.formData = {
        ...defaultFormData,
        a_partir_de: emDias(1),
        designacao_data_final: emDias(10),
      } as unknown as FormDesignacaoEServidorIndicado;

      render(<DesignacoesPasso3 />);
      await screen.findByTestId("editor-sei");
      fireEvent.click(screen.getByText("Salvar"));

      await waitFor(() => expect(designacaoAction).toHaveBeenCalled());
      expect(screen.queryByText(/data futura/)).not.toBeInTheDocument();
    });

    it.each([0, -5])("permite salvar sem Até quando o início está a %i dias de hoje", async (dias) => {
      vi.mocked(designacaoAction).mockResolvedValueOnce({ success: true, data: {} });
      h.formData = {
        ...defaultFormData,
        a_partir_de: emDias(dias),
        designacao_data_final: null,
      } as unknown as FormDesignacaoEServidorIndicado;

      render(<DesignacoesPasso3 />);
      await screen.findByTestId("editor-sei");
      fireEvent.click(screen.getByText("Salvar"));

      await waitFor(() => expect(designacaoAction).toHaveBeenCalled());
      expect(screen.queryByText(/data futura/)).not.toBeInTheDocument();
    });

    it("abre o modal com a mensagem quando o backend recusa por data futura sem Até", async () => {
      vi.mocked(designacaoAction).mockResolvedValueOnce({
        success: false,
        error: "Data fim: texto do backend",
        erroDataFuturaSemPeriodo: "Mensagem de data futura do backend",
      });

      render(<DesignacoesPasso3 />);
      await screen.findByTestId("editor-sei");
      fireEvent.click(screen.getByText("Salvar"));

      expect(await screen.findByText("Data final obrigatória")).toBeInTheDocument();
      expect(screen.getByTestId("mensagem-data-futura-sem-periodo")).toHaveTextContent(
        "Mensagem de data futura do backend"
      );
      expect(notificationErrorMock).not.toHaveBeenCalled();
      expect(h.pushMock).not.toHaveBeenCalled();
    });

    it("fecha o modal de data futura sem sair do passo 3", async () => {
      h.formData = formFuturoSemAte();

      render(<DesignacoesPasso3 />);
      await screen.findByTestId("editor-sei");
      fireEvent.click(screen.getByText("Salvar"));
      fireEvent.click(await screen.findByTestId("botao-fechar-data-futura-sem-periodo"));

      await waitFor(() => {
        expect(screen.queryByTestId("mensagem-data-futura-sem-periodo")).not.toBeInTheDocument();
      });
      expect(h.pushMock).not.toHaveBeenCalled();
    });

    it("volta ao passo 2 ao clicar em Alterar período no modal de data futura", async () => {
      h.formData = formFuturoSemAte();

      render(<DesignacoesPasso3 />);
      await screen.findByTestId("editor-sei");
      fireEvent.click(screen.getByText("Salvar"));
      fireEvent.click(await screen.findByTestId("botao-alterar-periodo-data-futura-sem-periodo"));

      expect(h.pushMock).toHaveBeenCalledWith(expect.stringContaining("/pages/designacoes/designacoes-passo-2"));
    });
  });

  it("navega ao clicar em Anterior", () => {
    render(<DesignacoesPasso3 />);
    fireEvent.click(screen.getByText("Anterior"));

    expect(h.pushMock).toHaveBeenCalledWith(
      "/pages/designacoes/designacoes-passo-2?rf=1234567"
    );
  });

  it("navega para passo 2 com id ao clicar em Anterior", () => {
    h.searchId = "42";
    render(<DesignacoesPasso3 />);
    fireEvent.click(screen.getByText("Anterior"));

    expect(h.pushMock).toHaveBeenCalledWith(
      "/pages/designacoes/designacoes-passo-2?id=42&rf=1234567"
    );
  });

  it("renderiza quebra de linha", async () => {
    vi.mocked(gerarPreviewTextoSeiAction).mockResolvedValueOnce({
      success: true,
      data: { modelo_portaria_id: 7, texto: "A\n\nB" },
    });

    render(<DesignacoesPasso3 />);
    await screen.findByTestId("editor-sei");

    await waitFor(() => {
      expect(screen.getByTestId("editor-sei").innerHTML).toContain("<br>");
    });
  });

  it("não quebra com texto vazio", async () => {
    vi.mocked(gerarPreviewTextoSeiAction).mockResolvedValueOnce({
      success: true,
      data: { modelo_portaria_id: 7, texto: "" },
    });

    render(<DesignacoesPasso3 />);
    const editor = await screen.findByTestId("editor-sei");

    expect(editor).toBeInTheDocument();
  });

  it("atualiza informações adicionais no contexto", async () => {
    render(<DesignacoesPasso3 />);

    fireEvent.change(screen.getByTestId("input-descricao-pendencia"), {
      target: { value: "Observacao complementar" },
    });

    await waitFor(() => {
      expect(h.setFormDesignacaoDataMock).toHaveBeenCalledWith(
        expect.objectContaining({
          informacoes_adicionais: "Observacao complementar",
        })
      );
    });
  });

  it("atualiza detalhe do histórico no contexto", async () => {
    render(<DesignacoesPasso3 />);

    fireEvent.click(screen.getByTestId("select-detalhe-false"));
    fireEvent.click(screen.getByTestId("select-detalhe-true"));

    await waitFor(() => {
      expect(h.setFormDesignacaoDataMock).toHaveBeenCalledWith(
        expect.objectContaining({
          detalhe_para_quadro_de_historico_por_ano: false,
        })
      );
      expect(h.setFormDesignacaoDataMock).toHaveBeenCalledWith(
        expect.objectContaining({
          detalhe_para_quadro_de_historico_por_ano: true,
        })
      );
    });
  });

  it("não busca prévia nem permite salvar quando não há dados no contexto", async () => {
    h.formData = null;

    render(<DesignacoesPasso3 />);

    expect(gerarPreviewTextoSeiAction).not.toHaveBeenCalled();
    expect(screen.getByText("Salvar")).toBeDisabled();

    fireEvent.click(screen.getByText("Salvar"));
    expect(designacaoAction).not.toHaveBeenCalled();
  });
});
