import { describe, it, expect, beforeEach, vi } from "vitest";
import { redefinirSenhaAction } from "./redefinir-senha";
import axios from "axios";

vi.mock("axios");
const axiosPostMock = axios.post as unknown as ReturnType<typeof vi.fn>;

describe("redefinirSenhaAction", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("retorna sucesso quando a API responde corretamente", async () => {
        axiosPostMock.mockResolvedValueOnce({});
        const result = await redefinirSenhaAction({
            uid: "abc123",
            token: "token123",
            password: "Senha@123",
            password2: "Senha@123",
        });
        expect(result).toEqual({ success: true });
        expect(axiosPostMock).toHaveBeenCalledWith(
            expect.stringContaining("/users/redefinir-senha"),
            expect.any(FormData)
        );
    });

    it("retorna erro customizado quando a API responde com non_field_errors", async () => {
        axiosPostMock.mockRejectedValueOnce({
            response: {
                data: {
                    errors: { non_field_errors: ["Senhas não conferem"] },
                },
            },
            message: "Erro customizado",
        });
        const result = await redefinirSenhaAction({
            uid: "abc123",
            token: "token123",
            password: "Senha@123",
            password2: "SenhaErrada",
        });
        expect(result).toEqual({
            success: false,
            error: "Senhas não conferem",
        });
    });

    it("retorna erro com detail quando presente", async () => {
        axiosPostMock.mockRejectedValueOnce({
            response: { data: { detail: "Token inválido" } },
            message: "Erro customizado",
        });
        const result = await redefinirSenhaAction({
            uid: "abc123",
            token: "token123",
            password: "Senha@123",
            password2: "Senha@123",
        });
        expect(result).toEqual({ success: false, error: "Token inválido" });
    });

    it("retorna erro 500 corretamente", async () => {
        axiosPostMock.mockRejectedValueOnce({
            response: { status: 500 },
            message: "Erro interno no servidor",
        });
        const result = await redefinirSenhaAction({
            uid: "abc123",
            token: "token123",
            password: "Senha@123",
            password2: "Senha@123",
        });
        expect(result).toEqual({
            success: false,
            error: "Erro interno no servidor",
        });
    });

    it("retorna erro genérico quando não há detail ou non_field_errors", async () => {
        axiosPostMock.mockRejectedValueOnce({
            message: "Erro desconhecido",
        });
        const result = await redefinirSenhaAction({
            uid: "abc123",
            token: "token123",
            password: "Senha@123",
            password2: "Senha@123",
        });
        expect(result).toEqual({ success: false, error: "Erro desconhecido" });
    });
});
