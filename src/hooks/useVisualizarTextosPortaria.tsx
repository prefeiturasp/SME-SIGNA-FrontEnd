import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextosDePortariasPaginada } from "@/types/gestao";
import { useAppNotification } from "@/components/providers/NotificationProvider";
import filterFormSchemaTextosPortaria, { filterFormSchemaTextosPortariaData } from "@/components/dashboard/Gestao/FiltroDeTextosPortaria/filterFormSchemaTextosPortaria";
import { useCallback, useEffect, useState, useTransition } from "react";
import { fetchTextosPortaria } from "@/actions/textos-portaria";


const defaultValuesFilters: filterFormSchemaTextosPortariaData = {
  tipo_portaria: "",
  nome_modelo: "",
  status: "",
};

export function useVisualizarTextosPortaria(defaultValues: filterFormSchemaTextosPortariaData = defaultValuesFilters) {
  const [resultado, setResultado] = useState<TextosDePortariasPaginada | null>(null);
    
  const { error: notifyError } = useAppNotification();
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  
   const filterForm = useForm<filterFormSchemaTextosPortariaData>({
    resolver: zodResolver(filterFormSchemaTextosPortaria),
    defaultValues: { ...defaultValues },
    mode: "onChange",
  });  
 

  const buscarTextos = useCallback(async (
    values: filterFormSchemaTextosPortariaData,
    page?: number,
  ) => {
    const filtros = {
      ...values,
    };

    return fetchTextosPortaria(filtros, page);
  }, []);

  const buscar = useCallback((values: filterFormSchemaTextosPortariaData, page?: number) => {
    startTransition(async () => {
      const response = await buscarTextos(values, page);
      if (response.success) {        
        setPage(page ?? 1);
        setResultado(response.data);
      } else {
        console.error(response.error);
        notifyError({
          title: "Erro ao buscar textos de portaria!",
          clearPrevious: true,
        });
      }
    });
  }, [buscarTextos, notifyError, startTransition]);

  

  const onPageChange = (newPage: number) => {
    buscar(filterForm.getValues(), newPage);
  };
   

  const handleClear = () => {

    filterForm.reset(defaultValues);

    buscar(defaultValues);
  };


  const onSubmitFilterForm = (values: filterFormSchemaTextosPortariaData) => {
    buscar(values, 1);
  };

  useEffect(() => {
    buscar(filterForm.getValues());        
  }, [buscar, filterForm]);

  return {
    isPending,
    filterForm,
    page,
    resultado,    
    onPageChange,    
    handleClear,    
    onSubmitFilterForm,    
    buscar,
    buscarTextos,
  };
} 