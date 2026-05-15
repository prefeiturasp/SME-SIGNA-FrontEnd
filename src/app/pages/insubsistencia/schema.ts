import { z } from "zod";

const formSchemaInsubsistencia = z.object({
  insubsistencia: z.object({
    numero_portaria: z.string().min(1, "Campo obrigatório"),
    ano: z.string().min(1, "Campo obrigatório"),
    numero_sei: z.string().min(1, "Campo obrigatório"),
    doc: z.string().optional(),
    observacoes: z.string().optional(),
    tipo_insubsistencia: z.string().nonempty("Campo obrigatório"),
  }),
});

export type formSchemaInsubsistenciaData = z.infer<typeof formSchemaInsubsistencia>;

export default formSchemaInsubsistencia;