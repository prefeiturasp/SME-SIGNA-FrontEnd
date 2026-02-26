import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import Page from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

function renderWithQueryProvider(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

async function renderPage(params: { code: string }) {
  const element = await Page({
    params: Promise.resolve(params),
  });

  return renderWithQueryProvider(element as React.ReactElement);
}

const mutateAsyncMock = vi.fn().mockResolvedValue({ success: true });

vi.mock("@/hooks/useConfirmarEmail", () => ({
  __esModule: true,
  default: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("ConfirmarEmail Page", () => {
    it("renderiza o botão após confirmar o e-mail com sucesso", async () => {
    await renderPage({
        code: encodeURIComponent("uid123"),
    });

    await waitFor(() => {
        expect(mutateAsyncMock).toHaveBeenCalled();
    });

    expect(
        await screen.findByRole("link", { name: /continuar no signa/i })
    ).toBeInTheDocument();
    });

  it("decodifica o code antes de enviar para a mutation", async () => {
    const rawCode = "código@!";

        await renderPage({
            code: encodeURIComponent(rawCode),
        });

        await waitFor(() => {
            expect(mutateAsyncMock).toHaveBeenCalledWith({
            code: rawCode,
            });
        });
    });

});
