import { z } from "zod";
import { isValidCPF } from "@/lib/utils";

const normalize = (s: string) => s.replace(/\s+/g, " ").trim();
const fullName = z
    .string()
    .transform(normalize)
    .refine((v) => !/\d/.test(v), { message: "Não use números no nome" })
    .refine((v) => v.split(" ").filter(Boolean).length >= 2, {
        message: "Informe nome e sobrenome",
    });

const formSchema = z.object({
    dre: z.string().min(1, "DRE é obrigatória"),
    ue: z.string().min(1, "UE é obrigatória"),
    fullName: fullName,
    cpf: z
        .string()
        .min(11, "CPF é obrigatório")
        .max(14, "CPF deve ter 11 dígitos")
        .refine((val) => isValidCPF(val.replace(/\D/g, "")), {
            message: "CPF inválido",
        }),
    email: z
        .string()
        .email("E-mail inválido")
        .refine(
            (val) =>
                /^([a-zA-Z0-9_.+-]+)@sme\.prefeitura\.sp\.gov\.br$/.test(val),
            {
                message:
                    "Use apenas e-mails institucionais (@sme.prefeitura.sp.gov.br)",
            }
        ),
});

export type FormDataSignup = z.infer<typeof formSchema>;

export default formSchema;
