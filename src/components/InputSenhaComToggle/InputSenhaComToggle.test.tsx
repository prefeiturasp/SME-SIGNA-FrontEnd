import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import InputSenhaComToggle from "./InputSenhaComToggle";

vi.mock("@/components/ui/input", () => ({
    Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
        <input {...props} />
    ),
}));

describe("InputSenhaComToggle", () => {
    it("renderiza o input do tipo password por padrão", () => {
        render(<InputSenhaComToggle placeholder="Senha" />);
        const input = screen.getByPlaceholderText("Senha");
        expect(input).toHaveAttribute("type", "password");
    });

    it("alterna para tipo text ao clicar no botão de exibir senha", async () => {
        render(<InputSenhaComToggle placeholder="Senha" />);
        const input = screen.getByPlaceholderText("Senha");
        const btn = screen.getByRole("button");
        expect(input).toHaveAttribute("type", "password");
        await userEvent.click(btn);
        expect(input).toHaveAttribute("type", "text");
        await userEvent.click(btn);
        expect(input).toHaveAttribute("type", "password");
    });

    it("chama onChange ao digitar no input", async () => {
        const onChange = vi.fn();
        render(<InputSenhaComToggle placeholder="Senha" onChange={onChange} />);
        const input = screen.getByPlaceholderText("Senha");
        await userEvent.type(input, "abc123");
        expect(onChange).toHaveBeenCalled();
    });

    it("respeita a prop disabled", () => {
        render(<InputSenhaComToggle placeholder="Senha" disabled />);
        const input = screen.getByPlaceholderText("Senha");
        expect(input).toBeDisabled();
    });
});
