import { useMutation } from "@tanstack/react-query";
 import { getDesignacaoUnidadeAction } from "@/actions/designacao-unidade";
 
 
const useFetchDesignacaoUnidadeMutation = () => {
     
    return useMutation({
      mutationFn: async (codigo_ue: string) => {
        const response = await getDesignacaoUnidadeAction(codigo_ue);

        if (!response.success) {
          return {
            ...response,
            error:
              response.error ?? "Não foi possível buscar os dados da unidade",
          };
        }

        return response;
      },
    });
  };
  
  export default useFetchDesignacaoUnidadeMutation;