"use client";
import { Card } from "antd";

import { Accordion } from "@/components/ui/accordion";

import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import ResumoPesquisaDaUnidade from "@/components/dashboard/Designacao/ResumoPesquisaDaUnidade";
import { CustomAccordionItem } from "@/components/dashboard/Designacao/CustomAccordionItem";
import ResumoDesignacaoServidorIndicado from "@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado";

import Designacao from "@/assets/icons/Designacao";

import { useParams } from "next/navigation";
import ResumoPortariaDesigacao from "@/components/dashboard/Designacao/ResumoPortariaDesigacao";
import { useFetchDesignacoesById } from "@/hooks/useVisualizarDesignacoes";
import { Loader2 } from "lucide-react";
import { InfoItem } from "@/components/ui/info-item";

export default function VisualizarDesignacao() {

  const params = useParams();
  const id = params.id;


  const { data: designacao, isLoading: isLoadingDesignacao, error: errorDesignacao } = useFetchDesignacoesById(
    Number(id),
  );
 
  return (
    <>
      <PageHeader
        title="Visualizar Designação"
        breadcrumbs={[{ title: "Início", href: "/" }, { title: "Listagem de Designações", href: "/pages/listagem-designacoes" },
          { title: "Visualizar Designação" }]}
        icon={<Designacao width={24} height={24} fill="#B22B2A" />}
        showBackButton={false}
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
                    estrutura_hierarquica:
                      designacao?.codigo_hierarquico ?? "",
                  }}
                  isLoading={isLoadingDesignacao} />
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
                    pendencias: designacao.pendencias
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
                  defaultValues=
                  {
                    {
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
                      cd_cargo_sobreposto_funcao_atividade:
                        designacao.indicado_codigo_cargo_sobreposto ?? 0,
                    }
                  }
                  showCursosTitulos={true}
                  showEditar={false}
                  showLotacao={true}
                  onSubmitEditarServidor={console.log}
                />
              </CustomAccordionItem>

              {designacao.tipo_vaga === "VAGO" ?
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
                :
                <CustomAccordionItem
                  title="Dados do Servidor Titular"
                  value="servidor-titular"
                  color="green"
                >
                  <ResumoDesignacaoServidorIndicado
                    defaultValues={
                      {
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
                        cd_cargo_sobreposto_funcao_atividade:
                        designacao.titular_codigo_cargo_sobreposto ?? 0,
                      }
                    }
                    showEditar={false}
                    onSubmitEditarServidor={console.log}
                  />
                </CustomAccordionItem>
              }
            </Accordion>
          )
        )}

      </Card>
    </>
  );
}