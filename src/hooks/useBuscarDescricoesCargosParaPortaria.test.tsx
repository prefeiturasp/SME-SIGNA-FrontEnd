import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBuscarDescricoesCargosParaPortaria } from "./useBuscarDescricoesCargosParaPortaria";

const { buscarDescricoesMock, notificationErrorMock } = vi.hoisted(() => ({
  buscarDescricoesMock: vi.fn(),
  notificationErrorMock: vi.fn(),
}));

vi.mock("./useBuscarDescricoesCargosBase", () => ({
  MENSAGEM_ERRO_DESCRICOES_CARGOS: "mensagem de erro",
  useBuscarDescricoesCargosBase: () => buscarDescricoesMock,
}));

vi.mock("@/components/providers/NotificationProvider", () => ({
  useAppNotification: () => ({ error: notificationErrorMock }),
}));

describe("useBuscarDescricoesCargosParaPortaria", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devolve as descrições sem avisar quando a consulta dá certo", async () => {
    buscarDescricoesMock.mockResolvedValueOnce({ "3360": "Diretor de Escola" });
    const { result } = renderHook(() => useBuscarDescricoesCargosParaPortaria());

    await expect(result.current([3360])).resolves.toEqual({ "3360": "Diretor de Escola" });
    expect(buscarDescricoesMock).toHaveBeenCalledWith([3360]);
    expect(notificationErrorMock).not.toHaveBeenCalled();
  });

  it("avisa o usuário e devolve null quando a consulta falha", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    buscarDescricoesMock.mockRejectedValueOnce(new Error("falha de rede"));
    const { result } = renderHook(() => useBuscarDescricoesCargosParaPortaria());

    await expect(result.current([3360])).resolves.toBeNull();
    expect(notificationErrorMock).toHaveBeenCalledWith({ title: "mensagem de erro" });
  });
});
