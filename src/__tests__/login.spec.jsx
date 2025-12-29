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

const loginActionMock = vi.fn();
vi.mock("@/actions/login", () => ({
  loginAction: (...args) => loginActionMock(...args),
}));

// Mock do Next.js Image
vi.mock("next/image", () => ({
  default: ({ src, alt, fill: _fill, ...props }) => {
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
    loginActionMock.mockReset();

    loginActionMock.mockResolvedValue({
      success: false,
      error: "Mock login error",
    });

    process.env.NEXT_PUBLIC_API_URL =
      "https://qa-signa.sme.prefeitura.sp.gov.br/api";
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

  // ✅ Helper reutilizável
  const getForgotPasswordLink = () =>
    screen.getByRole("link", { name: /Esqueci minha senha/i });

  describe("1. Acessibilidade e Renderização", () => {
    it("deve renderizar todos os elementos essenciais do formulário", () => {
      renderLogin();

      expect(screen.getByText(/RF ou CPF/i)).toBeInTheDocument();
      expect(screen.getByText(/^Senha\b/i)).toBeInTheDocument();

      expect(screen.getByPlaceholderText(/Seu RF/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Sua senha/i)).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: /Acessar/i })
      ).toBeInTheDocument();

      expect(getForgotPasswordLink()).toBeInTheDocument();
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
  });

  describe("3. Interação com Botões", () => {
    it("deve permitir clicar no botão Acessar e disparar a mutation de login", async () => {
      const user = userEvent.setup();

      loginActionMock.mockResolvedValueOnce({ success: true });

      renderLogin();

      await user.type(
        screen.getByPlaceholderText(/Seu RF/i),
        "12345678901"
      );
      await user.type(
        screen.getByPlaceholderText(/Sua senha/i),
        "minhasenha"
      );

      await user.click(
        screen.getByRole("button", { name: /Acessar/i })
      );

      await waitFor(() => {
        expect(loginActionMock).toHaveBeenCalled();
        expect(pushMock).toHaveBeenCalledWith("/home");
      });
    });

    it("deve permitir clicar no link 'Esqueci minha senha'", async () => {
      const user = userEvent.setup();
      renderLogin();

      const forgotPasswordLink = getForgotPasswordLink();

      expect(forgotPasswordLink).toBeInTheDocument();
      await user.click(forgotPasswordLink);
    });
  });

  describe("6. Renderização do Componente", () => {
    it("deve renderizar corretamente", () => {
      renderLogin();

      expect(
        screen.getByRole("button", { name: /Acessar/i })
      ).toBeInTheDocument();
    });

    it("deve renderizar link de esqueci senha", () => {
      renderLogin();

      expect(getForgotPasswordLink()).toBeInTheDocument();
    });
  });
});
