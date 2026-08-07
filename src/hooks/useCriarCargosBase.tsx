import { useMutation } from "@tanstack/react-query";
import { criarCargosBaseAction } from "@/actions/cargos-base";
import { createFormSchemaCargosBaseData } from "@/components/dashboard/Gestao/FormCargosBase/createFormSchemaCargosBase";

export const useCriarCargosBase = () => {
  return useMutation({
    mutationFn: async ({
      values
    }: {
      values: createFormSchemaCargosBaseData;
    }) => {
      const response = await criarCargosBaseAction(values);

      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });
};