import {
    describe,
    it,
    expect,
    beforeEach,
    vi,
    afterAll,
    type Mock,
} from "vitest";
import { getMeAction } from "@/actions/me";
import axios, { AxiosError, AxiosHeaders } from "axios";
import { cookies } from "next/headers";
import { User } from "@/stores/useUserStore";

vi.mock("axios");
vi.mock("next/headers", () => ({
    cookies: vi.fn(),
}));

const axiosGetMock = axios.get as Mock;
const cookiesMock = cookies as Mock;

describe.skip("getMeAction", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetAllMocks();
        process.env = { ...originalEnv };
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it("deve retornar os dados do usuário quando a requisição for bem-sucedida", async () => {
        const fakeUser: User = {
            username: "fulano.tal",
            name: "Fulano de Tal",
            email: "fulano@example.com",
            cpf: "123.456.789-00",
            rede: "SME",
            is_core_sso: true,
            is_validado: true,
            perfil_acesso: {
                codigo: 1,
                nome: "Admin",
            },
            unidades: [
                {
                    ue: {
                        codigo_eol: "123456",
                        nome: "ESCOLA MUNICIPAL DE ENSINO FUNDAMENTAL TESTE",
                        sigla: "EMEF TESTE",
                    },
                    dre: {
                        codigo_eol: "108100",
                        nome: "DIRETORIA REGIONAL DE EDUCACAO BUTANTA",
                        sigla: "DRE-BT",
                    },
                },
            ],
        };

        const getMock = vi.fn().mockReturnValue({ value: "fake-auth-token" });
        cookiesMock.mockReturnValue({ get: getMock });

        axiosGetMock.mockResolvedValueOnce({ data: fakeUser });

        const result = await getMeAction();

        expect(axiosGetMock).toHaveBeenCalledWith(
            "https://api.exemplo.com/usuario/me",
            {
                headers: {
                    Authorization: "Bearer fake-auth-token",
                },
            }
        );

        expect(result).toEqual({ success: true, data: fakeUser });
    });

    it("deve retornar erro se o token de autenticação não for encontrado", async () => {
        const getMock = vi.fn().mockReturnValue(undefined);
        cookiesMock.mockReturnValue({ get: getMock });

        const result = await getMeAction();

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

        const result = await getMeAction();

        expect(result).toEqual({
            success: false,
            error: "Erro ao buscar os dados do usuário",
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

        const result = await getMeAction();

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

        const result = await getMeAction();

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

        const result = await getMeAction();

        expect(result).toEqual({
            success: false,
            error: "Mensagem customizada do erro",
        });
    });

    it("deve deletar o cookie se o token for inválido (token_not_valid)", async () => {
        const deleteMock = vi.fn();
        const getMock = vi.fn().mockReturnValue({ value: "fake-auth-token" });

        const cookieStoreMock = { get: getMock, delete: deleteMock };
        cookiesMock.mockReturnValue(cookieStoreMock);

        vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

        const axiosError = new AxiosError("Token inválido");
        axiosError.response = {
            status: 401,
            data: { code: "token_not_valid" },
            statusText: "Unauthorized",
            headers: {},
            config: { headers: new AxiosHeaders() },
        };
        axiosGetMock.mockRejectedValueOnce(axiosError);

        await getMeAction();

        expect(cookiesMock).toHaveBeenCalledTimes(2);
        expect(deleteMock).toHaveBeenCalledWith("auth_token");
    });

    it("deve deletar o cookie se o status for 401", async () => {
        const deleteMock = vi.fn();
        const getMock = vi.fn().mockReturnValue({ value: "fake-auth-token" });

        const cookieStoreMock = { get: getMock, delete: deleteMock };
        cookiesMock.mockReturnValue(cookieStoreMock);

        vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

        const axiosError = new AxiosError("Não autorizado");
        axiosError.response = {
            status: 401,
            data: {},
            statusText: "Unauthorized",
            headers: {},
            config: { headers: new AxiosHeaders() },
        };
        axiosGetMock.mockRejectedValueOnce(axiosError);

        await getMeAction();

        expect(cookiesMock).toHaveBeenCalledTimes(2);
        expect(deleteMock).toHaveBeenCalledWith("auth_token");
    });
});
