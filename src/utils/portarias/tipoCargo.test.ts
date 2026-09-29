import { describe, it, expect } from "vitest";
import { mapTipoVagaParaTipoCargo } from "./tipoCargo";

describe("mapTipoVagaParaTipoCargo", () => {
    it("mapeia VAGO para CARGO_VAGO", () => {
        expect(mapTipoVagaParaTipoCargo("VAGO")).toBe("CARGO_VAGO");
    });

    it("mapeia vago (minúsculo) para CARGO_VAGO", () => {
        expect(mapTipoVagaParaTipoCargo("vago")).toBe("CARGO_VAGO");
    });

    it("mapeia DISPONIVEL para CARGO_DISPONIVEL", () => {
        expect(mapTipoVagaParaTipoCargo("DISPONIVEL")).toBe("CARGO_DISPONIVEL");
    });

    it("mapeia valor ausente para CARGO_DISPONIVEL", () => {
        expect(mapTipoVagaParaTipoCargo(undefined)).toBe("CARGO_DISPONIVEL");
        expect(mapTipoVagaParaTipoCargo(null)).toBe("CARGO_DISPONIVEL");
    });
});
