import { renderHook, waitFor, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useNovoAto } from "./useNovoAto";
import {
  buscarCessacaoPorPortariaAction,
  buscarDesignacaoPorPortariaAction,
  buscarInsubsistenciaPorPortariaAction,
} from "@/actions/busca-ato-por-portaria";
import type { Cessacao, DesignacaoResponse } from "@/types/designacao";
import type { InsubsistenciaRead } from "@/types/insubsistencia";
import type { ApostilaRead } from "@/types/apostila";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/actions/busca-ato-por-portaria", () => ({
  buscarDesignacaoPorPortariaAction: vi.fn(),
  buscarCessacaoPorPortariaAction: vi.fn(),
  buscarInsubsistenciaPorPortariaAction: vi.fn(),
}));

const erroNaoEncontrado = { success: false as const, error: "Não encontrado" };

function criarApostila(overrides: Partial<ApostilaRead> = {}): ApostilaRead {
  return {
    id: 1,
    sei_numero: "SEI-1",
    doc: "DOC-1",
    status: "ativo",
    observacao: "",
    criado_em: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function criarDesignacao(overrides: Partial<DesignacaoResponse> = {}): DesignacaoResponse {
  return {
    id: 1,
    tipo: "designacao",
    status: "ativo",
    ato_pai_id: null,
    ato_raiz_id: null,
    impedimento_substituicao_detail: null,
    impedimento_substituicao: null,
    impedimento_display: "",
    tipo_vaga_display: "",
    cargo_vaga_display: "",
    dre_nome: "DRE",
    unidade_proponente: "UE",
    dre: "dre",
    ue: "ue",
    funcionarios_da_unidade: "",
    codigo_hierarquico: "",
    indicado_nome_civil: "",
    indicado_nome_servidor: "",
    indicado_rf: "",
    indicado_vinculo: 0,
    indicado_cargo_base: "",
    indicado_codigo_cargo_base: 0,
    indicado_lotacao: "",
    indicado_cargo_sobreposto: "",
    indicado_codigo_cargo_sobreposto: 0,
    indicado_local_exercicio: "",
    indicado_local_servico: "",
    indicado_categoria: "",
    titular_nome_civil: "",
    titular_nome_servidor: "",
    titular_rf: "",
    titular_vinculo: 0,
    titular_cargo_base: "",
    titular_codigo_cargo_base: 0,
    titular_lotacao: "",
    titular_cargo_sobreposto: "",
    titular_codigo_cargo_sobreposto: 0,
    titular_local_exercicio: "",
    titular_local_servico: "",
    numero_portaria: "1",
    ano_vigente: "2026",
    sei_numero: "",
    doc: "",
    data_inicio: "",
    data_fim: null,
    carater_excepcional: false,
    com_afastamento: false,
    possui_pendencia: false,
    pendencias: "",
    motivo_afastamento: "",
    informacoes_adicionais: "",
    detalhe_para_quadro_de_historico_por_ano: false,
    tipo_vaga: "",
    cargo_vaga: 0,
    criado_em: "",
    cessacao: null,
    apostilas: [],
    insubsistencia: null,
    ...overrides,
  };
}

function criarCessacao(overrides: Partial<Cessacao> = {}): Cessacao {
  return {
    id: 1,
    numero_portaria: "1",
    ano_vigente: "2026",
    sei_numero: "",
    a_pedido: false,
    remocao: false,
    aposentadoria: false,
    data_cessacao: "",
    doc: "",
    criado_em: "",
    status: "ativo",
    ato_pai_id: 1,
    apostilas: [],
    insubsistencia: null,
    ...overrides,
  };
}

function criarInsubsistencia(overrides: Partial<InsubsistenciaRead> = {}): InsubsistenciaRead {
  return {
    id: 1,
    numero_portaria: "1",
    ano_vigente: "2026",
    sei_numero: "",
    doc: "",
    observacoes: "",
    texto_apostila: "",
    doc_do_ato_insubstituido: "",
    criado_em: "",
    status: "ativo",
    observacao: "",
    designacao: criarDesignacao(),
    cessacao: criarCessacao(),
    insubsistencia: {
      id: 1,
      numero_portaria: "1",
      ano_vigente: "2026",
      sei_numero: "",
      doc: "",
      observacoes: "",
      texto_apostila: "",
      doc_do_ato_insubstituido: "",
    },
    ato_apostilado: "",
    ato_apostilado_display: "",
    tipo_insubsistencia: "",
    tipo: "",
    ...overrides,
  };
}

describe("useNovoAto", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cessacao: busca designação pela portaria e navega para /pages/cessacao", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue({
      success: true,
      data: criarDesignacao({ id: 10 }),
    });

    const { result } = renderHook(() => useNovoAto());

    let sucesso: boolean | undefined;
    await act(async () => {
      sucesso = await result.current.buscar("cessacao", "100/2026", "2026");
    });

    expect(buscarDesignacaoPorPortariaAction).toHaveBeenCalledWith({ portaria: "100/2026", ano: "2026" });
    expect(pushMock).toHaveBeenCalledWith("/pages/cessacao?id=10");
    expect(sucesso).toBe(true);
    expect(result.current.errorMessage).toBeNull();
  });

  it("insubsistencia: quando a portaria é de designação, navega com origem=designacao sem consultar cessação", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue({
      success: true,
      data: criarDesignacao({ id: 20 }),
    });

    const { result } = renderHook(() => useNovoAto());

    await act(async () => {
      await result.current.buscar("insubsistencia", "200/2026", "2026");
    });

    expect(pushMock).toHaveBeenCalledWith("/pages/insubsistencia?id=20&origem=designacao");
    expect(buscarCessacaoPorPortariaAction).not.toHaveBeenCalled();
  });

  it("insubsistencia: quando não é designação, tenta cessação e navega com origem=cessacao", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);
    vi.mocked(buscarCessacaoPorPortariaAction).mockResolvedValue({
      success: true,
      data: criarCessacao({ id: 21, ato_pai_id: 11 }),
    });

    const { result } = renderHook(() => useNovoAto());

    await act(async () => {
      await result.current.buscar("insubsistencia", "210/2026", "2026");
    });

    expect(pushMock).toHaveBeenCalledWith("/pages/insubsistencia?id=11&origem=cessacao");
  });

  it("insubsistencia: quando nem designação nem cessação são encontradas, define mensagem de erro", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);
    vi.mocked(buscarCessacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);

    const { result } = renderHook(() => useNovoAto());

    let sucesso: boolean | undefined;
    await act(async () => {
      sucesso = await result.current.buscar("insubsistencia", "220/2026", "2026");
    });

    expect(sucesso).toBe(false);
    expect(pushMock).not.toHaveBeenCalled();
    expect(result.current.errorMessage).toBe(
      "Nenhum registro foi encontrado para essa portaria."
    );
  });

  it("tornar-sem-efeito: busca insubsistência pela portaria e navega para /pages/tornar-sem-efeito", async () => {
    vi.mocked(buscarInsubsistenciaPorPortariaAction).mockResolvedValue({
      success: true,
      data: criarInsubsistencia({ id: 30 }),
    });

    const { result } = renderHook(() => useNovoAto());

    await act(async () => {
      await result.current.buscar("tornar-sem-efeito", "300/2026", "2026");
    });

    expect(pushMock).toHaveBeenCalledWith("/pages/tornar-sem-efeito?id=30");
  });

  it("anular-apostila: quando a portaria é de designação com apostila, navega direto para /pages/anular-apostila", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue({
      success: true,
      data: criarDesignacao({ id: 40, apostilas: [criarApostila({ id: 400 })] }),
    });

    const { result } = renderHook(() => useNovoAto());

    await act(async () => {
      await result.current.buscar("anular-apostila", "400/2026", "2026");
    });

    expect(pushMock).toHaveBeenCalledWith("/pages/anular-apostila?id=400");
    expect(buscarCessacaoPorPortariaAction).not.toHaveBeenCalled();
  });

  it("anular-apostila: quando a designação não tem apostila, informa que não há apostila vinculada", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue({
      success: true,
      data: criarDesignacao({ id: 41, apostilas: [] }),
    });

    const { result } = renderHook(() => useNovoAto());

    let sucesso: boolean | undefined;
    await act(async () => {
      sucesso = await result.current.buscar("anular-apostila", "410/2026", "2026");
    });

    expect(sucesso).toBe(false);
    expect(pushMock).not.toHaveBeenCalled();
    expect(result.current.errorMessage).toBe(
      "Essa portaria não possui apostila vinculada para anular."
    );
  });

  it("anular-apostila: quando não é designação, tenta cessação e navega com o id da apostila da cessação", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);
    vi.mocked(buscarCessacaoPorPortariaAction).mockResolvedValue({
      success: true,
      data: criarCessacao({ id: 50, apostilas: [criarApostila({ id: 500 })] }),
    });

    const { result } = renderHook(() => useNovoAto());

    await act(async () => {
      await result.current.buscar("anular-apostila", "500/2026", "2026");
    });

    expect(pushMock).toHaveBeenCalledWith("/pages/anular-apostila?id=500");
  });

  it("anular-apostila: quando a cessação não tem apostila, informa que não há apostila vinculada", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);
    vi.mocked(buscarCessacaoPorPortariaAction).mockResolvedValue({
      success: true,
      data: criarCessacao({ id: 51, apostilas: [] }),
    });

    const { result } = renderHook(() => useNovoAto());

    let sucesso: boolean | undefined;
    await act(async () => {
      sucesso = await result.current.buscar("anular-apostila", "510/2026", "2026");
    });

    expect(sucesso).toBe(false);
    expect(result.current.errorMessage).toBe(
      "Essa portaria não possui apostila vinculada para anular."
    );
  });

  it("anular-apostila: quando nem designação nem cessação são encontradas, define mensagem de não encontrado", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);
    vi.mocked(buscarCessacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);

    const { result } = renderHook(() => useNovoAto());

    let sucesso: boolean | undefined;
    await act(async () => {
      sucesso = await result.current.buscar("anular-apostila", "520/2026", "2026");
    });

    expect(sucesso).toBe(false);
    expect(result.current.errorMessage).toBe(
      "Nenhum registro foi encontrado para essa portaria."
    );
  });

  it("apostila: quando portaria é de designação, navega com origem=designacao sem consultar cessação", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue({
      success: true,
      data: criarDesignacao({ id: 50 }),
    });

    const { result } = renderHook(() => useNovoAto());

    await act(async () => {
      await result.current.buscar("apostila", "500/2026", "2026");
    });

    expect(pushMock).toHaveBeenCalledWith("/pages/apostila?id=50&origem=designacao");
    expect(buscarCessacaoPorPortariaAction).not.toHaveBeenCalled();
  });

  it("apostila: quando não é designação, tenta cessação e navega com origem=cessacao", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);
    vi.mocked(buscarCessacaoPorPortariaAction).mockResolvedValue({
      success: true,
      data: criarCessacao({ id: 60, ato_pai_id: 12 }),
    });

    const { result } = renderHook(() => useNovoAto());

    await act(async () => {
      await result.current.buscar("apostila", "600/2026", "2026");
    });

    expect(pushMock).toHaveBeenCalledWith("/pages/apostila?id=12&origem=cessacao");
  });

  it("apostila: quando a designação já possui apostila ativa, informa erro e não navega", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue({
      success: true,
      data: criarDesignacao({
        id: 55,
        apostilas: [criarApostila({ id: 550, status: "ativo" })],
      }),
    });

    const { result } = renderHook(() => useNovoAto());

    let sucesso: boolean | undefined;
    await act(async () => {
      sucesso = await result.current.buscar("apostila", "550/2026", "2026");
    });

    expect(sucesso).toBe(false);
    expect(pushMock).not.toHaveBeenCalled();
    expect(result.current.errorMessage).toBe(
      "Essa portaria já possui uma apostila vinculada."
    );
  });

  it("apostila: quando a designação possui apostila anulada (não ativa), navega normalmente", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue({
      success: true,
      data: criarDesignacao({
        id: 56,
        apostilas: [criarApostila({ id: 560, status: "anulado" })],
      }),
    });

    const { result } = renderHook(() => useNovoAto());

    await act(async () => {
      await result.current.buscar("apostila", "560/2026", "2026");
    });

    expect(pushMock).toHaveBeenCalledWith("/pages/apostila?id=56&origem=designacao");
  });

  it("apostila: quando nem designação nem cessação são encontradas, define mensagem de erro", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);
    vi.mocked(buscarCessacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);

    const { result } = renderHook(() => useNovoAto());

    let sucesso: boolean | undefined;
    await act(async () => {
      sucesso = await result.current.buscar("apostila", "700/2026", "2026");
    });

    expect(sucesso).toBe(false);
    expect(pushMock).not.toHaveBeenCalled();
    expect(result.current.errorMessage).toBe(
      "Nenhum registro foi encontrado para essa portaria."
    );
  });

  it("define errorMessage e não navega quando a portaria não é encontrada", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);

    const { result } = renderHook(() => useNovoAto());

    await act(async () => {
      await result.current.buscar("cessacao", "999/2026", "2026");
    });

    await waitFor(() => {
      expect(result.current.errorMessage).toBe(
        "Nenhum registro foi encontrado para essa portaria."
      );
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("limparErro limpa a mensagem de erro", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);

    const { result } = renderHook(() => useNovoAto());

    await act(async () => {
      await result.current.buscar("cessacao", "999/2026", "2026");
    });
    expect(result.current.errorMessage).not.toBeNull();

    act(() => {
      result.current.limparErro();
    });

    expect(result.current.errorMessage).toBeNull();
  });

  it("cessacao: não navega quando a designação não é encontrada", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);

    const { result } = renderHook(() => useNovoAto());

    let sucesso: boolean | undefined;
    await act(async () => {
      sucesso = await result.current.buscar("cessacao", "101/2026", "2026");
    });

    expect(sucesso).toBe(false);
    expect(pushMock).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it("tornar-sem-efeito: define erro quando a insubsistência não é encontrada", async () => {
    vi.mocked(buscarInsubsistenciaPorPortariaAction).mockResolvedValue(erroNaoEncontrado);

    const { result } = renderHook(() => useNovoAto());

    let sucesso: boolean | undefined;
    await act(async () => {
      sucesso = await result.current.buscar("tornar-sem-efeito", "301/2026", "2026");
    });

    expect(sucesso).toBe(false);
    expect(pushMock).not.toHaveBeenCalled();
    expect(result.current.errorMessage).toBe(
      "Nenhum registro foi encontrado para essa portaria.",
    );
  });

  it("insubsistencia: informa não encontrado quando o id do ato é 0", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);
    vi.mocked(buscarCessacaoPorPortariaAction).mockResolvedValue({
      success: true,
      data: criarCessacao({ id: 21, ato_pai_id: 0, apostilas: [] }),
    });

    const { result } = renderHook(() => useNovoAto());

    let sucesso: boolean | undefined;
    await act(async () => {
      sucesso = await result.current.buscar("insubsistencia", "211/2026", "2026");
    });

    expect(sucesso).toBe(false);
    expect(pushMock).not.toHaveBeenCalled();
    expect(result.current.errorMessage).toBe(
      "Nenhum registro foi encontrado para essa portaria.",
    );
  });

  it("apostila: navega quando a designação não possui lista de apostilas", async () => {
    const designacaoSemApostilas = criarDesignacao({ id: 57 });
    delete (designacaoSemApostilas as { apostilas?: ApostilaRead[] }).apostilas;

    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue({
      success: true,
      data: designacaoSemApostilas,
    });

    const { result } = renderHook(() => useNovoAto());

    await act(async () => {
      await result.current.buscar("apostila", "570/2026", "2026");
    });

    expect(pushMock).toHaveBeenCalledWith("/pages/apostila?id=57&origem=designacao");
  });

  it("apostila: informa erro quando a cessação já possui apostila ativa", async () => {
    vi.mocked(buscarDesignacaoPorPortariaAction).mockResolvedValue(erroNaoEncontrado);
    vi.mocked(buscarCessacaoPorPortariaAction).mockResolvedValue({
      success: true,
      data: criarCessacao({
        id: 61,
        ato_pai_id: 13,
        apostilas: [criarApostila({ id: 610, status: "ativo" })],
      }),
    });

    const { result } = renderHook(() => useNovoAto());

    let sucesso: boolean | undefined;
    await act(async () => {
      sucesso = await result.current.buscar("apostila", "610/2026", "2026");
    });

    expect(sucesso).toBe(false);
    expect(pushMock).not.toHaveBeenCalled();
    expect(result.current.errorMessage).toBe(
      "Essa portaria já possui uma apostila vinculada.",
    );
  });
});
