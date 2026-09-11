import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  criarCargosBaseAction,
  editarCargosBaseAction,
  fetchCargosBaseAction,
  fetchCargosBaseActionByIdAction,
} from "./cargos-base";
import { patchWithAuth, postWithAuth } from "@/lib/serverRequest";
import { fetchWithClient } from "./http";

vi.mock("@/lib/serverRequest", () => ({
  postWithAuth: vi.fn(),
  patchWithAuth: vi.fn(),
}));

vi.mock("./http", () => ({
  fetchWithClient: vi.fn(),
}));

describe("actions/cargos-base", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cria cargo base com endpoint e mensagem corretos", async () => {
    const payload = {
      grupamento: "DOCENCIA",
      codigo_cargo: "111",
      descricao_resumida: "Resumo",
      descricao_completa: "Completa",
      situacao_funcional: "EFETIVO",
      status: "ATIVO",
      utilizado_para_funcoes: true,
      utilizado_para_designacoes: false,
      utilizado_para_ste: false,
      utilizado_para_permutas: false,
      cargo_base_ficticio: false,
      testar_laudo: false,
      pesquisar_licencas_no_sigpec: true,
      quantidade_maxima_de_dias_de_licenca: "10",
    };

    vi.mocked(postWithAuth).mockResolvedValueOnce({
      success: true,
      data: { id: 1 },
    } as never);

    const response = await criarCargosBaseAction(payload);

    expect(postWithAuth).toHaveBeenCalledWith(
      "/gestao/cargos-base/",
      payload,
      "Erro ao criar cargo base",
    );
    expect(response).toEqual({ success: true, data: { id: 1 } });
  });

  it("edita cargo base com endpoint e mensagem corretos", async () => {
    const payload = {
      grupamento: "DOCENTES",
      descricao_resumida: "Resumo atualizado",
    };

    vi.mocked(patchWithAuth).mockResolvedValueOnce({
      success: true,
      data: { id: 7, ...payload },
    } as never);

    const response = await editarCargosBaseAction(7, payload);

    expect(patchWithAuth).toHaveBeenCalledWith(
      "/gestao/cargos-base/7/",
      payload,
      "Erro ao editar cargo base",
    );
    expect(response).toEqual({ success: true, data: { id: 7, ...payload } });
  });

  it("busca cargos base com endpoint e fallback de erro corretos", async () => {
    vi.mocked(fetchWithClient).mockResolvedValueOnce({
      success: true,
      data: [{ codigoCargo: 1, nomeCargo: "Cargo" }],
    } as never);

    const response = await fetchCargosBaseAction();

    expect(fetchWithClient).toHaveBeenCalledWith(
      "/gestao/cargos-eol/",
      {},
      "Erro ao buscar as insubsistencias",
    );
    expect(response).toEqual({
      success: true,
      data: [{ codigoCargo: 1, nomeCargo: "Cargo" }],
    });
  });

  it("busca cargo base por id com endpoint e fallback corretos", async () => {
    const responseData = {
      id: 9,
      grupamento: "DOCENTES",
      descricao_resumida: "Resumo",
      descricao_completa: "Descrição completa",
      situacao_funcional: "EFETIVO",
      utilizado_para_funcoes: true,
      utilizado_para_designacoes: false,
      utilizado_para_ste: false,
      utilizado_para_permutas: false,
      cargo_base_ficticio: false,
      status: "ATIVO",
    };

    vi.mocked(fetchWithClient).mockResolvedValueOnce({
      success: true,
      data: responseData,
    } as never);

    const response = await fetchCargosBaseActionByIdAction(9);

    expect(fetchWithClient).toHaveBeenCalledWith(
      "/gestao/cargos-base/9/",
      {},
      "Erro ao buscar o cargo base",
    );
    expect(response).toEqual({
      success: true,
      data: responseData,
    });
  });
});
