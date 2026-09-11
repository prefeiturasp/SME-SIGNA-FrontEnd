import { describe, expect, it } from "vitest";
import { formatDate, formatDateAndHour } from "./formatDate";

describe("formatDate", () => {
  it.each([null, undefined, ""])("retorna hífen quando data é %s", (date) => {
    expect(formatDate(date)).toBe("-");
  });

  it("formata data sem horário", () => {
    expect(formatDate("2026-06-11")).toBe("11/06/2026");
  });

  it("formata data com horário", () => {
    expect(formatDate("2026-06-11T08:05:00")).toBe("11/06/2026");
  });

  it("retorna hífen para data inválida", () => {
    expect(formatDate("data-invalida")).toBe("-");
  });
});

describe("formatDateAndHour", () => {
  it.each([null, undefined, ""])("retorna hífen quando data é %s", (date) => {
    expect(formatDateAndHour(date)).toBe("-");
  });

  it("formata data sem horário com meia-noite", () => {
    expect(formatDateAndHour("2026-06-11")).toBe("11/06/2026 00:00");
  });

  it("formata data com horário", () => {
    expect(formatDateAndHour("2026-06-11T08:05:00")).toBe("11/06/2026 08:05");
  });

  it("retorna hífen para data inválida", () => {
    expect(formatDateAndHour("data-invalida")).toBe("-");
  });
});
