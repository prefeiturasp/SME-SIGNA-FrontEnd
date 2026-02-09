import {
    describe,
    it,
    expect,
    beforeEach,
    vi,
    afterAll,
    type Mock,
} from "vitest";
import { getCursosETitulosAction } from "@/actions/cursos-e-titulos";
import axios, { AxiosError, AxiosHeaders } from "axios";
import { cookies } from "next/headers";
import { IConcursoType } from "@/types/cursos-e-titulos";

vi.mock("axios");
vi.mock("next/headers", () => ({
    cookies: vi.fn(),
}));

const axiosGetMock = axios.get as Mock;
const cookiesMock = cookies as Mock;

describe("getCursosETitulosAction", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetAllMocks();
        process.env = { ...originalEnv };
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it("deve retornar os dados dos cursos e títulos quando a requisição for bem-sucedida", async () => {
        const fakeCursosETitulos: IConcursoType = {
            id: 1,
            concurso: "201002757777 - PROF ENS FUND II MEDIO",
        };

        const getMock = vi.fn().mockReturnValue({ value: "fake-auth-token" });
        cookiesMock.mockReturnValue({ get: getMock });

        axiosGetMock.mockResolvedValueOnce({ data: fakeCursosETitulos });

        const result = await getCursosETitulosAction();

        expect(axiosGetMock).toHaveBeenCalledWith(
            "https://api.exemplo.com/cursos-e-titulos",
            {
                headers: {
                    Authorization: "Bearer fake-auth-token",
                },
            }
        );

        expect(result).toEqual({ success: true, data: fakeCursosETitulos });
    });

    it("deve retornar erro se o token de autenticação não for encontrado", async () => {
        const getMock = vi.fn().mockReturnValue(undefined);
        cookiesMock.mockReturnValue({ get: getMock });

        const result = await getCursosETitulosAction();

        expect(axiosGetMock).not.toHaveBeenCalled();
        expect(result).toEqual({
            success: false,
            error: "Usuário não autenticado. Token não encontrado.",
        });
    });

    it("deve retornar erro se a chamada à API falhar", async () => {
        const getMock = vi.fn().mockReturnValue({ value: "fake-auth-token" });
        cookiesMock.mockReturnValue({ get: getMock });

        const axiosError = new AxiosError("Mensagem de erro da API");
        axiosGetMock.mockRejectedValueOnce(axiosError);

        const result = await getCursosETitulosAction();

        expect(result).toEqual({
            success: false,
            error: "Erro ao buscar os cursos e títulos",
        });
    });

    it("deve retornar 'Erro interno no servidor' para status 500", async () => {
        const getMock = vi.fn().mockReturnValue({ value: "fake-auth-token" });
        cookiesMock.mockReturnValue({ get: getMock });

        const axiosError = new AxiosError("Erro de servidor");
        axiosError.response = {
            status: 500,
            data: {},
            statusText: "Internal Server Error",
            headers: {},
            config: { headers: new AxiosHeaders() },
        };
        axiosGetMock.mockRejectedValueOnce(axiosError);

        const result = await getCursosETitulosAction();

        expect(result).toEqual({
            success: false,
            error: "Erro interno no servidor",
        });
    });

    it("deve retornar a mensagem de 'detail' da resposta da API", async () => {
        const getMock = vi.fn().mockReturnValue({ value: "fake-auth-token" });
        cookiesMock.mockReturnValue({ get: getMock });

        const axiosError = new AxiosError("Erro com detalhe");
        axiosError.response = {
            status: 400,
            data: { detail: "Detalhe do erro da API" },
            statusText: "Bad Request",
            headers: {},
            config: { headers: new AxiosHeaders() },
        };
        axiosGetMock.mockRejectedValueOnce(axiosError);

        const result = await getCursosETitulosAction();

        expect(result).toEqual({
            success: false,
            error: "Detalhe do erro da API",
        });
    });

    it("deve retornar a mensagem de 'error.message' quando não há detail nem status 500", async () => {
        const getMock = vi.fn().mockReturnValue({ value: "fake-auth-token" });
        cookiesMock.mockReturnValue({ get: getMock });

        const axiosError = new AxiosError("Mensagem customizada do erro");
        axiosError.response = {
            status: 400,
            data: {},
            statusText: "Bad Request",
            headers: {},
            config: { headers: new AxiosHeaders() },
        };
        Object.defineProperty(axiosError, "message", {
            value: "Mensagem customizada do erro",
            writable: true,
            enumerable: true,
            configurable: true,
        });

        axiosGetMock.mockRejectedValueOnce(axiosError);

        const result = await getCursosETitulosAction();

        expect(result).toEqual({
            success: false,
            error: "Mensagem customizada do erro",
        });
    });

         

    it("deve retornar erro genérico quando o erro não é um AxiosError", async () => {
        const getMock = vi.fn().mockReturnValue({ value: "fake-auth-token" });
        cookiesMock.mockReturnValue({ get: getMock });

        const genericError = new Error("Erro genérico");
        axiosGetMock.mockRejectedValueOnce(genericError);

        const result = await getCursosETitulosAction();

        expect(result).toEqual({
            success: false,
            error: "Erro ao buscar os cursos e títulos",
        });
    });
});

