import { useQuery } from "@tanstack/react-query";
import { getDREs, getUEs } from "@/actions/unidades";

export function useFetchDREs() {
    return useQuery({
        queryKey: ["get-dres"],
        queryFn: () => getDREs(),
        refetchOnWindowFocus: false,
    });
}

export function useFetchUEs(dreUuid: string) {
    return useQuery({
        queryKey: ["get-ues", dreUuid],
        queryFn: () => getUEs(dreUuid),
        enabled: !!dreUuid,
        refetchOnWindowFocus: false,
    });
}
