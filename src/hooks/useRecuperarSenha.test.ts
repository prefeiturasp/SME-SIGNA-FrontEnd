import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRecuperarSenhaAction } from "@/actions/recuperarSenha";
import useRecuperarSenha from "@/hooks/useRecuperarSenha";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const invalidateQueriesMock = vi.fn();
const useQueryClientMock = vi.fn(() => ({
  invalidateQueries: invalidateQueriesMock,
}));

const useMutationMock = vi.fn((opts) => ({
  ...opts,
  mutateAsync: vi.fn(),
  isPending: false,
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => useQueryClientMock(),
  useMutation: (opts) => useMutationMock(opts),
}));

describe("useRecuperarSenha (hook)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("configura useMutation com a action correta", () => {
    useRecuperarSenha();

    expect(useMutationMock).toHaveBeenCalledTimes(1);
    const opts = useMutationMock.mock.calls[0][0];
    expect(opts.mutationFn).toBe(useRecuperarSenhaAction);
    expect(typeof opts.onSuccess).toBe("function");
  });

  it("não navega nem invalida queries quando success=false", () => {
    useRecuperarSenha();
    const opts = useMutationMock.mock.calls[0][0];

    opts.onSuccess({ success: false });

    expect(invalidateQueriesMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("invalida query e navega quando success=true", () => {
    useRecuperarSenha();
    const opts = useMutationMock.mock.calls[0][0];

    opts.onSuccess({ success: true });

    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ["me"] });
    expect(pushMock).toHaveBeenCalledWith("/home");
  });
});

