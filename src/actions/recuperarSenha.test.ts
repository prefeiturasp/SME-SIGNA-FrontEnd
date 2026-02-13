import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  afterAll,
  type Mock,
} from "vitest";
import axios, { AxiosError, AxiosHeaders } from "axios";
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

    axiosPostMock.mockResolvedValueOnce({
      status: 200,
      data: { detail: "E-mail enviado com sucesso" },
    });

    const result = await useRecuperarSenhaAction({ username: "fulano" });

    expect(axiosPostMock).toHaveBeenCalledWith(
      "https://api.exemplo.com/usuario/esqueci-senha",
      { username: "fulano" },
    );
    expect(result).toEqual({
      success: true,
      message: "E-mail enviado com sucesso",
    });
  });

  it("usa fallback de API_URL vazio quando NEXT_PUBLIC_API_URL não está definida", async () => {
    delete process.env.NEXT_PUBLIC_API_URL;

    axiosPostMock.mockResolvedValueOnce({
      status: 200,
      data: { detail: "E-mail enviado com sucesso" },
    });

    const result = await useRecuperarSenhaAction({ username: "fulano" });

    expect(axiosPostMock).toHaveBeenCalledWith("/usuario/esqueci-senha", {
      username: "fulano",
    });
    expect(result).toEqual({
      success: true,
      message: "E-mail enviado com sucesso",
    });
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


    const axiosError = new AxiosError("Token inválido");
    axiosError.response = {
        status: 404,
        data: { detail: "Usuário não encontrado" },
        statusText: "Not Found",
        headers: {},
        config: { headers: new AxiosHeaders() },
    };
    axiosPostMock.mockRejectedValueOnce(axiosError);

 
    const result = await useRecuperarSenhaAction({ username: "fulano" });

    expect(result).toEqual({
      success: false,
      error: "Usuário não encontrado",
    });
  });

  it("retorna success false com mensagem vazia quando erro não tem detail", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.com";

    const axiosError = new AxiosError("Falha inesperada");
    axiosError.response = {
      status: 500,
      data: {},
      statusText: "Internal Server Error",
      headers: {},
      config: { headers: new AxiosHeaders() },
    };

    axiosPostMock.mockRejectedValueOnce(axiosError);

    const result = await useRecuperarSenhaAction({ username: "fulano" });

    expect(result).toEqual({
      success: false,
      error: "",
    });
  });
});

