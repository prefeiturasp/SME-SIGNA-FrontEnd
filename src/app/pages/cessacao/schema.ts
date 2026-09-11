import { EnumCheckbox } from "@/components/ui/FieldsForm";
import { z } from "zod";


const formSchemaCessacao = z.object({
  cessacao: z.object({
    numero_portaria: z.string().min(1, "Campo obrigatório"),
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