import { useQuery } from "@tanstack/react-query";
 import { getDesignacaoUnidadeAction } from "@/actions/designacao-unidade";

export function useFetchDesignacaoUnidade(codigo_ue:string) {
    return useQuery({
        queryKey: ["get-designacao-unidade"],
        queryFn: () => getDesignacaoUnidadeAction( codigo_ue ),
        refetchOnWindowFocus: false,
    });
}

 