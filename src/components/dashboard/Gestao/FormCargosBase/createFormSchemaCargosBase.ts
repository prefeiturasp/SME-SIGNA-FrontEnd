import { z } from "zod";
 
export const createFormSchemaCargosBase = z
  .object({
    codigo_cargo: z.string().min(1, { message: "Campo obrigatório." }),
    grupamento: z.string().min(1, { message: "Campo obrigatório." }),
    descricao_resumida: z.string().min(1, { message: "Campo obrigatório." }),
    descricao_completa: z.string().min(1, { message: "Campo obrigatório." }),
    situacao_funcional: z.string().min(1, { message: "Campo obrigatório." }),
    status: z.string().min(1, { message: "Campo obrigatório." }),
    utilizado_para_funcoes: z.boolean().default(false).nonoptional({ message: "Campo obrigatório." }),
    utilizado_para_designacoes: z.boolean().default(false).nonoptional({ message: "Campo obrigatório." }),
    utilizado_para_ste: z.boolean().default(false).nonoptional({ message: "Campo obrigatório." }),
    utilizado_para_permutas: z.boolean().default(false).nonoptional({ message: "Campo obrigatório." }),
    cargo_base_ficticio: z.boolean().default(false).nonoptional({ message: "Campo obrigatório." }),
    testar_laudo: z.boolean().default(false).nonoptional({ message: "Campo obrigatório." }),
    pesquisar_licencas_no_sigpec: z.boolean().default(false).nonoptional({ message: "Campo obrigatório." }) ,
    quantidade_maxima_de_dias_de_licenca: z.string().optional(),
   }).superRefine((data, ctx) => {
    
    const quantidadeMaximaDeDiasDeLicenca = data.quantidade_maxima_de_dias_de_licenca==="" ? 0 : Number.parseInt(data.quantidade_maxima_de_dias_de_licenca ?? "0");
    const pesquisarLicencasNoSigpec = data.pesquisar_licencas_no_sigpec;
    
    if (pesquisarLicencasNoSigpec && quantidadeMaximaDeDiasDeLicenca <= 0) {    
      ctx.addIssue({
        code: "custom",
        message: "A quantidade máxima de dias de licença deve ser maior que 0.",
        path: ["quantidade_maxima_de_dias_de_licenca"],
      });
    }
  });
   
export type createFormSchemaCargosBaseData = z.infer<typeof createFormSchemaCargosBase>;

export default createFormSchemaCargosBase;
