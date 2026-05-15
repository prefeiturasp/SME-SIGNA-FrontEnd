import { formSchemaCessacaoData } from "@/app/pages/cessacao/schema";

export function mapearPayloadCessacao(
  values: formSchemaCessacaoData,
  designacaoId: number
) {
  return {
    ato_pai: designacaoId,
    numero_portaria: values.cessacao.numero_portaria,
    ano_vigente: values.cessacao.ano,
    sei_numero: values.cessacao.numero_sei,
    doc: values.cessacao.doc !== "" ? values.cessacao.doc : undefined,
    data_cessacao: values.cessacao.data_inicio?.toISOString().split("T")[0],
    a_pedido: values.cessacao.a_pedido === "sim",
    remocao: values.cessacao.remocao === "sim",
    aposentadoria: values.cessacao.aposentadoria === "sim",
  };
}
