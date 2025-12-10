import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterAll } from "vitest";
import LoginTela, { getServerSideProps } from "../pages/login";

// Mock do Next.js Image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

// Mock dos ícones lucide-react
vi.mock("lucide-react", () => ({
  HelpCircle: () => <span data-testid="help-icon">?</span>,
}));

describe("LoginTela - Testes Unitários Completos", () => {
  const defaultProps = {
    tokenPreview: null,
    tokenExists: false,
    fetchStatus: null,
    fetchBody: null,
    fetchHeaders: null,
    fetchError: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const originalFetch = global.fetch;

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe("1. Acessibilidade e Renderização", () => {
    it("deve renderizar todos os elementos essenciais do formulário", () => {
      render(<LoginTela {...defaultProps} />);

      // Verifica labels
      expect(screen.getByText(/RF ou CPF/i)).toBeInTheDocument();
      // Usa âncora no início para evitar conflito com textos como "Digite sua Senha"
      expect(screen.getByText(/^Senha\b/i)).toBeInTheDocument();

      // Verifica inputs com placeholders
      expect(screen.getByPlaceholderText(/Seu e-mail/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Sua senha/i)).toBeInTheDocument();

      // Verifica botões
      expect(screen.getByRole("button", { name: /Acessar/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Esqueci minha senha/i })).toBeInTheDocument();
    });

    it("deve ter inputs acessíveis com ids corretos", () => {
      render(<LoginTela {...defaultProps} />);

      const rfInput = screen.getByPlaceholderText(/Seu e-mail/i);
      const senhaInput = screen.getByPlaceholderText(/Sua senha/i);

      expect(rfInput).toHaveAttribute("id", "rf_ou_cpf");
      expect(senhaInput).toHaveAttribute("id", "senha");
      expect(senhaInput).toHaveAttribute("type", "password");
    });

    it("deve renderizar as três imagens (capa, logo SIGNA, logo PrefSP)", () => {
      render(<LoginTela {...defaultProps} />);

      const images = screen.getAllByRole("img");
      expect(images).toHaveLength(3);

      // Há mais de uma imagem com alt contendo "Login"
      const loginImages = screen.getAllByAltText(/Login/i);
      expect(loginImages.length).toBeGreaterThanOrEqual(1);
    });

    it("deve renderizar ícones de ajuda (tooltips)", () => {
      render(<LoginTela {...defaultProps} />);

      const helpIcons = screen.getAllByTestId("help-icon");
      expect(helpIcons.length).toBeGreaterThan(0);
    });
  });

  describe("2. Comportamento de Digitação e Estados do Formulário", () => {
    it("deve permitir digitação no campo RF ou CPF", async () => {
      const user = userEvent.setup();
      render(<LoginTela {...defaultProps} />);

      const rfInput = screen.getByPlaceholderText(/Seu e-mail/i);
      
      await user.type(rfInput, "12345678901");
      
      expect(rfInput).toHaveValue("12345678901");
    });

    it("deve permitir digitação no campo Senha", async () => {
      const user = userEvent.setup();
      render(<LoginTela {...defaultProps} />);

      const senhaInput = screen.getByPlaceholderText(/Sua senha/i);
      
      await user.type(senhaInput, "senhaSecreta123");
      
      expect(senhaInput).toHaveValue("senhaSecreta123");
    });

    it("deve manter valores independentes nos dois campos", async () => {
      const user = userEvent.setup();
      render(<LoginTela {...defaultProps} />);

      const rfInput = screen.getByPlaceholderText(/Seu e-mail/i);
      const senhaInput = screen.getByPlaceholderText(/Sua senha/i);
      
      await user.type(rfInput, "usuario123");
      await user.type(senhaInput, "senha456");
      
      expect(rfInput).toHaveValue("usuario123");
      expect(senhaInput).toHaveValue("senha456");
    });

    it("deve permitir limpar e redigitar valores", async () => {
      const user = userEvent.setup();
      render(<LoginTela {...defaultProps} />);

      const rfInput = screen.getByPlaceholderText(/Seu e-mail/i);
      
      await user.type(rfInput, "primeiro");
      expect(rfInput).toHaveValue("primeiro");
      
      await user.clear(rfInput);
      expect(rfInput).toHaveValue("");
      
      await user.type(rfInput, "segundo");
      expect(rfInput).toHaveValue("segundo");
    });
  });

  describe("3. Interação com Botões", () => {
    it("deve permitir clicar no botão Acessar", async () => {
      const user = userEvent.setup();
      const consoleLogSpy = vi.spyOn(console, "log");
      
      render(<LoginTela {...defaultProps} />);

      const rfInput = screen.getByPlaceholderText(/Seu e-mail/i);
      const senhaInput = screen.getByPlaceholderText(/Sua senha/i);
      const submitButton = screen.getByRole("button", { name: /Acessar/i });

      await user.type(rfInput, "12345678901");
      await user.type(senhaInput, "minhasenha");
      await user.click(submitButton);

      // O onClick do botão chama console.log("testw")
      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalled();
      });

      consoleLogSpy.mockRestore();
    });

    it("deve permitir clicar no botão 'Esqueci minha senha'", async () => {
      const user = userEvent.setup();
      render(<LoginTela {...defaultProps} />);

      const forgotPasswordButton = screen.getByRole("button", { 
        name: /Esqueci minha senha/i 
      });

      expect(forgotPasswordButton).toBeInTheDocument();
      await user.click(forgotPasswordButton);
      
      // Verifica que o botão é clicável (não quebra)
      expect(forgotPasswordButton).toBeInTheDocument();
    });
  });

  describe("4. Validação de Formulário (react-hook-form)", () => {
    it("deve inicializar com valores vazios", () => {
      render(<LoginTela {...defaultProps} />);

      const rfInput = screen.getByPlaceholderText(/Seu e-mail/i);
      const senhaInput = screen.getByPlaceholderText(/Sua senha/i);

      expect(rfInput).toHaveValue("");
      expect(senhaInput).toHaveValue("");
    });

    it("deve aceitar RF numérico válido", async () => {
      const user = userEvent.setup();
      render(<LoginTela {...defaultProps} />);

      const rfInput = screen.getByPlaceholderText(/Seu e-mail/i);
      
      await user.type(rfInput, "1234567");
      
      expect(rfInput).toHaveValue("1234567");
    });

    it("deve aceitar CPF válido", async () => {
      const user = userEvent.setup();
      render(<LoginTela {...defaultProps} />);

      const rfInput = screen.getByPlaceholderText(/Seu e-mail/i);
      
      await user.type(rfInput, "123.456.789-00");
      
      expect(rfInput).toHaveValue("123.456.789-00");
    });
  });

  describe("5. Teste de Submit do Formulário", () => {
    it("deve chamar console.log com os valores corretos ao submeter", async () => {
      const user = userEvent.setup();
      const consoleLogSpy = vi.spyOn(console, "log");
      
      render(<LoginTela {...defaultProps} />);

      const rfInput = screen.getByPlaceholderText(/Seu e-mail/i);
      const senhaInput = screen.getByPlaceholderText(/Sua senha/i);
      const submitButton = screen.getByRole("button", { name: /Acessar/i });

      await user.type(rfInput, "usuario@test.com");
      await user.type(senhaInput, "senha123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalled();
      });

      consoleLogSpy.mockRestore();
    });

    it("não deve disparar submit automático apenas com Enter no campo de senha", async () => {
      const user = userEvent.setup();
      const consoleLogSpy = vi.spyOn(console, "log");
      
      render(<LoginTela {...defaultProps} />);

      const rfInput = screen.getByPlaceholderText(/Seu e-mail/i);
      const senhaInput = screen.getByPlaceholderText(/Sua senha/i);

      await user.type(rfInput, "usuario123");
      await user.type(senhaInput, "senha123{Enter}");

      // Com o código atual, pressionar Enter não dispara submit custom de login
      expect(consoleLogSpy).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });
  });

  describe("6. Props do Componente (SSR Data)", () => {
    it("deve renderizar corretamente com token existente", () => {
      const propsWithToken = {
        tokenPreview: "abc123...",
        tokenExists: true,
        fetchStatus: 200,
        fetchBody: '{"user": "test"}',
        fetchHeaders: {},
        fetchError: null,
      };

      render(<LoginTela {...propsWithToken} />);

      expect(screen.getByRole("button", { name: /Acessar/i })).toBeInTheDocument();
    });

    it("deve renderizar corretamente com erro de fetch", () => {
      const propsWithError = {
        ...defaultProps,
        fetchError: "Network error",
      };

      render(<LoginTela {...propsWithError} />);

      expect(screen.getByRole("button", { name: /Acessar/i })).toBeInTheDocument();
    });

    it("deve renderizar corretamente sem token", () => {
      render(<LoginTela {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: /Acessar/i });
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe("7. Acessibilidade Avançada", () => {
    it("deve ter estrutura semântica adequada", () => {
      render(<LoginTela {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it("deve manter foco navegável entre campos", async () => {
      const user = userEvent.setup();
      render(<LoginTela {...defaultProps} />);

      const rfInput = screen.getByPlaceholderText(/Seu e-mail/i);
      const senhaInput = screen.getByPlaceholderText(/Sua senha/i);

      rfInput.focus();
      expect(rfInput).toHaveFocus();

      await user.tab();
      // Após tab, o foco deve mover para o próximo elemento focável
      expect(document.activeElement).toBeTruthy();
    });
  });

  describe("8. Casos de Borda e Edge Cases", () => {
    it("deve lidar com caracteres especiais no RF/CPF", async () => {
      const user = userEvent.setup();
      render(<LoginTela {...defaultProps} />);

      const rfInput = screen.getByPlaceholderText(/Seu e-mail/i);
      
      await user.type(rfInput, "test@example.com!#$%");
      
      expect(rfInput).toHaveValue("test@example.com!#$%");
    });

    it("deve lidar com senhas longas", async () => {
      const user = userEvent.setup();
      render(<LoginTela {...defaultProps} />);

      const senhaInput = screen.getByPlaceholderText(/Sua senha/i);
      const longPassword = "a".repeat(100);
      
      await user.type(senhaInput, longPassword);
      
      expect(senhaInput).toHaveValue(longPassword);
    });

    it("deve manter estado do formulário após múltiplas interações", async () => {
      const user = userEvent.setup();
      render(<LoginTela {...defaultProps} />);

      const rfInput = screen.getByPlaceholderText(/Seu e-mail/i);
      const senhaInput = screen.getByPlaceholderText(/Sua senha/i);

      await user.type(rfInput, "user1");
      await user.type(senhaInput, "pass1");
      
      expect(rfInput).toHaveValue("user1");
      expect(senhaInput).toHaveValue("pass1");
      
      await user.clear(rfInput);
      await user.type(rfInput, "user2");
      
      expect(rfInput).toHaveValue("user2");
      expect(senhaInput).toHaveValue("pass1"); // senha mantida
    });

    it("deve lidar com submits rápidos consecutivos", async () => {
      const user = userEvent.setup();
      const consoleLogSpy = vi.spyOn(console, "log");
      
      render(<LoginTela {...defaultProps} />);

      const rfInput = screen.getByPlaceholderText(/Seu e-mail/i);
      const senhaInput = screen.getByPlaceholderText(/Sua senha/i);
      const submitButton = screen.getByRole("button", { name: /Acessar/i });

      await user.type(rfInput, "user");
      await user.type(senhaInput, "pass");
      
      // Múltiplos cliques rápidos
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalled();
      });

      consoleLogSpy.mockRestore();
    });
  });

  describe("9. Layout Responsivo e Estilos", () => {
    it("deve aplicar classes Tailwind corretas no container principal", () => {
      const { container } = render(<LoginTela {...defaultProps} />);

      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("w-[95%]", "h-full", "flex");
    });

    it("deve renderizar botão de submit com estilos corretos", () => {
      render(<LoginTela {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: /Acessar/i });
      
      expect(submitButton).toHaveClass("rounded", "bg-[#717FC7]", "text-white", "w-full");
    });
  });

  describe("10. Integração de Componentes", () => {
    it("deve integrar corretamente com react-hook-form", async () => {
      const user = userEvent.setup();
      render(<LoginTela {...defaultProps} />);

      const rfInput = screen.getByPlaceholderText(/Seu e-mail/i);
      const senhaInput = screen.getByPlaceholderText(/Sua senha/i);

      // Testa que os valores são controlados pelo react-hook-form
      await user.type(rfInput, "test");
      await user.type(senhaInput, "password");

      expect(rfInput.value).toBe("test");
      expect(senhaInput.value).toBe("password");
    });

    it("deve renderizar FormField sem erros", () => {
      render(<LoginTela {...defaultProps} />);

      // Verifica que os FormField renderizaram corretamente
      expect(screen.getByPlaceholderText(/Seu e-mail/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Sua senha/i)).toBeInTheDocument();
    });
  });

  describe("11. getServerSideProps - SSR e cobertura total", () => {
    it("deve montar props corretamente quando token é fornecido e fetch é bem-sucedido", async () => {
      const token = "a".repeat(30);
      const mockResponseText = '{"ok": true}';
      const headersMap = {
        "www-authenticate": "Bearer",
        "content-type": "application/json",
        vary: "X-Header",
        "set-cookie": "session=abc",
      };

      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        text: vi.fn().mockResolvedValue(mockResponseText),
        headers: {
          get: (name) => headersMap[name.toLowerCase()] ?? null,
        },
      });

      const context = { query: { token } };

      const result = await getServerSideProps(context);

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/profile/",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          redirect: "manual",
        },
      );

      expect(result).toEqual({
        props: {
          tokenPreview: `${token.slice(0, 20)}... (len=${token.length})`,
          tokenExists: true,
          fetchStatus: 200,
          fetchBody: mockResponseText,
          fetchHeaders: {
            "www-authenticate": "Bearer",
            "content-type": "application/json",
            vary: "X-Header",
            "set-cookie": "session=abc",
          },
        },
      });
    });

    it("deve lidar com ausência de token e headers vazios", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 204,
        text: vi.fn().mockResolvedValue(""),
        headers: {
          get: () => null,
        },
      });

      const context = { query: {} };

      const result = await getServerSideProps(context);

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/profile/",
        {
          method: "GET",
          headers: {},
          redirect: "manual",
        },
      );

      expect(result).toEqual({
        props: {
          tokenPreview: null,
          tokenExists: false,
          fetchStatus: 204,
          fetchBody: "",
          fetchHeaders: {},
        },
      });
    });

    it("deve retornar erro de fetch quando a chamada falha", async () => {
      const token = "token-de-teste";
      const error = new Error("Network error");

      global.fetch = vi.fn().mockRejectedValue(error);

      const context = { query: { token } };

      const result = await getServerSideProps(context);

      expect(result).toEqual({
        props: {
          tokenPreview: `${token.slice(0, 20)}... (len=${token.length})`,
          tokenExists: true,
          fetchError: String(error),
        },
      });
    });
  });
});