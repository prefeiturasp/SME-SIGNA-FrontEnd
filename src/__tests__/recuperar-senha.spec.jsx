import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import RecuperacaoDeSenhaTela from "@/pages/recuperar-senha";
import ReactQueryProvider from "@/lib/ReactQueryProvider";

const recuperarSenhaHookMock = vi.fn();
vi.mock("@/hooks/useRecuperarSenha", () => ({
  default: (...args) => recuperarSenhaHookMock(...args),
}));

// Mock do Next.js Image
vi.mock("next/image", () => ({
  default: ({ src, alt, fill, ...props }) => {
    void fill;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

// Mock do Next.js Link
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock dos ícones lucide-react
vi.mock("lucide-react", () => ({
  HelpCircle: () => <span data-testid="help-icon">?</span>,
  CircleX: () => <span data-testid="alert-icon-error">x</span>,
  CircleCheck: () => <span data-testid="alert-icon-success">v</span>,
}));

describe("RecuperacaoDeSenhaTela - Testes Unitários", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    recuperarSenhaHookMock.mockReset();

    // Evita unhandled rejection caso algum teste dispare submit sem mock específico
    recuperarSenhaHookMock.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ success: false, error: "Mock recuperar senha error" }),
      isPending: false,
    });
  });

  const renderTela = () =>
    render(
      <ReactQueryProvider>
        <RecuperacaoDeSenhaTela />
      </ReactQueryProvider>
    );

  it("deve renderizar os elementos iniciais (texto, input e botões)", () => {
    renderTela();

    expect(screen.getByText(/Recuperação de senha/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Você recebera um e-mail com orientações/i),
    ).toBeInTheDocument();

    expect(screen.getByText(/RF ou CPF/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Insira seu RF ou CPF/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /Continuar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Voltar/i })).toBeInTheDocument();

    // Tooltip/help icon
    expect(screen.getAllByTestId("help-icon").length).toBeGreaterThan(0);
  });

  it("deve permitir digitar no campo RF/CPF", async () => {
    const user = userEvent.setup();
    renderTela();

    const rfInput = screen.getByPlaceholderText(/Insira seu RF ou CPF/i);
    await user.type(rfInput, "1234567");
    expect(rfInput).toHaveValue("1234567");
  });

  it("deve exibir mensagem de sucesso ao submeter com success=true", async () => {
    const user = userEvent.setup();
    const mutateAsyncMock = vi.fn().mockResolvedValue({ success: true, message: "ok" });
    recuperarSenhaHookMock.mockReturnValue({ mutateAsync: mutateAsyncMock, isPending: false });

    renderTela();

    const rfInput = screen.getByPlaceholderText(/Insira seu RF ou CPF/i);
    await user.type(rfInput, "1234567");

    await user.click(screen.getByRole("button", { name: /Continuar/i }));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({ username: "1234567" });
    });

    expect(
      await screen.findByText(/Verifique sua caixa de entrada ou lixo eletrônico!/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Seu link de recuperação de senha foi enviado/i),
    ).toBeInTheDocument();
  });

  it("deve exibir mensagem de erro ao submeter com success=false e esconder o formulário", async () => {
    const user = userEvent.setup();
    const mutateAsyncMock = vi.fn().mockResolvedValue({ success: false, error: "not found" });
    recuperarSenhaHookMock.mockReturnValue({ mutateAsync: mutateAsyncMock, isPending: false });

    renderTela();

    const rfInput = screen.getByPlaceholderText(/Insira seu RF ou CPF/i);
    await user.type(rfInput, "9999999");

    await user.click(screen.getByRole("button", { name: /Continuar/i }));

    expect(await screen.findByText(/E-mail não encontrado!/i)).toBeInTheDocument();
    expect(
      screen.getByText(/entre em contato com o Gabinete da Diretoria Regional/i),
    ).toBeInTheDocument();

    // Quando há erro, o input e o botão submit são escondidos
    expect(screen.queryByPlaceholderText(/Insira seu RF ou CPF/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Continuar/i })).not.toBeInTheDocument();
  });
});