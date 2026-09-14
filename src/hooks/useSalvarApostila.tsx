import { useMutation } from "@tanstack/react-query";
import { ApostilaAction } from "@/actions/apostila-criar";
import { ApostilaBody } from "@/types/apostila";

export const useSalvarApostila = () => {
  return useMutation({
    mutationFn: async ({
      body,
    }: {
      body: ApostilaBody;
    }) => {
      const response = await ApostilaAction(body);

      if (!response.success) {
        throw new Error(response.error);
      }

      return response.data;
    },
  });
};
