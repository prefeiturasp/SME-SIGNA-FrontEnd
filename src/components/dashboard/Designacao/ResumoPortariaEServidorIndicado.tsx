"use client";

import { CustomAccordionItem } from "@/components/dashboard/Designacao/CustomAccordionItem";
import ResumoDesignacaoServidorIndicado from "@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado";
import ResumoPortariaDesigacao from "@/components/dashboard/Designacao/ResumoPortariaDesigacao";
import type { DesignacaoResponse } from "@/types/designacao";

interface ResumoPortariaEServidorIndicadoProps {
  designacao: DesignacaoResponse;
  isLoadingDesignacao: boolean;
}

export default function ResumoPortariaEServidorIndicado({
  designacao,
  isLoadingDesignacao,
}: Readonly<ResumoPortariaEServidorIndicadoProps>) {
  return (
    <>
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
            cursos_titulos: "-",
            codigo_hierarquia: "-",
            lotacao_cargo_base: designacao.indicado_lotacao,
            laudo_medico: "-",
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
    </>
  );
}
