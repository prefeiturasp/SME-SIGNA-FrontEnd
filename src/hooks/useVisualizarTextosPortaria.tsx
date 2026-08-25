import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextosDePortariasPaginada } from "@/types/gestao";
import { useAppNotification } from "@/components/providers/NotificationProvider";
import FormSchemaCriarTextosPortaria, { FormSchemaCriarTextosPortariaData } from "@/components/dashboard/Gestao/FormCriarTextosPortaria/FormSchemaCriarTextosPortaria";
import { useCallback, useEffect, useState, useTransition } from "react";
import { fetchTextosPortaria } from "@/actions/textos-portaria";


const defaultValuesFilters: FormSchemaCriarTextosPortariaData = {
  tipo_portaria: "",
  nome_modelo: "",
  status: "",
  texto_portaria: "<p>rererere  [[NOME_SERVIDOR]]</p>",
  variavel: [],
  tipo_cargo: "",
};

export function useVisualizarTextosPortaria(defaultValues: FormSchemaCriarTextosPortariaData = defaultValuesFilters) {
  const [resultado, setResultado] = useState<TextosDePortariasPaginada | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCancel = () => {
    setIsModalOpen(false);
  };
 
  
  const { error: notifyError } = useAppNotification();
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  
   const filterForm = useForm<FormSchemaCriarTextosPortariaData>({
    resolver: zodResolver(FormSchemaCriarTextosPortaria),
    defaultValues: { ...defaultValues },
    mode: "onChange",
  });  
 

  const buscarTextos = useCallback(async (
    values: FormSchemaCriarTextosPortariaData,
    page?: number,
  ) => {
    const filtros = {
      ...values,
    };

    return fetchTextosPortaria(filtros, page);
  }, []);

  const buscar = useCallback((values: FormSchemaCriarTextosPortariaData, page?: number) => {
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


  const onSubmitFilterForm = (values: FormSchemaCriarTextosPortariaData) => {
    
    const variavelEstaValida = values.variavel.reduce((acc, item) => {
      if (!values.texto_portaria.includes(`[[${item}]]`)) {        
          return acc && false;              
      }
      return acc;
    }, true);
    
    if (!variavelEstaValida) {
      setIsModalOpen(true);      
    }
    console.log(values, "variavelEstaValida",variavelEstaValida);
    
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
    isModalOpen,
    handleCancel,
  };
} 