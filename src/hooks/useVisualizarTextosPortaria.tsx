"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextosDePortariasPaginada } from "@/types/gestao";
import { useAppNotification } from "@/components/providers/NotificationProvider";
import filterFormSchemaTextosPortaria, { filterFormSchemaTextosPortariaData } from "@/components/dashboard/Gestao/FiltroDeTextosPortaria/filterFormSchemaTextosPortaria";
import { useCallback, useEffect, useState, useTransition } from "react";
import { fetchTextosPortaria } from "@/actions/textos-portaria";

export const buscarTextosPortaria = (
  values: filterFormSchemaTextosPortariaData,
  page?: number,
) => {

  let tipoPortaria=values.tipo_portaria;
  let tipoAtoPai;

  //Portaria composta
  if( tipoPortaria?.includes('_')){
    [tipoPortaria, tipoAtoPai] = tipoPortaria.split('_');
  }   

  const filtros = {      
    tipo_ato_pai: tipoAtoPai,
    tipo_portaria: tipoPortaria||values.tipo_portaria,
    nome_modelo: values.nome_modelo,
    status: values.status
  };

  return fetchTextosPortaria(filtros, page);
}


const defaultValuesFilters: filterFormSchemaTextosPortariaData = {
  tipo_portaria: "",
  tipo_ato_pai: "",
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
 



  const buscar = useCallback((values: filterFormSchemaTextosPortariaData, page?: number) => {
    startTransition(async () => {
      const response = await buscarTextosPortaria(values, page);
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
  }, [buscarTextosPortaria, notifyError, startTransition]);

  

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
    buscarTextos:buscarTextosPortaria,
  };
} 