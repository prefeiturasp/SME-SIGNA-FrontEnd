import { describe, expect, it } from "vitest";
import { getDadosPortaria } from "./getDadosPortaria";
import type { DesignacaoResponse } from "@/types/designacao";

describe("getDadosPortaria", () => {
  it("retorna null quando a designação é undefined", () => {
    expect(getDadosPortaria(undefined)).toBeNull();
  });

  it("monta os dados da portaria a partir da designação", () => {
    const designacao = {
      numero_portaria: "123/2026",
      portaria: "123",
      ano_vigente: "2026",
      sei_numero: "6017.2026/0000001-1",
      doc: "SEI-DOC-1",
      data_inicio: "2026-01-01",
      data_fim: "2026-12-31",
      carater_excepcional: true,
      impedimento_substituicao: "Férias",
      motivo_afastamento: "Licença médica",
      pendencias: "Nenhuma",
    } as unknown as DesignacaoResponse;

    expect(getDadosPortaria(designacao)).toEqual({
      numero_portaria: "123/2026",
      portaria: "123",
      ano_vigente: "2026",
      sei_numero: "6017.2026/0000001-1",
      doc: "SEI-DOC-1",
      data_inicio: "2026-01-01",
      data_fim: "2026-12-31",
      carater_excepcional: true,
      impedimento_substituicao: "Férias",
      motivo_afastamento: "Licença médica",
      pendencias: "Nenhuma",
    });
  });

  it("preserva data_fim e impedimento_substituicao nulos", () => {
    const designacao = {
      numero_portaria: "124/2026",
      portaria: "124",
      ano_vigente: "2026",
      sei_numero: "6017.2026/0000002-1",
      doc: "SEI-DOC-2",
      data_inicio: "2026-02-01",
      data_fim: null,
      carater_excepcional: false,
      impedimento_substituicao: null,
      motivo_afastamento: "",
      pendencias: "",
    } as unknown as DesignacaoResponse;

    const resultado = getDadosPortaria(designacao);

    expect(resultado?.data_fim).toBeNull();
    expect(resultado?.impedimento_substituicao).toBeNull();
  });
});
