import { z } from "zod";

const camposCargosBase = z
  .object({
    codigo_cargo: z.string().min(1, { message: "Campo obrigatório." }),
    grupamento: z.string().min(1, { message: "Campo obrigatório." }),
    descricao_resumida: z.string().trim().min(1, { message: "Campo obrigatório." }),
    descricao_completa: z
      .string()
      .trim()
      .min(1, { message: "Campo obrigatório." })
      .max(255, { message: "A descrição completa deve ter no máximo 255 caracteres." }),
    provimento: z.string().optional(),
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
    permite_substituicao: z.boolean().default(false).nonoptional({ message: "Campo obrigatório." }),    
    possui_periodo_fechado: z.boolean().default(false).nonoptional({ message: "Campo obrigatório." }),
    data_fim_periodo: z.date().optional().nullable(),
  });

const validarRegrasCargosBase = (data: z.infer<typeof camposCargosBase>, ctx: z.RefinementCtx) => {
    const quantidadeMaximaDeDiasDeLicenca = data.quantidade_maxima_de_dias_de_licenca==="" ? 0 : Number.parseInt(data.quantidade_maxima_de_dias_de_licenca ?? "0");
    const pesquisarLicencasNoSigpec = data.pesquisar_licencas_no_sigpec;
    
    if (pesquisarLicencasNoSigpec && quantidadeMaximaDeDiasDeLicenca <= 0) {    
      ctx.addIssue({
        code: "custom",
        message: "A quantidade máxima de dias de licença deve ser maior que 0.",
        path: ["quantidade_maxima_de_dias_de_licenca"],
      });
    }

    if (data.possui_periodo_fechado && !data.data_fim_periodo) {
      ctx.addIssue({
        code: "custom",
        message: "A data final do período é obrigatória.",
        path: ["data_fim_periodo"],
      });
    }
};

export const createFormSchemaCargosBase = camposCargosBase
  .extend({
    descricao_eol: z
      .string()
      .trim()
      .min(1, { message: "Campo obrigatório." })
      .max(255, { message: "A descrição do EOL deve ter no máximo 255 caracteres." }),
  })
  .superRefine(validarRegrasCargosBase);

// A API ignora descricao_eol na edição, então ela não pode bloquear o salvamento.
export const editFormSchemaCargosBase = camposCargosBase
  .extend({
    descricao_eol: z.string().optional(),
  })
  .superRefine(validarRegrasCargosBase);

export type createFormSchemaCargosBaseData = z.infer<typeof createFormSchemaCargosBase>;

export default createFormSchemaCargosBase;
