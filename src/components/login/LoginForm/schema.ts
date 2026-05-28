import { z } from "zod";

const formSchemaLogin = z.object({
    seu_rf: z.string().min(1, "Campo obrigatório"),
    senha: z.string().min(1, "Campo obrigatório"),
 
 });

 
export default formSchemaLogin;