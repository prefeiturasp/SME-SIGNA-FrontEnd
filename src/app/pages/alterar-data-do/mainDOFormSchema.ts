import { z } from "zod";
 
export const mainDOFormSchema = z
  .object({
    data_publicacao: z.date(),
    portarias_selecionadas: z.number(),   
    data_considerada_portaria: z.date().optional(),
  })
   
export type mainDOFormSchemaData = z.infer<typeof mainDOFormSchema>;

export default mainDOFormSchema;
