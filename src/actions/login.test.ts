import {
    describe,
    it,
    expect,
    beforeEach,
    vi,
    afterAll,
    type Mock,
} from "vitest";
import { loginAction } from "@/actions/login";
import axios from "axios";
import { AxiosError, type AxiosResponse } from "axios";

// ✅ mock do axios
vi.mock("axios");

// Mock do cookies() do Next.js
const mockCookieSet = vi.fn();
vi.mock("next/headers", () => ({
    cookies: vi.fn(() => Promise.resolve({
        set: mockCookieSet,
        get: vi.fn(),
        delete: vi.fn(),
    })),
}));

const axiosPostMock = axios.post as Mock;

describe("loginAction", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetAllMocks();
        mockCookieSet.mockClear();
        process.env = { ...originalEnv };
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it("retorna success true quando tem sucesso", async () => {
        axiosPostMock.mockResolvedValueOnce({
            data: { token: "jwt_token_top" },
        });

        const result = await loginAction({
            seu_rf: "fulano",
            senha: "1234",
        });

        // ✅ agora o expect bate com a implementação real
        expect(axiosPostMock).toHaveBeenCalledWith(
            "https://api.exemplo.com/usuario/login",
            {
                username: "fulano",
                password: "1234",
            }
        );

        expect(result).toEqual({ success: true });
    });

    it("retorna erro com a mensagem do servidor se a requisição falhar", async () => {
        const axiosError = new AxiosError("Request failed");
        axiosError.response = {
            status: 401,
            data: {
                detail: "Credenciais inválidas",
            },
            headers: {},
            config: {},
            statusText: "",
        } as AxiosResponse;

        axiosPostMock.mockRejectedValueOnce(axiosError);

        const result = await loginAction({
            seu_rf: "fulano",
            senha: "errado",
        });

        expect(result).toEqual({
            success: false,
            error: "Credenciais inválidas",
        });
    });

    it("retorna erro genérico se não houver mensagem de erro no response", async () => {
        const axiosError = new AxiosError("Erro desconhecido");

        axiosPostMock.mockRejectedValueOnce(axiosError);

        const result = await loginAction({
            seu_rf: "foo",
            senha: "bar",
        });

        expect(result).toEqual({
            success: false,
            error: "Erro na autenticação",
        });
    });

    it("retorna erro específico se status for 500", async () => {
        const axiosError = new AxiosError("Internal Server Error");
        axiosError.response = {
            status: 500,
            data: {},
            headers: {},
            config: {},
            statusText: "Internal Server Error",
        } as AxiosResponse;

        axiosPostMock.mockRejectedValueOnce(axiosError);

        const result = await loginAction({
            seu_rf: "erro",
            senha: "500",
        });

        expect(result).toEqual({
            success: false,
            error: "Erro interno no servidor",
        });
    });

    it("retorna erro com a mensagem genérica do próprio erro", async () => {
        const axiosError = new AxiosError("Mensagem genérica");
        axiosError.message = "Mensagem genérica";
        axiosError.response = {
            status: 418,
            data: {},
            headers: {},
            config: {},
            statusText: "I'm a teapot",
        } as AxiosResponse;

        axiosPostMock.mockRejectedValueOnce(axiosError);

        const result = await loginAction({
            seu_rf: "genérico",
            senha: "123",
        });

        expect(result).toEqual({
            success: false,
            error: "Mensagem genérica",
        });
    });
});
