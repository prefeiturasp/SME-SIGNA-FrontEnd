import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

const mockUser: MockUser = {
    username: "12345",
    name: "JOÃO DA SILVA",
    perfil_acesso: { nome: "Assistente de diretor", codigo: 3085 },
    cpf: "123.456.789-00",
};

interface MockUser {
    username: string;
    name: string;
    perfil_acesso: { nome: string; codigo: number };
    cpf: string;
}

vi.mock("@/stores/useUserStore", () => ({
    useUserStore: (selector: (state: { user: MockUser }) => unknown) =>
        selector({
            user: mockUser,
        }),
}));

import QuadroUsuario from "./QuadroUsuario";

describe("QuadroUsuario", () => {
    it("renderiza o name do usuário", () => {
        render(<QuadroUsuario />);
        expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    });

    it("renderiza o CPF do usuário", () => {
        render(<QuadroUsuario />);
        expect(screen.getByText(`CPF: ${mockUser.cpf}`)).toBeInTheDocument();
    });

    it("renderiza o RF do usuário", () => {
        render(<QuadroUsuario />);
        expect(
            screen.getByText(`RF: ${mockUser.username}`)
        ).toBeInTheDocument();
    });
});
