import { z } from "zod";

const formSchemaAnularApostila = z.object({
  apostila: z.object({
    portaria: z.number().optional(),
    ano: z.number().optional(),
    numero_sei: z.string().min(1, "Campo obrigatório"),
    doc: z.string().optional(),
    observacao: z.string().optional(),
    texto_para_apostila: z.string().optional(),
  }),
});

export type formSchemaAnularApostilaData = z.infer<typeof formSchemaAnularApostila>;

export default formSchemaAnularApostila;