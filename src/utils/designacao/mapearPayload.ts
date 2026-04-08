function formatarData(valor: any): string | null {
    if (!valor) return null;
    if (typeof valor.format === "function") return valor.format("YYYY-MM-DD");
    if (valor instanceof Date) return valor.toISOString().split("T")[0];
    if (typeof valor === "string") return valor.split("T")[0];
    return null;
}

function getCargoVaga(form: any, titular: any): number | undefined {
    if (titular) {
        return 3360; // to-do: ajustar quando vier da API
    }

    const cargo = form.cargo_vago_selecionado;

    if (cargo) {
        if (typeof cargo === "string") {
            return Number(cargo);
        }
        return cargo.id;
    }

    if (form.cargo_vaga) {
        return Number.parseInt(form.cargo_vaga, 10);
    }

    return undefined;
}

export function mapearPayloadDesignacao(form: any) {
    if (!form) return null;

    const { servidorIndicado, dadosTitular } = form;
    const titular = dadosTitular ?? null;

    const cargoVaga = getCargoVaga(form, titular);

    return {
        dre_nome: form.dre_nome,
        unidade_proponente: form.ue_nome,
        codigo_hierarquico: form.codigo_hierarquico,

        indicado_nome_civil: servidorIndicado.nome_civil,
        indicado_nome_servidor: servidorIndicado.nome_servidor,
        indicado_rf: servidorIndicado.rf,
        indicado_vinculo: servidorIndicado.vinculo,
        indicado_cargo_base: servidorIndicado.cargo_base,
        indicado_codigo_cargo_base: servidorIndicado.cd_cargo_base,
        indicado_lotacao: servidorIndicado.lotacao,
        indicado_cargo_sobreposto: servidorIndicado.cargo_sobreposto_funcao_atividade,
        indicado_codigo_cargo_sobreposto: servidorIndicado.cd_cargo_sobreposto_funcao_atividade,
        indicado_local_exercicio: servidorIndicado.local_de_exercicio,
        indicado_local_servico: servidorIndicado.local_de_servico,

        ...(titular && {
            titular_nome_civil: titular.nome_civil,
            titular_nome_servidor: titular.nome_servidor,
            titular_rf: titular.rf,
            titular_vinculo: titular.vinculo,
            titular_cargo_base: titular.cargo_base,
            titular_codigo_cargo_base: titular.cd_cargo_base,
            titular_lotacao: titular.lotacao,
            titular_cargo_sobreposto: titular.cargo_sobreposto_funcao_atividade,
            titular_codigo_cargo_sobreposto: titular.cd_cargo_sobreposto_funcao_atividade,
            titular_local_exercicio: titular.local_de_exercicio,
            titular_local_servico: titular.local_de_servico,
        }),

        numero_portaria: form.portaria_designacao,
        ano_vigente: form.ano,
        sei_numero: form.numero_sei,
        doc: form.doc,
        data_inicio: formatarData(form.a_partir_de),
        data_fim: formatarData(form.designacao_data_final),

        carater_excepcional: form.carater_especial === "sim",
        impedimento_substituicao: form.impedimento_substituicao,
        com_afastamento: form.com_afastamento === "sim",
        motivo_afastamento: form.motivo_afastamento ?? null,
        possui_pendencia: form.com_pendencia === "sim",
        pendencias: form.motivo_pendencia ?? null,

        tipo_vaga: form.tipo_cargo?.toUpperCase(),
        cargo_vaga: cargoVaga,
    };
}