import { EnumCheckbox } from "@/components/ui/FieldsForm";
import { z } from "zod";
import {
  NUMERO_PORTARIA_MAX_DIGITOS,
  NUMERO_PORTARIA_MAX_LABEL,
  excedeNumeroPortaria,
} from "@/utils/portarias/numeroPortaria";


const formSchemaCessacao = z.object({
  cessacao: z.object({
    numero_portaria: z
      .string()
      .min(1, "Campo obrigatório")
      .max(NUMERO_PORTARIA_MAX_DIGITOS, `A Portaria de Cessação deve ter no máximo ${NUMERO_PORTARIA_MAX_DIGITOS} dígitos`)
      .regex(/^\d*$/, "A Portaria de Cessação deve conter apenas números")
      .refine(
        (valor) => !excedeNumeroPortaria(valor),
        `A Portaria de Cessação deve ser no máximo ${NUMERO_PORTARIA_MAX_LABEL}`
      ),
    ano: z.string().min(1, "Campo obrigatório"),
    numero_sei: z.string().min(1, "Campo obrigatório"),
    a_pedido: z.enum([EnumCheckbox.SIM, EnumCheckbox.NAO]),

    data_inicio: z.date(),
    remocao: z.enum([EnumCheckbox.SIM, EnumCheckbox.NAO]),
    aposentadoria: z.enum([EnumCheckbox.SIM, EnumCheckbox.NAO]),
    doc: z.string().optional(),
  }),
});

export type formSchemaCessacaoData = z.infer<typeof formSchemaCessacao>;

export default formSchemaCessacao;