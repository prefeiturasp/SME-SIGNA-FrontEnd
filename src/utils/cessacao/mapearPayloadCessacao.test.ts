import { mapearPayloadCessacao } from "./mapearPayloadCessacao";
import type { formSchemaCessacaoData } from "@/app/pages/cessacao/schema";
import { EnumCheckbox } from "@/components/ui/FieldsForm";

describe("mapearPayloadCessacao", () => {
  it("deve mapear corretamente os dados da cessação", () => {
    const mockValues: formSchemaCessacaoData = {
      cessacao: {
        numero_portaria: "123",
        ano: "2026",
        numero_sei: "999999",
        doc: "DOC123",
        data_inicio: new Date("2026-04-13T10:00:00Z"),
        a_pedido: EnumCheckbox.SIM,
        remocao: EnumCheckbox.NAO,
        aposentadoria: EnumCheckbox.NAO,
      },
    };

    const result = mapearPayloadCessacao(mockValues, 10);

    expect(result).toEqual({
      ato_pai: 10,
      numero_portaria: "123",
      ano_vigente: "2026",
      sei_numero: "999999",
      doc: "DOC123",
      data_cessacao: "2026-04-13",
      a_pedido: true,
      remocao: false,
      aposentadoria: false,
      texto_sei: "",
      modelo_portaria: null,
    });
  });

  it("repassa texto_sei e modelo_portaria quando informados", () => {
    const mockValues: formSchemaCessacaoData = {
      cessacao: {
        numero_portaria: "123",
        ano: "2026",
        numero_sei: "999999",
        doc: "DOC123",
        data_inicio: new Date("2026-04-13T10:00:00Z"),
        a_pedido: EnumCheckbox.SIM,
        remocao: EnumCheckbox.NAO,
        aposentadoria: EnumCheckbox.NAO,
      },
    };

    const result = mapearPayloadCessacao(
      mockValues,
      10,
      "Texto gerado pelo back.",
      7
    );

    expect(result.texto_sei).toBe("Texto gerado pelo back.");
    expect(result.modelo_portaria).toBe(7);
  });

  it("deve converter corretamente os booleanos", () => {
    const mockValues: formSchemaCessacaoData = {
      cessacao: {
        numero_portaria: "1",
        ano: "2025",
        numero_sei: "123",
        doc: "DOC",
        data_inicio: new Date("2025-01-01"),
        a_pedido: EnumCheckbox.NAO,
        remocao: EnumCheckbox.SIM,
        aposentadoria: EnumCheckbox.SIM,
      },
    };

    const result = mapearPayloadCessacao(mockValues, 5);

    expect(result.a_pedido).toBe(false);
    expect(result.remocao).toBe(true);
    expect(result.aposentadoria).toBe(true);
  });

  it("deve formatar corretamente a data", () => {
    const mockValues: formSchemaCessacaoData = {
      cessacao: {
        numero_portaria: "1",
        ano: "2025",
        numero_sei: "123",
        doc: "DOC",
        data_inicio: new Date("2025-12-25T15:30:00Z"),
        a_pedido: EnumCheckbox.NAO,
        remocao: EnumCheckbox.NAO,
        aposentadoria: EnumCheckbox.NAO,
      },
    };

    const result = mapearPayloadCessacao(mockValues, 1);

    expect(result.data_cessacao).toBe("2025-12-25");
  });

  it("deve omitir o campo doc quando estiver vazio", () => {
    const mockValues: formSchemaCessacaoData = {
      cessacao: {
        numero_portaria: "1",
        ano: "2025",
        numero_sei: "123",
        doc: "",
        data_inicio: new Date("2025-01-01"),
        a_pedido: EnumCheckbox.NAO,
        remocao: EnumCheckbox.NAO,
        aposentadoria: EnumCheckbox.NAO,
      },
    };

    const result = mapearPayloadCessacao(mockValues, 1);

    expect(result.doc).toBeUndefined();
  });

  it("deve lidar com data_inicio undefined", () => {
    // data_inicio é obrigatório no schema, mas o form pode chamar a função antes
    // da validação — daí o cast para simular esse estado transitório.
    const mockValues = {
      cessacao: {
        numero_portaria: "1",
        ano: "2025",
        numero_sei: "123",
        doc: "DOC",
        data_inicio: undefined,
        a_pedido: "nao",
        remocao: "nao",
        aposentadoria: "nao",
      },
    } as unknown as formSchemaCessacaoData;

    const result = mapearPayloadCessacao(mockValues, 1);

    expect(result.data_cessacao).toBeUndefined();
  });
});
