import { z } from "zod";
 
export const filterFormSchemaTextosPortaria = z
  .object({
    tipo_portaria: z.string().optional(),
    tipo_ato_pai: z.string().optional(),
    nome_modelo: z.string().optional(),
    status: z.string().optional(),
   });
   
export type filterFormSchemaTextosPortariaData = z.infer<typeof filterFormSchemaTextosPortaria>;

export default filterFormSchemaTextosPortaria;
