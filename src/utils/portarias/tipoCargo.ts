/**
 * Converte o tipo de vaga (como vem do backend em `tipo_vaga`, ou do
 * formulário de designação em `tipo_cargo`) para o valor esperado pelo
 * endpoint de prévia do texto SEI (`ModeloPortaria.TipoCargo` no
 * backend: `CARGO_VAGO` | `CARGO_DISPONIVEL`).
 */
export function mapTipoVagaParaTipoCargo(
    tipoVaga: string | null | undefined
): string {
    return tipoVaga?.toUpperCase() === "VAGO" ? "CARGO_VAGO" : "CARGO_DISPONIVEL";
}
