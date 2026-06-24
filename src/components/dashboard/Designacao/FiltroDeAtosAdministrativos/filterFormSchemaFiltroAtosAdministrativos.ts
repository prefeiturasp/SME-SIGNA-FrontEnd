import { z } from "zod";
 
export const filterFormSchemaFiltroAtosAdministrativos = z
  .object({
      numero_sei: z.string().optional(),
     tipo: z.string().optional(),
    portaria: z.string().optional(),
    nome_titular_e_indicado: z.string().optional(),
    status_publicacao: z.string().optional(), 
    periodo_after: z.string().optional(),
    periodo_before: z.string().optional(),
    periodo: z
      .object({
        from: z.date().optional(),
        to: z.date().optional(),
      })
      .nullable()
      .optional(),
   });
   
export type filterFormSchemaFiltroAtosAdministrativosData = z.infer<typeof filterFormSchemaFiltroAtosAdministrativos>;

export default filterFormSchemaFiltroAtosAdministrativos;
