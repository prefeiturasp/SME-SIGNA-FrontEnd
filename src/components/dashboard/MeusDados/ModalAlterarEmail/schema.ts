import { z } from "zod";

const formSchema = z.object({
    email: z
        .string()
        .email("Digite um e-mail válido!")
        .refine(
            (val) =>
                /^([a-zA-Z0-9_.+-]+)@sme\.prefeitura\.sp\.gov\.br$/.test(val),
            {
                message:
                    "Use apenas e-mails institucionais (@sme.prefeitura.sp.gov.br)",
            }
        ),
});

export type FormDataChangeEmail = z.infer<typeof formSchema>;

export default formSchema;
