import { z } from "zod";
import {
  NUMERO_PORTARIA_MAX_DIGITOS,
  NUMERO_PORTARIA_MAX_LABEL,
  excedeNumeroPortaria,
} from "@/utils/portarias/numeroPortaria";

const formSchemaAnularApostilaTornarSemEfeito = z.object({
  apostila_insubsistencia: z.object({
    portaria: z
      .string()
      .min(1, "Campo obrigatório")
      .max(NUMERO_PORTARIA_MAX_DIGITOS, `A Portaria deve ter no máximo ${NUMERO_PORTARIA_MAX_DIGITOS} dígitos`)
      .regex(/^\d*$/, "A Portaria deve conter apenas números")
      .refine(
        (valor) => !excedeNumeroPortaria(valor),
        `A Portaria deve ser no máximo ${NUMERO_PORTARIA_MAX_LABEL}`
      ),
    ano: z.string().min(1, "Campo obrigatório"),
    numero_sei: z.string().min(1, "Campo obrigatório"),
    doc: z.date(),
    observacao: z.string().optional(),
    texto_para_apostila: z.string().optional(),
  }),
});

export type formSchemaAnularApostilaTornarSemEfeitoData = z.infer<typeof formSchemaAnularApostilaTornarSemEfeito>;

export default formSchemaAnularApostilaTornarSemEfeito;