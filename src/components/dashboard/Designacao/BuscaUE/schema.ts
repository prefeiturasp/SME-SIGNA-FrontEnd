import { z } from "zod";

const formSchemaDesignacao = z.object({
  dre: z.string().min(1, "Selecione uma DRE"),
  ue: z.string().min(1, "Selecione uma UE"),
});

export type FormDesignacaoData = z.infer<typeof formSchemaDesignacao>;

export default formSchemaDesignacao;
