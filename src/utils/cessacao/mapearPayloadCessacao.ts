import { formSchemaCessacaoData } from "@/app/pages/cessacao/schema";

export function mapearPayloadCessacao(
  values: formSchemaCessacaoData,
  designacaoId: number
) {
  return {
    designacao: designacaoId,
    numero_portaria: values.cessacao.numero_portaria,
    ano_vigente: values.cessacao.ano,
    sei_numero: values.cessacao.numero_sei,
    doc: values.cessacao.doc,
    data_designacao: values.cessacao.data_inicio?.toISOString().split("T")[0],//to-do mudar o nome pra data_cessacao
    a_pedido: values.cessacao.a_pedido === "sim",
    remocao: values.cessacao.remocao === "sim",
    aposentadoria: values.cessacao.aposentadoria === "sim",
  };
}