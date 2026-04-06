import { z } from "zod";

const formSchemaFiltroDesignacao = z.object({

  rf: z.string().optional(),
  nome_servidor: z.string().optional(),
  periodo: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
  cargo_base: z.string().optional(),
  cargo_sobreposto: z.string().optional(),
  dre: z.string().optional(),
  unidade_escolar: z.string().optional(),
  ano: z.string().optional(),
});

export type formSchemaFiltroDesignacaoData = z.infer<typeof formSchemaFiltroDesignacao>;

export default formSchemaFiltroDesignacao;
