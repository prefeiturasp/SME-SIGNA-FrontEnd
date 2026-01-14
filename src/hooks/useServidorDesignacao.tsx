import { useQuery } from "@tanstack/react-query";
import { getServidorDesignacaoAction } from "@/actions/servidores-designacao";
import { BuscaDesignacaoRequest } from "@/types/designacao";

const useServidorDesignacao = (designacaoRequest: BuscaDesignacaoRequest) => {
  const query = useQuery({
    queryKey: [
      "servidorDesignacao",
      designacaoRequest.rf,
      designacaoRequest.nome_do_servidor,
    ],
    queryFn: async () => {
      const response = await getServidorDesignacaoAction(designacaoRequest);

      if (!response.success) {
        throw new Error(response.error || "Erro ao buscar dados");
      }

      return response.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return query;
};

    export default useServidorDesignacao;
