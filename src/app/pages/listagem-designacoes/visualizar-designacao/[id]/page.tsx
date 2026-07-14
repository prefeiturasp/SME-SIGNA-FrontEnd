"use client";
import { useEffect, useMemo, useRef } from "react";
import { Card } from "antd";
import { Button } from "@/components/ui/button";

import { Accordion } from "@/components/ui/accordion";

import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import ResumoPesquisaDaUnidade from "@/components/dashboard/Designacao/ResumoPesquisaDaUnidade";
import { CustomAccordionItem } from "@/components/dashboard/Designacao/CustomAccordionItem";
import ResumoDesignacaoServidorIndicado from "@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado";


import { useParams, useRouter } from "next/navigation";
import ResumoPortariaDesigacao from "@/components/dashboard/Designacao/ResumoPortariaDesigacao";
import { useFetchDesignacoesById } from "@/hooks/useVisualizarDesignacoes";
import { ArrowLeft, History, Loader2, X } from "lucide-react";
import { InfoItem } from "@/components/ui/info-item";
import EditorSEI, {
  gerarHtmlPortaria,
  EditorSEIHandle,
} from "@/components/dashboard/EditorTextoSEI/EditorTextoSEI";
import { preencherTemplate } from "@/utils/portarias/preencherTemplate";
import { gerarDadosPortaria } from "@/utils/portarias/gerarDadosPortaria";
import { TEMPLATE_DESIGNACAO } from "@/utils/portarias/templates";
import type { DesignacaoData } from "@/types/designacao";
import { useForm } from "react-hook-form";
import { formSchemaDesignacaoPasso3Data } from "@/app/pages/designacoes/designacoes-passo-3/schema";

import InformacoesAdicionais from "@/components/dashboard/Designacao/InformacoesAdicionais/InformacoesAdicionais";

const CAMPOS_NEGRITO = ["nome_indicado", "autoridade", "portaria", "sei"] as const;

function escapeHtml(s: string) {
  return s.replaceAll("&", "&amp;").replaceAll("<​", "&lt;").replaceAll(">", "&gt;");
}

export default function VisualizarDesignacaoPage  () {

  const params = useParams();
  const id = params.id;

  const editorSEIRef = useRef<EditorSEIHandle>(null);

  const { data: designacao, isLoading: isLoadingDesignacao, error: errorDesignacao } = useFetchDesignacoesById(
    Number(id),
  );

  const htmlInicial = useMemo(() => {
    if (!designacao) return "";

    const dadosMapeados: DesignacaoData = {
      portaria_designacao: designacao.numero_portaria,
      ano: designacao.ano_vigente,
      numero_sei: designacao.sei_numero,
      doc: designacao.doc,
      dre_nome: designacao.dre_nome,
      codigo_hierarquico: designacao.codigo_hierarquico,
      a_partir_de: designacao.data_inicio,
      designacao_data_final: designacao.data_fim ?? undefined,
      impedimento_substituicao: designacao.impedimento_substituicao === null
        ? undefined
        : String(designacao.impedimento_substituicao),
      impedimento_label: designacao.impedimento_substituicao !== null ? designacao.impedimento_display : undefined,
      com_afastamento: designacao.com_afastamento,
      motivo_afastamento: designacao.motivo_afastamento,
      tipo_cargo: designacao.tipo_vaga === "VAGO" ? "vago" : "substituicao",
      ue_nome: designacao.unidade_proponente,
      cargo_vago_selecionado: designacao.cargo_vaga_display,
      servidorIndicado: {
        nome_servidor: designacao.indicado_nome_servidor,
        nome_civil: designacao.indicado_nome_civil,
        rf: designacao.indicado_rf,
        vinculo: designacao.indicado_vinculo,
        cargo_base: designacao.indicado_cargo_base,
        lotacao: designacao.indicado_lotacao,
        categoria: designacao.indicado_categoria ?? undefined,
      },
      dadosTitular: designacao.titular_rf
        ? {
          nome_servidor: designacao.titular_nome_servidor,
          nome_civil: designacao.titular_nome_civil,
          rf: designacao.titular_rf,
          vinculo: designacao.titular_vinculo,
          cargo_base: designacao.titular_cargo_base,
        }
        : null,
    };

    const dadosPuros = gerarDadosPortaria(dadosMapeados);

    const dadosEscapados: Record<string, string> = {};
    for (const [k, v] of Object.entries(dadosPuros)) {
      if (v === undefined || v === null) continue;
      dadosEscapados[k] = escapeHtml(String(v));
    }

    for (const campo of CAMPOS_NEGRITO) {
      const val = dadosEscapados[campo];
      if (val) dadosEscapados[campo] = `<strong>${val}</strong>`;
    }

    return gerarHtmlPortaria(preencherTemplate(TEMPLATE_DESIGNACAO, dadosEscapados));
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
        showBackButton={false}
        createButton={
          <div className="flex gap-2">

            <Button
              type="button"
              variant="default"
              className="gap-2"
              data-testid="btn-voltar"
              onClick={() =>
                router.push("/pages/atos-administrativos")
              }
            >              
              <span className="font-bold">Voltar</span>
              <ArrowLeft />
            </Button>

            <Button
              className="gap-2 px-4"
              type="button"
              variant="destructive"
              size="lg"
              onClick={() =>
                router.push("/pages/historico-ato-administrativo")
              }
            >
              <span className="font-bold">Consultar histórico</span>
              <History width={15} height={15} />
            </Button>
          </div>
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

        <InformacoesAdicionais
          disableFields={true}
          form={form}
          onChangeDescricao={console.log}
          onValueChangeDetalheParaQuadroDeHistoricoPorAno={console.log}
        />

      </Card>
    </>
  );
}