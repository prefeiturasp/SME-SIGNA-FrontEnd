import { beforeEach, describe, expect, it, vi } from "vitest";
import { criarCargosBaseAction, fetchCargosBaseAction } from "./cargos-base";
import { postWithAuth } from "@/lib/serverRequest";
import { fetchWithClient } from "./http";

vi.mock("@/lib/serverRequest", () => ({
  postWithAuth: vi.fn(),
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
      utilizado_para_outros: false,
      utilizado_para_ste: false,
      utilizado_para_permutas: false,
      cargo_base_ficticio: false,
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
});
