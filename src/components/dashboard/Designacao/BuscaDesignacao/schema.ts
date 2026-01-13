import { z } from "zod";
export const  buscaDesignacaoSchema = z.object({
    rf: z.string().min(1, "Número da unidade é obrigatório"),
    nome_do_servidor: z.string().optional(),
  });
  