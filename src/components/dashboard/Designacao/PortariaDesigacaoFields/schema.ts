import { z } from "zod";

const formSchemaDesignacao = z.object({
  dre: z.string().min(1, "Selecione uma DRE"),
  ue: z.string().min(1, "Selecione uma UE"),
  codigo_estrutura_hierarquica: z.string().optional(),
  funcionarios_da_unidade: z.string().optional(),
  quantidade_turmas: z.string().optional(),
  cargo_sobreposto: z.string().optional(),
  modulos: z.string().optional(),
});

export type FormDesignacaoData = z.infer<typeof formSchemaDesignacao>;

export default formSchemaDesignacao;
