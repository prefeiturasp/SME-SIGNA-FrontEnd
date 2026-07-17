"use client";
import { useMemo, useRef } from "react";
import { Card } from "antd";
import { Button } from "@/components/ui/button";

import { Accordion } from "@/components/ui/accordion";

import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import ResumoPesquisaDaUnidade from "@/components/dashboard/Designacao/ResumoPesquisaDaUnidade";
import { CustomAccordionItem } from "@/components/dashboard/Designacao/CustomAccordionItem";
import ResumoDesignacaoServidorIndicado from "@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado";


import { useParams, useRouter } from "next/navigation";
import ResumoPortariaDesigacao from "@/components/dashboard/Designacao/ResumoPortariaDesigacao";
import { History, Loader2 } from "lucide-react";
import EditorSEI, {
  gerarHtmlPortaria,
  EditorSEIHandle,
} from "@/components/dashboard/EditorTextoSEI/EditorTextoSEI";
import { preencherTemplate } from "@/utils/portarias/preencherTemplate";
import { montarTrechoUnidade } from "@/utils/portarias/gerarDadosPortaria";
import { TEMPLATE_CESSACAO } from "@/utils/portarias/templates";
import type { CessacaoByIdResponse } from "@/types/designacao";

import { useFetchCessacaoById } from "@/hooks/useVisualizarCessacao";
import ResumoPortariaCessacao from "@/components/dashboard/Designacao/ResumoPortariaCessacao";
import { formatarRF, nameToCamelCaseUe } from "@/utils/portarias/formatadores";
import { nameToCamelCase } from "@/utils/portarias/formatadores";
import { formatDate } from "@/utils/formatDate";

const CAMPOS_NEGRITO = ["nome_indicado", "autoridade", "portaria", "sei", "ano"] as const;

function escapeHtml(s: string) {
  return s.replaceAll("&", "&amp;").replaceAll("<​", "&lt;").replaceAll(">", "&gt;");
}

export default function VisualizarDesignacaoPage() {

  const params = useParams();
  const id = params.id;

  const editorSEIRef = useRef<EditorSEIHandle>(null);

  const { data: cessacao, isLoading: isLoadingDesignacao, error: errorDesignacao } = useFetchCessacaoById(
    Number(id),
  );
  const designacao = cessacao?.designacao;




  const htmlInicial = useMemo(() => {
    const gerarDados = (cessacao: CessacaoByIdResponse) => ({
      portaria: cessacao.numero_portaria,
      ano: cessacao.ano_vigente,
      sei: cessacao.sei_numero,
      dre: designacao?.dre_nome ?? "-",
      tipo_cessacao:
        cessacao.a_pedido ? "a pedido" : "de ofício",
      portaria_designacao: designacao?.numero_portaria ?? "-",
      doc_designacao: designacao?.doc ? formatDate(designacao.doc) : "-",
      sei_designacao: designacao?.sei_numero ?? "-",
      nome_indicado: designacao?.indicado_nome_servidor ?? "-",
      rf: formatarRF(designacao?.indicado_rf ?? "-"),
      vinculo: designacao?.indicado_vinculo ?? "-",
      cargo_base: (() => {
        const base = nameToCamelCase(designacao?.indicado_cargo_base ?? "-");
        const cat = designacao?.indicado_categoria;
        return cat ? `${base} - Categoria ${cat}` : base;
      })(),
      cargo: nameToCamelCase(designacao?.indicado_cargo_sobreposto ?? "-"),
      ue: nameToCamelCaseUe(designacao?.indicado_local_exercicio ?? "-"), // NAO TEM TIPO DA ESCOLA NO BANCO!! VER COMO ARRUMAR
      data_inicio: formatDate(cessacao.data_cessacao),
      trecho_unidade: montarTrechoUnidade(designacao?.indicado_lotacao ?? "", designacao?.unidade_proponente ?? "", designacao?.dre_nome ?? ""),
      trecho_afastamento: designacao?.com_afastamento && designacao?.motivo_afastamento
        ? `, ${designacao.motivo_afastamento}`
        : "",
    });

    if (!designacao || !cessacao) return "";

    const dadosPuros = gerarDados(cessacao);
    console.log(dadosPuros);
 

    const dadosEscapados: Record<string, string> = {};
    for (const [k, v] of Object.entries(dadosPuros)) {
      if (v === undefined || v === null) continue;
      dadosEscapados[k] = escapeHtml(String(v));
    }

    for (const campo of CAMPOS_NEGRITO) {
      const val = dadosEscapados[campo];
      if (val) dadosEscapados[campo] = `<strong>${val}</strong>`;
    }

    return gerarHtmlPortaria(preencherTemplate(TEMPLATE_CESSACAO, dadosEscapados));
  }, [designacao, cessacao]);


  const router = useRouter();

  console.log(cessacao);
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
                `/pages/historico-ato-administrativo?id=${id}&tipo=${cessacao?.tipo}&tipo_display=Cessação&ato_raiz_id=${cessacao?.ato_raiz_id}&numero_portaria=${cessacao?.numero_portaria}&servidor_indicado=${cessacao?.designacao?.indicado_nome_servidor}`)
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


              <CustomAccordionItem
                title="Portarias de designação"
                color="purple"
                value="portarias-designacao"
              >
                <ResumoPortariaDesigacao
                  isLoading={isLoadingDesignacao}
                  defaultValues={{
                    numero_portaria: designacao.numero_portaria,
                    ano_vigente: designacao.ano_vigente,
                    sei_numero: designacao.sei_numero,
                    doc: designacao.doc,
                    data_inicio: designacao.data_inicio,
                    data_fim: designacao.data_fim,
                    carater_excepcional: designacao.carater_excepcional,
                    impedimento_substituicao: designacao.impedimento_display,
                    motivo_afastamento: designacao.motivo_afastamento,
                    pendencias: designacao.pendencias,
                  }}
                />
              </CustomAccordionItem>

              <CustomAccordionItem
                title="Dados do servidor indicado"
                value="servidor-indicado"
                color="gold"
              >
                <ResumoDesignacaoServidorIndicado
                  isLoading={isLoadingDesignacao}
                  defaultValues={{
                    rf: designacao.indicado_rf,
                    nome_servidor: designacao.indicado_nome_servidor,
                    nome_civil: designacao.indicado_nome_civil,
                    vinculo: designacao.indicado_vinculo,
                    lotacao: designacao.indicado_lotacao,
                    cargo_base: designacao.indicado_cargo_base,
                    cargo_sobreposto_funcao_atividade: designacao.indicado_cargo_sobreposto,
                    cursos_titulos: '-',
                    codigo_hierarquia: '-',
                    lotacao_cargo_base: designacao.indicado_lotacao,
                    laudo_medico: '-',
                    local_de_servico: designacao.indicado_local_servico,
                    local_de_exercicio: designacao.indicado_local_exercicio,
                    cd_cargo_base: designacao.indicado_codigo_cargo_base ?? 0,
                    cd_cargo_sobreposto_funcao_atividade: designacao.indicado_codigo_cargo_sobreposto ?? 0,
                    categoria: designacao.indicado_categoria ?? "",
                  }}
                  showCursosTitulos={true}
                  showEditar={false}
                  showLotacao={true}
                  onSubmitEditarServidor={console.log}
                />
              </CustomAccordionItem>



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