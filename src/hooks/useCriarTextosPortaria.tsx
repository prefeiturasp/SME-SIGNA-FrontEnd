import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppNotification } from "@/components/providers/NotificationProvider";
import FormSchemaCriarTextosPortaria, { FormSchemaCriarTextosPortariaData } from "@/components/dashboard/Gestao/FormCriarTextosPortaria/FormSchemaCriarTextosPortaria";
import { useState } from "react";
import router from "next/router";
 
const defaultValuesFilters: FormSchemaCriarTextosPortariaData = {
  tipo_portaria: "",
  nome_modelo: "",
  status: "",
  texto_portaria: "",
  variavel: [],
  tipo_cargo: "",
};

export function useCriarTextosPortaria(defaultValues: FormSchemaCriarTextosPortariaData = defaultValuesFilters) {
   const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCancel = () => {
    setIsModalOpen(false);
  };
 
  
  const notification = useAppNotification();
  const isPending = false;
  
   const filterForm = useForm<FormSchemaCriarTextosPortariaData>({
    resolver: zodResolver(FormSchemaCriarTextosPortaria),
    defaultValues: { ...defaultValues },
    mode: "onChange",
  });  
 
 


  const onSubmitFilterForm = (values: FormSchemaCriarTextosPortariaData) => { 

    const variavelEstaValida = values.variavel.every(item => values.texto_portaria.includes(`[[${item}]]`))        
    if (!variavelEstaValida) {
      setIsModalOpen(true);      
      return;
    }
    // futura integração aqui com o backend
    
    notification.success({
      title: "Tudo certo por aqui!",
      description: "Texto de portaria encontrado com sucesso!",
    });

    router.push("/pages/gestao/cargos-base");   
    
  };
 

  return {
    isPending,
    filterForm,
    onSubmitFilterForm,    
    isModalOpen,
    handleCancel,
  };
} 