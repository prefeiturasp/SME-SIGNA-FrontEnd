import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import filterFormSchemaFiltroCargosBase, { filterFormSchemaFiltroCargosBaseData } from "@/components/dashboard/Gestão/FiltroDeCargosBase/filterFormSchemaCargosBase";
import { CargosBaseFiltros } from "@/types/gestao";


const defaultValuesFilters: CargosBaseFiltros = {
  grupamento: "",
  descricao_resumida: "",
  descricao_completa: "",
  situacao_funcional: "",
  status: "",
};

export function useCargosBase(defaultValues: CargosBaseFiltros = defaultValuesFilters) {
  const filterForm = useForm<filterFormSchemaFiltroCargosBaseData>({
    resolver: zodResolver(filterFormSchemaFiltroCargosBase),
    defaultValues: { ...defaultValues },
    mode: "onChange",
  });

  const handleClear = () => {
    filterForm.reset(defaultValues);
  };


  const onSubmitFilterForm = (values: filterFormSchemaFiltroCargosBaseData) => {
    console.log(values)
  };


  return {
    handleClear,
    filterForm,
    onSubmitFilterForm,

  };
}