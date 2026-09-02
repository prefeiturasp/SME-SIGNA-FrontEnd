import { z } from "zod";

const formSchemaApostila = z.object({
    ato_apostilado: z.string().nonempty("Campo obrigatório"),
    informacoes_adicionais: z.string().optional(),
    detalhe_para_quadro_de_historico_por_ano: z.boolean().optional(), 
    texto_para_apostila: z.string().optional(),
});

 
  

export type formSchemaApostilaData = z.infer<typeof formSchemaApostila>;

export default formSchemaApostila;