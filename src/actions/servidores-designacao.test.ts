import { describe, it, expect, beforeEach, vi } from "vitest";
import axios from "axios";
import { cookies } from "next/headers";
import { getServidorDesignacaoAction } from "./servidores-designacao";
import { BuscaServidorDesignacaoResponse } from "@/types/busca-servidor-designacao";

vi.mock("axios");
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

const makeCookieStore = (token?: string) => ({
  get: vi.fn().mockReturnValue(token ? { value: token } : undefined),
});

const sampleRequest = { rf: "123", nome_do_servidor: "Servidor Teste" };

const sampleResponse: BuscaServidorDesignacaoResponse = {
  servidor: "Servidor Teste",
  rf: "123",
  vinculo: "Ativo",
  lotacao: "Escola X",
  cargo_base: "Professor",
  aulas_atribuidas: "20",
  funcao: "Docente",
  cargo_sobreposto: "Nenhum",
  cursos_titulos: "Licenciatura",
  estagio_probatorio: "Sim",
  aprovado_em_concurso: "Sim",
  laudo_medico: "Não",
};

describe("getServidorDesignacaoAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna erro quando não há token", async () => {
    vi.mocked(cookies).mockResolvedValue(makeCookieStore(undefined));

    const result = await getServidorDesignacaoAction(sampleRequest);

    expect(result).toEqual({
      success: false,
      error: "Usuário não autenticado",
    });
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("faz requisição com token e retorna dados em caso de sucesso", async () => {
    vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
    vi.mocked(axios.get).mockResolvedValue({ data: sampleResponse });

    const result = await getServidorDesignacaoAction(sampleRequest);

    expect(axios.get).toHaveBeenCalledWith(
      "http://localhost:4000//servidorDesignacao/?rf=123&nome_do_servidor=Servidor Teste",
      {
        headers: {
          Authorization: "Bearer token-123",
        },
      }
    );
    expect(result).toEqual({ success: true, data: sampleResponse });
  });

  it("retorna mensagem específica para status 401", async () => {
    vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
    vi.mocked(axios.get).mockRejectedValue({ response: { status: 401 } });

    const result = await getServidorDesignacaoAction(sampleRequest);

    expect(result).toEqual({
      success: false,
      error: "Não autorizado. Faça login novamente.",
    });
  });

  it("prioriza mensagem vinda de detail quando presente", async () => {
    vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
    vi.mocked(axios.get).mockRejectedValue({
      response: { data: { detail: "Erro específico" } },
      message: "Erro genérico",
    });

    const result = await getServidorDesignacaoAction(sampleRequest);

    expect(result).toEqual({ success: false, error: "Erro específico" });
  });
});

