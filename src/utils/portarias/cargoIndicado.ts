import type { DesignacaoResponse } from "@/types/designacao";
import { CODIGOS_CARGO_PROFESSOR } from "@/utils/designacao/substituicaoDiretor";

export const CARGO_NAO_CADASTRADO = "CARGO NÃO CADASTRADO EM GESTÃO";

export type CodigoCargo = string | number | null | undefined;

/**
 * `descricao_completa` de Gestão de cargos base por código normalizado
 * (ver `normalizarCodigoCargo`). `null` quer dizer que o código não está
 * cadastrado; código ausente do objeto quer dizer que ele não foi buscado.
 */
export type DescricoesCargosBase = Readonly<Record<string, string | null>>;

export type DadosCargoIndicado = {
    codigoCargoBase?: CodigoCargo;
    codigoCargoSobreposto?: CodigoCargo;
    // Diz se `codigoCargoSobreposto` é cargo sobreposto (true) ou função/atividade (false).
    possuiCargoSobreposto?: boolean | null;
    categoria?: string | null;
};

/** Código como o backend grava em `codigo_cargo`; `null` quando não há código. */
export function normalizarCodigoCargo(codigo: CodigoCargo): string | null {
    if (codigo === null || codigo === undefined) return null;
    const texto = String(codigo).trim();
    if (!texto) return null;
    if (!/^\d+$/.test(texto)) return texto;
    const numero = String(Number(texto));
    return numero === "0" ? null : numero;
}

function descricaoCargoBase(codigo: CodigoCargo, descricoes: DescricoesCargosBase): string | null {
    const chave = normalizarCodigoCargo(codigo);
    if (!chave) return null;
    if (!(chave in descricoes)) {
        throw new Error(`A descrição do cargo ${chave} não foi carregada.`);
    }
    return descricoes[chave]?.trim().toUpperCase() || null;
}

function ehCargoProfessor(codigo: CodigoCargo): boolean {
    const chave = normalizarCodigoCargo(codigo);
    return chave !== null && CODIGOS_CARGO_PROFESSOR.has(Number(chave));
}

/** Valor de `[[CARGO]]`/`[[CARGO_DESIGNACAO]]` para o código do cargo a ser ocupado. */
export function montarCargo(codigo: CodigoCargo, descricoes: DescricoesCargosBase): string {
    return descricaoCargoBase(codigo, descricoes) ?? CARGO_NAO_CADASTRADO;
}

function usaCargoSobreposto(dados: DadosCargoIndicado): boolean {
    return !!dados.possuiCargoSobreposto && normalizarCodigoCargo(dados.codigoCargoSobreposto) !== null;
}

/** Código do cargo exibido em `[[CARGO_INDICADO]]`. */
export function codigoCargoIndicado(dados: DadosCargoIndicado): CodigoCargo {
    return usaCargoSobreposto(dados) ? dados.codigoCargoSobreposto : dados.codigoCargoBase;
}

/**
 * Monta o valor da variável `[[CARGO_INDICADO]]`: o cargo sobreposto do
 * indicado, quando houver; senão, o cargo base. Função/atividade não conta
 * como cargo sobreposto.
 *
 * Quando o cargo exibido é o cargo base de professor, a categoria vem logo
 * depois: "PROFESSOR DE EDUCAÇÃO INFANTIL - CATEGORIA 3".
 */
export function montarCargoIndicado(dados: DadosCargoIndicado, descricoes: DescricoesCargosBase): string {
    if (usaCargoSobreposto(dados)) {
        return montarCargo(dados.codigoCargoSobreposto, descricoes);
    }

    const cargoBase = descricaoCargoBase(dados.codigoCargoBase, descricoes);
    if (!cargoBase) return CARGO_NAO_CADASTRADO;

    const categoria = dados.categoria?.trim();
    if (categoria && ehCargoProfessor(dados.codigoCargoBase)) {
        return `${cargoBase} - CATEGORIA ${categoria.toUpperCase()}`;
    }

    return cargoBase;
}

/**
 * Dados do indicado gravados na designação, e não os atuais do EOL:
 * durante a designação, o EOL já traz o próprio cargo designado como
 * sobreposto.
 */
function dadosCargoIndicadoDaDesignacao(designacao: DesignacaoResponse | undefined): DadosCargoIndicado {
    return {
        codigoCargoBase: designacao?.indicado_codigo_cargo_base,
        codigoCargoSobreposto: designacao?.indicado_codigo_cargo_sobreposto,
        possuiCargoSobreposto: designacao?.indicado_possui_cargo_sobreposto,
        categoria: designacao?.indicado_categoria,
    };
}

/**
 * Código do cargo a ser ocupado nas portarias que partem de uma designação:
 * o cargo da vaga. Designações antigas sem `cargo_vaga` caem no cargo base
 * do titular.
 */
function codigoCargoDaDesignacao(designacao: DesignacaoResponse | undefined): CodigoCargo {
    return normalizarCodigoCargo(designacao?.cargo_vaga) ?? designacao?.titular_codigo_cargo_base;
}

/** Códigos que `montarCargoDaDesignacao` e `montarCargoIndicadoDaDesignacao` consultam. */
export function codigosCargosDaDesignacao(designacao: DesignacaoResponse | undefined): CodigoCargo[] {
    return [
        codigoCargoDaDesignacao(designacao),
        codigoCargoIndicado(dadosCargoIndicadoDaDesignacao(designacao)),
    ];
}

/** `[[CARGO_INDICADO]]` das portarias que partem de uma designação. */
export function montarCargoIndicadoDaDesignacao(
    designacao: DesignacaoResponse | undefined,
    descricoes: DescricoesCargosBase
): string {
    return montarCargoIndicado(dadosCargoIndicadoDaDesignacao(designacao), descricoes);
}

/** `[[CARGO]]` (cargo a ser ocupado) das portarias que partem de uma designação. */
export function montarCargoDaDesignacao(
    designacao: DesignacaoResponse | undefined,
    descricoes: DescricoesCargosBase
): string {
    return montarCargo(codigoCargoDaDesignacao(designacao), descricoes);
}
