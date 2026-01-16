import { useMutation } from "@tanstack/react-query";
import { getServidorDesignacaoAction } from "@/actions/servidores-designacao";
 
const useServidorDesignacao = () => {
  return useMutation({
    mutationFn: getServidorDesignacaoAction
  });
};

export default useServidorDesignacao;
