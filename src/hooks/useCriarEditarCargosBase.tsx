import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CargosBaseCriarEditar } from "@/types/gestao";
import createFormSchemaCargosBase, { createFormSchemaCargosBaseData } from "@/components/dashboard/Gestao/FormCargosBase/createFormSchemaCargosBase";
import { useBuscarCargosBase, useBuscarCargosBaseById } from "./useBuscarCargosBase";
import { useRouter } from "next/navigation";
import { useAppNotification } from "@/components/providers/NotificationProvider";
import { useCriarCargosBase } from "./useCriarCargosBase";



const defaultValuesCreateEdit: CargosBaseCriarEditar = {
  grupamento: "",
  codigo_cargo: "",
  descricao_resumida: "",
  descricao_completa: "",
  situacao_funcional: "",
  status: "",
  usado_em_funcoes: false,
  usado_em_designacoes: false,
  usado_em_outros: false,
  usado_em_ste: false,
  usado_em_permutas: false,
  cargo_base_ficticio: false,
};

export function useCriarEditarCargosBase( defaultValues: CargosBaseCriarEditar = defaultValuesCreateEdit, id: number|null = null) {


  const router = useRouter();
  const notification = useAppNotification();
  const { data: CargosBaseOpcoes = [], isLoading: isLoadingCargosBase } = useBuscarCargosBase();
  const { data: cargoBase, isLoading: isLoadingCargoBase } = useBuscarCargosBaseById(id ?? 0);
  console.log("cargoBase",cargoBase);
  const criarCargosBase = useCriarCargosBase();

  const isPending = false;

  const form = useForm<createFormSchemaCargosBaseData>({
    resolver: zodResolver(createFormSchemaCargosBase),
    defaultValues: { ...defaultValues },
    mode: "onChange",
  });


  const onSubmitForm = async (values: createFormSchemaCargosBaseData) => {
    try {
      await criarCargosBase.mutateAsync({
        values,
      });

      notification.success({
        title: "Tudo certo por aqui!",
        description: "O cargo base foi criado.",
      });

      router.push("/pages/gestao/cargos-base");

    } catch (error: unknown) {
      console.error("Erro ao salvar cargo base:", error);
      notification.error({
        title: "Erro!",
        description: "Não conseguimos criar o cargo base. Por favor, tente novamente.",
        clearPrevious: true,
      });
    }
  };


  return {
    isLoadingCargosBase,
    CargosBaseOpcoes,
    isPending,
    form,
    onSubmitForm,
  };
} 