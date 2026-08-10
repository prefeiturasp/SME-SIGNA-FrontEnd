import { useQuery } from "@tanstack/react-query";
import { fetchCargosBaseAction, fetchCargosBaseActionByIdAction } from "@/actions/cargos-base";
import { CargosBaseCriarEditar } from "@/types/gestao";

 

export function useBuscarCargosBase() {
    return useQuery({
        queryKey: ["get-cargos-base"],
        queryFn: async () => {
            const response = await fetchCargosBaseAction();
            if (!response.success) {
                throw new Error(response.error);
            }
            console.log("response", response);
            if (response.data[0]?.codigoCargo===0) {
                return [];
            }

            return response.data;
        },
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 0,
    });
}



export function useBuscarCargosBaseById(id: number) {
    return useQuery({
        queryKey: ["get-cargos-base-by-id", id],
        queryFn: async () => {
            return {
                id: 1,
                grupamento: 'DOCENTES', 
                descricao_resumida: 'Resumo',
                descricao_completa: "response.data.descricao_completa",
                situacao_funcional: 'EFETIVO',
                utilizado_para_funcoes: false,
                utilizado_para_designacoes: false,
                utilizado_para_ste: false,
                utilizado_para_permutas: false,
                cargo_base_ficticio: false,
                status: "ATIVO",
                codigo_cargo: "20"            
            } as CargosBaseCriarEditar;
            const response = await fetchCargosBaseActionByIdAction(id);
            if (!response.success) {
                throw new Error(response.error);
            }
           
            return response.data;
        },
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 0,
        enabled: !!id,
    });
}   