import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

// ── Mocks ────────────────────────────────────────

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

vi.mock("next/headers", () => ({
    cookies: vi.fn(),
}));

vi.mock("@/utils/designacao/mapearPayload", () => ({
    mapearPayloadDesignacao: vi.fn(() => ({ dre: "dre-1" })),
}));

// ── Helpers ──────────────────────────────────────

const { cookies } = await import("next/headers");
const { designacaoAction } = await import("./cadastro-designacao");

const mockCookies = (token: string | undefined) => {
    vi.mocked(cookies).mockResolvedValue({
        get: (key: string) =>
            key === "auth_token" && token ? { value: token } : undefined,
    } as any);
};

const formDataMock = {
    dre: "dre-1",
    ue: "ue-1",
} as any;

// ── Testes ───────────────────────────────────────

describe("designacaoAction", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    });

    it("retorna erro se formData for null", async () => {
        const result = await designacaoAction(null);

        expect(result).toEqual({
            success: false,
            error: "Dados do formulário ausentes.",
        });
    });

    it("retorna sucesso quando axios.post resolve", async () => {
        mockCookies("token-abc");
        mockedAxios.post.mockResolvedValueOnce({ data: { id: 1 } });

        const result = await designacaoAction(formDataMock);

        expect(result).toEqual({ success: true, data: { id: 1 } });
    });

    it("retorna sucesso quando axios.patch resolve para edição", async () => {
        mockCookies("token-abc");
        mockedAxios.patch.mockResolvedValueOnce({ data: { id: 99 } } as any);

        const result = await designacaoAction(formDataMock, "99");

        expect(result).toEqual({ success: true, data: { id: 99 } });
        expect(mockedAxios.patch).toHaveBeenCalledWith(
            "https://api.example.com/designacao/designacoes/99/",
            { dre: "dre-1" },
            expect.any(Object)
        );
    });

    it("envia Authorization header quando auth_token está presente", async () => {
        mockCookies("meu-token");
        mockedAxios.post.mockResolvedValueOnce({ data: {} });

        await designacaoAction(formDataMock);

        expect(mockedAxios.post).toHaveBeenCalledWith(
            "https://api.example.com/designacao/designacoes/",
            { dre: "dre-1" },
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: "Bearer meu-token",
                }),
            })
        );
    });

    it("não envia Authorization header quando auth_token está ausente", async () => {
        mockCookies(undefined);
        mockedAxios.post.mockResolvedValueOnce({ data: {} });

        await designacaoAction(formDataMock);

        const callHeaders = mockedAxios.post.mock.calls[0][2]?.headers as Record<string, string>;
        expect(callHeaders).not.toHaveProperty("Authorization");
    });

    it("retorna erro 500 com mensagem específica", async () => {
        mockCookies("token");

        const axiosError = {
            isAxiosError: true,
            response: { status: 500, data: {} },
            message: "Request failed",
        };
        mockedAxios.post.mockRejectedValueOnce(axiosError);

        const result = await designacaoAction(formDataMock);

        expect(result).toEqual({
            success: false,
            error: "Erro interno no servidor",
            field: undefined,
        });
    });

    it("retorna mensagem do campo detail quando presente na resposta", async () => {
        mockCookies("token");

        const axiosError = {
            isAxiosError: true,
            response: {
                status: 400,
                data: { detail: "Campo obrigatório ausente." },
            },
            message: "Request failed",
        };
        mockedAxios.post.mockRejectedValueOnce(axiosError);

        const result = await designacaoAction(formDataMock);

        expect(result).toEqual({
            success: false,
            error: "Campo obrigatório ausente.",
            field: undefined,
        });
    });

    it("retorna campo field quando presente na resposta de erro", async () => {
        mockCookies("token");

        const axiosError = {
            isAxiosError: true,
            response: {
                status: 422,
                data: { detail: "Valor inválido.", field: "indicado_rf" },
            },
            message: "Request failed",
        };
        mockedAxios.post.mockRejectedValueOnce(axiosError);

        const result = await designacaoAction(formDataMock);

        expect(result).toEqual({
            success: false,
            error: "Valor inválido.",
            field: "indicado_rf",
        });
    });

    it("usa error.message como fallback quando não há response.data.detail", async () => {
        mockCookies("token");

        const axiosError = {
            isAxiosError: true,
            response: { status: 404, data: {} },
            message: "Network Error",
        };
        mockedAxios.post.mockRejectedValueOnce(axiosError);

        const result = await designacaoAction(formDataMock);

        expect(result).toEqual({
            success: false,
            error: "Network Error",
            field: undefined,
        });
    });

    it("usa mensagem padrão quando não há response nem error.message", async () => {
        mockCookies("token");

        const axiosError = {
            isAxiosError: true,
            response: undefined,
            message: "",
        };
        mockedAxios.post.mockRejectedValueOnce(axiosError);

        const result = await designacaoAction(formDataMock);

        expect(result).toEqual({
            success: false,
            error: "Erro ao salvar designação",
            field: undefined,
        });
    });

    it("chama mapearPayloadDesignacao com o formData recebido", async () => {
        mockCookies("token");
        mockedAxios.post.mockResolvedValueOnce({ data: {} });

        const { mapearPayloadDesignacao } = await import("@/utils/designacao/mapearPayload");

        await designacaoAction(formDataMock);

        expect(mapearPayloadDesignacao).toHaveBeenCalledWith(formDataMock);
    });
});