import { useMutation, useQueryClient } from "@tanstack/react-query";
 import { getDesignacaoUnidadeAction } from "@/actions/designacao-unidade";
 
 
const useFetchDesignacaoUnidadeMutation = () => {
     const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (codigo_ue:string) => getDesignacaoUnidadeAction( codigo_ue ),
      onSuccess: (response) => {
        if (!response.success) return;
        
        queryClient.invalidateQueries({ queryKey: ["me"] });
       },
    });
  };
  
  export default useFetchDesignacaoUnidadeMutation;