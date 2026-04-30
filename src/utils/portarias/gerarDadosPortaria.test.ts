import { describe, it, expect, vi } from "vitest";
import { gerarDadosPortaria } from "./gerarDadosPortaria";
import * as regrasPortaria from "./regrasPortaria";

vi.mock("./regrasPortaria", () => ({
    montarAutoridade: vi.fn(),
    montarTrechoSubstituicao: vi.fn(),
    montarTrechoFinal: vi.fn(),
}));

describe("gerarDadosPortaria", () => {
    it("gera os dados da portaria corretamente para cargo vago", () => {
        vi.mocked(regrasPortaria.montarAutoridade).mockReturnValue("Autoridade Teste");
        vi.mocked(regrasPortaria.montarTrechoSubstituicao).mockReturnValue("Trecho Substituição");
        vi.mocked(regrasPortaria.montarTrechoFinal).mockReturnValue("Trecho Final");

        const data: any = {
            tipo_cargo: "vago",
            cargo_vago_selecionado: "Diretor",
            portaria_designacao: "123",
            ano: "2025",
            numero_sei: "000123",
            dre_nome: "DRE Centro",
            ue_nome: "Escola Teste",
            codigo_hierarquico: "123456",
            servidorIndicado: {
                nome_civil: "João Silva",
                rf: "1234567",
                vinculo: "Efetivo",
                cargo_base: "Professor",
                lotacao: "Escola Teste",
            },
        };

        const resultado = gerarDadosPortaria(data);

        expect(resultado).toEqual({
            portaria: "123/2025",
            ano: "2025",
            sei: "000123",
            dre: "DRE Centro",
            autoridade: "Autoridade Teste",
            nome_indicado: "João Silva",
            rf: "123.456.7",
            vinculo: "Efetivo",
            cargo_base: "Professor",
            lotacao_indicado: "Escola Teste",
            cargo_indicado: "Diretor",
            ue: "Escola Teste",
            eh: "123456",
            trecho_substituicao: "Trecho Substituição",
            trecho_final: "Trecho Final",
        });
    });

    it("usa cargo_base do titular quando não for cargo vago", () => {
        vi.mocked(regrasPortaria.montarAutoridade).mockReturnValue("Autoridade");
        vi.mocked(regrasPortaria.montarTrechoSubstituicao).mockReturnValue("Substituição");
        vi.mocked(regrasPortaria.montarTrechoFinal).mockReturnValue("Final");

        const data: any = {
            tipo_cargo: "titular",
            dadosTitular: {
                cargo_base: "Coordenador",
            },
            servidorIndicado: {
                nome_civil: "Maria Souza",
                rf: "654321",
                vinculo: "Efetivo",
                cargo_base: "Professor",
                lotacao: "Escola A",
            },
        };

        const resultado = gerarDadosPortaria(data);

        expect(resultado.cargo_indicado).toBe("Coordenador");
    });
});