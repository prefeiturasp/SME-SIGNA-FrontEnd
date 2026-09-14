import { z } from "zod";
 
export const filterFormSchemaFiltroCargosBase = z
  .object({
    grupamento: z.string().optional(),
    descricao_resumida: z.string().optional(),
    descricao_completa: z.string().optional(),
    situacao_funcional: z.string().optional(),
    status: z.string().optional(),
   });
   
export type filterFormSchemaFiltroCargosBaseData = z.infer<typeof filterFormSchemaFiltroCargosBase>;

export default filterFormSchemaFiltroCargosBase;
