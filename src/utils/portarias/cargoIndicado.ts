import type { DesignacaoResponse } from "@/types/designacao";
import { CODIGOS_CARGO_PROFESSOR } from "@/utils/designacao/substituicaoDiretor";
import { nameToCamelCase } from "@/utils/portarias/formatadores";

export type DadosCargoIndicado = {
    cargoBase?: string | null;
    codigoCargoBase?: string | number | null;
    cargoSobreposto?: string | null;
    // Diz se `cargoSobreposto` é cargo sobreposto (true) ou função/atividade (false).
    possuiCargoSobreposto?: boolean | null;
    categoria?: string | null;
};

function ehCargoProfessor(codigo: string | number | null | undefined): boolean {
    if (codigo === null || codigo === undefined || String(codigo).trim() === "") return false;
    return CODIGOS_CARGO_PROFESSOR.has(Number(codigo));
}

/**
 * Monta o valor da variável `[[CARGO_INDICADO]]`: o cargo sobreposto do
 * indicado, quando houver; senão, o cargo base. Função/atividade não conta
 * como cargo sobreposto.
 *
 * Quando o cargo exibido é o cargo base de professor, a categoria vem logo
 * depois, como na redação oficial: "Professor de Educação Infantil - Categoria 3".
 */
export function montarCargoIndicado(dados: DadosCargoIndicado): string {
    const cargoSobreposto = dados.cargoSobreposto?.trim();
    if (dados.possuiCargoSobreposto && cargoSobreposto) {
        return nameToCamelCase(cargoSobreposto);
    }

    const cargoBase = nameToCamelCase(dados.cargoBase ?? "");
    const categoria = dados.categoria?.trim();
    if (cargoBase && categoria && ehCargoProfessor(dados.codigoCargoBase)) {
        return `${cargoBase} - Categoria ${categoria}`;
    }

    return cargoBase;
}

/**
 * `[[CARGO_INDICADO]]` das portarias que partem de uma designação
 * (cessação, insubsistência, anulação de apostila). Usa os dados do
 * indicado gravados na designação, e não os atuais do EOL: durante a
 * designação, o EOL já traz o próprio cargo designado como sobreposto.
 */
export function montarCargoIndicadoDaDesignacao(
    designacao: DesignacaoResponse | undefined
): string {
    return montarCargoIndicado({
        cargoBase: designacao?.indicado_cargo_base,
        codigoCargoBase: designacao?.indicado_codigo_cargo_base,
        cargoSobreposto: designacao?.indicado_cargo_sobreposto,
        possuiCargoSobreposto: designacao?.indicado_possui_cargo_sobreposto,
        categoria: designacao?.indicado_categoria,
    });
}

/**
 * `[[CARGO]]` (cargo a ser ocupado) das portarias que partem de uma
 * designação: o cargo da vaga. Designações antigas sem `cargo_vaga`
 * caem no cargo base do titular, como no cargo disponível.
 */
export function montarCargoDaDesignacao(
    designacao: DesignacaoResponse | undefined
): string {
    return nameToCamelCase(
        designacao?.cargo_vaga_display || designacao?.titular_cargo_base || ""
    );
}
