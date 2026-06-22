import { z } from "zod";
 
export const filterFormSchemaFiltroDO = z
  .object({
    portaria_final: z.string().optional(),
    tipo: z.string().optional(),
    portaria_inicial: z.string().optional(),
    numero_sei: z.string().optional(),
    ano: z.string().optional(),
  })  
export type filterFormSchemaFiltroDOData = z.infer<typeof filterFormSchemaFiltroDO>;

export default filterFormSchemaFiltroDO;
