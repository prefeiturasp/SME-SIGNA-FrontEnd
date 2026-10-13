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
import { useFetchApostilaById } from "@/hooks/useVisualizarApostila";
import ResumoPortariaApostila from "@/components/dashboard/Designacao/ResumoPortariaApostila";


export default function VisualizarApostilaPage() {

  const params = useParams();
  const id = params.id;

  const editorSEIRef = useRef<EditorSEIHandle>(null);

  const { data: apostila, isLoading: isLoadingApostila, error: errorApostila } = useFetchApostilaById(
    Number(id),
  );
  const designacao = apostila?.designacao;




  const htmlInicial = useMemo(() => {
    return gerarHtmlPortaria(apostila?.texto_sei ?? "");
  }, [apostila]);


  const router = useRouter();

  return (
    <>
      <PageHeader
        title="Detalhes da apostila"
        breadcrumbs={[{ title: "Início", href: "/" },
        { title: "Detalhes da apostila" }]}
        showBackButton={true}
        createButton={
          <Button
            className="gap-2 px-4"
            type="button"
            variant="destructive"
            size="lg"
            onClick={() =>
              router.push(
                `/pages/historico-ato-administrativo?id=${id}&tipo_display=da apostila&numero_portaria=${apostila?.numero_portaria}&servidor_indicado=${apostila?.designacao?.indicado_nome_servidor}`)
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
            <span className="text-[#333]">Apostila</span>
          </div>
        }
        className="mt-4 m-0"
      >
        {errorApostila && (
          <div className="text-red-500 text-sm animate-in shake-1">
            {errorApostila?.message}
          </div>
        )}

        {isLoadingApostila ? (
          <div className="flex justify-center h-full">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          </div>
        ) : (
          designacao && (
            <Accordion
              type="multiple"
              defaultValue={["portaria-apostila", "portarias-designacao", "servidor-indicado"]}
            >
              <ResumoPortariaEServidorIndicado
                designacao={designacao}
                isLoadingDesignacao={isLoadingApostila}
              />

              <CustomAccordionItem title="Portaria de Apostila" value="portaria-apostila" color="purple">
                <ResumoPortariaApostila defaultValues={apostila} />
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