import { z } from "zod";
 
export const filterFormSchemaFiltroDO = z
  .object({
    numero_sei: z.string().optional(),
    ano: z.string().optional(),
    tipo: z.string().optional(),
    portaria_inicial: z.string().optional(),

    portaria_final: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const numeroSei = data.numero_sei?.trim();

    const portariaInicial = data.portaria_inicial?.trim();
    const portariaFinal = data.portaria_final?.trim();

    if (numeroSei) return;

    const apenasUmaPortaria =
      (portariaInicial && !portariaFinal) ||
      (!portariaInicial && portariaFinal);

    if (apenasUmaPortaria) {
      ctx.addIssue({
        code: "custom",
        path: ["portaria_inicial"],
        message:
          "Preencha portaria inicial e final juntas quando não houver Nº SEI.",
      });

      ctx.addIssue({
        code: "custom",
        path: ["portaria_final"],
        message:
          "Preencha portaria inicial e final juntas quando não houver Nº SEI.",
      });
    }
  });
export type filterFormSchemaFiltroDOData = z.infer<typeof filterFormSchemaFiltroDO>;

export default filterFormSchemaFiltroDO;
