import { afterEach, describe, expect, it, vi } from "vitest";
import { baixarArquivo } from "./baixarArquivo";

describe("baixarArquivo", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("cria link com href e download, clica e libera a URL", () => {
    const createObjectURLSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:mock-url");
    const revokeObjectURLSpy = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => undefined);
    const appendSpy = vi.spyOn(document.body, "appendChild");
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    const blob = new Blob(["conteudo"], { type: "application/pdf" });
    baixarArquivo(blob, "lauda.pdf");

    expect(createObjectURLSpy).toHaveBeenCalledWith(blob);

    const anchor = appendSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(anchor.getAttribute("href")).toBe("blob:mock-url");
    expect(anchor.getAttribute("download")).toBe("lauda.pdf");
    expect(anchor.style.visibility).toBe("hidden");

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(anchor.isConnected).toBe(false);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");
  });
});
