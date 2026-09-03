import { z } from "zod";

const formSchemaApostila = z.object({
    ato_apostilado: z.string().nonempty("Campo obrigatório"),
    informacoes_adicionais: z.string().optional(),
    detalhe_para_quadro_de_historico_por_ano: z.boolean().optional(),
    texto_para_apostila: z.string().optional(),


    // Designacao
    
    motivo_pendencia: z.string(),
    
    a_partir_de: z.date(),
    designacao_data_final: z.date().optional().nullable(),       
    impedimento_substituicao: z.string().optional().nullable(),    
    carater_especial: z.string().min(1, "selecione se possui carater especial "),
    com_afastamento: z.string().min(1, "selecione se possui afastamento"),    
    com_pendencia: z.string().min(1, "Selecione se possui pendêcia"),
    numero_sei: z.string().min(1, "Digite o número do SEI"),
    motivo_afastamento: z.string(),
    ano: z.string().min(1, "Selecione o ano"),
    doc: z.string().optional(),
    impedimento_label: z.string().optional(),
    portaria_designacao: z
    .string()
    .min(1, "Selecione uma Portaria de Designação")
    .max(20, "A Portaria de Designação deve ter no máximo 20 caracteres"),

    dre: z.string().optional(),
    dre_nome: z.string().min(1, "Selecione uma DRE"),
    ue: z.string().min(1, "Selecione uma Unidade"),
    ue_nome: z.string().min(1, "Selecione uma Unidade"),
    codigo_hierarquico: z.string().min(1, "Selecione um Código Hierárquico"),

});




export type formSchemaApostilaData = z.infer<typeof formSchemaApostila>;

export default formSchemaApostila;