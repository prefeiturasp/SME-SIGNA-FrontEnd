import { describe, it, expect, vi, beforeEach } from "vitest";

const mockDelete = vi.fn();

vi.mock("next/headers", () => ({
    cookies: vi.fn(() => ({
        delete: mockDelete,
    })),
}));

describe("logoutAction", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("deve remover os cookies de autenticação e de dados do usuário", async () => {
        const { logoutAction } = await import("./logout");

        await logoutAction();

        expect(mockDelete).toHaveBeenCalledTimes(1);
        expect(mockDelete).toHaveBeenCalledWith("auth_token");
    });
});
