import { beforeEach, describe, expect, it, vi } from "vitest";
import { filterFormSchemaTextosPortariaData } from "@/components/dashboard/Gestao/FiltroDeTextosPortaria/filterFormSchemaTextosPortaria";
import { FormSchemaCriarTextosPortariaData } from "@/components/dashboard/Gestao/FormCriarTextosPortaria/FormSchemaCriarTextosPortaria";
import { TextosDePortariasPaginada, TextosDePortariasResponse, Variavel } from "@/types/gestao";
import { fetchWithClient } from "./http";
import { postWithAuth } from "@/lib/serverRequest";
import {
  cadastrarTextosPortariaAction,
  fetchTextoPortariaByIdAction,
  fetchTextosPortaria,
  fetchVariavelAction,
} from "./textos-portaria";

vi.mock("./http", () => ({
  fetchWithClient: vi.fn(),
}));

vi.mock("@/lib/serverRequest", () => ({
  postWithAuth: vi.fn(),
}));

const filtros: filterFormSchemaTextosPortariaData = {
  tipo_portaria: "Portaria",
  nome_modelo: "Modelo 1",
  status: "ATIVO",
};

const resultado: TextosDePortariasPaginada = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

const payloadCadastro: FormSchemaCriarTextosPortariaData = {
  tipo_portaria: "DESIGNACAO",
  nome_modelo: "Modelo 1",
  status: "ATIVO",
  texto_portaria: "Texto [[NOME_SERVIDOR]]",
  variaveis: ["NOME_SERVIDOR"],
  tipo_cargo: "CARGO_VAGO",
  tipo_ato_pai: "DESIGNACAO",
  observacoes: "Obs",
};

const textoPorId: TextosDePortariasResponse = {
  id: 9,
  tipo_ato_pai: "DESIGNACAO",
  tipo_portaria: "INSUBSISTENCIA",
  nome_modelo: "Modelo 1",
  status: "ATIVO",
  criado_em: "2026-06-11T08:05:00",
  atualizado_em: "2026-06-11T10:00:00",
  texto_portaria: "Texto",
  variaveis: ["NOME_SERVIDOR"],
  tipo_cargo: "CARGO_VAGO",
  observacoes: "Obs",
};

const variaveis: Variavel[] = [
  { value: "NOME_SERVIDOR", display_name: "Nome do servidor" },
  { value: "PORTARIA", display_name: "Portaria" },
];

describe("actions/textos-portaria", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("busca textos de portaria com página informada", async () => {
    vi.mocked(fetchWithClient<TextosDePortariasPaginada>).mockResolvedValue({
      success: true,
      data: resultado,
    });

    const response = await fetchTextosPortaria(filtros, 3);

    expect(fetchWithClient).toHaveBeenCalledWith(
      "/gestao/modelos-portaria/",
      { ...filtros, page: 3 },
      "Erro ao buscar os textos de portaria",
    );
    expect(response).toEqual({
      success: true,
      data: resultado,
    });
  });

  it("usa página 1 quando página não é informada", async () => {
    vi.mocked(fetchWithClient<TextosDePortariasPaginada>).mockResolvedValue({
      success: true,
      data: resultado,
    });

    await fetchTextosPortaria(filtros);

    expect(fetchWithClient).toHaveBeenCalledWith(
      "/gestao/modelos-portaria/",
      { ...filtros, page: 1 },
      "Erro ao buscar os textos de portaria",
    );
  });

  it("cadastra texto de portaria com endpoint e mensagem corretos", async () => {
    vi.mocked(postWithAuth).mockResolvedValueOnce({
      success: true,
      data: { id: 1 },
    } as never);

    const response = await cadastrarTextosPortariaAction(payloadCadastro);

    expect(postWithAuth).toHaveBeenCalledWith(
      "/gestao/modelos-portaria/",
      payloadCadastro,
      "Erro ao cadastrar o texto de portaria",
    );
    expect(response).toEqual({ success: true, data: { id: 1 } });
  });

  it("busca variáveis com endpoint e mensagem corretos", async () => {
    vi.mocked(fetchWithClient<Variavel[]>).mockResolvedValueOnce({
      success: true,
      data: variaveis,
    });

    const response = await fetchVariavelAction();

    expect(fetchWithClient).toHaveBeenCalledWith(
      "/gestao/modelos-portaria/variaveis/",
      {},
      "Erro ao buscar as variáveis",
    );
    expect(response).toEqual({
      success: true,
      data: variaveis,
    });
  });

  it("busca texto de portaria por id com endpoint e mensagem corretos", async () => {
    vi.mocked(fetchWithClient<TextosDePortariasResponse>).mockResolvedValueOnce({
      success: true,
      data: textoPorId,
    });

    const response = await fetchTextoPortariaByIdAction(9);

    expect(fetchWithClient).toHaveBeenCalledWith(
      "/gestao/modelos-portaria/9/",
      {},
      "Erro ao buscar o cargo base",
    );
    expect(response).toEqual({
      success: true,
      data: textoPorId,
    });
  });
});
