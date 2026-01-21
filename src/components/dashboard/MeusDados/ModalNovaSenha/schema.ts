import { z } from "zod";

const passwordSchema = z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .max(12, "A senha deve ter no máximo 12 caracteres")
    .refine((v) => /[A-Z]/.test(v), {
        message: "A senha deve conter ao menos uma letra maiúscula",
    })
    .refine((v) => /[a-z]/.test(v), {
        message: "A senha deve conter ao menos uma letra minúscula",
    })
    .refine((v) => /\d/.test(v), {
        message: "A senha deve conter ao menos um número",
    })
    .refine((v) => /[!@#_]/.test(v), {
        message: "A senha deve conter ao menos um carácter especial (!@#_)",
    });

const formSchema = z
    .object({
        oldPassword: z.string(),
        password: passwordSchema,
        confirmPassword: z
            .string()
            .min(8, "A senha deve ter no mínimo 8 caracteres")
            .max(12, "A senha deve ter no máximo 12 caracteres"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "As senhas não coincidem",
    });

export type FormAlterarSenha = z.infer<typeof formSchema>;
export default formSchema;
