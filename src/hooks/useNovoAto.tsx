"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BuscaPorPortariaRequest,
  buscarCessacaoPorPortariaAction,
  buscarDesignacaoPorPortariaAction,
  buscarInsubsistenciaPorPortariaAction,
} from "@/actions/busca-ato-por-portaria";
import { ApostilaRead } from "@/types/apostila";

export type TipoNovoAto =
  | "cessacao"
  | "insubsistencia"
  | "tornar-sem-efeito"
  | "apostila"
  | "anular-apostila";

type OrigemAto = "designacao" | "cessacao";

type AtoEncontrado = {
  origem: OrigemAto;
  id: number;
  apostilas: ApostilaRead[];
};

type ResultadoBusca<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const MENSAGEM_NAO_ENCONTRADO =
  "Nenhum registro foi encontrado para essa portaria.";
const MENSAGEM_APOSTILA_NAO_ENCONTRADA =
  "Essa portaria não possui apostila vinculada para anular.";
const MENSAGEM_APOSTILA_JA_EXISTE =
  "Essa portaria já possui uma apostila vinculada.";

const DESTINO_POR_TIPO: Record<"insubsistencia" | "apostila", string> = {
  insubsistencia: "insubsistencia",
  apostila: "apostila",
};

async function buscarDesignacaoOuCessacao(
  portaria: string,
  ano: string
): Promise<AtoEncontrado | null> {
  const resultadoDesignacao = await buscarDesignacaoPorPortariaAction({ portaria, ano });
  if (resultadoDesignacao.success) {
    return {
      origem: "designacao",
      id: resultadoDesignacao.data.id,
      apostilas: resultadoDesignacao.data.apostilas,
    };
  }

  const resultadoCessacao = await buscarCessacaoPorPortariaAction({ portaria, ano });
  if (!resultadoCessacao.success) {
    return null;
  }

  return {
    origem: "cessacao",
    id: resultadoCessacao.data.ato_pai_id,
    apostilas: resultadoCessacao.data.apostilas,
  };
}

export function useNovoAto() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const limparErro = () => setErrorMessage(null);

  const buscarOuMostrarErro = async <T,>(
    buscarAction: (filtros: BuscaPorPortariaRequest) => Promise<ResultadoBusca<T>>,
    portaria: string,
    ano: string
  ): Promise<T | null> => {
    const resultado = await buscarAction({ portaria, ano });
    if (!resultado.success) {
      setErrorMessage(MENSAGEM_NAO_ENCONTRADO);
      return null;
    }
    return resultado.data;
  };

  const buscarInsubsistenciaOuApostila = async (
    tipo: "insubsistencia" | "apostila",
    portaria: string,
    ano: string
  ): Promise<boolean> => {
    const encontrado = await buscarDesignacaoOuCessacao(portaria, ano);
    if (!encontrado) {
      setErrorMessage(MENSAGEM_NAO_ENCONTRADO);
      return false;
    }
    if (tipo === "apostila" && encontrado.apostilas?.some((a) => a.status === "ativo")) {
      setErrorMessage(MENSAGEM_APOSTILA_JA_EXISTE);
      return false;
    }
    router.push(
      `/pages/${DESTINO_POR_TIPO[tipo]}?id=${encontrado.id}&origem=${encontrado.origem}`
    );
    return true;
  };

  const buscarParaAnularApostila = async (portaria: string, ano: string): Promise<boolean> => {
    const encontrado = await buscarDesignacaoOuCessacao(portaria, ano);
    if (!encontrado) {
      setErrorMessage(MENSAGEM_NAO_ENCONTRADO);
      return false;
    }
    const apostila = encontrado.apostilas[0];
    if (!apostila) {
      setErrorMessage(MENSAGEM_APOSTILA_NAO_ENCONTRADA);
      return false;
    }
    router.push(`/pages/anular-apostila?id=${apostila.id}`);
    return true;
  };

  const buscar = async (tipo: TipoNovoAto, portaria: string, ano: string): Promise<boolean> => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      switch (tipo) {
        case "cessacao": {
          const dados = await buscarOuMostrarErro(buscarDesignacaoPorPortariaAction, portaria, ano);
          if (!dados) return false;
          router.push(`/pages/cessacao?id=${dados.id}`);
          return true;
        }

        case "tornar-sem-efeito": {
          const dados = await buscarOuMostrarErro(buscarInsubsistenciaPorPortariaAction, portaria, ano);
          if (!dados) return false;
          router.push(`/pages/tornar-sem-efeito?id=${dados.id}`);
          return true;
        }

        case "insubsistencia":
        case "apostila":
          return buscarInsubsistenciaOuApostila(tipo, portaria, ano);

        case "anular-apostila":
          return buscarParaAnularApostila(portaria, ano);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { buscar, isLoading, errorMessage, limparErro };
}
