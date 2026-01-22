import {
    describe,
    it,
    expect,
    beforeEach,
    afterAll,
    vi,
    type Mock,
} from "vitest";
import { cadastroAction } from "./cadastro";
import axios from "axios";
import type { CadastroRequest } from "@/types/cadastro";

vi.mock("axios");
const axiosPostMock = axios.post as Mock;

describe("cadastroAction", () => {
    const originalEnv = process.env;
    const dadosCadastro: CadastroRequest = {
        unidades: ["45c839b6-2ae3-4e83-98b1-4eb40f27554c"],
        name: "Usuário Teste",
        username: "12345678900",
        cpf: "12345678900",
        email: "teste@email.com",
        password: "pastel",
    };

    beforeEach(() => {
        vi.resetAllMocks();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it("deve retornar sucesso quando o cadastro for realizado", async () => {
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
        axiosPostMock.mockResolvedValueOnce({});
        const result = await cadastroAction(dadosCadastro);
        expect(axiosPostMock).toHaveBeenCalledWith(
            "https://api.exemplo.com/users/registrar",
            {
                username: "12345678900",
                password: "pastel",
                name: "Usuário Teste",
                cpf: "12345678900",
                email: "teste@email.com",
                unidades: ["45c839b6-2ae3-4e83-98b1-4eb40f27554c"],
            },
            { withCredentials: true }
        );
        expect(result).toEqual({ success: true });
    });

    it("deve retornar erro interno do servidor", async () => {
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
        axiosPostMock.mockRejectedValueOnce({
            response: { status: 500 },
            message: "Erro genérico",
        });
        const result = await cadastroAction(dadosCadastro);
        expect(result).toEqual({
            success: false,
            error: "Erro interno no servidor",
        });
    });

    it("deve retornar erro com detail da API", async () => {
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
        axiosPostMock.mockRejectedValueOnce({
            response: { data: { detail: "E-mail já cadastrado" } },
            message: "Erro genérico",
        });
        const result = await cadastroAction(dadosCadastro);
        expect(result).toEqual({
            success: false,
            error: "E-mail já cadastrado",
        });
    });

    it("deve retornar erro com message genérica", async () => {
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
        axiosPostMock.mockRejectedValueOnce({
            message: "Erro desconhecido",
        });
        const result = await cadastroAction(dadosCadastro);
        expect(result).toEqual({ success: false, error: "Erro desconhecido" });
    });

    it("deve retornar field quando a API envia o campo que causou erro", async () => {
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
        axiosPostMock.mockRejectedValueOnce({
            response: { data: { detail: "CPF já cadastrado", field: "cpf" } },
        });
        const result = await cadastroAction(dadosCadastro);
        expect(result).toEqual({
            success: false,
            error: "CPF já cadastrado",
            field: "cpf",
        });
    });

    it("deve retornar field undefined quando não há campo específico no erro", async () => {
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
        axiosPostMock.mockRejectedValueOnce({
            response: { data: { detail: "Erro desconhecido" } },
        });
        const result = await cadastroAction(dadosCadastro);
        expect(result).toEqual({
            success: false,
            error: "Erro desconhecido",
            field: undefined,
        });
    });
});
