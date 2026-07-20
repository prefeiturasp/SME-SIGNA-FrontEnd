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
import { preencherTemplate } from "@/utils/portarias/preencherTemplate";
import { TEMPLATE_APOSTILA } from "@/utils/portarias/templates";
import { formatarRF, nameToCamelCaseUe, nameToCamelCase } from "@/utils/portarias/formatadores";
import { useFetchApostilaById } from "@/hooks/useVisualizarApostila";
import ResumoPortariaApostila from "@/components/dashboard/Designacao/ResumoPortariaApostila";
import { ApostilaDetailRead } from "@/types/apostila";

const CAMPOS_NEGRITO = ["nome_indicado"] as const;

function escapeHtml(s: string) {
  return s.replaceAll("&", "&amp;").replaceAll("<​", "&lt;").replaceAll(">", "&gt;");
}

export default function VisualizarApostilaPage() {

  const params = useParams();
  const id = params.id;

  const editorSEIRef = useRef<EditorSEIHandle>(null);

  const { data: apostila, isLoading: isLoadingApostila, error: errorApostila } = useFetchApostilaById(
    Number(id),
  );
  const designacao = apostila?.designacao;




  const htmlInicial = useMemo(() => {
    const gerarDados = (apostila: ApostilaDetailRead) => {
      const isCessacao = apostila.ato_apostilado === "CESSACAO";
      
      const fonteDados = isCessacao ? designacao?.cessacao : designacao;

      return {
        sei: apostila.sei_numero,
        dre: designacao?.dre_nome ?? "-",
        eh: designacao?.codigo_hierarquico ?? "-",
        doc: apostila.doc,
        ato_apostilado: apostila.ato_apostilado,
        
        
        ano: fonteDados?.ano_vigente ?? "-",
        sei_designacao: isCessacao ? designacao?.cessacao?.sei_numero : designacao?.sei_numero ?? "-",
        doc_designacao: fonteDados?.doc ?? "-",        
        portaria_designacao: fonteDados?.numero_portaria ?? "-",
        
        rf: formatarRF(designacao?.indicado_rf ?? "-"),        
        cargo_base: nameToCamelCase(designacao?.indicado_cargo_base ?? "-"),
        ue: nameToCamelCaseUe(designacao?.indicado_local_exercicio ?? "-"),
        cargo: nameToCamelCase(designacao?.indicado_cargo_sobreposto ?? "-"),
        nome_indicado: designacao?.indicado_nome_servidor ?? "-",
        vinculo: designacao?.indicado_vinculo ?? "-",
        observacao: apostila.observacao ?? "",
      };
    };
    
    if (!designacao || !apostila) return "";

    const dadosPuros = gerarDados(apostila);


    const dadosEscapados: Record<string, string> = {};
    for (const [k, v] of Object.entries(dadosPuros)) {
      if (v === undefined || v === null) continue;
      dadosEscapados[k] = escapeHtml(String(v));
    }

    for (const campo of CAMPOS_NEGRITO) {
      const val = dadosEscapados[campo];
      if (val) dadosEscapados[campo] = `<strong>${val}</strong>`;
    }

    return gerarHtmlPortaria(preencherTemplate(TEMPLATE_APOSTILA, dadosEscapados));
  }, [designacao, apostila]);


  const router = useRouter();

  console.log(apostila);
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
                `/pages/historico-ato-administrativo?id=${id}&tipo=${apostila?.tipo}&tipo_display=Apostila&numero_portaria=${apostila?.numero_portaria}&servidor_indicado=${apostila?.designacao?.indicado_nome_servidor}`)
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