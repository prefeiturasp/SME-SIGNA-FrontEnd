import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
 import { useAppNotification } from "@/components/providers/NotificationProvider";
import formSchemaSelecaoTextosPortaria, { formSchemaSelecaoTextosPortariaData } from "@/components/dashboard/Gestao/ModalSelecaoDeTipoDeTexto/formSchemaSelecaoTextosPortaria";
import { useTransition } from "react";

import { useRouter } from "next/navigation";
import { buscarTextosPortaria } from "./useVisualizarTextosPortaria";
 
 

export function useModalTextosPortaria( ) {
  const { error: notifyError } = useAppNotification();
  const filterForm = useForm<formSchemaSelecaoTextosPortariaData>({
    resolver: zodResolver(formSchemaSelecaoTextosPortaria),
    defaultValues: { tipo_de_texto: "criar_novo_texto", tipo_portaria: "DESIGNACAO" },
    mode: "onChange",
  });
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const onSubmitFilterForm = (values: formSchemaSelecaoTextosPortariaData) => {
    if (values.tipo_de_texto === "criar_novo_texto") {
      router.push(`/pages/gestao/criar-textos-de-portaria`);
    } else {
      startTransition(async () => {
        const response = await buscarTextosPortaria({ tipo_portaria: values.tipo_portaria }, 1);
        if (response.success && response.data?.results?.[0]?.id) {         
          router.push(`/pages/gestao/criar-textos-de-portaria?id=${response.data?.results?.[0]?.id}`);
        } else {
          notifyError({
            title: "Erro ao buscar textos de portaria, por favor, tente novamente mais tarde!",
            clearPrevious: true,
          });
        }
      });
    }
  }

  const tipo_de_texto = filterForm.getValues("tipo_de_texto");

  return {
    isPending,
    filterForm,
    onSubmitFilterForm,    
    tipo_de_texto,
  };
} 