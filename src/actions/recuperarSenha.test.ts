import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  afterAll,
  type Mock,
} from "vitest";
import axios from "axios";
import { useRecuperarSenhaAction } from "@/actions/recuperarSenha";

vi.mock("axios");

const axiosPostMock = axios.post as Mock;

describe("useRecuperarSenhaAction", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("retorna success true quando a API responde 200", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";

    axiosPostMock.mockResolvedValueOnce({ status: 200, data: {} });

    const result = await useRecuperarSenhaAction({ username: "fulano" });

    expect(axiosPostMock).toHaveBeenCalledWith(
      "https://api.exemplo.com/usuarios/esqueci-senha",
      { username: "fulano" },
    );
    expect(result).toEqual({ success: true });
  });

  it("retorna success false com detail quando a API responde != 200", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";

    axiosPostMock.mockResolvedValueOnce({
      status: 400,
      data: { detail: "Usuário não encontrado" },
    });

    const result = await useRecuperarSenhaAction({ username: "fulano" });

    expect(result).toEqual({ success: false, error: "Usuário não encontrado" });
  });

  it("retorna success false com mensagem genérica quando axios lança erro", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";

    axiosPostMock.mockRejectedValueOnce(new Error("boom"));

    const result = await useRecuperarSenhaAction({ username: "fulano" });

    expect(result).toEqual({
      success: false,
      error: "Erro ao fazer login. Verifique suas credenciais.",
    });
  });
});

