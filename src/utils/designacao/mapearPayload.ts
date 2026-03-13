function formatarData(valor: any): string | null {
    if (!valor) return null;
    if (typeof valor.format === "function") return valor.format("YYYY-MM-DD");
    if (valor instanceof Date) return valor.toISOString().split("T")[0];
    if (typeof valor === "string") return valor.split("T")[0];
    return null;
}

export function mapearPayloadDesignacao(form: any) {
    if (!form) return null;

    const { servidorIndicado, dadosTitular } = form;
    const titular = dadosTitular ?? null;

    return {
        dre_nome: form.dre_nome,
        unidade_proponente: form.ue_nome,
        codigo_hierarquico: form.codigo_hierarquico,

        indicado_nome_civil: servidorIndicado.nome_civil,
        indicado_nome_servidor: servidorIndicado.nome_servidor,
        indicado_rf: servidorIndicado.rf,
        indicado_vinculo: servidorIndicado.vinculo,
        indicado_cargo_base: servidorIndicado.cargo_base,
        indicado_lotacao: servidorIndicado.lotacao,
        indicado_cargo_sobreposto: servidorIndicado.cargo_sobreposto_funcao_atividade,
        indicado_local_exercicio: servidorIndicado.local_de_exercicio,
        indicado_local_servico: servidorIndicado.local_de_servico,

        ...(titular && {
            titular_nome_civil: titular.nome_civil,
            titular_nome_servidor: titular.nome_servidor,
            titular_rf: titular.rf,
            titular_vinculo: titular.vinculo,
            titular_cargo_base: titular.cargo_base,
            titular_lotacao: titular.lotacao,
            titular_cargo_sobreposto: titular.cargo_sobreposto_funcao_atividade,
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
        impedimento_substituicao: "FERIAS", //to-do: arrumar quando front tiver consumindo endpint //form.impedimento_substituicao,
        com_afastamento: form.com_afastamento === "sim",
        motivo_afastamento: form.motivo_afastamento ?? null,
        possui_pendencia: form.com_pendencia === "sim",
        pendencias: form.motivo_pendencia ?? null,

        tipo_vaga: form.tipo_cargo?.toUpperCase(),
        // to-do: corigir para pegar da api o valor correto de cargo_vaga do titular
        //cargo_vaga: titular?.cargo_vaga ?? form.cargo_vago_selecionado ?? Number.parseInt(form.cargo_vaga, 10),
        cargo_vaga: titular ? 3360 : (form.cargo_vago_selecionado ?? Number.parseInt(form.cargo_vaga, 10)),
    };
}