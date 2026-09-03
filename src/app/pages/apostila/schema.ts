import { z } from "zod";

const formSchemaApostila = z.object({
    ato_apostilado: z.string().nonempty("Campo obrigatório"),
    informacoes_adicionais: z.string().optional(),
    detalhe_para_quadro_de_historico_por_ano: z.boolean().optional(),
    texto_para_apostila: z.string().optional(),


    // Designacao
    portaria_designacao: z
        .string()
        .min(1, "Selecione uma Portaria de Designação")
        .max(20, "A Portaria de Designação deve ter no máximo 20 caracteres"),
    numero_sei: z.string().min(1, "Digite o número do SEI"),
    a_partir_de: z.date(),
    designacao_data_final: z.date().optional().nullable(),
    ano: z.string().min(1, "Selecione o ano"),
    doc: z.string().optional(),
    impedimento_substituicao: z.string().optional().nullable(),
    impedimento_label: z.string().optional(),
    carater_especial: z.string().min(1, "selecione se possui carater especial "),
    com_afastamento: z.string().min(1, "selecione se possui afastamento"),
    motivo_afastamento: z.string(),
    com_pendencia: z.string().min(1, "Selecione se possui pendêcia"),
    motivo_pendencia: z.string(),

});




export type formSchemaApostilaData = z.infer<typeof formSchemaApostila>;

export default formSchemaApostila;