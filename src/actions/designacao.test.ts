import { describe, it, expect, beforeEach, vi } from "vitest";
import axios from "axios";
import { cookies } from "next/headers";
import { fetchDesignacoesAction } from "./designacao";
import { DesignacaoFiltros, DesignacaoPaginada } from "@/types/designacao";

vi.mock("axios");
vi.mock("next/headers", () => ({
    cookies: vi.fn(),
}));

type CookieStore = Awaited<ReturnType<typeof cookies>>;

const makeCookieStore = (token?: string): CookieStore =>
({
    get: vi.fn().mockReturnValue(token ? { value: token } : undefined),
} as unknown as CookieStore);

const sampleFiltros: DesignacaoFiltros = {
    rf: "123456",
    nome: "Servidor Teste",
    page: 1,
    page_size: 10,
};

const sampleResponse: DesignacaoPaginada = {
    count: 1,
    next: null,
    previous: null,
    results: [
        {
            id: 1,
            dre_nome: "DRE Centro",
            unidade_proponente: "Escola Alpha",
            indicado_nome_servidor: "Servidor Teste",
            indicado_rf: "123456",
            titular_nome_servidor: "Titular Teste",
            titular_rf: "654321",
            numero_portaria: "001",
            ano_vigente: "2025",
            sei_numero: "SEI-001",
            data_inicio: "2025-01-01",
            data_fim: null,
            tipo_vaga: "vago",
            tipo_vaga_display: "Vago",
            cargo_vaga: null,
            cargo_vaga_display: "Diretor",
            status: 0,
        },
    ],
};

describe("fetchDesignacoesAction", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
    });

    it("retorna erro quando não há token", async () => {
        vi.mocked(cookies).mockResolvedValue(makeCookieStore(undefined));

        const result = await fetchDesignacoesAction(sampleFiltros);

        expect(result).toEqual({
            success: false,
            error: "Usuário não autenticado",
        });
        expect(axios.get).not.toHaveBeenCalled();
    });

    it("faz requisição com token e retorna dados em caso de sucesso", async () => {
        vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
        vi.mocked(axios.get).mockResolvedValue({ data: sampleResponse });

        const result = await fetchDesignacoesAction(sampleFiltros);

        expect(axios.get).toHaveBeenCalledWith(
            "https://api.exemplo.com/designacao/designacoes/",
            {
                params: { rf: "123456", nome: "Servidor Teste", page: 1, page_size: 10 },
                headers: {
                    Authorization: "Bearer token-123",
                },
            }
        );
        expect(result).toEqual({ success: true, data: sampleResponse });
    });

    it("filtra parâmetros vazios, undefined e null antes de enviar", async () => {
        vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
        vi.mocked(axios.get).mockResolvedValue({ data: sampleResponse });

        const filtrosComVazios: DesignacaoFiltros = {
            rf: "123456",
            nome: "",
            cargo_base: undefined,
            dre: null as unknown as undefined,
            page: 1,
        };

        await fetchDesignacoesAction(filtrosComVazios);

        expect(axios.get).toHaveBeenCalledWith(
            "https://api.exemplo.com/designacao/designacoes/",
            {
                params: { rf: "123456", page: 1 },
                headers: { Authorization: "Bearer token-123" },
            }
        );
    });

    it("retorna mensagem específica para status 401", async () => {
        vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
        vi.mocked(axios.get).mockRejectedValue({ response: { status: 401 } });

        const result = await fetchDesignacoesAction(sampleFiltros);

        expect(result).toEqual({
            success: false,
            error: "Não autorizado. Faça login novamente.",
        });
    });

    it("retorna mensagem específica para status 400", async () => {
        vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
        vi.mocked(axios.get).mockRejectedValue({ response: { status: 400 } });

        const result = await fetchDesignacoesAction(sampleFiltros);

        expect(result).toEqual({
            success: false,
            error: "Parâmetros inválidos",
        });
    });

    it("retorna mensagem específica para status 500", async () => {
        vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
        vi.mocked(axios.get).mockRejectedValue({ response: { status: 500 } });

        const result = await fetchDesignacoesAction(sampleFiltros);

        expect(result).toEqual({
            success: false,
            error: "Erro interno no servidor",
        });
    });

    it("prioriza mensagem vinda de detail quando presente", async () => {
        vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
        vi.mocked(axios.get).mockRejectedValue({
            response: { data: { detail: "Erro específico" } },
            message: "Erro genérico",
        });

        const result = await fetchDesignacoesAction(sampleFiltros);

        expect(result).toEqual({ success: false, error: "Erro específico" });
    });

    it("retorna mensagem do erro quando disponível e sem detail", async () => {
        vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
        vi.mocked(axios.get).mockRejectedValue({ message: "Falha inesperada" });

        const result = await fetchDesignacoesAction(sampleFiltros);

        expect(result).toEqual({
            success: false,
            error: "Falha inesperada",
        });
    });

    it("retorna mensagem padrão quando não há detalhes do erro", async () => {
        vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
        vi.mocked(axios.get).mockRejectedValue({});

        const result = await fetchDesignacoesAction(sampleFiltros);

        expect(result).toEqual({
            success: false,
            error: "Erro ao buscar as designações",
        });
    });

    it("retorna detail para status não mapeado com detail presente", async () => {
        vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
        vi.mocked(axios.get).mockRejectedValue({
            response: { status: 503, data: { detail: "Serviço indisponível" } },
            message: "Erro genérico",
        });

        const result = await fetchDesignacoesAction(sampleFiltros);

        expect(result).toEqual({ success: false, error: "Serviço indisponível" });
    });
});