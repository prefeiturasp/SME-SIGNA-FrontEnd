import { z } from "zod";

const formSchemaDesignacaoPasso2 = z
  .object({
    portaria_designacao: z.string().min(1, "Selecione uma Portaria de Designação"),
    numero_sei: z.string().min(1, "Digite o número do SEI"),
    a_partir_de: z.date(),
    designacao_data_final: z.date().optional().nullable(),
    ano: z.string().min(1, "Selecione o ano"),
    doc: z.string().optional(),
    impedimento_substituicao: z.string().optional().nullable(),
    carater_especial: z.string().min(1, "selecione se possui carater especial "),
    com_afastamento: z.string().min(1, "selecione se possui afastamento"),
    motivo_afastamento: z.string(),
    com_pendencia: z.string().min(1, "Selecione se possui pendêcia"),
    motivo_pendencia: z.string(),
    tipo_cargo: z.enum(["vago", "disponivel"]),
    rf_titular: z.string().optional(),

    cargo_vago_selecionado: z
      .object({
        id: z.number(),
        label: z.string(),
      })
      .optional()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.tipo_cargo === "vago") {
      if (!data.cargo_vago_selecionado?.id) {
        ctx.addIssue({
          code: "custom",
          message: "Selecione um cargo",
          path: ["cargo_vago_selecionado"],
        });
      }
    }
  });

export type formSchemaDesignacaoPasso2Data = z.infer<typeof formSchemaDesignacaoPasso2>;

export default formSchemaDesignacaoPasso2;
