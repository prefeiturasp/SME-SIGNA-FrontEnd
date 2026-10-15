import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import createFormSchemaCargosBase, { createFormSchemaCargosBaseData } from "@/components/dashboard/Gestao/FormCargosBase/createFormSchemaCargosBase";
import { useBuscarCargosBase, useBuscarCargosBaseById } from "./useBuscarCargosBase";
import { useRouter } from "next/navigation";
import { useAppNotification } from "@/components/providers/NotificationProvider";
import { useEffect } from "react";
import dayjs from "dayjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { criarCargosBaseAction, editarCargosBaseAction } from "@/actions/cargos-base";
import { CargosBaseCriarEditar } from "@/types/gestao";

export const useCriarCargosBase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      values
    }: {
      values: CargosBaseCriarEditar;
    }) => {
      const response = await criarCargosBaseAction(values);

      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-cargos"] });
    },
  });
};


export const useEditarCargosBase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values
    }: {
      id: number;
      values: Partial<CargosBaseCriarEditar>;
    }) => {
      const response = await editarCargosBaseAction(id, values);

      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-cargos"] });
    },
  });
};

const defaultValuesCreateEdit: createFormSchemaCargosBaseData = {
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
  testar_laudo: false,
  pesquisar_licencas_no_sigpec: false,
  quantidade_maxima_de_dias_de_licenca: '0',
  permite_substituicao: false,
  possui_periodo_fechado: false,
  data_fim_periodo: null,
};





export function useCriarEditarCargosBase(id: number | null = null, defaultValues: createFormSchemaCargosBaseData = defaultValuesCreateEdit) {

  const router = useRouter();
  const notification = useAppNotification();
  const { data: CargosBaseOpcoes = [], isLoading: isLoadingCargosBase } = useBuscarCargosBase();
  const { data: cargoBase, isLoading: isLoadingEditarCargosBase } = useBuscarCargosBaseById(id ?? 0);


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
      const data_fim_periodo = cargoBase.data_fim_periodo ? new Date(cargoBase.data_fim_periodo.toString().replaceAll("-", '/')) : null;
      form.reset(
        {
          ...cargoBase,
          data_fim_periodo: data_fim_periodo,
          quantidade_maxima_de_dias_de_licenca:
            cargoBase.quantidade_maxima_de_dias_de_licenca?.toString() ?? "0"
        });
    }
  }, [cargoBase]);


  const onSubmitForm = async (values: createFormSchemaCargosBaseData) => {
    try {
      const data_fim_periodo_formatada = values.data_fim_periodo ? dayjs(values.data_fim_periodo).format("YYYY-MM-DD"): null;
      let successMessage = "O cargo base foi criado.";
      if (id) {             
        const partialValues: Partial<createFormSchemaCargosBaseData> = {
          ...values,
        };

        delete partialValues["descricao_completa"];
        delete partialValues["codigo_cargo"];

        

        await editarCargosBase.mutateAsync({
          id,
          values: { ...partialValues, data_fim_periodo: data_fim_periodo_formatada},
        });
        successMessage = "As alterações foram salvas.";
      } else {
        await criarCargosBase.mutateAsync({
          values: { ...values, data_fim_periodo: data_fim_periodo_formatada},
        });
      }

      notification.success({
        title: "Tudo certo por aqui!",
        description: successMessage,
      });

      router.push("/pages/gestao/cargos-base");

    } catch (error) {
      console.log("error: ", error);
      let message = "Não conseguimos criar o cargo base. Por favor, tente novamente.";

      if (id) {
        message = "Não conseguimos salvar as alterações. Por favor, tente novamente.";
      }

      if (error instanceof Error) {
        message = error.message;
      }

      notification.error({
        title: "Erro!",
        description: message,
        clearPrevious: true,
      });

    }
  };


  const quantidadeMaximaDeDiasDeLicenca = form.watch("quantidade_maxima_de_dias_de_licenca");
  const pesquisarLicencasNoSigpec = form.watch("pesquisar_licencas_no_sigpec");

  useEffect(() => {
    form.trigger(["quantidade_maxima_de_dias_de_licenca", "pesquisar_licencas_no_sigpec"]);
  }, [quantidadeMaximaDeDiasDeLicenca, pesquisarLicencasNoSigpec, form]);


  return {
    isLoadingCargosBase,
    CargosBaseOpcoes: CargosBaseOpcoes,
    isPending,
    form,
    onSubmitForm,
    isLoadingEditarCargosBase
  };
} 