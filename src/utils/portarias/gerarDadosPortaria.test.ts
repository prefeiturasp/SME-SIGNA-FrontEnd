import { describe, it, expect, vi } from "vitest";
import { gerarDadosPortaria, montarTrechoUnidade } from "./gerarDadosPortaria";
import * as regrasPortaria from "./regrasPortaria";

vi.mock("./regrasPortaria", () => ({
    montarAutoridade: vi.fn(),
    montarTrechoSubstituicao: vi.fn(),
    montarTrechoFinal: vi.fn(),
}));

describe("gerarDadosPortaria", () => {
    it("gera os dados da portaria corretamente para cargo vago na mesma unidade", () => {
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
            nome_indicado: "JOÃO SILVA",
            rf: "123.456.7",
            vinculo: "Efetivo",
            cargo_base: "Professor",
            lotacao_indicado: "Escola Teste",
            cargo_indicado: "Diretor",
            ue: "Escola Teste",
            eh: "123456",
            trecho_substituicao: "Trecho Substituição",
            trecho_unidade: "na referida Unidade",
            trecho_final: "Trecho Final",
        });
    });

    it("gera os dados da portaria corretamente para cargo vago em outra unidade", () => {
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
                lotacao: "Escola Nova",
            },
        };

        const resultado = gerarDadosPortaria(data);

        expect(resultado).toEqual({
            portaria: "123/2025",
            ano: "2025",
            sei: "000123",
            dre: "DRE Centro",
            autoridade: "Autoridade Teste",
            nome_indicado: "JOÃO SILVA",
            rf: "123.456.7",
            vinculo: "Efetivo",
            cargo_base: "Professor",
            lotacao_indicado: "Escola Nova",
            cargo_indicado: "Diretor",
            ue: "Escola Teste",
            eh: "123456",
            trecho_substituicao: "Trecho Substituição",
            trecho_unidade: "na Escola Teste, da DRE Centro",
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

    it("inclui categoria no cargo_base quando servidorIndicado tem categoria", () => {
        vi.mocked(regrasPortaria.montarAutoridade).mockReturnValue("Autoridade");
        vi.mocked(regrasPortaria.montarTrechoSubstituicao).mockReturnValue("Substituição");
        vi.mocked(regrasPortaria.montarTrechoFinal).mockReturnValue("Final");

        const data: any = {
            tipo_cargo: "disponivel",
            portaria_designacao: "100",
            ano: "2026",
            numero_sei: "000100",
            dre_nome: "DRE Leste",
            ue_nome: "EMEF Teste",
            codigo_hierarquico: "111",
            servidorIndicado: {
                nome_civil: "Carlos Lima",
                rf: "111222",
                vinculo: 1,
                cargo_base: "Professor de Educação Infantil",
                categoria: "3",
                lotacao: "EMEF Teste",
            },
        };

        const resultado = gerarDadosPortaria(data);

        expect(resultado.cargo_base).toBe("Professor de Educação Infantil - Categoria 3");
    });

    it("não inclui categoria no cargo_base quando servidorIndicado não tem categoria", () => {
        vi.mocked(regrasPortaria.montarAutoridade).mockReturnValue("Autoridade");
        vi.mocked(regrasPortaria.montarTrechoSubstituicao).mockReturnValue("Substituição");
        vi.mocked(regrasPortaria.montarTrechoFinal).mockReturnValue("Final");

        const data: any = {
            tipo_cargo: "disponivel",
            portaria_designacao: "101",
            ano: "2026",
            numero_sei: "000101",
            dre_nome: "DRE Leste",
            ue_nome: "EMEF Teste",
            codigo_hierarquico: "111",
            servidorIndicado: {
                nome_civil: "Carlos Lima",
                rf: "111222",
                vinculo: 1,
                cargo_base: "Professor de Educação Infantil",
                lotacao: "EMEF Teste",
            },
        };

        const resultado = gerarDadosPortaria(data);

        expect(resultado.cargo_base).toBe("Professor de Educação Infantil");
    });

    it("usa cargo_vago_selecionado.label quando for um objeto", () => {
        vi.mocked(regrasPortaria.montarAutoridade).mockReturnValue("Autoridade");
        vi.mocked(regrasPortaria.montarTrechoSubstituicao).mockReturnValue("Substituição");
        vi.mocked(regrasPortaria.montarTrechoFinal).mockReturnValue("Final");

        const data: any = {
            tipo_cargo: "vago",
            cargo_vago_selecionado: { label: "Vice-Diretor", value: "vice_diretor" },
            portaria_designacao: "456",
            ano: "2025",
            numero_sei: "000456",
            dre_nome: "DRE Sul",
            ue_nome: "Escola B",
            codigo_hierarquico: "654321",
            servidorIndicado: {
                nome_civil: "Ana Lima",
                rf: "7654321",
                vinculo: "Efetivo",
                cargo_base: "Professor",
                lotacao: "Escola B",
            },
        };

        const resultado = gerarDadosPortaria(data);

        expect(resultado.cargo_indicado).toBe("Vice-diretor");
    });
});

describe("montarTrechoUnidade", () => {
    it("retorna 'na referida Unidade' quando lotação é igual à unidade proponente", () => {
        const resultado = montarTrechoUnidade("EMEF Teste", "EMEF Teste", "DRE Centro");
        expect(resultado).toBe("na referida Unidade");
    });

    it("retorna 'na referida Unidade' ignorando espaços extras", () => {
        const resultado = montarTrechoUnidade("EMEF  Teste ", " EMEF  Teste", "DRE Centro");
        expect(resultado).toBe("na referida Unidade");
    });

    it("retorna o nome da unidade e DRE quando lotação é diferente da unidade proponente", () => {
        const resultado = montarTrechoUnidade("EMEF Origem", "CEU EMEF Destino", "DRE Leste");
        expect(resultado).toBe("na CEU EMEF Destino, da DRE Leste");
    });
});