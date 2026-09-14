import { z } from "zod";
import {
  NUMERO_PORTARIA_MAX_DIGITOS,
  NUMERO_PORTARIA_MAX_LABEL,
  excedeNumeroPortaria,
} from "@/utils/portarias/numeroPortaria";

const formSchemaInsubsistencia = z.object({
  insubsistencia: z.object({
    numero_portaria: z
      .string()
      .min(1, "Campo obrigatório")
      .max(NUMERO_PORTARIA_MAX_DIGITOS, `A Portaria de Insubsistência deve ter no máximo ${NUMERO_PORTARIA_MAX_DIGITOS} dígitos`)
      .regex(/^\d*$/, "A Portaria de Insubsistência deve conter apenas números")
      .refine(
        (valor) => !excedeNumeroPortaria(valor),
        `A Portaria de Insubsistência deve ser no máximo ${NUMERO_PORTARIA_MAX_LABEL}`
      ),
    ano: z.string().min(1, "Campo obrigatório"),
    numero_sei: z.string().min(1, "Campo obrigatório"),
    doc: z.string().optional(),
    observacoes: z.string().optional(),
    tipo_insubsistencia: z.string().nonempty("Campo obrigatório"),
  }),
});

export type formSchemaInsubsistenciaData = z.infer<typeof formSchemaInsubsistencia>;

export default formSchemaInsubsistencia;