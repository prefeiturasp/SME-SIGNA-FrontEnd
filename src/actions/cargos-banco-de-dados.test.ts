import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterAll,
    type Mock,
} from "vitest";
import axios from "axios";
import { cookies } from "next/headers";
import {
    getCargosBaseBancoDeDados,
    getCargosSobrepostosBancoDeDados,
} from "@/actions/cargos-banco-de-dados";
import { ICargoType } from "@/types/cargos";

vi.mock("axios");
vi.mock("next/headers", () => ({
    cookies: vi.fn(),
}));

type CookieStore = Awaited<ReturnType<typeof cookies>>;

const makeCookieStore = (token?: string): CookieStore =>
({
    get: vi.fn().mockReturnValue(token ? { value: token } : undefined),
} as unknown as CookieStore);

const fakeCargos: ICargoType[] = [
    { codigoCargo: 1, nomeCargo: "Diretor de Escola" },
    { codigoCargo: 2, nomeCargo: "Assistente de Diretor" },
];

describe("cargos-banco-de-dados actions", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetAllMocks();
        process.env = { ...originalEnv };
        process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe("getCargosBaseBancoDeDados", () => {
        it("retorna os cargos base com sucesso", async () => {
            vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
            (axios.get as Mock).mockResolvedValueOnce({ data: fakeCargos });

            const result = await getCargosBaseBancoDeDados();

            expect(axios.get).toHaveBeenCalledWith(
                "https://api.exemplo.com/designacao/designacoes/cargos-base-pareados",
                {
                    headers: {
                        Authorization: "Bearer token-123",
                    },
                }
            );

            expect(result).toEqual(fakeCargos);
        });

        it("faz a requisição sem token quando não há cookie", async () => {
            vi.mocked(cookies).mockResolvedValue(makeCookieStore());
            (axios.get as Mock).mockResolvedValueOnce({ data: fakeCargos });

            const result = await getCargosBaseBancoDeDados();

            expect(axios.get).toHaveBeenCalledWith(
                "https://api.exemplo.com/designacao/designacoes/cargos-base-pareados",
                {
                    headers: {
                        Authorization: "Bearer undefined",
                    },
                }
            );

            expect(result).toEqual(fakeCargos);
        });

        it("lança erro quando a API falhar", async () => {
            vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
            (axios.get as Mock).mockRejectedValueOnce(new Error("Network error"));

            await expect(getCargosBaseBancoDeDados()).rejects.toThrow(
                "Não foi possível buscar os cargos base do banco de dados"
            );
        });
    });

    describe("getCargosSobrepostosBancoDeDados", () => {
        it("retorna os cargos sobrepostos com sucesso", async () => {
            vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
            (axios.get as Mock).mockResolvedValueOnce({ data: fakeCargos });

            const result = await getCargosSobrepostosBancoDeDados();

            expect(axios.get).toHaveBeenCalledWith(
                "https://api.exemplo.com/designacao/designacoes/cargos-sobrepostos-pareados",
                {
                    headers: {
                        Authorization: "Bearer token-123",
                    },
                }
            );

            expect(result).toEqual(fakeCargos);
        });

        it("faz a requisição sem token quando não há cookie", async () => {
            vi.mocked(cookies).mockResolvedValue(makeCookieStore());
            (axios.get as Mock).mockResolvedValueOnce({ data: fakeCargos });

            const result = await getCargosSobrepostosBancoDeDados();

            expect(axios.get).toHaveBeenCalledWith(
                "https://api.exemplo.com/designacao/designacoes/cargos-sobrepostos-pareados",
                {
                    headers: {
                        Authorization: "Bearer undefined",
                    },
                }
            );

            expect(result).toEqual(fakeCargos);
        });

        it("lança erro quando a API falhar", async () => {
            vi.mocked(cookies).mockResolvedValue(makeCookieStore("token-123"));
            (axios.get as Mock).mockRejectedValueOnce(new Error("Network error"));

            await expect(getCargosSobrepostosBancoDeDados()).rejects.toThrow(
                "Não foi possível buscar os cargos sobrepostos do banco de dados"
            );
        });
    });
});