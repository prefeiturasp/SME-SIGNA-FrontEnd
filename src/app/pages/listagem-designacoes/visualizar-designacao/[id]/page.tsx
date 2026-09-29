"use client";
import { useEffect, useMemo, useRef } from "react";
import { Card } from "antd";
import { Button } from "@/components/ui/button";

import { Accordion } from "@/components/ui/accordion";

import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import ResumoPesquisaDaUnidade from "@/components/dashboard/Designacao/ResumoPesquisaDaUnidade";
import { CustomAccordionItem } from "@/components/dashboard/Designacao/CustomAccordionItem";
import ResumoDesignacaoServidorIndicado from "@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado";
import ResumoPortariaEServidorIndicado from "@/components/dashboard/Designacao/ResumoPortariaEServidorIndicado";


import { useParams, useRouter } from "next/navigation";
import { useFetchDesignacoesById } from "@/hooks/useVisualizarDesignacoes";
import { History, Loader2 } from "lucide-react";
import { InfoItem } from "@/components/ui/info-item";
import EditorSEI, {
  gerarHtmlPortaria,
  EditorSEIHandle,
} from "@/components/dashboard/EditorTextoSEI/EditorTextoSEI";
import { FormProvider, useForm } from "react-hook-form";
import { formSchemaDesignacaoPasso3Data } from "@/app/pages/designacoes/designacoes-passo-3/schema";

import InformacoesAdicionais from "@/components/dashboard/Designacao/InformacoesAdicionais/InformacoesAdicionais";

export default function VisualizarDesignacaoPage() {

  const params = useParams();
  const id = params.id;

  const editorSEIRef = useRef<EditorSEIHandle>(null);

  const { data: designacao, isLoading: isLoadingDesignacao, error: errorDesignacao } = useFetchDesignacoesById(
    Number(id),
  );

  const htmlInicial = useMemo(() => {
    if (!designacao?.texto_sei) return "";

    return gerarHtmlPortaria(designacao.texto_sei);
  }, [designacao]);



  const form = useForm<formSchemaDesignacaoPasso3Data>({
    defaultValues: {
      informacoes_adicionais: designacao?.informacoes_adicionais ?? "",
      detalhe_para_quadro_de_historico_por_ano: designacao?.detalhe_para_quadro_de_historico_por_ano ?? true,
    },
    mode: "onChange",
  });

  useEffect(() => {
    form.setValue("informacoes_adicionais", designacao?.informacoes_adicionais ?? "");
    form.setValue("detalhe_para_quadro_de_historico_por_ano", designacao?.detalhe_para_quadro_de_historico_por_ano ?? true);
  }, [designacao, form]);

  const router = useRouter();

  return (
    <>
      <PageHeader
        title="Detalhes da designação"
        breadcrumbs={[{ title: "Início", href: "/" },
        { title: "Detalhes da designação" }]}
        showBackButton={true}
        createButton={
          <Button
            className="gap-2 px-4"
            type="button"
            variant="destructive"
            size="lg"
            onClick={() =>
              router.push(`/pages/historico-ato-administrativo?id=${id}&tipo_display=da designação&numero_portaria=${designacao?.numero_portaria}&servidor_indicado=${designacao?.indicado_nome_servidor}`)
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
            <span className="text-[#333]">Designação</span>
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
              defaultValue={["unidade-proponente", "portarias-designacao", "servidor-indicado", "servidor-titular"]}
            >
              <CustomAccordionItem
                title="Unidade Proponente"
                color="blue"
                value="unidade-proponente"
              >
                <ResumoPesquisaDaUnidade
                  defaultValues={{
                    lotacao: designacao?.unidade_proponente ?? "",
                    dre: designacao?.dre_nome ?? "",
                    estrutura_hierarquica: designacao?.codigo_hierarquico ?? "",
                  }}
                  isLoading={isLoadingDesignacao}
                />
              </CustomAccordionItem>

              <ResumoPortariaEServidorIndicado
                designacao={designacao}
                isLoadingDesignacao={isLoadingDesignacao}
              />



              {designacao.tipo_vaga === "VAGO" ? (
                <CustomAccordionItem
                  title="Cargo Disponível"
                  value="servidor-titular"
                  color="green"
                >
                  <InfoItem
                    label="Nome do Cargo Disponível"
                    value={designacao.cargo_vaga_display}
                  />
                </CustomAccordionItem>
              ) : (
                <CustomAccordionItem
                  title="Dados do Servidor Titular"
                  value="servidor-titular"
                  color="green"
                >
                  <ResumoDesignacaoServidorIndicado
                    defaultValues={{
                      rf: designacao.titular_rf,
                      nome_servidor: designacao.titular_nome_servidor,
                      nome_civil: designacao.titular_nome_civil,
                      vinculo: designacao.titular_vinculo,
                      lotacao: designacao.titular_lotacao,
                      cargo_base: designacao.titular_cargo_base,
                      cargo_sobreposto_funcao_atividade: designacao.titular_cargo_sobreposto,
                      cursos_titulos: '-',
                      codigo_hierarquia: '-',
                      lotacao_cargo_base: '-',
                      laudo_medico: '-',
                      local_de_servico: designacao.titular_local_servico,
                      local_de_exercicio: designacao.titular_local_exercicio,
                      cd_cargo_base: designacao.titular_codigo_cargo_base ?? 0,
                      cd_cargo_sobreposto_funcao_atividade: designacao.titular_codigo_cargo_sobreposto ?? 0,
                    }}
                    showEditar={false}
                    onSubmitEditarServidor={console.log}
                  />
                </CustomAccordionItem>
              )}
            </Accordion>
          )
        )}
        <EditorSEI
          ref={editorSEIRef}
          html={htmlInicial}
          titulo="PORTARIA"
          mostrarBotao={false}
        />

        <div className="mt-8">
          <div>
            <span className="text-[#333] text-[16px] font-bold ">Informações adicionais</span>
          </div>
          <FormProvider {...form}>
            <form >
              <InformacoesAdicionais
                disableFields={true}
                form={form}
                onChangeDescricao={console.log}
                onValueChangeDetalheParaQuadroDeHistoricoPorAno={console.log}
              />
            </form>
          </FormProvider>
        </div>

      </Card>
    </>
  );
}