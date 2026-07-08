"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  buscarCessacaoPorPortariaAction,
  buscarDesignacaoPorPortariaAction,
  buscarInsubsistenciaPorPortariaAction,
} from "@/actions/busca-ato-por-portaria";

export type TipoNovoAto =
  | "cessacao"
  | "insubsistencia"
  | "tornar-sem-efeito"
  | "apostila"
  | "anular-apostila";

const MENSAGEM_NAO_ENCONTRADO =
  "Nenhum registro foi encontrado para essa portaria.";
const MENSAGEM_APOSTILA_NAO_ENCONTRADA =
  "Essa portaria não possui apostila vinculada para anular.";

export function useNovoAto() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const limparErro = () => setErrorMessage(null);

  const buscar = async (tipo: TipoNovoAto, portaria: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      switch (tipo) {
        case "cessacao": {
          const resultado = await buscarDesignacaoPorPortariaAction({ portaria });
          if (!resultado.success) {
            setErrorMessage(MENSAGEM_NAO_ENCONTRADO);
            return false;
          }
          router.push(`/pages/cessacao?id=${resultado.data.id}`);
          return true;
        }

        case "insubsistencia": {
          const resultadoDesignacao = await buscarDesignacaoPorPortariaAction({ portaria });
          if (resultadoDesignacao.success) {
            router.push(
              `/pages/insubsistencia?id=${resultadoDesignacao.data.id}&origem=designacao`
            );
            return true;
          }

          const resultadoCessacao = await buscarCessacaoPorPortariaAction({ portaria });
          if (!resultadoCessacao.success) {
            setErrorMessage(MENSAGEM_NAO_ENCONTRADO);
            return false;
          }
          router.push(
            `/pages/insubsistencia?id=${resultadoCessacao.data.ato_pai_id}&origem=cessacao`
          );
          return true;
        }

        case "tornar-sem-efeito": {
          const resultado = await buscarInsubsistenciaPorPortariaAction({ portaria });
          if (!resultado.success) {
            setErrorMessage(MENSAGEM_NAO_ENCONTRADO);
            return false;
          }
          router.push(`/pages/tornar-sem-efeito?id=${resultado.data.id}`);
          return true;
        }

        case "apostila": {
          const resultadoDesignacao = await buscarDesignacaoPorPortariaAction({ portaria });
          if (resultadoDesignacao.success) {
            router.push(
              `/pages/apostila?id=${resultadoDesignacao.data.id}&origem=designacao`
            );
            return true;
          }

          const resultadoCessacao = await buscarCessacaoPorPortariaAction({ portaria });
          if (!resultadoCessacao.success) {
            setErrorMessage(MENSAGEM_NAO_ENCONTRADO);
            return false;
          }
          router.push(
            `/pages/apostila?id=${resultadoCessacao.data.ato_pai_id}&origem=cessacao`
          );
          return true;
        }

        case "anular-apostila": {
          const resultadoDesignacao = await buscarDesignacaoPorPortariaAction({ portaria });
          if (resultadoDesignacao.success) {
            const apostila = resultadoDesignacao.data.apostilas[0];
            if (!apostila) {
              setErrorMessage(MENSAGEM_APOSTILA_NAO_ENCONTRADA);
              return false;
            }
            router.push(`/pages/anular-apostila?id=${apostila.id}`);
            return true;
          }

          const resultadoCessacao = await buscarCessacaoPorPortariaAction({ portaria });
          if (!resultadoCessacao.success) {
            setErrorMessage(MENSAGEM_NAO_ENCONTRADO);
            return false;
          }
          const apostilaCessacao = resultadoCessacao.data.apostilas[0];
          if (!apostilaCessacao) {
            setErrorMessage(MENSAGEM_APOSTILA_NAO_ENCONTRADA);
            return false;
          }
          router.push(`/pages/anular-apostila?id=${apostilaCessacao.id}`);
          return true;
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { buscar, isLoading, errorMessage, limparErro };
}
