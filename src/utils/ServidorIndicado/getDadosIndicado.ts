import { Servidor } from "@/types/designacao-unidade";

export function getDadosIndicado(designacao: any): Servidor | null {
  if (!designacao) return null;

return {
  rf: designacao.indicado_rf,
  nome_servidor: designacao.indicado_nome_servidor,
  nome_civil: designacao.indicado_nome_civil,
  vinculo: designacao.indicado_vinculo,
  cargo_base: designacao.indicado_cargo_base,
  lotacao: designacao.indicado_lotacao,
  cargo_sobreposto_funcao_atividade: designacao.indicado_cargo_sobreposto,
  local_de_exercicio: designacao.indicado_local_exercicio,
  local_de_servico: designacao.indicado_local_servico,
  cd_cargo_base: designacao.indicado_codigo_cargo_base ?? 0,
  cd_cargo_sobreposto_funcao_atividade:
    designacao.indicado_codigo_cargo_sobreposto ?? 0,
  cursos_titulos: designacao.cursos_titulos ?? "-",
  laudo_medico: designacao.laudo_medico ?? "-",
};
}