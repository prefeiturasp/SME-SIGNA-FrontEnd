import { esqueciSenhaAction } from "./esqueci-senha";
import axios from "axios";
import { vi } from "vitest";

describe("esqueciSenhaAction", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("retorna sucesso quando a API responde corretamente", async () => {
        vi.spyOn(axios, "post").mockResolvedValueOnce({
            data: { detail: "Link enviado!" },
        });
        const result = await esqueciSenhaAction({ username: "47198005055" });
        expect(result).toEqual({ success: true, message: "Link enviado!" });
    });

    it("retorna erro customizado quando a API responde com detail", async () => {
        vi.spyOn(axios, "post").mockRejectedValueOnce({
            response: { data: { detail: "Usuário não encontrado" } },
            message: "Erro customizado",
        });
        const result = await esqueciSenhaAction({ username: "00000000000" });
        expect(result).toEqual({
            success: false,
            error: "Usuário não encontrado",
        });
    });

    it("retorna erro 500 corretamente", async () => {
        vi.spyOn(axios, "post").mockRejectedValueOnce({
            response: { status: 500 },
            message: "Erro interno no servidor",
        });
        const result = await esqueciSenhaAction({ username: "47198005055" });
        expect(result).toEqual({
            success: false,
            error: "Erro interno no servidor",
        });
    });

    it("retorna erro genérico quando não há detail", async () => {
        vi.spyOn(axios, "post").mockRejectedValueOnce({
            message: "Erro desconhecido",
        });
        const result = await esqueciSenhaAction({ username: "47198005055" });
        expect(result).toEqual({ success: false, error: "Erro desconhecido" });
    });
});
