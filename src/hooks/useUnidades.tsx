import { useQuery } from "@tanstack/react-query";
import { ContextoUnidades, getDREs, getUEs } from "@/actions/unidades";

export function useFetchDREs(contexto?: ContextoUnidades) {
    return useQuery({
        queryKey: ["get-dres", contexto ?? null],
        queryFn: () => getDREs(contexto),
        refetchOnWindowFocus: false,
    });
}

export function useFetchUEs(dreUuid: string, contexto?: ContextoUnidades) {
    return useQuery({
        queryKey: ["get-ues", dreUuid, contexto ?? null],
        queryFn: () => getUEs(dreUuid, contexto),
        enabled: !!dreUuid,
        refetchOnWindowFocus: false,
    });
}
