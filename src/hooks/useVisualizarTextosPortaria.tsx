import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { filterFormSchemaFiltroCargosBaseData } from "@/components/dashboard/Gestao/FiltroDeCargosBase/filterFormSchemaCargosBase";
import { CargosBaseFiltros,  TextosDePortariasPaginada } from "@/types/gestao";
import { useAppNotification } from "@/components/providers/NotificationProvider";
import filterFormSchemaTextosPortaria, { filterFormSchemaTextosPortariaData } from "@/components/dashboard/Gestao/FiltroDeTextosPortaria/filterFormSchemaTextosPortaria";


const defaultValuesFilters: filterFormSchemaTextosPortariaData = {
  tipo_portaria: "",
  nome_modelo: "",
  status: "",
};

export function useVisualizarTextosPortaria(defaultValues: CargosBaseFiltros = defaultValuesFilters) {
  const isPending = false;
  const resultado: TextosDePortariasPaginada = {
    count: 0,
    next: null,
    previous: null,
    results: [
      { id: 1, tipo_portaria: "Portaria", nome_modelo: "Modelo 1", status: "ATIVO", criado_em: "2026-06-11T08:05:00", atualizado_em: "2026-06-11T10:00:00" },
      { id: 2, tipo_portaria: "Portaria", nome_modelo: "Modelo 2", status: "ATIVO", criado_em: "2026-06-28T11:12:00", atualizado_em: "2026-06-28T11:40:00" },
      { id: 3, tipo_portaria: "Portaria", nome_modelo: "Modelo 3", status: "INATIVO", criado_em: "2026-06-15T06:30:00", atualizado_em: "2026-06-15T06:50:00" },
    ],
  };
  const page = 1; 
  
  
  const notification = useAppNotification();
   const filterForm = useForm<filterFormSchemaTextosPortariaData>({
    resolver: zodResolver(filterFormSchemaTextosPortaria),
    defaultValues: { ...defaultValues },
    mode: "onChange",
  });

  
 

  const buscar = (values: filterFormSchemaTextosPortariaData, page?: number) => {
    console.log(values, page);
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
    notification.success({
      title: "Textos de portaria buscados com sucesso!",
      clearPrevious: true,
    });
  };
 

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