import { useQuery } from "@tanstack/react-query";
import { getMeAction } from "@/actions/me";
import { useUserStore } from "@/stores/useUserStore";
import { useEffect } from "react";

const useMe = () => {
    const setUser = useUserStore((state) => state.setUser);

    const query = useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            const response = await getMeAction();

            if (!response.success) {
                throw new Error(
                    response.error || "Erro ao buscar dados do usuário"
                );
            }

            return response.data;
        },
        retry: false,
        staleTime: 1000 * 60 * 5,
    });

    useEffect(() => {
        if (query.data) {
            setUser(query.data);
        }
    }, [query.data, setUser]);

    return query;
};

export default useMe;
