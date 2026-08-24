import { z } from "zod";
 
export const filterFormSchemaTextosPortaria = z
  .object({
    tipo: z.string().optional(),
    nome_do_modelo: z.string().optional(),
    status: z.string().optional(),
   });
   
export type filterFormSchemaTextosPortariaData = z.infer<typeof filterFormSchemaTextosPortaria>;

export default filterFormSchemaTextosPortaria;
