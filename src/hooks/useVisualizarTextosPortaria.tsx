import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { filterFormSchemaFiltroCargosBaseData } from "@/components/dashboard/Gestao/FiltroDeCargosBase/filterFormSchemaCargosBase";
import { CargosBaseFiltros,  TextosDePortariasPaginada } from "@/types/gestao";
import { useAppNotification } from "@/components/providers/NotificationProvider";
import filterFormSchemaTextosPortaria, { filterFormSchemaTextosPortariaData } from "@/components/dashboard/Gestao/FiltroDeTextosPortaria/filterFormSchemaTextosPortaria";


const defaultValuesFilters: filterFormSchemaTextosPortariaData = {
  tipo: "",
  nome_do_modelo: "",
  status: "",
};

export function useVisualizarTextosPortaria(defaultValues: CargosBaseFiltros = defaultValuesFilters) {
  const isPending = false;
  const resultado: TextosDePortariasPaginada = {
    count: 0,
    next: null,
    previous: null,
    results: [
      { id: 1, tipo_de_portaria: "Portaria", nome_do_modelo: "Modelo 1", status: "ATIVO", atualizado_por: "Usuario 1", atualizado_em: "30/06/2026 08:05" },
      { id: 2, tipo_de_portaria: "Portaria", nome_do_modelo: "Modelo 2", status: "ATIVO", atualizado_por: "Usuario 2", atualizado_em: "28/06/2026 11:12" },
      { id: 3, tipo_de_portaria: "Portaria", nome_do_modelo: "Modelo 3", status: "INATIVO", atualizado_por: "Usuario 3", atualizado_em: "15/06/2026 06:30" },
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