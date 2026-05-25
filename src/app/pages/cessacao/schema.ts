import { z } from "zod";

const formSchemaCessacao = z.object({
  cessacao: z.object({
    numero_portaria: z.string().min(1, "Campo obrigatório"),
    ano: z.string().min(1, "Campo obrigatório"),
    numero_sei: z.string().min(1, "Campo obrigatório"),
    a_pedido: z.enum(["sim", "nao"]),

    data_inicio: z.date(),
    remocao: z.enum(["sim", "nao"]),
    aposentadoria: z.enum(["sim", "nao"]),
    doc: z.string().optional(),
  }),
});

export type formSchemaCessacaoData = z.infer<typeof formSchemaCessacao>;

export default formSchemaCessacao;