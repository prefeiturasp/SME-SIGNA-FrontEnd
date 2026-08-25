import { z } from "zod";

const formSchemaApostila = z.object({
  apostila: z.object({
    numero_sei: z.string().min(1, "Campo obrigatório"),
    doc: z.string().optional(),
    observacao: z.string().min(1, "Campo obrigatório"),
    ato_apostilado: z.string().nonempty("Campo obrigatório"),
  }),
});

export type formSchemaApostilaData = z.infer<typeof formSchemaApostila>;

export default formSchemaApostila;