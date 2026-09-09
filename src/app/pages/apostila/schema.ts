import { z } from "zod";
import formSchemaCessacao from "../cessacao/schema";
import { EnumCheckbox } from "@/components/ui/FieldsForm";

const formSchemaApostila = z.object({
    // campos apostila
    ato_apostilado: z.string().min(1, "Selecione um ato apostilado"),
    informacoes_adicionais: z.string().optional(),
    detalhe_para_quadro_de_historico_por_ano: z.boolean().optional(),    


    // campos Designacao

    motivo_pendencia: z.string(),

    a_partir_de: z.date(),
    designacao_data_final: z.date().optional().nullable(),
    impedimento_substituicao: z.string().optional().nullable(),
    carater_especial: z.enum([EnumCheckbox.SIM, EnumCheckbox.NAO]),
    com_afastamento: z.enum([EnumCheckbox.SIM, EnumCheckbox.NAO]),
    com_pendencia: z.enum([EnumCheckbox.SIM, EnumCheckbox.NAO]),
    numero_sei: z.string().min(1, "Digite o número do SEI"),
    motivo_afastamento: z.string(),
    ano: z.string().min(1, "Selecione o ano"),
    doc: z.string().optional(),
    impedimento_label: z.string().optional(),
    portaria_designacao: z
        .string()
        .min(1, "Selecione uma Portaria de Designação")
        .max(20, "A Portaria de Designação deve ter no máximo 20 caracteres"),

    dre: z.string().min(1, "Selecione uma DRE"),
    dre_nome: z.string().min(1, "Selecione uma DRE"),
    ue: z.string().min(1, "Selecione uma Unidade"),
    ue_nome: z.string().min(1, "Selecione uma Unidade"),
    codigo_hierarquico: z.string().min(1, "Selecione um Código Hierárquico"),


    //campos servidor indicado
    rf: z.string().optional(),
    nome_civil: z.string().optional(),
    nome_servidor: z.string().min(1, "Digite o nome do servidor"),
    cargo_sobreposto_funcao_atividade: z.string().optional(),
    funcao: z.string().nullable().optional(),
    vinculo: z.number().optional(),
    cd_cargo_base: z.string().optional(),    
    cargo_base: z.string().optional(),
    local_de_exercicio: z.string().optional(),
    lotacao: z.string().optional(),
    categoria: z
        .string()        
        .optional(),   
    local_de_servico: z.string().optional(),
    laudo_medico: z.string().optional(),
    cursos_titulos: z.string().optional(),    
    texto_portaria: z.string().optional(),
    
    // campos portaria de cessação
    cessacao: formSchemaCessacao.shape.cessacao,
});




export type formSchemaApostilaData = z.infer<typeof formSchemaApostila>;

export default formSchemaApostila;