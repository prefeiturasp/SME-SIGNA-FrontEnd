import { z } from "zod";
 
export const FormSchemaCriarTextosPortaria = z
  .object({
    tipo_portaria: z.string().min(1, { message: "Campo obrigatório." }),
    nome_modelo: z.string().min(1, { message: "Campo obrigatório." }),
    status: z.string().min(1, { message: "Campo obrigatório." }),
    texto_portaria: z.string().min(2, { message: "Campo obrigatório." }),
    variavel: z.array(z.string()).min(1, { message: "Campo obrigatório." }),
    tipo_cargo: z.string().min(1, { message: "Campo obrigatório." }),
    observacoes: z.string().optional(),
   });
   
export type FormSchemaCriarTextosPortariaData = z.infer<typeof FormSchemaCriarTextosPortaria>;

export default FormSchemaCriarTextosPortaria;
