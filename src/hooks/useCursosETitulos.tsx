import { useQuery } from "@tanstack/react-query";
import { getCursosETitulosAction } from "@/actions/cursos-e-titulos";

const useCursosETitulos = () => {

    const query = useQuery({
        queryKey: ["cursos-e-titulos"],
        queryFn: async () => {
            const response = await getCursosETitulosAction();

            if (!response.success) {
                throw new Error(
                    response.error || "Erro ao buscar cursos e títulos"
                );
            }

            return response.data;
        },
        retry: false,
        staleTime: 1000 * 60 * 5,
    });


    return query;
};

export default useCursosETitulos;
