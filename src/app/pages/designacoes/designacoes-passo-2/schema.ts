import { z } from "zod";

const formSchemaDesignacaoPasso2 = z.object({
  portaria_designacao: z.string().min(1, "Selecione uma Portaria de Designação"),
  numero_sei: z.string().min(1, "Digite o número do SEI"),
  a_partir_de: z.date(),//.required("Selecione a data de início"),
  designacao_data_final: z.date(),//.required("Selecione a data de início"),
  ano: z.string().min(1, "Selecione o ano"),
  doc: z.string().min(1, "Digite o número do documento"),
  motivo_cancelamento: z.string().min(1, "Digite o motivo do cancelamento"),
  impedimento_substituicao: z.string().min(1, "Selecione o impedimento para substituição"),
  com_afastamento: z.string().min(1, "Selecione o impedimento para substituição"),
  motivo_afastamento: z.string().min(1, "Digite o motivo de afastamento"),
});

export type formSchemaDesignacaoPasso2Data = z.infer<typeof formSchemaDesignacaoPasso2>;

export default formSchemaDesignacaoPasso2;
