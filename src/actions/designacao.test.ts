import { describe, it, expect, beforeEach, vi } from "vitest";
import { cookies } from "next/headers";
import {
    fetchAtosAdministrativos,
    fetchPortariasDO,
} from "./designacao";
import {
    AtosAdministrativosFiltros,
    AtosAdministrativosPaginada,
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

const samplePortariasFiltros: PortariasDOFiltros = {
    portaria_inicial: "100",
    portaria_final: "200",
    ano: "2026",
};

const samplePortariasResponse: ListagemPortariasResponse[] = [
    {
        id: 1,
        portaria: "100",
        doc: "DOC-1",
        tipo_de_ato: "DESIGNACAO_CESSACAO",
        nome: "Servidor Teste",
        cargo: "Diretor",

        data_designacao: "2026-01-15",
        data_cessacao: "",
        numero_sei: "SEI-100",
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

const sampleAtosFiltros: AtosAdministrativosFiltros = {
    numero_sei: "SEI-2026-1",
    portaria_inicial: "10",
    portaria_final: "20",
    ano: "2026",
    tipo: "DESIGNACAO",
    page: 2,
};

const sampleAtosResponse: AtosAdministrativosPaginada = {
    count: 1,
    next: null,
    previous: null,
    results: [
        {
            id: 77,
            ano_vigente: "2026",
            criado_em: "2026-06-01T12:00:00.000Z",
            nome: "Servidor Teste",
            numero_sei: "SEI-2026-1",
            observacoes: null,
            portaria: "123/2026",
            status_publicacao: "PUBLICADO",
            tipo: "DESIGNACAO",
            tipo_de_ato: "Designação",
        },
    ],
};

describe("fetchAtosAdministrativos", () => {
    const mockAxiosInstance = { get: vi.fn() };

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
        vi.mocked(getApiClient).mockResolvedValue(mockAxiosInstance as any);
    });

    it("retorna erro quando getApiClient retorna null", async () => {
        vi.mocked(getApiClient).mockResolvedValue(null);

        const result = await fetchAtosAdministrativos(sampleAtosFiltros);

        expect(result).toEqual({ success: false, error: "Usuário não autenticado" });
        expect(mockAxiosInstance.get).not.toHaveBeenCalled();
    });

    it("retorna dados em caso de sucesso", async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: sampleAtosResponse });

        const result = await fetchAtosAdministrativos(sampleAtosFiltros);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
            "/designacao/atos-administrativos/",
            {
                params: {
                    numero_sei: "SEI-2026-1",
                    portaria_inicial: "10",
                    portaria_final: "20",
                    ano: "2026",
                    tipo: "DESIGNACAO",
                    page: 2,
                },
            }
        );
        expect(result).toEqual({ success: true, data: sampleAtosResponse });
    });

    it("filtra parâmetros vazios e undefined antes de enviar", async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: sampleAtosResponse });

        const filtrosComVazios: AtosAdministrativosFiltros = {
            numero_sei: "",
            portaria_inicial: "10",
            portaria_final: undefined,
            ano: "2026",
            tipo: "",
            page: 1,
        };

        await fetchAtosAdministrativos(filtrosComVazios);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
            "/designacao/atos-administrativos/",
            { params: { portaria_inicial: "10", ano: "2026", page: 1 } }
        );
    });

    it("retorna mensagem de erro tratada quando a requisição falha", async () => {
        mockAxiosInstance.get.mockRejectedValue({
            isAxiosError: true,
            response: { status: 400 },
        });

        const result = await fetchAtosAdministrativos(sampleAtosFiltros);

        expect(result).toEqual({
            success: false,
            error: "Erro ao buscar os atos administrativos",
        });
    });
});