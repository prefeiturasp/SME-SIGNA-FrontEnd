/**
 * @vitest-environment jsdom
 */

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { FormProvider, useForm } from "react-hook-form";
import React from "react";
import InputSenhaComValidador from "./InputSenhaComValidador";

// Wrapper que cria contexto do react-hook-form
function FormWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
    const methods = useForm();
    return <FormProvider {...methods}>{children}</FormProvider>;
}

// Wrapper para simular atualização de estado dos inputs
function ControlledInputSenhaComValidador(
    props: Readonly<React.ComponentProps<typeof InputSenhaComValidador>>
) {
    const [password, setPassword] = React.useState(props.password || "");
    const [confirmPassword, setConfirmPassword] = React.useState(
        props.confirmPassword || ""
    );
    return (
        <InputSenhaComValidador
            {...props}
            password={password}
            confirmPassword={confirmPassword}
            onPasswordChange={(val) => {
                setPassword(val);
                props.onPasswordChange(val);
            }}
            onConfirmPasswordChange={(val) => {
                setConfirmPassword(val);
                props.onConfirmPasswordChange(val);
            }}
        />
    );
}

function renderWithFormProvider(ui: React.ReactElement) {
    return render(<FormWrapper>{ui}</FormWrapper>);
}

describe("InputSenhaComValidador", () => {
    const mockOnPasswordChange = vi.fn();
    const mockOnConfirmPasswordChange = vi.fn();

    const criteria = [
        { label: "Mínimo 8 caracteres", test: (v: string) => v.length >= 8 },
        {
            label: "Contém letra maiúscula",
            test: (v: string) => /[A-Z]/.test(v),
        },
    ];

    const passwordStatus = [true, false];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renderiza critérios e ícones corretos", () => {
        renderWithFormProvider(
            <InputSenhaComValidador
                password="Password123"
                confirmPassword=""
                onPasswordChange={mockOnPasswordChange}
                onConfirmPasswordChange={mockOnConfirmPasswordChange}
                criteria={criteria}
                passwordStatus={passwordStatus}
            />
        );

        expect(screen.getByText(/Mínimo 8 caracteres/i)).toBeInTheDocument();
        expect(screen.getByText(/Contém letra maiúscula/i)).toBeInTheDocument();

        const checkIcon = screen.getByTestId("check-icon");
        const closeCheckIcon = screen.getByTestId("close-check-icon");
        expect(checkIcon).toBeInTheDocument();
        expect(closeCheckIcon).toBeInTheDocument();
    });

    it("chama callback ao digitar senha e envia valor final corretamente", async () => {
        const user = userEvent.setup();
        renderWithFormProvider(
            <ControlledInputSenhaComValidador
                password=""
                confirmPassword=""
                onPasswordChange={mockOnPasswordChange}
                onConfirmPasswordChange={mockOnConfirmPasswordChange}
                criteria={criteria}
                passwordStatus={[false, false]}
            />
        );

        const passwordInput = screen.getByPlaceholderText(/digite sua senha/i);
        await user.type(passwordInput, "MinhaSenha");

        const ultimaChamada =
            mockOnPasswordChange.mock.calls[
                mockOnPasswordChange.mock.calls.length - 1
            ][0];
        expect(ultimaChamada).toBe("MinhaSenha");
    });

    it("chama callback ao digitar confirmação de senha e envia valor final corretamente", async () => {
        const user = userEvent.setup();
        renderWithFormProvider(
            <ControlledInputSenhaComValidador
                password=""
                confirmPassword=""
                onPasswordChange={mockOnPasswordChange}
                onConfirmPasswordChange={mockOnConfirmPasswordChange}
                criteria={criteria}
                passwordStatus={[false, false]}
            />
        );

        const confirmInput = screen.getByPlaceholderText(/confirme sua senha/i);
        await user.type(confirmInput, "MinhaSenha");

        const ultimaChamada =
            mockOnConfirmPasswordChange.mock.calls[
                mockOnConfirmPasswordChange.mock.calls.length - 1
            ][0];
        expect(ultimaChamada).toBe("MinhaSenha");
    });

    it("alterna visibilidade das senhas ao clicar nos botões de olho", () => {
        renderWithFormProvider(
            <InputSenhaComValidador
                password="123"
                confirmPassword="456"
                onPasswordChange={mockOnPasswordChange}
                onConfirmPasswordChange={mockOnConfirmPasswordChange}
                criteria={criteria}
                passwordStatus={[false, false]}
            />
        );

        const toggleButtons = screen.getAllByRole("button");
        const passwordInput = screen.getByPlaceholderText(/digite sua senha/i);
        const confirmInput = screen.getByPlaceholderText(/confirme sua senha/i);

        expect(passwordInput).toHaveAttribute("type", "password");
        expect(confirmInput).toHaveAttribute("type", "password");

        fireEvent.click(toggleButtons[0]);
        expect(passwordInput).toHaveAttribute("type", "text");

        fireEvent.click(toggleButtons[1]);
        expect(confirmInput).toHaveAttribute("type", "text");
    });

    it("mostra mensagens de erro se fornecidas", () => {
        renderWithFormProvider(
            <InputSenhaComValidador
                password=""
                confirmPassword=""
                onPasswordChange={mockOnPasswordChange}
                onConfirmPasswordChange={mockOnConfirmPasswordChange}
                criteria={criteria}
                passwordStatus={[false, false]}
                confirmError="Erro de confirmação"
            />
        );

        expect(screen.getByText("Erro de confirmação")).toBeInTheDocument();
    });
});
