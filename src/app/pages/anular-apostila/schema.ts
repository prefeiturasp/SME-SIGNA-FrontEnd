import { z } from "zod";

const formSchemaAnularApostilaTornarSemEfeito = z.object({
  apostila_insubsistencia: z.object({
    portaria: z.string().min(1, "Campo obrigatório"),
    ano: z.string().min(1, "Campo obrigatório"),
    numero_sei: z.string().min(1, "Campo obrigatório"),
    doc: z.date(),
    observacao: z.string().optional(),
    texto_para_apostila: z.string().optional(),
  }),
});

export type formSchemaAnularApostilaTornarSemEfeitoData = z.infer<typeof formSchemaAnularApostilaTornarSemEfeito>;

export default formSchemaAnularApostilaTornarSemEfeito;