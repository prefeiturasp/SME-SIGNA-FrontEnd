import { z } from "zod";

const formSchemaAnularApostila = z.object({
  apostila: z.object({
    portaria: z.string().min(1, "Campo obrigatório"),
    ano: z.string().min(1, "Campo obrigatório"),
    numero_sei: z.string().min(1, "Campo obrigatório"),
    doc: z.date(),
    observacao: z.string().optional(),
    texto_para_apostila: z.string().optional(),
  }),
});

export type formSchemaAnularApostilaData = z.infer<typeof formSchemaAnularApostila>;

export default formSchemaAnularApostila;