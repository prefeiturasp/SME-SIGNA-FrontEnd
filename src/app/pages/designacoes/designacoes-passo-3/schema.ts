import { z } from "zod";

const formSchemaDesignacaoPasso3 = z
  .object({
    informacoes_adicionais: z.string().optional(),
    detalhe_para_quadro_de_historico_por_ano: z.boolean().optional(),    
  });
  
  

export type formSchemaDesignacaoPasso3Data = z.infer<typeof formSchemaDesignacaoPasso3>;

export default formSchemaDesignacaoPasso3;
