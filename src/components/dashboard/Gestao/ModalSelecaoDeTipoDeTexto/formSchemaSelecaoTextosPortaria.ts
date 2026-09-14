import { z } from "zod";
 
export const formSchemaSelecaoTextosPortaria = z
  .object({
    tipo_de_texto: z.string(),
    tipo_portaria: z.string(),
   });
   
export type formSchemaSelecaoTextosPortariaData = z.infer<typeof formSchemaSelecaoTextosPortaria>;

export default formSchemaSelecaoTextosPortaria;
