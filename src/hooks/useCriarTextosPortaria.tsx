"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppNotification } from "@/components/providers/NotificationProvider";
import FormSchemaCriarTextosPortaria, { FormSchemaCriarTextosPortariaData } from "@/components/dashboard/Gestao/FormCriarTextosPortaria/FormSchemaCriarTextosPortaria";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { cadastrarTextosPortariaAction } from "@/actions/textos-portaria";

export const useCadastrarTextosPortaria = () => {
  return useMutation({
    mutationFn: async ({
      values
    }: {
      values: FormSchemaCriarTextosPortariaData;
    }) => {
      const response = await cadastrarTextosPortariaAction(values);

      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });
};


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
 
  const cadastrarTextosPortaria = useCadastrarTextosPortaria();

  const router = useRouter();


  const onSubmitFilterForm = async(values: FormSchemaCriarTextosPortariaData) => { 

    const variavelEstaValida = values.variavel.every(item => values.texto_portaria.includes(`[[${item}]]`))        
    if (!variavelEstaValida) {
      setIsModalOpen(true);      
      return;
    }

    try {      
      await cadastrarTextosPortaria.mutateAsync({
        values,
      });
      notification.success({
        title: "Tudo certo por aqui!",
        description: "O texto da portaria foi cadastrado.",
      });
      router.push("/pages/gestao/textos-de-portaria");   
    } catch {
      notification.error({
        title: "Erro!",
        description: "Não conseguimos cadastrar o texto da portarias. Por favor, tente novamente.",
      });
    }    
  };
 

  return {
    isPending,
    filterForm,
    onSubmitFilterForm,    
    isModalOpen,
    handleCancel,
  };
} 