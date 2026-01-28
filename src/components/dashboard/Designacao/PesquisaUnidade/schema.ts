import { z } from "zod";

const formSchemaDesignacao = z.object({
  dre: z.string().min(1, "Selecione uma DRE"),
  ue: z.string().min(1, "Selecione uma UE"),
  codigo_estrutura_hierarquica: z.string().min(1, "Código estrutura hierárquica é obrigatório"),
});

export type FormDesignacaoData = z.infer<typeof formSchemaDesignacao>;

export default formSchemaDesignacao;
