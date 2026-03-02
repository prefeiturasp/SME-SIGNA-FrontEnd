import { z } from "zod";

const formSchemaDesignacao = z.object({
  dre: z.string().min(1, "Selecione uma DRE"),
  dre_nome: z.string().optional(),
  ue: z.string().min(1, "Selecione uma UE"),
  ue_nome: z.string().optional(),
  codigo_estrutura_hierarquica: z.string().optional(),
  funcionarios_da_unidade: z.string().optional(),
  quantidade_turmas: z.string().optional(),
  cargo_sobreposto: z.string().optional(),
  modulos: z.string().optional(),
});

export type FormDesignacaoData = z.infer<typeof formSchemaDesignacao>;

export default formSchemaDesignacao;
