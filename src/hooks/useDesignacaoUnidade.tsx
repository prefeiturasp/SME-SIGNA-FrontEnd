import { useMutation } from "@tanstack/react-query";
 import { getDesignacaoUnidadeAction } from "@/actions/designacao-unidade";
 
 
const useFetchDesignacaoUnidadeMutation = () => {
     
    return useMutation({
      mutationFn: (codigo_ue:string) => getDesignacaoUnidadeAction( codigo_ue ),
      onSuccess: (response) => {
         if (!response.success) {
           throw new Error(
              response.error || "Não foi possível buscar os dados da unidade"
          );
      }
      return response.data;
        
       }
    });
  };
  
  export default useFetchDesignacaoUnidadeMutation;