import { z } from "zod";

const formSchemaDesignacaoPasso2 = z.object({
  portaria_designacao: z.string().min(1, "Selecione uma Portaria de Designação"),
  numero_sei: z.string().min(1, "Selecione uma UE"),
});

export type formSchemaDesignacaoPasso2Data = z.infer<typeof formSchemaDesignacaoPasso2>;

export default formSchemaDesignacaoPasso2;
