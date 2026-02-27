import { z } from "zod";

// --- 1. SCHEMA PARA O COMPONENTE DE BUSCA (Lupa) ---
export const buscaDesignacaoSchema = z.object({
  rf: z.string().min(1, "O RF é obrigatório para a pesquisa"),
});

export type BuscaDesignacaoRequest = z.infer<typeof buscaDesignacaoSchema>;


const formSchemaDesignacaoPasso2 = z.object({
  portaria_designacao: z.string().min(1, "Obrigatório"),
  numero_sei: z.string().min(1, "Obrigatório"),
  a_partir_de: z.date(),
  designacao_data_final: z.date(),
  
  tipo_cargo: z.enum(["vago", "disponivel"]),
  rf_titular: z.string().optional(),
  cargo_vago_selecionado: z.string().optional(), 
})
.superRefine((data, ctx) => {
  if (data.tipo_cargo === "disponivel" && (!data.rf_titular || data.rf_titular.length < 1)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "RF do Titular é obrigatório",
      path: ["rf_titular"],
    });
  }

  if (data.tipo_cargo === "vago" && !data.cargo_vago_selecionado) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Selecione o cargo vago",
      path: ["cargo_vago_selecionado"],
    });
  }
});

export type formSchemaDesignacaoPasso2Data = z.infer<typeof formSchemaDesignacaoPasso2>;
export default formSchemaDesignacaoPasso2;