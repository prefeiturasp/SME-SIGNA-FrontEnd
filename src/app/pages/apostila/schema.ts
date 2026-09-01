import { z } from "zod";

const formSchemaApostila = z.object({
    numero_sei: z.string().min(1, "Campo obrigatório"),
    doc: z.string().optional(),
    observacao: z.string().optional(),
    ato_apostilado: z.string().nonempty("Campo obrigatório"),
    informacoes_adicionais: z.string().optional(),
    detalhe_para_quadro_de_historico_por_ano: z.boolean().optional(),  
});

 
  

export type formSchemaApostilaData = z.infer<typeof formSchemaApostila>;

export default formSchemaApostila;