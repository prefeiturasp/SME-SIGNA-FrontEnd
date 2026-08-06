import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import filterFormSchemaFiltroCargosBase, { filterFormSchemaFiltroCargosBaseData } from "@/components/dashboard/Gestao/FiltroDeCargosBase/filterFormSchemaCargosBase";
import { CargosBaseFiltros, CargosBasePaginada } from "@/types/gestao";
import { useEffect, useState, useTransition } from "react";
import { fetchCargosBase } from "@/actions/gestao";
import { useAppNotification } from "@/components/providers/NotificationProvider";


const defaultValuesFilters: CargosBaseFiltros = {
  grupamento: "",
  descricao_resumida: "",
  descricao_completa: "",
  situacao_funcional: "",
  status: "",
};

export function useCargosBase(defaultValues: CargosBaseFiltros = defaultValuesFilters) {
  const [resultado, setResultado] = useState<CargosBasePaginada | null>(null);
  
  const notification = useAppNotification();
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const filterForm = useForm<filterFormSchemaFiltroCargosBaseData>({
    resolver: zodResolver(filterFormSchemaFiltroCargosBase),
    defaultValues: { ...defaultValues },
    mode: "onChange",
  });

  
  const buscarCargosBase = async (
    values: CargosBaseFiltros,
    page?: number,
  ) => {
    const filtros = {
      ...values,
    };

    return fetchCargosBase({ ...filtros, page: page ?? 1 });
  };

  const buscar = (values: CargosBaseFiltros, page = 1) => {
    startTransition(async () => {
      const response = await buscarCargosBase(values, page);
      if (response.success) {        
        setPage(page);
        setResultado(response.data);
      } else {
        console.error(response.error);
        notification.error(
          "Erro ao buscar cargos base!"
        );
      }
    });
  };


  const onPageChange = (newPage: number) => {
    buscar(filterForm.getValues(), newPage);
  };
   

  const handleClear = () => {

    filterForm.reset(defaultValues);

    buscar(defaultValues);
  };


  const onSubmitFilterForm = (values: filterFormSchemaFiltroCargosBaseData) => {
    buscar(values, 1);
  };

  useEffect(() => {
    buscar(filterForm.getValues());    
  }, []);

  return {
    isPending,
    filterForm,
    page,
    resultado,    
    onPageChange,    
    handleClear,    
    onSubmitFilterForm,    
  };
} 