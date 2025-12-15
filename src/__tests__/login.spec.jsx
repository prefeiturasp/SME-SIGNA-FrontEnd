import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterAll } from "vitest";
import LoginTela from "@/pages/login";
import ReactQueryProvider from "@/lib/ReactQueryProvider";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

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
  const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    pushMock.mockReset();
    // Deixa os testes determinísticos (o hook monta a URL a partir dessa env)
    process.env.NEXT_PUBLIC_API_URL = "https://qa-signa.sme.prefeitura.sp.gov.br/api";
  });

  const originalFetch = global.fetch;

  afterAll(() => {
    global.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
  });

  const renderLogin = () =>
    render(
      <ReactQueryProvider>
        <LoginTela />
      </ReactQueryProvider>
    );

  describe("1. Acessibilidade e Renderização", () => {
    it("deve renderizar todos os elementos essenciais do formulário", () => {
      renderLogin();

      // Verifica labels
      expect(screen.getByText(/RF ou CPF/i)).toBeInTheDocument();
      // Usa âncora no início para evitar conflito com textos como "Digite sua Senha"
      expect(screen.getByText(/^Senha\b/i)).toBeInTheDocument();

      // Verifica inputs com placeholders
      expect(screen.getByPlaceholderText(/Seu RF/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Sua senha/i)).toBeInTheDocument();

      // Verifica botões
      expect(screen.getByRole("button", { name: /Acessar/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Esqueci minha senha/i })).toBeInTheDocument();
    });

    it("deve ter inputs acessíveis com ids corretos", () => {
      renderLogin();

      const rfInput = screen.getByPlaceholderText(/Seu RF/i);
      const senhaInput = screen.getByPlaceholderText(/Sua senha/i);

      expect(rfInput).toHaveAttribute("id", "seu_rf");
      expect(senhaInput).toHaveAttribute("id", "senha");
      expect(senhaInput).toHaveAttribute("type", "password");
    });

    it("deve renderizar as três imagens (capa, logo SIGNA, logo PrefSP)", () => {
      renderLogin();

      const images = screen.getAllByRole("img");
      expect(images).toHaveLength(3);

      // Há mais de uma imagem com alt contendo "Login"
      const loginImages = screen.getAllByAltText(/Login/i);
      expect(loginImages.length).toBeGreaterThanOrEqual(1);
    });

    it("deve renderizar ícones de ajuda (tooltips)", () => {
      renderLogin();

      const helpIcons = screen.getAllByTestId("help-icon");
      expect(helpIcons.length).toBeGreaterThan(0);
    });
  });

  describe("2. Comportamento de Digitação e Estados do Formulário", () => {
    it("deve permitir digitação no campo RF ou CPF", async () => {
      const user = userEvent.setup();
      renderLogin();

      const rfInput = screen.getByPlaceholderText(/Seu RF/i);
      
      await user.type(rfInput, "12345678901");
      
      expect(rfInput).toHaveValue("12345678901");
    });

    it("deve permitir digitação no campo Senha", async () => {
      const user = userEvent.setup();
      renderLogin();

      const senhaInput = screen.getByPlaceholderText(/Sua senha/i);
      
      await user.type(senhaInput, "senhaSecreta123");
      
      expect(senhaInput).toHaveValue("senhaSecreta123");
    });

    it("deve manter valores independentes nos dois campos", async () => {
      const user = userEvent.setup();
      renderLogin();

      const rfInput = screen.getByPlaceholderText(/Seu RF/i);
      const senhaInput = screen.getByPlaceholderText(/Sua senha/i);
      
      await user.type(rfInput, "usuario123");
      await user.type(senhaInput, "senha456");
      
      expect(rfInput).toHaveValue("usuario123");
      expect(senhaInput).toHaveValue("senha456");
    });

    it("deve permitir limpar e redigitar valores", async () => {
      const user = userEvent.setup();
      renderLogin();

      const rfInput = screen.getByPlaceholderText(/Seu RF/i);
      
      await user.type(rfInput, "primeiro");
      expect(rfInput).toHaveValue("primeiro");
      
      await user.clear(rfInput);
      expect(rfInput).toHaveValue("");
      
      await user.type(rfInput, "segundo");
      expect(rfInput).toHaveValue("segundo");
    });
  });

  describe("3. Interação com Botões", () => {
    it("deve permitir clicar no botão Acessar e disparar a mutation de login", async () => {
      const user = userEvent.setup();

      const mockResponse = {
        status: 200,
        ok: true,
        json: vi.fn().mockResolvedValue({ token: "abc123" }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      renderLogin();

      const rfInput = screen.getByPlaceholderText(/Seu RF/i);
      const senhaInput = screen.getByPlaceholderText(/Sua senha/i);
      const submitButton = screen.getByRole("button", { name: /Acessar/i });

      await user.type(rfInput, "12345678901");
      await user.type(senhaInput, "minhasenha");
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `${process.env.NEXT_PUBLIC_API_URL}/usuario/login`,
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: "12345678901",
              password: "minhasenha",
            }),
          }),
        );
        expect(pushMock).toHaveBeenCalledWith("/home");
      });
    });

    it("deve permitir clicar no botão 'Esqueci minha senha'", async () => {
      const user = userEvent.setup();
      renderLogin();

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
      renderLogin();

      const rfInput = screen.getByPlaceholderText(/Seu RF/i);
      const senhaInput = screen.getByPlaceholderText(/Sua senha/i);

      expect(rfInput).toHaveValue("");
      expect(senhaInput).toHaveValue("");
    });

    it("deve aceitar RF numérico válido", async () => {
      const user = userEvent.setup();
      renderLogin();

      const rfInput = screen.getByPlaceholderText(/Seu RF/i);
      
      await user.type(rfInput, "1234567");
      
      expect(rfInput).toHaveValue("1234567");
    });

    it("deve aceitar CPF válido", async () => {
      const user = userEvent.setup();
      renderLogin();

      const rfInput = screen.getByPlaceholderText(/Seu RF/i);
      
      await user.type(rfInput, "123.456.789-00");
      
      expect(rfInput).toHaveValue("123.456.789-00");
    });
  });

  describe("5. Teste de Submit do Formulário", () => {
    it("deve exibir mensagem de erro quando o login falha", async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn().mockResolvedValue({
        status: 401,
        ok: false,
        json: vi.fn().mockResolvedValue({ detail: "Credenciais inválidas" }),
      });

      renderLogin();

      const rfInput = screen.getByPlaceholderText(/Seu RF/i);
      const senhaInput = screen.getByPlaceholderText(/Sua senha/i);
      const submitButton = screen.getByRole("button", { name: /Acessar/i });

      await user.type(rfInput, "usuario@test.com");
      await user.type(senhaInput, "senha123");
      await user.click(submitButton);

      const errorMessage = await screen.findByTestId("login-error");
      expect(errorMessage).toHaveTextContent("Credenciais inválidas");
    });

    it("deve desabilitar o botão enquanto o login está sendo enviado", async () => {
      const user = userEvent.setup();

      let resolveFetch;
      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          }),
      );

      renderLogin();

      const rfInput = screen.getByPlaceholderText(/Seu RF/i);
      const senhaInput = screen.getByPlaceholderText(/Sua senha/i);
      const submitButton = screen.getByRole("button", { name: /Acessar/i });

      await user.type(rfInput, "usuario@test.com");
      await user.type(senhaInput, "senha123");

      await user.click(submitButton);

      // Enquanto a Promise não é resolvida, o botão deve estar desabilitado
      expect(submitButton).toBeDisabled();

      resolveFetch({
        status: 200,
        ok: true,
        json: vi.fn().mockResolvedValue({ token: "abc123" }),
      });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe("6. Renderização do Componente", () => {
    it("deve renderizar corretamente", () => {
      renderLogin();

      expect(screen.getByRole("button", { name: /Acessar/i })).toBeInTheDocument();
    });

    it("deve renderizar o formulário completo", () => {
      renderLogin();

      const submitButton = screen.getByRole("button", { name: /Acessar/i });
      expect(submitButton).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Seu RF/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Sua senha/i)).toBeInTheDocument();
    });

    it("deve renderizar botão de esqueci senha", () => {
      renderLogin();

      const forgotPasswordButton = screen.getByRole("button", { 
        name: /Esqueci minha senha/i 
      });
      expect(forgotPasswordButton).toBeInTheDocument();
    });
  });

  describe("7. Acessibilidade Avançada", () => {
    it("deve ter estrutura semântica adequada", () => {
      renderLogin();

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it("deve manter foco navegável entre campos", async () => {
      const user = userEvent.setup();
      renderLogin();

      const rfInput = screen.getByPlaceholderText(/Seu RF/i);
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
      renderLogin();

      const rfInput = screen.getByPlaceholderText(/Seu RF/i);
      
      await user.type(rfInput, "test@example.com!#$%");
      
      expect(rfInput).toHaveValue("test@example.com!#$%");
    });

    it("deve lidar com senhas longas", async () => {
      const user = userEvent.setup();
      renderLogin();

      const senhaInput = screen.getByPlaceholderText(/Sua senha/i);
      const longPassword = "a".repeat(100);
      
      await user.type(senhaInput, longPassword);
      
      expect(senhaInput).toHaveValue(longPassword);
    });

    it("deve manter estado do formulário após múltiplas interações", async () => {
      const user = userEvent.setup();
      renderLogin();

      const rfInput = screen.getByPlaceholderText(/Seu RF/i);
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
      
      // Mock com delay para simular uma requisição real
      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((resolve) => setTimeout(() => {
          resolve({
            status: 200,
            ok: true,
            json: vi.fn().mockResolvedValue({ token: "abc123" }),
          });
        }, 100))
      );

      renderLogin();

      const rfInput = screen.getByPlaceholderText(/Seu RF/i);
      const senhaInput = screen.getByPlaceholderText(/Sua senha/i);
      const submitButton = screen.getByRole("button", { name: /Acessar/i });

      await user.type(rfInput, "user");
      await user.type(senhaInput, "pass");
      
      // Clique no botão
      await user.click(submitButton);
      
      // Verifica que o botão foi desabilitado durante o processamento
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // Aguarda a conclusão e botão voltar ao normal
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      }, { timeout: 3000 });

      // Verifica que o fetch foi chamado
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe("9. Layout Responsivo e Estilos", () => {
    it("deve aplicar classes Tailwind corretas no container principal", () => {
      const { container } = renderLogin();

      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("w-[95%]", "h-full", "flex");
    });

    it("deve renderizar botão de submit com estilos corretos", () => {
      renderLogin();

      const submitButton = screen.getByRole("button", { name: /Acessar/i });
      
      expect(submitButton).toHaveClass("rounded", "bg-[#717FC7]", "text-white", "w-full");
    });
  });

  describe("10. Integração de Componentes", () => {
    it("deve integrar corretamente com react-hook-form", async () => {
      const user = userEvent.setup();
      renderLogin();

      const rfInput = screen.getByPlaceholderText(/Seu RF/i);
      const senhaInput = screen.getByPlaceholderText(/Sua senha/i);

      // Testa que os valores são controlados pelo react-hook-form
      await user.type(rfInput, "test");
      await user.type(senhaInput, "password");

      expect(rfInput.value).toBe("test");
      expect(senhaInput.value).toBe("password");
    });

    it("deve renderizar FormField sem erros", () => {
      renderLogin();

      // Verifica que os FormField renderizaram corretamente
      expect(screen.getByPlaceholderText(/Seu RF/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Sua senha/i)).toBeInTheDocument();
    });
  });

});