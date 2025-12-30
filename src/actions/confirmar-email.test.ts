import {
    describe,
    it,
    expect,
    beforeEach,
    afterAll,
    vi,
    type Mock,
} from "vitest";
import { confirmarEmailAction } from "./confirmar-email";
import axios from "axios";
import { cookies } from "next/headers";
import type { ConfirmarEmailRequest } from "@/types/confirmar-email";

vi.mock("axios");
vi.mock("next/headers", () => ({
    cookies: vi.fn(),
}));

const axiosPutMock = axios.put as Mock;
const cookiesMock = cookies as Mock;

describe("confirmarEmailAction", () => {
    const originalEnv = process.env;
    const dados: ConfirmarEmailRequest = { code: "token" };
    const mockAuthToken = "mock-auth-token";

    beforeEach(() => {
        vi.resetAllMocks();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it("deve retornar sucesso quando o email for confirmado", async () => {
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
        cookiesMock.mockReturnValue({
            get: vi.fn().mockReturnValue({ value: mockAuthToken }),
        });
        axiosPutMock.mockResolvedValueOnce({
            data: { email: "novo@exemplo.com" },
        });

        const result = await confirmarEmailAction(dados);

        expect(axiosPutMock).toHaveBeenCalledWith(
            "https://api.exemplo.com/alteracao-email/validar/token/",
            null,
            {
                headers: {
                    Authorization: `Bearer ${mockAuthToken}`,
                },
            }
        );

        expect(result).toEqual({ success: true, new_mail: "novo@exemplo.com" });
    });

    it("deve retornar erro se o token de autenticação não for encontrado", async () => {
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
        cookiesMock.mockReturnValue({
            get: vi.fn().mockReturnValue(undefined),
        });

        const result = await confirmarEmailAction(dados);
        expect(axiosPutMock).not.toHaveBeenCalled();
        expect(result).toEqual({
            success: false,
            error: "Usuário não autenticado. Token não encontrado.",
        });
    });

    it("deve retornar erro 401 para sessão expirada", async () => {
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
        cookiesMock.mockReturnValue({
            get: vi.fn().mockReturnValue({ value: mockAuthToken }),
        });
        axiosPutMock.mockRejectedValueOnce({ response: { status: 401 } });

        const result = await confirmarEmailAction(dados);

        expect(result).toEqual({
            success: false,
            error: "Sua sessão expirou. Por favor, faça login novamente.",
            field: undefined,
        });
    });

    it("deve retornar erro 500 para erro interno do servidor", async () => {
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
        cookiesMock.mockReturnValue({
            get: vi.fn().mockReturnValue({ value: mockAuthToken }),
        });
        axiosPutMock.mockRejectedValueOnce({ response: { status: 500 } });

        const result = await confirmarEmailAction(dados);

        expect(result).toEqual({
            success: false,
            error: "Erro interno no servidor. Tente novamente mais tarde.",
            field: undefined,
        });
    });

    it("deve retornar erro com detail da API", async () => {
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
        cookiesMock.mockReturnValue({
            get: vi.fn().mockReturnValue({ value: mockAuthToken }),
        });
        axiosPutMock.mockRejectedValueOnce({
            response: { data: { detail: "Token inválido" } },
        });

        const result = await confirmarEmailAction(dados);

        expect(result).toEqual({
            success: false,
            error: "Token inválido",
            field: undefined,
        });
    });

    it("deve retornar erro com message genérica", async () => {
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
        cookiesMock.mockReturnValue({
            get: vi.fn().mockReturnValue({ value: mockAuthToken }),
        });
        axiosPutMock.mockRejectedValueOnce({ message: "Erro desconhecido" });

        const result = await confirmarEmailAction(dados);

        expect(result).toEqual({ success: false, error: "Erro desconhecido" });
    });

    it("deve retornar field quando a API envia o campo que causou erro", async () => {
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
        cookiesMock.mockReturnValue({
            get: vi.fn().mockReturnValue({ value: mockAuthToken }),
        });
        axiosPutMock.mockRejectedValueOnce({
            response: { data: { detail: "Código inválido", field: "code" } },
        });

        const result = await confirmarEmailAction(dados);

        expect(result).toEqual({
            success: false,
            error: "Código inválido",
            field: "code",
        });
    });
});
