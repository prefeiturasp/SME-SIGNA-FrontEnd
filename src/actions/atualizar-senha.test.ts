import {
    describe,
    it,
    expect,
    beforeEach,
    afterAll,
    vi,
    type Mock,
} from "vitest";
import { atualizarSenhaAction } from "./atualizar-senha";
import axios from "axios";
import { cookies } from "next/headers";
import type { AtualizarSenhaRequest } from "@/types/atualizar-senha";

vi.mock("axios");
vi.mock("next/headers", () => ({
    cookies: vi.fn(),
}));

const axiosPostMock = axios.post as Mock;
const cookiesMock = cookies as Mock;

describe("atualizarSenhaAction", () => {
    const originalEnv = process.env;
    const dados: AtualizarSenhaRequest = {
        senha_atual: "SenhaAtu@1!",
        nova_senha: "Senha123!",
        confirmacao_nova_senha: "Senha123!",
    };
    const mockAuthToken = "mock-auth-token";

    beforeEach(() => {
        vi.resetAllMocks();
        process.env = { ...originalEnv };
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it("deve retornar sucesso quando a senha for atualizada", async () => {
        cookiesMock.mockReturnValue({
            get: vi.fn().mockReturnValue({ value: mockAuthToken }),
        });
        axiosPostMock.mockResolvedValueOnce({});

        const result = await atualizarSenhaAction(dados);

        expect(axiosPostMock).toHaveBeenCalledWith(
            "https://api.exemplo.com/users/atualizar-senha",
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
        cookiesMock.mockReturnValue({
            get: vi.fn().mockReturnValue(undefined),
        });

        const result = await atualizarSenhaAction(dados);

        expect(axiosPostMock).not.toHaveBeenCalled();
        expect(result).toEqual({
            success: false,
            error: "Usuário não autenticado. Token não encontrado.",
        });
    });

    it("deve retornar erro 401 para sessão expirada", async () => {
        cookiesMock.mockReturnValue({
            get: vi.fn().mockReturnValue({ value: mockAuthToken }),
        });
        axiosPostMock.mockRejectedValueOnce({
            response: { status: 401 },
        });

        const result = await atualizarSenhaAction(dados);

        expect(result).toEqual({
            success: false,
            error: "Sua sessão expirou. Por favor, faça login novamente.",
            field: undefined,
        });
    });

    it("deve retornar erro 500 para erro interno do servidor", async () => {
        cookiesMock.mockReturnValue({
            get: vi.fn().mockReturnValue({ value: mockAuthToken }),
        });
        axiosPostMock.mockRejectedValueOnce({
            response: { status: 500 },
        });

        const result = await atualizarSenhaAction(dados);

        expect(result).toEqual({
            success: false,
            error: "Erro interno no servidor. Tente novamente mais tarde.",
            field: undefined,
        });
    });

    it("deve retornar erro com a mensagem de 'detail' da API", async () => {
        cookiesMock.mockReturnValue({
            get: vi.fn().mockReturnValue({ value: mockAuthToken }),
        });
        axiosPostMock.mockRejectedValueOnce({
            response: { data: { detail: "Senha antiga incorreta" } },
        });

        const result = await atualizarSenhaAction(dados);

        expect(result).toEqual({
            success: false,
            error: "Senha antiga incorreta",
            field: undefined,
        });
    });

    it("deve retornar erro com a mensagem genérica do axios", async () => {
        cookiesMock.mockReturnValue({
            get: vi.fn().mockReturnValue({ value: mockAuthToken }),
        });
        axiosPostMock.mockRejectedValueOnce({
            message: "Erro de rede",
        });

        const result = await atualizarSenhaAction(dados);

        expect(result).toEqual({
            success: false,
            error: "Erro de rede",
            field: undefined,
        });
    });

    it("deve retornar o campo de erro quando a API o envia", async () => {
        cookiesMock.mockReturnValue({
            get: vi.fn().mockReturnValue({ value: mockAuthToken }),
        });
        axiosPostMock.mockRejectedValueOnce({
            response: {
                data: {
                    detail: "Senha antiga não pode ser igual à nova",
                    field: "nova_senha",
                },
            },
        });

        const result = await atualizarSenhaAction(dados);

        expect(result).toEqual({
            success: false,
            error: "Senha antiga não pode ser igual à nova",
            field: "nova_senha",
        });
    });
});
