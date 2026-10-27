import { formatarData } from "@/lib/utils";
import {
  AtoRelacionadoHistorico,
  DesignacaoHistorico,
} from "@/types/historico-designacoes";
import {
  IAtosAdministrativosPrincipalType,
  IAtosAdministrativosType,
} from "./components/AtosRelacionados";

const DATA_ISO = /^\d{4}-\d{2}-\d{2}/;

const formatarDataDoAto = (data?: string | null): string => {
  if (!data) return "";

  return DATA_ISO.test(data) ? formatarData(data.slice(0, 10)) : data;
};

const mapearStatus = (designacao: DesignacaoHistorico) => {
  if (designacao.vigente) return "EM_VIGENCIA" as const;
  if (designacao.status === "insubsistente") return "INSUBSISTENTE" as const;

  return "CESSADA" as const;
};

const mapearAtoRelacionado = (
  ato: AtoRelacionadoHistorico
): IAtosAdministrativosType => ({
  id: ato.id,
  data: formatarDataDoAto(
    ato.tipo === "CESSACAO" ||
      ato.tipo_apostila === "CESSACAO" ||
      ato.tipo_insubsistencia === "CESSACAO"
      ? ato.data_cessacao
      : ato.data_designacao
  ),
  portaria: ato.portaria ?? "",
  titulo: ato.tipo_de_ato ?? "",
  descricao: ato.observacoes ?? "",
  principal: Boolean(ato.ultimo_ato_vigente),
  esta_vigente: Boolean(ato.ativo),
});

export const mapearHistoricoParaAtosPrincipais = (
  designacoes: DesignacaoHistorico[] = []
): IAtosAdministrativosPrincipalType[] =>
  designacoes.map((designacao) => ({
    id: designacao.id,
    tipo_ato_display: designacao.tipo_de_ato || "Designação",
    realizada_em: formatarDataDoAto(designacao.data_inicio),
    data_cessacao: formatarDataDoAto(
      designacao.cessada_em ?? designacao.data_fim
    ),
    status: mapearStatus(designacao),
    numero_portaria:
      designacao.portaria ?? String(designacao.numero_portaria ?? ""),
    cargo_display: designacao.cargo ?? "",
    nome_servidor_indicado: designacao.indicado_nome_servidor || "",
    nome_social_servidor_indicado: designacao.nome?.trim() || "",
    atos_relacionados: (designacao.atos_relacionados ?? []).map(
      mapearAtoRelacionado
    ),
  }));
