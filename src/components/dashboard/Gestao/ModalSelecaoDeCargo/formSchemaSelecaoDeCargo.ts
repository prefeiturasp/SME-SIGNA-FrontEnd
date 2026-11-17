import { z } from "zod";

export const formSchemaSelecaoDeCargo = z.object({
  codigo_cargo: z.string().min(1, "Selecione um cargo"),
});

export type formSchemaSelecaoDeCargoData = z.infer<typeof formSchemaSelecaoDeCargo>;

export default formSchemaSelecaoDeCargo;
