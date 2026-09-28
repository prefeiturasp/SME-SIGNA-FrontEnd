import { z } from "zod";
import {
  NUMERO_PORTARIA_MAX_DIGITOS,
  NUMERO_PORTARIA_MAX_LABEL,
  excedeNumeroPortaria,
} from "@/utils/portarias/numeroPortaria";

const formSchemaBuscaPortaria = z.object({
  portaria: z
    .string()
    .min(1, "Digite um número válido.")
    .max(NUMERO_PORTARIA_MAX_DIGITOS, `A Portaria deve ter no máximo ${NUMERO_PORTARIA_MAX_DIGITOS} dígitos`)
    .regex(/^\d*$/, "A Portaria deve conter apenas números")
    .refine(
      (valor) => !excedeNumeroPortaria(valor),
      `A Portaria deve ser no máximo ${NUMERO_PORTARIA_MAX_LABEL}`
    ),
  ano: z.string().min(1, "Selecione o ano."),
});

export type FormBuscaPortariaData = z.infer<typeof formSchemaBuscaPortaria>;

export default formSchemaBuscaPortaria;
