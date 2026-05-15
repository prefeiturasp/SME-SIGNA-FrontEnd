import { describe, it, expect, beforeEach, vi } from "vitest";
import { cookies } from "next/headers";
import {
    fetchDesignacoesAction,
    fetchDesignacoesSemPaginacaoAction,
    fetchPortariasDO,
} from "./designacao";
import {
    DesignacaoFiltros,
    DesignacaoPaginada,
    ListagemPortariasResponse,
    PortariasDOFiltros,
} from "@/types/designacao";
import { getApiClient } from "@/lib/api";

// Mocks de dependências externas
vi.mock("next/headers", () => ({
    cookies: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
    getApiClient: vi.fn(),
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
    // Criamos um mock para a instância do Axios que o getApiClient retorna
    const mockAxiosInstance = {
        get: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";

        // Por padrão, o getApiClient retorna nossa instância mockada
        vi.mocked(getApiClient).mockResolvedValue(mockAxiosInstance as any);
    });

    it("retorna erro quando não há token (getApiClient retorna null)", async () => {
        vi.mocked(getApiClient).mockResolvedValue(null);
        vi.mocked(cookies).mockResolvedValue(makeCookieStore(undefined));

        const result = await fetchDesignacoesAction(sampleFiltros);

        expect(result).toEqual({
            success: false,
            error: "Usuário não autenticado",
        });
        expect(mockAxiosInstance.get).not.toHaveBeenCalled();
    });

    it("faz requisição com token e retorna dados em caso de sucesso", async () => {
        vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
        mockAxiosInstance.get.mockResolvedValue({ data: sampleResponse });

        const result = await fetchDesignacoesAction(sampleFiltros);

        // Note que agora validamos o caminho relativo, pois a baseURL está no client
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
            "/designacao/designacoes/",
            {
                params: { rf: "123456", nome: "Servidor Teste", page: 1, page_size: 10 },
            }
        );
        expect(result).toEqual({ success: true, data: sampleResponse });
    });

    it("filtra parâmetros vazios, undefined e null antes de enviar", async () => {
        vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
        mockAxiosInstance.get.mockResolvedValue({ data: sampleResponse });

        const filtrosComVazios: DesignacaoFiltros = {
            rf: "123456",
            nome: "",
            cargo_base: undefined,
            dre: null as unknown as undefined,
            page: 1,
        };

        await fetchDesignacoesAction(filtrosComVazios);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
            "/designacao/designacoes/",
            {
                params: { rf: "123456", page: 1 },
            }
        );
    });

    it("retorna mensagem específica para status 401", async () => {
        vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
        mockAxiosInstance.get.mockRejectedValue({
            isAxiosError: true,
            response: { status: 401 }
        });

        const result = await fetchDesignacoesAction(sampleFiltros);

        expect(result).toEqual({
            success: false,
            error: "Não autorizado. Faça login novamente.",
        });
    });

    it("retorna mensagem específica para status 400", async () => {
        vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
        mockAxiosInstance.get.mockRejectedValue({
            isAxiosError: true,
            response: { status: 400 }
        });

        const result = await fetchDesignacoesAction(sampleFiltros);

        expect(result).toEqual({
            success: false,
            error: "Erro ao buscar as designações", // defaultMessage passada no handleApiError
        });
    });

    it("retorna mensagem específica para status 500", async () => {
        vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
        mockAxiosInstance.get.mockRejectedValue({
            isAxiosError: true,
            response: { status: 500 }
        });

        const result = await fetchDesignacoesAction(sampleFiltros);

        expect(result).toEqual({
            success: false,
            error: "Erro interno no servidor",
        });
    });

    it("prioriza mensagem vinda de detail quando presente", async () => {
        vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
        mockAxiosInstance.get.mockRejectedValue({
            isAxiosError: true,
            response: { data: { detail: "Erro específico" } },
            message: "Erro genérico",
        });

        const result = await fetchDesignacoesAction(sampleFiltros);

        expect(result).toEqual({ success: false, error: "Erro específico" });
    });

    it("retorna mensagem do erro quando disponível e sem detail", async () => {
        vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
        mockAxiosInstance.get.mockRejectedValue({
            isAxiosError: true,
            message: "Falha inesperada"
        });

        const result = await fetchDesignacoesAction(sampleFiltros);

        expect(result).toEqual({
            success: false,
            error: "Falha inesperada",
        });
    });

    it("retorna mensagem padrão quando não há detalhes do erro", async () => {
        vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
        mockAxiosInstance.get.mockRejectedValue({
            isAxiosError: true,
            message: ""
        });

        const result = await fetchDesignacoesAction(sampleFiltros);

        expect(result).toEqual({
            success: false,
            error: "Erro inesperado", // Fallback final do handleApiError
        });
    });

    it("retorna detail para status não mapeado com detail presente", async () => {
        vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
        mockAxiosInstance.get.mockRejectedValue({
            isAxiosError: true,
            response: { status: 503, data: { detail: "Serviço indisponível" } },
            message: "Erro genérico",
        });

        const result = await fetchDesignacoesAction(sampleFiltros);

        expect(result).toEqual({ success: false, error: "Serviço indisponível" });
    });

    it("busca designações sem paginação com o mesmo endpoint", async () => {
        vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
        const semPaginacao = sampleResponse.results;
        mockAxiosInstance.get.mockResolvedValue({ data: semPaginacao });

        const result = await fetchDesignacoesSemPaginacaoAction(sampleFiltros);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
            "/designacao/designacoes/",
            {
                params: { rf: "123456", nome: "Servidor Teste", page: 1, page_size: 10 },
            }
        );
        expect(result).toEqual({ success: true, data: semPaginacao });
    });
});

const samplePortariasFiltros: PortariasDOFiltros = {
    portaria_inicial: "100",
    portaria_final: "200",
    ano: "2026",
};

const samplePortariasResponse: ListagemPortariasResponse[] = [
    {
        id: 1,
        portaria_designacao: "100",
        doc: "DOC-1",
        tipo_ato: "DESIGNACAO_CESSACAO",
        titular_nome_servidor: "Servidor Teste",
        cargo_vaga_display: "Diretor",
        do: "DO-001",
        data_designacao: "2026-01-15",
        data_cessacao: "",
        sei_numero: "SEI-100",
    },
];

describe("fetchPortariasDO", () => {
    const mockAxiosInstance = { get: vi.fn() };

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
        vi.mocked(getApiClient).mockResolvedValue(mockAxiosInstance as any);
    });

    it("retorna erro quando getApiClient retorna null", async () => {
        vi.mocked(getApiClient).mockResolvedValue(null);

        const result = await fetchPortariasDO(samplePortariasFiltros);

        expect(result).toEqual({ success: false, error: "Usuário não autenticado" });
        expect(mockAxiosInstance.get).not.toHaveBeenCalled();
    });

    it("retorna dados em caso de sucesso", async () => {
        vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
        mockAxiosInstance.get.mockResolvedValue({ data: samplePortariasResponse });

        const result = await fetchPortariasDO(samplePortariasFiltros);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
            "/designacao/portarias/",
            { params: { portaria_inicial: "100", portaria_final: "200", ano: "2026" } }
        );
        expect(result).toEqual({ success: true, data: samplePortariasResponse });
    });

    it("filtra parâmetros vazios e undefined antes de enviar", async () => {
        vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
        mockAxiosInstance.get.mockResolvedValue({ data: [] });

        const filtrosComVazios: PortariasDOFiltros = {
            numero_sei: "",
            portaria_inicial: "100",
            portaria_final: undefined,
            ano: "2026",
        };

        await fetchPortariasDO(filtrosComVazios);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
            "/designacao/portarias/",
            { params: { portaria_inicial: "100", ano: "2026" } }
        );
    });

    it("retorna erro tratado quando a requisição falha", async () => {
        vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
        mockAxiosInstance.get.mockRejectedValue({
            isAxiosError: true,
            response: { status: 500 },
        });

        const result = await fetchPortariasDO(samplePortariasFiltros);

        expect(result).toEqual({ success: false, error: "Erro interno no servidor" });
    });

    it("retorna mensagem de detail quando presente no erro", async () => {
        vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
        mockAxiosInstance.get.mockRejectedValue({
            isAxiosError: true,
            response: { data: { detail: "Portaria não encontrada" } },
        });

        const result = await fetchPortariasDO(samplePortariasFiltros);

        expect(result).toEqual({ success: false, error: "Portaria não encontrada" });
    });
});