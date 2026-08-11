import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CargosBaseCriarEditar } from "@/types/gestao";
import createFormSchemaCargosBase, { createFormSchemaCargosBaseData } from "@/components/dashboard/Gestao/FormCargosBase/createFormSchemaCargosBase";
import { useBuscarCargosBase, useBuscarCargosBaseById } from "./useBuscarCargosBase";
import { useRouter } from "next/navigation";
import { useAppNotification } from "@/components/providers/NotificationProvider";
import { useEffect } from "react";

import { useMutation } from "@tanstack/react-query";
import { criarCargosBaseAction, editarCargosBaseAction } from "@/actions/cargos-base";

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


export const useEditarCargosBase = () => {
  return useMutation({
    mutationFn: async ({
      id,
      values
    }: {
      id: number;
      values: createFormSchemaCargosBaseData;
    }) => {
      const response = await editarCargosBaseAction(id, values);

      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });
};

const defaultValuesCreateEdit: CargosBaseCriarEditar = {
  grupamento: "",
  codigo_cargo: "",
  descricao_resumida: "",
  descricao_completa: "",
  situacao_funcional: "",
  status: "",
  utilizado_para_funcoes: false,
  utilizado_para_designacoes: false,
  utilizado_para_ste: false,
  utilizado_para_permutas: false,
  cargo_base_ficticio: false,
};

export function useCriarEditarCargosBase(id: number | null = null, defaultValues: CargosBaseCriarEditar = defaultValuesCreateEdit) {


  const router = useRouter();
  const notification = useAppNotification();
  const { data: CargosBaseOpcoes = [], isLoading: isLoadingCargosBase } = useBuscarCargosBase();
  const { data: cargoBase, isLoading: isLoadingEditarCargosBase } = useBuscarCargosBaseById(id ?? 0);
  console.log("CargosBaseOpcoes", CargosBaseOpcoes);

  const criarCargosBase = useCriarCargosBase();
  const editarCargosBase = useEditarCargosBase();

  const isPending = false;

  const form = useForm<createFormSchemaCargosBaseData>({
    resolver: zodResolver(createFormSchemaCargosBase),
    defaultValues: { ...defaultValues },
    mode: "onChange",
  });

  useEffect(() => {
    if (cargoBase) {
      form.reset(cargoBase);
    }
  }, [cargoBase]);


  const onSubmitForm = async (values: createFormSchemaCargosBaseData) => {
    try {
      let successMessage = "O cargo base foi criado.";
      if (id) {
        console.log("values", values);
        console.log("id", id);
        await editarCargosBase.mutateAsync({
          id,
          values,
        });
        successMessage = "As alterações foram salvas.";
      } else {
        await criarCargosBase.mutateAsync({
          values,
        });
      }

      notification.success({
        title: "Tudo certo por aqui!",
        description: successMessage,
      });

      router.push("/pages/gestao/cargos-base");

    } catch (error: unknown) {
      console.error("Erro ao salvar cargo base:", error);
      let message = "Não conseguimos criar o cargo base. Por favor, tente novamente.";
      if (id) {
        message = "Não conseguimos salvar as alterações. Por favor, tente novamente.";
      }
      notification.error({
        title: "Erro!",
        description: message,
        clearPrevious: true,
      });
    }
  };


  return {
    isLoadingCargosBase,
    CargosBaseOpcoes: CargosBaseOpcoes,
    isPending,
    form,
    onSubmitForm,
    isLoadingEditarCargosBase
  };
} 