import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import PortariaAnularApostilaFields from "./PortariaAnularApostilaFields";

const fieldsBasePropsMock = vi.fn();

vi.mock("./FieldsBase", () => ({
  __esModule: true,
  default: (props: unknown) => {
    fieldsBasePropsMock(props);
    return <div data-testid="fields-base" />;
  },
}));

describe("PortariaAnularApostilaFields", () => {
  it("monta os campos para anulação de designação", () => {
    render(<PortariaAnularApostilaFields tipo_portaria="designacao" />);

    expect(fieldsBasePropsMock).toHaveBeenCalledTimes(1);
    expect(fieldsBasePropsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: undefined,
        inputFields: expect.arrayContaining([
          expect.objectContaining({
            name: "apostila.portaria",
            label: "Portaria da apostila da designacao",
            type: "number",
            disabled: false,
          }),
          expect.objectContaining({
            name: "apostila.numero_sei",
            mask: "9999.9999/9999999-9",
            type: "string",
          }),
        ]),
        dateFields: [
          expect.objectContaining({
            name: "apostila.doc",
            type: "date",
            placeholder: "Selecione a data",
          }),
        ],
        textareaFields: [
          expect.objectContaining({
            name: "apostila.texto_para_apostila",
          }),
          expect.objectContaining({
            name: "apostila.observacao",
          }),
        ],
      })
    );
  });

  it("monta label de portaria para cessação e repassa loading", () => {
    render(<PortariaAnularApostilaFields tipo_portaria="cessacao" isLoading />);

    expect(fieldsBasePropsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: true,
        inputFields: expect.arrayContaining([
          expect.objectContaining({
            name: "apostila.portaria",
            label: "Portaria da apostila da cessacao",
          }),
          expect.objectContaining({
            name: "apostila.ano",
            maxLength: 4,
          }),
        ]),
      })
    );
  });
});
