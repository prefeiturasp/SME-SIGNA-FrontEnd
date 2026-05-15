import { useMutation } from "@tanstack/react-query";
import { ListagemPortariasResponse, PortariasDOBody } from "@/types/designacao";
import { PortariaDOAction } from "@/actions/portaria-do-criar";

export const useSalvarPortariasDo = () => {
  return useMutation({
    mutationFn: async ({
      values,
      data_publicacao,      
    }: {
      values: ListagemPortariasResponse[];
      data_publicacao: string;
    }) => {

      const payload = {
         ids: values.map((row) => row.id),
         data_publicacao: data_publicacao,
       
        } as PortariasDOBody;
      

      const response = await PortariaDOAction(payload);

      if (!response.success) {
        throw new Error(response.error);
      }

      return response.data;
    },
  });   
};