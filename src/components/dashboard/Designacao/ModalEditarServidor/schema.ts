import { z } from "zod";

const formSchemaEditarServidor = z.object({
  nome_servidor: z.string().min(1, "Digite o nome do servidor"),
  nome_civil: z.string().optional(),
  rf: z.string().optional(),
  
  funcao: z.string().nullable().optional(),
  // Campos somente leitura vindos do EOL: podem chegar como null.
  cargo_sobreposto_funcao_atividade: z.string().nullish(),
  
  cargo_base: z.string().nullish(),
  funcao_atividade: z.string().nullable().optional(),

  vinculo: z.number().optional(),
  dre: z.string().nullish(),

    
  lotacao: z.string().nullish(),
  
  local_de_exercicio: z.string().nullish(),

  categoria: z
    .string()
    .max(2, "Máximo 2 dígitos")
    .regex(/^\d*$/, "Apenas números são permitidos")
    .optional(),

  // Esses campos não são editáveis neste modal (estão disabled) e podem vir vazios.
  cursos_titulos: z.string().nullish(),
  laudo_medico: z.string().nullish(),
  local_de_servico: z.string().nullish(),

  // Não há campo no formulário atualmente; não bloquear submit.
  esta_afastado: z.boolean().optional(),
  
});

export type FormEditarServidorData = z.infer<typeof formSchemaEditarServidor>;

export default formSchemaEditarServidor;
