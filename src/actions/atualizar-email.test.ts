import {
    describe,
    it,
    expect,
    beforeEach,
    afterAll,
    vi,
    type Mock,
} from "vitest";
import { atualizarEmailAction } from "./atualizar-email";
import axios from "axios";
import { cookies } from "next/headers";
import type { AtualizarEmailRequest } from "@/types/atualizar-email";

vi.mock("axios");
vi.mock("next/headers", () => ({
    cookies: vi.fn(),
}));

const axiosPostMock = axios.post as Mock;
const cookiesMock = cookies as Mock;

describe("atualizarEmailAction", () => {
    const originalEnv = process.env;
    const dados: AtualizarEmailRequest = {
        new_email: "novo@exemplo.com.br",
    };
    const mockAuthToken = "mock-auth-token";

    beforeEach(() => {
        vi.resetAllMocks();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it("deve retornar sucesso quando o e-mail for atualizado", async () => {
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
        cookiesMock.mockReturnValue({
            get: vi.fn().mockReturnValue({ value: mockAuthToken }),
        });
        axiosPostMock.mockResolvedValueOnce({});

        const result = await atualizarEmailAction(dados);

        expect(axiosPostMock).toHaveBeenCalledWith(
            "https://api.exemplo.com/alteracao-email/solicitar/",
            dados,
            {
                headers: {
                    Authorization: `Bearer ${mockAuthToken}`,
                },
            }
        );
        expect(result).toEqual({ success: true });
    });

    it("deve retornar erro se o token de autenticação não for encontrado", async () => {
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
        cookiesMock.mockReturnValue({
            get: vi.fn().mockReturnValue(undefined),
        });

        const result = await atualizarEmailAction(dados);
        expect(axiosPostMock).not.toHaveBeenCalled();
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
        axiosPostMock.mockRejectedValueOnce({ response: { status: 401 } });

        const result = await atualizarEmailAction(dados);

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
        axiosPostMock.mockRejectedValueOnce({ response: { status: 500 } });

        const result = await atualizarEmailAction(dados);

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
        axiosPostMock.mockRejectedValueOnce({
            response: { data: { detail: "E-mail já cadastrado" } },
        });

        const result = await atualizarEmailAction(dados);

        expect(result).toEqual({
            success: false,
            error: "E-mail já cadastrado",
            field: undefined,
        });
    });

    it("deve retornar erro com message genérica", async () => {
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
        cookiesMock.mockReturnValue({
            get: vi.fn().mockReturnValue({ value: mockAuthToken }),
        });
        axiosPostMock.mockRejectedValueOnce({ message: "Erro desconhecido" });

        const result = await atualizarEmailAction(dados);

        expect(result).toEqual({ success: false, error: "Erro desconhecido" });
    });

    it("deve retornar field quando a API envia o campo que causou erro", async () => {
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
        cookiesMock.mockReturnValue({
            get: vi.fn().mockReturnValue({ value: mockAuthToken }),
        });
        axiosPostMock.mockRejectedValueOnce({
            response: { data: { detail: "E-mail inválido", field: "email" } },
        });

        const result = await atualizarEmailAction(dados);

        expect(result).toEqual({
            success: false,
            error: "E-mail inválido",
            field: "email",
        });
    });
});
