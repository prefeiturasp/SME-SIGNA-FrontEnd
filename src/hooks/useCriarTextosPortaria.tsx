"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppNotification } from "@/components/providers/NotificationProvider";
import FormSchemaCriarTextosPortaria, { FormSchemaCriarTextosPortariaData } from "@/components/dashboard/Gestao/FormCriarTextosPortaria/FormSchemaCriarTextosPortaria";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { cadastrarTextosPortariaAction,fetchTextoPortariaByIdAction,fetchVariavelAction } from "@/actions/textos-portaria";

export function useFetchTextoPortariaById(id: number) {
  return useQuery({
      queryKey: ["get-texto-portaria-by-id", id],
      queryFn: async () => {
          const response = await fetchTextoPortariaByIdAction(id);
          if (!response.success) {
              throw new Error(response.error);
          }
         
          return response.data;
      },
      refetchOnWindowFocus: false,
      staleTime: 0,
      gcTime: 0,
      enabled: !!id,
  });
}    

export function useBuscarVariavel() {
  return useQuery({
      queryKey: ["get-variaveis"],
      queryFn: async () => {
          const response = await fetchVariavelAction();
          if (!response.success) {
              throw new Error(response.error);
          }
          return response.data;
      },
      refetchOnWindowFocus: false,
      staleTime: 0,
      gcTime: 0,
  });
}


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


const defaultValues: FormSchemaCriarTextosPortariaData = {
  tipo_portaria: "",
  nome_modelo: "",
  status: "",
  texto_portaria: "",
  variaveis: [],
  tipo_cargo: "",
};

export function useCriarTextosPortaria(id: number | null = null) {
  const notification = useAppNotification();
  const router = useRouter();
 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCancel = () => {
    setIsModalOpen(false);
  };
 
  const { data: variaveisOpcoes = [], isLoading: isLoadingVariavel } = useBuscarVariavel();
 
  const cadastrarTextosPortaria = useCadastrarTextosPortaria();
  const {isPending: isLoadingCadastrarTextoPortaria}=cadastrarTextosPortaria



  

  const { data: textoPortaria, isLoading: isLoadingBuscarTextoPortaria } = useFetchTextoPortariaById( Number(id ?? 0));

  const filterForm = useForm<FormSchemaCriarTextosPortariaData>({
    resolver: zodResolver(FormSchemaCriarTextosPortaria),
    defaultValues: { ...defaultValues },
    mode: "onChange",
  });

  useEffect(() => {
    if (textoPortaria) {     
      
      let tipoPortaria = textoPortaria.tipo_portaria;
      const tipoAtoPai=textoPortaria.tipo_ato_pai;

      if(tipoAtoPai && tipoPortaria !== 'CESSACAO'){
        tipoPortaria= tipoPortaria+'_'+tipoAtoPai;
      }

      filterForm.reset({
        tipo_portaria: tipoPortaria,
        nome_modelo: textoPortaria.nome_modelo,
        status: textoPortaria.status,
        texto_portaria: textoPortaria.texto_portaria,
        variaveis: textoPortaria.variaveis,
        tipo_cargo: textoPortaria.tipo_cargo,
        observacoes: textoPortaria.observacoes,
      }); 
    }
  }, [filterForm,textoPortaria]);

  
  

 

  const onSubmitFilterForm = async(values: FormSchemaCriarTextosPortariaData) => { 
    const variavelEstaValida = values.variaveis.every(item => values.texto_portaria.includes(`[[${item}]]`))        
    if (!variavelEstaValida) {
      setIsModalOpen(true);      
      return;
    }

    let tipoPortaria=values.tipo_portaria;
    let tipoAtoPai;
  
    
    if( tipoPortaria?.includes('_')){
      [tipoPortaria, tipoAtoPai] = tipoPortaria.split('_');
    }   

    if(tipoPortaria==='CESSACAO'){
      tipoAtoPai = "DESIGNACAO";
    }


    try {      
 
      await cadastrarTextosPortaria.mutateAsync({
        values:{
          ...values,
          tipo_ato_pai: tipoAtoPai,
          tipo_portaria: tipoPortaria,
        },
      });
      notification.success({
        title: "Tudo certo por aqui!",
        description: "O texto da portaria foi cadastrado.",
      });
      router.push("/pages/gestao/textos-de-portaria");   
    } catch  {
      notification.error({
        title: "Erro!",
        description: "Não conseguimos cadastrar o texto da portarias. Por favor, tente novamente.",
      });
    }    
  };
 

  return {  
    variaveisOpcoes,
    isLoadingVariavel,
    isLoadingBuscarTextoPortaria,
    isLoadingCadastrarTextoPortaria,
    filterForm,
    onSubmitFilterForm,    
    isModalOpen,
    handleCancel,
  };
} 