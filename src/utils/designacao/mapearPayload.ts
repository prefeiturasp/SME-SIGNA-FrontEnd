import type { FormDesignacaoEServidorIndicado } from "@/app/pages/designacoes/DesignacaoContext";
import type { ICargoType } from "@/types/cargos";
import type { Servidor } from "@/types/designacao-unidade";

// `a_partir_de`/`designacao_data_final` são `Date` no schema, mas o formulário é
// persistido em localStorage via JSON.stringify/parse (DesignacaoContext), o que
// desfaz o tipo Date em string. Por isso essa função aceita `unknown` de propósito.
function formatarData(valor: unknown): string | null {
    if (!valor) return null;
    if (
        typeof valor === "object" &&
        "format" in valor &&
        typeof valor.format === "function"
    )
        return valor.format("YYYY-MM-DD");
    if (valor instanceof Date) return valor.toISOString().split("T")[0];
    if (typeof valor === "string") return valor.split("T")[0];
    return null;
}

// `cd_cargo_sobreposto_funcao_atividade` do titular vem da busca por RF
// (/designacao/servidor) e é o código de cargo do EOL, não um dos códigos
// fixos aceitos por `cargo_vaga`. É preciso resolver pelo nome do cargo
// contra a lista fixa (/designacao/unidade/cargos/) para obter o código correto.
export function encontrarCargoPorNome(
    nomeCargo: string | null | undefined,
    cargosDisponiveis: ICargoType[]
): ICargoType | undefined {
    if (!nomeCargo) return undefined;
    return cargosDisponiveis.find((cargo) => cargo.nomeCargo === nomeCargo);
}

// A integração SME pode retornar `cargo_sobreposto_funcao_atividade` nulo para
// o titular; nesse caso usamos `cargo_base` (que a integração sempre preenche)
// como fallback para resolver o cargo de vaga.
export function obterNomeCargoTitular(
    titular: Pick<Servidor, "cargo_sobreposto_funcao_atividade" | "cargo_base"> | null | undefined
): string | null | undefined {
    return titular?.cargo_sobreposto_funcao_atividade ?? titular?.cargo_base;
}

function getCargoVaga(
    form: FormDesignacaoEServidorIndicado,
    cargosDisponiveis: ICargoType[]
): number | undefined {
    const tipo = form.tipo_cargo?.toLowerCase();

    if (tipo === "disponivel") {
        const cargoCorrespondente = encontrarCargoPorNome(
            obterNomeCargoTitular(form.dadosTitular),
            cargosDisponiveis
        );
        return cargoCorrespondente?.codigoCargo;
    }

    if (tipo === "vago") {
        const cargo = form.cargo_vago_selecionado;

        if (cargo) {
            if (typeof cargo === "string") {
                return Number(cargo);
            }
            return cargo.id;
        }
    }

    return undefined;
}

export function mapearPayloadDesignacao(
    form: FormDesignacaoEServidorIndicado | null | undefined,
    cargosDisponiveis: ICargoType[] = []
) {
    if (!form) return null;

    const { servidorIndicado, a_partir_de, tipo_cargo } = form;
    if (!servidorIndicado || !a_partir_de || !tipo_cargo) return null;

    const { dadosTitular } = form;
    const titular = dadosTitular ?? null;

    const cargoVaga = getCargoVaga(form, cargosDisponiveis);

    return {
        dre_nome: form.dre_nome,
        unidade_proponente: form.ue_nome,
        dre: form.dre,
        ue: form.ue,
        funcionarios_da_unidade: form.funcionarios_da_unidade,
        codigo_hierarquico: form.codigo_hierarquico,

        indicado_nome_civil: servidorIndicado.nome_civil ?? "",
        indicado_nome_servidor: servidorIndicado.nome_servidor,
        indicado_rf: servidorIndicado.rf,
        indicado_vinculo: servidorIndicado.vinculo,
        indicado_cargo_base: servidorIndicado.cargo_base,
        indicado_codigo_cargo_base: servidorIndicado.cd_cargo_base,
        indicado_lotacao: servidorIndicado.lotacao,
        indicado_cargo_sobreposto: servidorIndicado.cargo_sobreposto_funcao_atividade ?? "",
        indicado_codigo_cargo_sobreposto: servidorIndicado.cd_cargo_sobreposto_funcao_atividade,
        indicado_local_exercicio: servidorIndicado.local_de_exercicio,
        indicado_local_servico: servidorIndicado.local_de_servico ?? "",
        indicado_categoria: servidorIndicado.categoria ?? "",

        ...(titular && {
            titular_nome_civil: titular.nome_civil ?? "",
            titular_nome_servidor: titular.nome_servidor ?? "",
            titular_rf: titular.rf,
            titular_vinculo: titular.vinculo,
            titular_cargo_base: titular.cargo_base ?? "",
            titular_codigo_cargo_base: titular.cd_cargo_base,
            titular_lotacao: titular.lotacao ?? "",
            titular_cargo_sobreposto: titular.cargo_sobreposto_funcao_atividade ?? "",
            titular_codigo_cargo_sobreposto: titular.cd_cargo_sobreposto_funcao_atividade,
            titular_local_exercicio: titular.local_de_exercicio,
            titular_local_servico: titular.local_de_servico ?? "",
        }),

        numero_portaria: form.portaria_designacao,
        ano_vigente: form.ano,
        sei_numero: form.numero_sei,
        doc: form.doc,
        data_inicio: formatarData(a_partir_de),
        data_fim: formatarData(form.designacao_data_final),

        carater_excepcional: form.carater_especial === "sim",
        impedimento_substituicao: form.impedimento_substituicao != null ? Number(form.impedimento_substituicao) : null,
        com_afastamento: form.com_afastamento === "sim",
        motivo_afastamento: form.motivo_afastamento ?? null,
        possui_pendencia: form.com_pendencia === "sim",
        pendencias: form.motivo_pendencia ?? null,

        tipo_vaga: tipo_cargo.toUpperCase(),
        cargo_vaga: cargoVaga,
        informacoes_adicionais: form.informacoes_adicionais,
        detalhe_para_quadro_de_historico_por_ano: form.detalhe_para_quadro_de_historico_por_ano,
    };
}
