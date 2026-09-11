"use client";
import { useMemo, useRef } from "react";
import { Card } from "antd";
import { Button } from "@/components/ui/button";

import { Accordion } from "@/components/ui/accordion";

import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { CustomAccordionItem } from "@/components/dashboard/Designacao/CustomAccordionItem";
import ResumoPortariaEServidorIndicado from "@/components/dashboard/Designacao/ResumoPortariaEServidorIndicado";


import { useParams, useRouter } from "next/navigation";
import { History, Loader2 } from "lucide-react";
import EditorSEI, {
  gerarHtmlPortaria,
  EditorSEIHandle,
} from "@/components/dashboard/EditorTextoSEI/EditorTextoSEI";

import { useFetchCessacaoById } from "@/hooks/useVisualizarCessacao";
import ResumoPortariaCessacao from "@/components/dashboard/Designacao/ResumoPortariaCessacao";

export default function VisualizarCessacaoPage() {

  const params = useParams();
  const id = params.id;

  const editorSEIRef = useRef<EditorSEIHandle>(null);

  const { data: cessacao, isLoading: isLoadingDesignacao, error: errorDesignacao } = useFetchCessacaoById(
    Number(id),
  );
  const designacao = cessacao?.designacao;

  const htmlInicial = useMemo(() => {
    if (!cessacao?.texto_sei) return "";

    return gerarHtmlPortaria(cessacao.texto_sei);
  }, [cessacao]);


  const router = useRouter();

  return (
    <>
      <PageHeader
        title="Detalhes da cessação"
        breadcrumbs={[{ title: "Início", href: "/" },
        { title: "Detalhes da cessação" }]}
        showBackButton={true}
        createButton={
          <Button
            className="gap-2 px-4"
            type="button"
            variant="destructive"
            size="lg"
            onClick={() =>
              router.push(
                `/pages/historico-ato-administrativo?id=${id}&tipo_display=da cessação&numero_portaria=${cessacao?.numero_portaria}&servidor_indicado=${cessacao?.designacao?.indicado_nome_servidor}`)
            }
          >
            <span className="font-bold">Consultar histórico</span>
            <History width={15} height={15} />
          </Button>
        }

      />

      <Card
        title={
          <div className="flex justify-between items-center">
            <span className="text-[#333]">Cessação</span>
          </div>
        }
        className="mt-4 m-0"
      >
        {errorDesignacao && (
          <div className="text-red-500 text-sm animate-in shake-1">
            {errorDesignacao?.message}
          </div>
        )}

        {isLoadingDesignacao ? (
          <div className="flex justify-center h-full">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          </div>
        ) : (
          designacao && (
            <Accordion
              type="multiple"
              defaultValue={["portarias-cessacao", "portarias-designacao", "servidor-indicado"]}
            >
              <ResumoPortariaEServidorIndicado
                designacao={designacao}
                isLoadingDesignacao={isLoadingDesignacao}
              />



              <CustomAccordionItem title="Portarias de Cessação" value="portarias-cessacao" color="green">
                {cessacao ? (
                  <ResumoPortariaCessacao defaultValues={cessacao} showExtraFields={true} />
                ) : (
                  <div className="text-center text-[#777] p-4">
                    Não há portaria de cessão
                  </div>
                )}
              </CustomAccordionItem>

            </Accordion>
          )
        )}
        <EditorSEI
          ref={editorSEIRef}
          html={htmlInicial}
          titulo="PORTARIA"
          mostrarBotao={false}
        />



      </Card>
    </>
  );
}