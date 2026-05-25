import type { ColumnsType } from "antd/es/table";
import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadCSV } from "./exportCSV";

type TestRow = {
  key: string;
  nome: any;
  idade: any;
};

class MockBlob {
  parts: BlobPart[];
  type: string;

  constructor(parts: BlobPart[], options?: BlobPropertyBag) {
    this.parts = parts;
    this.type = options?.type ?? "";
  }
}

const setupDOMMocks = () => {
  vi.stubGlobal("Blob", MockBlob as unknown as typeof Blob);

  const createObjectURLSpy = vi
    .spyOn(URL, "createObjectURL")
    .mockReturnValue("blob:mock-url");

  const revokeObjectURLSpy = vi
    .spyOn(URL, "revokeObjectURL")
    .mockImplementation(() => undefined);

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

  return {
    createObjectURLSpy,
    revokeObjectURLSpy,
    appendSpy,
    removeSpy,
    clickSpy,
  };
};

describe("downloadCSV", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("gera CSV e executa fluxo completo", () => {
    const {
      createObjectURLSpy,
      revokeObjectURLSpy,
      appendSpy,
      removeSpy,
      clickSpy,
    } = setupDOMMocks();

    const data: TestRow[] = [
      { key: "1", nome: 'Ana "Maria"', idade: 30 },
    ];

    const columns: ColumnsType<TestRow> = [
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

    expect(blob.parts).toEqual([
      'Nome,Idade\n"Ana \\"Maria\\"","30"',
    ]);
    expect(blob.type).toBe("text/csv;charset=utf-8;");
  });

  it("gera CSV vazio quando não há dados", () => {
    const { createObjectURLSpy, clickSpy } = setupDOMMocks();

    downloadCSV<TestRow>([], [{ key: "nome", title: "Nome" }]);

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);

    const blob = createObjectURLSpy.mock.calls[0][0] as unknown as MockBlob;

    expect(blob.parts).toEqual([""]);
    expect(blob.type).toBe("text/csv;charset=utf-8;");
  });

  it("gera múltiplas linhas corretamente", () => {
    const { createObjectURLSpy } = setupDOMMocks();

    const data = [
      { key: "1", nome: "Ana", idade: 30 },
      { key: "2", nome: "João", idade: 25 },
    ];

    const columns: ColumnsType<TestRow> = [
      { key: "nome", title: "Nome" },
      { key: "idade", title: "Idade" },
    ];

    downloadCSV(data, columns);

    const blob = createObjectURLSpy.mock.calls[0][0] as unknown as MockBlob;

    expect(blob.parts[0]).toBe(
      'Nome,Idade\n"Ana","30"\n"João","25"'
    );
  });

  it("trata undefined e null como vazio", () => {
    const { createObjectURLSpy } = setupDOMMocks();

    const data = [
      { key: "1", nome: undefined, idade: null },
    ] as any;

    const columns: ColumnsType<any> = [
      { key: "nome", title: "Nome" },
      { key: "idade", title: "Idade" },
    ];

    downloadCSV(data, columns);

    const blob = createObjectURLSpy.mock.calls[0][0] as unknown as MockBlob;

    expect(blob.parts[0]).toContain('"",""');
  });

  it("serializa boolean e bigint", () => {
    const { createObjectURLSpy } = setupDOMMocks();

    const data = [
      { key: "1", nome: true, idade: BigInt(99) },
    ] as any;

    const columns: ColumnsType<any> = [
      { key: "nome", title: "Nome" },
      { key: "idade", title: "Idade" },
    ];

    downloadCSV(data, columns);

    const blob = createObjectURLSpy.mock.calls[0][0] as unknown as MockBlob;

    expect(blob.parts[0]).toContain('"true","99"');
  });

  it("serializa Date corretamente", () => {
    const { createObjectURLSpy } = setupDOMMocks();

    const date = new Date("2020-01-01T00:00:00.000Z");

    const data = [
      { key: "1", nome: "Ana", idade: date },
    ] as any;

    const columns: ColumnsType<any> = [
      { key: "nome", title: "Nome" },
      { key: "idade", title: "Idade" },
    ];

    downloadCSV(data, columns);

    const blob = createObjectURLSpy.mock.calls[0][0] as unknown as MockBlob;

    expect(blob.parts[0]).toContain(date.toISOString());
  });

  it("serializa objetos como JSON", () => {
    const { createObjectURLSpy } = setupDOMMocks();

    const data = [
      { key: "1", nome: { a: 1 }, idade: 30 },
    ] as any;

    const columns: ColumnsType<any> = [
      { key: "nome", title: "Nome" },
      { key: "idade", title: "Idade" },
    ];

    downloadCSV(data, columns);

    const blob = createObjectURLSpy.mock.calls[0][0] as unknown as MockBlob;

    expect(blob.parts[0]).toContain('{\\"a\\":1}');
  });

  it("retorna vazio quando JSON.stringify falha (circular)", () => {
    const { createObjectURLSpy } = setupDOMMocks();

    const circular: any = {};
    circular.self = circular;

    const data = [
      { key: "1", nome: circular, idade: 1 },
    ];

    const columns: ColumnsType<any> = [
      { key: "nome", title: "Nome" },
      { key: "idade", title: "Idade" },
    ];

    downloadCSV(data, columns);

    const blob = createObjectURLSpy.mock.calls[0][0] as unknown as MockBlob;

    // nome vira vazio
    expect(blob.parts[0]).toContain('"","1"');
  });
});