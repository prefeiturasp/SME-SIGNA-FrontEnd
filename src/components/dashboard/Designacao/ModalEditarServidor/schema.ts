import { z } from "zod";

const formSchemaEditarServidor = z.object({
  nome_servidor: z.string().min(1, "Digite o nome do servidor"),
  nome_civil: z.string().min(1, "Digite o nome civil do servidor"),
  rf: z.string().optional(),
  
  funcao: z.string().nullable().optional(),
  cargo_sobreposto: z.string().optional(),
  
  cargo_base: z.string().optional(),
  funcao_atividade: z.string().nullable().optional(),

  vinculo_cargo_sobreposto: z.number().optional(),
  dre: z.string().optional(),

    
  lotacao_cargo_sobreposto: z.string().optional(),
  codigo_estrutura_hierarquica: z.string().optional(),
  
  
  // Esses campos não são editáveis neste modal (estão disabled) e podem vir vazios.
  local_de_exercicio: z.string().optional(),
  laudo_medico: z.string().optional(),
  local_de_servico: z.string().optional(),

  // Não há campo no formulário atualmente; não bloquear submit.
  esta_afastado: z.boolean().optional(),
  
});

export type FormEditarServidorData = z.infer<typeof formSchemaEditarServidor>;

export default formSchemaEditarServidor;
