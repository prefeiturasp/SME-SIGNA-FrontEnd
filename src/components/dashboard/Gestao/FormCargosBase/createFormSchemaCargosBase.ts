import { z } from "zod";
 
export const createFormSchemaCargosBase = z
  .object({
    codigo_cargo_eol: z.string().min(1, { message: "Código do cargo EOL é obrigatório" }),
    grupamento: z.string().optional(),    
    descricao_resumida: z.string().optional(),
    descricao_completa: z.string().optional(),
    situacao_funcional: z.string().optional(),
    status: z.string().optional(),
    utilizado_para_funcoes: z.boolean(),
    utilizado_para_designacoes: z.boolean(),
    utilizado_para_outros: z.boolean(),
    utilizado_para_ste: z.boolean(),
    utilizado_para_permutas: z.boolean(),
    cargo_base_ficticio: z.boolean(), 
   })
   
export type createFormSchemaCargosBaseData = z.infer<typeof createFormSchemaCargosBase>;

export default createFormSchemaCargosBase;
