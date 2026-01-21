import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useUserStore, User } from "./useUserStore";

vi.mock("@/actions/logout", () => ({
    logoutAction: vi.fn(),
}));

import { logoutAction } from "@/actions/logout";

const mockUser: User = {
    username: "testuser",
    name: "Test User",
    email: "test@example.com",
    cpf: "123.456.789-00",
    rede: "SME",
    is_core_sso: false,
    is_validado: true,
    perfil_acesso: {
        codigo: 1,
        nome: "Perfil Teste",
    },
    unidades: [
        {
            ue: {
                codigo_eol: "123",
                nome: "UE Teste",
                sigla: "UET",
            },
            dre: {
                codigo_eol: "456",
                nome: "DRE Teste",
                sigla: "DRET",
            },
        },
    ],
};

describe("useUserStore", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        act(() => {
            useUserStore.setState({ user: null });
        });
    });

    it("deve iniciar com o usuário nulo", () => {
        const { result } = renderHook(() => useUserStore());
        expect(result.current.user).toBeNull();
    });

    it("deve definir o usuário com setUser", () => {
        const { result } = renderHook(() => useUserStore());

        act(() => {
            result.current.setUser(mockUser);
        });

        expect(result.current.user).toEqual(mockUser);
    });

    it("deve limpar o usuário e chamar logoutAction com clearUser", async () => {
        const { result } = renderHook(() => useUserStore());

        act(() => {
            result.current.setUser(mockUser);
        });
        expect(result.current.user).toEqual(mockUser);

        await act(async () => {
            await result.current.clearUser();
        });

        expect(logoutAction).toHaveBeenCalledTimes(1);
        expect(result.current.user).toBeNull();
    });
});
