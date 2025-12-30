import { describe, it, expect } from "vitest";
import formSchema from "./schema";

describe("FormRecuperarSenha Schema", () => {
    describe("username field validation", () => {
        it("aceita RF válido com 7 caracteres", () => {
            const result = formSchema.safeParse({ username: "1234567" });
            expect(result.success).toBe(true);
        });

        it("aceita RF válido com 8 caracteres", () => {
            const result = formSchema.safeParse({ username: "12345678" });
            expect(result.success).toBe(true);
        });

        it("aceita CPF válido com 11 caracteres", () => {
            const result = formSchema.safeParse({ username: "47198005055" });
            expect(result.success).toBe(true);
        });

        it("rejeita username com menos de 7 caracteres", () => {
            const result = formSchema.safeParse({ username: "123456" });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("RF ou CPF é obrigatório");
            }
        });

        it("rejeita username com mais de 11 caracteres", () => {
            const result = formSchema.safeParse({ username: "123456789012" });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "RF ou CPF deve ter no máximo 11 caracteres"
                );
            }
        });

        it("rejeita CPF inválido com 11 caracteres", () => {
            const result = formSchema.safeParse({ username: "12345678901" });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("CPF inválido");
            }
        });

        it("rejeita CPF com todos dígitos iguais", () => {
            const result = formSchema.safeParse({ username: "11111111111" });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("CPF inválido");
            }
        });

        it("aceita outro CPF válido", () => {
            const result = formSchema.safeParse({ username: "64718737001" });
            expect(result.success).toBe(true);
        });

        it("rejeita username vazio", () => {
            const result = formSchema.safeParse({ username: "" });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("RF ou CPF é obrigatório");
            }
        });
    });
});

