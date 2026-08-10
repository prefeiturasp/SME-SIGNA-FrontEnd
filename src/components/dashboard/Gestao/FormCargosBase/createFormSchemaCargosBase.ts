import { z } from "zod";
 
export const createFormSchemaCargosBase = z
  .object({
    codigo_cargo: z.string().min(1, { message: "Campo obrigatório." }),
    grupamento: z.string().min(1, { message: "Campo obrigatório." }),
    descricao_resumida: z.string().min(1, { message: "Campo obrigatório." }),
    descricao_completa: z.string().min(1, { message: "Campo obrigatório." }),
    situacao_funcional: z.string().min(1, { message: "Campo obrigatório." }),
    status: z.string().min(1, { message: "Campo obrigatório." }),
    usado_em_funcoes: z.boolean(),
    usado_em_designacoes: z.boolean(),
    usado_em_ste: z.boolean(),
    usado_em_permutas: z.boolean(),
    cargo_base_ficticio: z.boolean(), 
   })
   
export type createFormSchemaCargosBaseData = z.infer<typeof createFormSchemaCargosBase>;

export default createFormSchemaCargosBase;
