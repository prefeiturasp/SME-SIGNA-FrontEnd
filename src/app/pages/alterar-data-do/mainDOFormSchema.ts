import { z } from "zod";
 
export const mainDOFormSchema = z
  .object({
    data_publicacao: z.date().min(new Date(), "A data de publicação deve ser maior que a data atual"),
    portarias_selecionadas: z.number(),   
    data_considerada_portaria: z.date().optional(),
  })
   
export type mainDOFormSchemaData = z.infer<typeof mainDOFormSchema>;

export default mainDOFormSchema;
