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
import { TEMPLATE_ANULAR_APOSTILA, TEMPLATE_INSUBSISTENCIA_CESSACAO, TEMPLATE_INSUBSISTENCIA_DESIGNACAO, TEMPLATE_TORNAR_SEM_EFEITO_INSUBSISTENCIA } from "@/utils/portarias/templates";
import { useFetchInsubsistenciasById } from "@/hooks/useVisualizarInsubsistencia";
import ResumoPortariaInsubsistencia from "@/components/dashboard/Designacao/ResumoPortariaInsubsistencia";
import { gerarDadosInsubsistencia } from "../../insubsistencia/page";
import { formatarData } from "@/lib/utils";


export default function VisualizarInsubsistenciaPage() {

  const params = useParams();
  const id = params.id;

  const editorSEIRef = useRef<EditorSEIHandle>(null);

  const { data: insubsistencia, isLoading: isLoadingInsubsistencia, error: errorInsubsistencia } = useFetchInsubsistenciasById(
    Number(id),
  );
  const designacao = insubsistencia?.designacao;

  const htmlInicial = useMemo(() => {
    const values = {
      insubsistencia: {
        numero_portaria: insubsistencia?.numero_portaria ?? "",
        ano: insubsistencia?.ano_vigente ?? "",
        numero_sei: insubsistencia?.sei_numero ?? "",
        doc: insubsistencia?.doc ?? "",
        observacoes: insubsistencia?.observacoes ?? "",
        tipo_insubsistencia: insubsistencia?.tipo_insubsistencia ?? "",
      }
    };


    let texto = TEMPLATE_INSUBSISTENCIA_DESIGNACAO;


    if (values.insubsistencia.tipo_insubsistencia === "CESSACAO") {
      texto = TEMPLATE_INSUBSISTENCIA_CESSACAO;
    }


    if (values.insubsistencia.tipo_insubsistencia === "APOSTILA") {
      texto = TEMPLATE_ANULAR_APOSTILA;
    }

    if (values.insubsistencia.tipo_insubsistencia === "INSUBSISTENCIA") {
      texto = TEMPLATE_TORNAR_SEM_EFEITO_INSUBSISTENCIA;
    }

    const dados_base = gerarDadosInsubsistencia(values, designacao, insubsistencia?.cessacao);

    const isCessacao = insubsistencia?.ato_apostilado === "CESSACAO";
      
    const fonteDados = isCessacao ? insubsistencia?.cessacao : insubsistencia?.designacao;




    const dados = {
      ...dados_base,
      doc_da_insubsistencia: insubsistencia?.insubsistencia?.doc ? formatarData(insubsistencia?.insubsistencia?.doc) : "",
      numero_sei_da_insubsistencia: insubsistencia?.insubsistencia?.sei_numero ?? "-",
      doc_do_ato_insubstituido: insubsistencia?.insubsistencia?.doc_do_ato_insubstituido ? formatarData(insubsistencia?.insubsistencia?.doc_do_ato_insubstituido) : "",

      portaria_apostilada: fonteDados?.numero_portaria ?? "-",
      ano_apostilado: fonteDados?.ano_vigente ?? "-",
      doc_apostilado: fonteDados?.doc ? formatarData(fonteDados?.doc) : "",
      sei_apostilado: fonteDados?.sei_numero ?? "-",
      texto_para_apostila: insubsistencia?.texto_apostila ?? "",
    };

    Object.entries(dados).forEach(([key, value]) => {
      let val = String(value ?? "");

      if (["nome_indicado"].includes(key)) {
        val = `<strong>${val}</strong>`;
      }

      texto = texto.replaceAll(`{{${key}}}`, val);
    });

    return gerarHtmlPortaria(texto);

  }, [designacao, insubsistencia]);


  const router = useRouter();


  const  tipo_display = (() => {
    if (insubsistencia?.tipo_insubsistencia === "APOSTILA") {
      return "da anulação da apostila";
    } else if (insubsistencia?.tipo_insubsistencia === "INSUBSISTENCIA") {
      return "do ato de tornar sem efeito";
    }
    return "de insubsistência";
  })();

  const cor_portaria = (() => {
    if (["APOSTILA", "INSUBSISTENCIA"].includes(insubsistencia?.tipo_insubsistencia ?? "")) {
      return "gray";
    } else {
      return "purple";
    }
  })();

  return (
    <>
      <PageHeader
        title={`Detalhes ${tipo_display}`}
        breadcrumbs={[{ title: "Início", href: "/" },
        { title: `Detalhes ${tipo_display}` }]}
        showBackButton={true}
        createButton={
          <Button
            className="gap-2 px-4"
            type="button"
            variant="destructive"
            size="lg"
            onClick={() =>
              router.push(
                `/pages/historico-ato-administrativo?id=${id}&tipo=${insubsistencia?.tipo}&tipo_display=${tipo_display}&numero_portaria=${insubsistencia?.numero_portaria}&servidor_indicado=${insubsistencia?.designacao?.indicado_nome_servidor}`)
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
            <span className="text-[#333]">Insubsistencia</span>
          </div>
        }
        className="mt-4 m-0"
      >
        {errorInsubsistencia && (
          <div className="text-red-500 text-sm animate-in shake-1">
            {errorInsubsistencia?.message}
          </div>
        )}

        {isLoadingInsubsistencia ? (
          <div className="flex justify-center h-full">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          </div>
        ) : (
          designacao && (
            <Accordion
              type="multiple"
              defaultValue={["portaria-insubsistencia", "portarias-designacao", "servidor-indicado"]}
            >
              <ResumoPortariaEServidorIndicado
                designacao={designacao}
                isLoadingDesignacao={isLoadingInsubsistencia}
              />

              <CustomAccordionItem title={`Portaria ${tipo_display}`} value="portaria-insubsistencia" color={cor_portaria ?? "purple"}>
                <ResumoPortariaInsubsistencia defaultValues={insubsistencia} titulo_portaria={`Portaria ${tipo_display}`} />
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