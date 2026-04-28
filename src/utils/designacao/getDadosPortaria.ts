export function getDadosPortaria(designacao: any) {
  if (!designacao) return null;

  return {
    numero_portaria: designacao.numero_portaria,
    ano_vigente: designacao.ano_vigente,
    sei_numero: designacao.sei_numero,
    doc: designacao.doc,
    data_inicio: designacao.data_inicio,
    data_fim: designacao.data_fim,
    carater_excepcional: designacao.carater_excepcional,
    impedimento_substituicao: designacao.impedimento_substituicao,
    motivo_afastamento: designacao.motivo_afastamento,
    pendencias: designacao.pendencias,
  };
}