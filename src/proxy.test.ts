import { describe, it, expect, vi, beforeEach } from "vitest";
import { proxy } from "./proxy";
import { NextRequest, NextResponse } from "next/server";

describe("proxy middleware", () => {
    const createMockRequest = (pathname: string, hasAuthToken: boolean = false) => {
        const url = `http://localhost:3000${pathname}`;
        const request = {
            nextUrl: {
                pathname,
            },
            url,
            cookies: {
                get: vi.fn((name: string) => {
                    if (name === "auth_token") {
                        return hasAuthToken ? { value: "token123" } : undefined;
                    }
                    return undefined;
                }),
            },
        } as unknown as NextRequest;

        return request;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("rotas públicas", () => {
        it("permite acesso a / sem autenticação", () => {
            const request = createMockRequest("/", false);
            const response = proxy(request);

            expect(response.status).not.toBe(307); // 307 = redirect
        });

        it("permite acesso a /cadastro sem autenticação", () => {
            const request = createMockRequest("/cadastro", false);
            const response = proxy(request);

            expect(response.status).not.toBe(307);
        });

        it("permite acesso a /recuperar-senha sem autenticação", () => {
            const request = createMockRequest("/recuperar-senha", false);
            const response = proxy(request);

            expect(response.status).not.toBe(307);
        });

        it("permite acesso a /recuperar-senha/[code]/[token] sem autenticação", () => {
            const request = createMockRequest("/recuperar-senha/abc123/token456", false);
            const response = proxy(request);

            expect(response.status).not.toBe(307);
        });
    });

    describe("rotas protegidas", () => {
        it("redireciona para / quando não autenticado e acessando dashboard", () => {
            const request = createMockRequest("/pages", false);
            const response = proxy(request);

            expect(response.status).toBe(307);
            expect(response.headers.get("location")).toBe("http://localhost:3000/");
        });

        it("permite acesso ao pages quando autenticado", () => {
            const request = createMockRequest("/pages", true);
            const response = proxy(request);

            // Quando autenticado e acessando rota privada, passa normalmente
            expect(response.status).not.toBe(307);
        });
    });

    describe("redirecionamentos quando autenticado", () => {
        it("redireciona para /pages quando autenticado e acessando /", () => {
            const request = createMockRequest("/", true);
            const response = proxy(request);

            expect(response.status).toBe(307);
            expect(response.headers.get("location")).toBe("http://localhost:3000/pages");
        });

        it("redireciona para /pages quando autenticado e acessando /cadastro", () => {
            const request = createMockRequest("/cadastro", true);
            const response = proxy(request);

            expect(response.status).toBe(307);
            expect(response.headers.get("location")).toBe("http://localhost:3000/pages");
        });

        it("redireciona para /pages quando autenticado e acessando /recuperar-senha", () => {
            const request = createMockRequest("/recuperar-senha", true);
            const response = proxy(request);

            expect(response.status).toBe(307);
            expect(response.headers.get("location")).toBe("http://localhost:3000/pages");
        });
    });

    describe("rotas especiais", () => {
        it("permite acesso a /confirmar-email/ independente de autenticação", () => {
            const requestUnauth = createMockRequest("/confirmar-email/token123", false);
            const responseUnauth = proxy(requestUnauth);

            expect(responseUnauth.status).not.toBe(307);

            const requestAuth = createMockRequest("/confirmar-email/token123", true);
            const responseAuth = proxy(requestAuth);

            expect(responseAuth.status).not.toBe(307);
        });
    });

    describe("normalização de paths", () => {
        it("normaliza paths com trailing slash", () => {
            const request = createMockRequest("/cadastro/", false);
            const response = proxy(request);

            // Deve ser tratado como público
            expect(response.status).not.toBe(307);
        });
    });
});

