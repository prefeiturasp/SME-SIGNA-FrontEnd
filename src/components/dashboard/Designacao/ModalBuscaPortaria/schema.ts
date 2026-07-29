import { z } from "zod";

const formSchemaBuscaPortaria = z.object({
  portaria: z.string().min(1, "Digite um número válido."),
  ano: z.string().min(1, "Selecione o ano."),
});

export type FormBuscaPortariaData = z.infer<typeof formSchemaBuscaPortaria>;

export default formSchemaBuscaPortaria;
