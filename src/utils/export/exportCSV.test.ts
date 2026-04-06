import type { ColumnsType } from "antd/es/table";
import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadCSV } from "./exportCSV";

type TestRow = {
  key: string;
  nome: string;
  idade: number;
};

describe("downloadCSV", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("gera CSV e executa o fluxo de download", async () => {
    class MockBlob {
      parts: BlobPart[];
      type: string;

      constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        this.parts = parts;
        this.type = options?.type ?? "";
      }
    }
    vi.stubGlobal("Blob", MockBlob as unknown as typeof Blob);

    const createObjectURLSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:mock-url");
    const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const appendSpy = vi.spyOn(document.body, "appendChild");
    const removeSpy = vi.spyOn(document.body, "removeChild");

    const nativeCreateElement = document.createElement.bind(document);
    const clickSpy = vi.fn();
    vi.spyOn(document, "createElement").mockImplementation(
      ((tagName: string) => {
        if (tagName === "a") {
          const anchor = nativeCreateElement("a");
          anchor.click = clickSpy;
          return anchor;
        }
        return nativeCreateElement(tagName);
      }) as typeof document.createElement
    );

    const data: TestRow[] = [{ key: "1", nome: 'Ana "Maria"', idade: 30 }];
    const columns: ColumnsType<TestRow> = [
      { key: "key", title: "Chave" },
      { key: "nome", title: "Nome" },
      { key: "idade", title: "Idade" },
    ];

    downloadCSV(data, columns);

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(appendSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");
    const blob = createObjectURLSpy.mock.calls[0][0] as unknown as MockBlob;
    expect(blob.parts).toEqual(['Nome,Idade\n"Ana \\"Maria\\"","30"']);
    expect(blob.type).toBe("text/csv;charset=utf-8;");
  });

  it("gera arquivo vazio quando não há dados", () => {
    class MockBlob {
      parts: BlobPart[];
      type: string;

      constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        this.parts = parts;
        this.type = options?.type ?? "";
      }
    }
    vi.stubGlobal("Blob", MockBlob as unknown as typeof Blob);

    const createObjectURLSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:mock-empty");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);

    const nativeCreateElement = document.createElement.bind(document);
    const clickSpy = vi.fn();
    vi.spyOn(document, "createElement").mockImplementation(
      ((tagName: string) => {
        if (tagName === "a") {
          const anchor = nativeCreateElement("a");
          anchor.click = clickSpy;
          return anchor;
        }
        return nativeCreateElement(tagName);
      }) as typeof document.createElement
    );

    downloadCSV<TestRow>([], [{ key: "nome", title: "Nome" }]);

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    const blob = createObjectURLSpy.mock.calls[0][0] as unknown as MockBlob;
    expect(blob.parts).toEqual([""]);
    expect(blob.type).toBe("text/csv;charset=utf-8;");
  });
});
