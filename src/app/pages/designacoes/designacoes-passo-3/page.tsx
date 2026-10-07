"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Alert, Card } from "antd";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import StepperDesignacao from "@/components/dashboard/Designacao/StepperDesignacao";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import BotoesDeNavegacao from "@/components/dashboard/Designacao/BotoesDeNavegacao";
import Designacao from "@/assets/icons/Designacao";
import { useDesignacaoContext } from "../DesignacaoContext";
import { montarDadosTextoSeiDesignacao } from "@/utils/designacao/montarDadosTextoSei";
import { mapTipoVagaParaTipoCargo } from "@/utils/portarias/tipoCargo";
import { gerarPreviewTextoSeiAction } from "@/actions/textos-sei";
import { designacaoAction } from "@/actions/cadastro-designacao";
import EditorSEI, {
  gerarHtmlPortaria,
} from "@/components/dashboard/EditorTextoSEI/EditorTextoSEI";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import formSchemaDesignacaoPasso3, { formSchemaDesignacaoPasso3Data } from "./schema";
import InformacoesAdicionais from "@/components/dashboard/Designacao/InformacoesAdicionais/InformacoesAdicionais";
import { useAppNotification } from "@/components/providers/NotificationProvider";
import { useFetchCargos } from "@/hooks/useCargos";
import { getCargoVaga } from "@/utils/designacao/mapearPayload";
import {
  avaliarSubstituicaoDiretor,
  ErrosBackendSubstituicaoDiretor,
  MENSAGEM_ASSISTENTE_DIRETOR,
} from "@/utils/designacao/substituicaoDiretor";

class ErroSubstituicaoDiretor extends Error {
  constructor(
    message: string,
    readonly erros: ErrosBackendSubstituicaoDiretor
  ) {
    super(message);
  }
}

export default function DesignacoesPasso3() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const rf = searchParams.get("rf");
  const { formDesignacaoData, clearFormDesignacaoData, setFormDesignacaoData } = useDesignacaoContext();
  const notification = useAppNotification();

  const [salvando, setSalvando] = useState(false);
  const [errosSubstituicaoDiretor, setErrosSubstituicaoDiretor] =
    useState<ErrosBackendSubstituicaoDiretor | null>(null);

  // Mesmas regras do passo 2: protege contra dados antigos do localStorage.
  const { data: cargosData = [] } = useFetchCargos();
  const substituicaoDiretor = useMemo(
    () =>
      avaliarSubstituicaoDiretor({
        cargoVaga: formDesignacaoData ? getCargoVaga(formDesignacaoData, cargosData) : undefined,
        dataInicio: formDesignacaoData?.a_partir_de,
        dataFim: formDesignacaoData?.designacao_data_final,
        indicado: formDesignacaoData?.servidorIndicado,
        codigoUe: formDesignacaoData?.ue,
      }),
    [formDesignacaoData, cargosData]
  );

  const form = useForm<formSchemaDesignacaoPasso3Data>({
    resolver: zodResolver(formSchemaDesignacaoPasso3),
    defaultValues: {
      informacoes_adicionais: formDesignacaoData?.informacoes_adicionais ?? "",
      detalhe_para_quadro_de_historico_por_ano: formDesignacaoData?.detalhe_para_quadro_de_historico_por_ano ?? true,
    },
    mode: "onChange",
  });

  // Gera a prévia do texto SEI uma única vez, quando os dados do formulário
  // ficam disponíveis.
  const previewSolicitadoRef = useRef(false);
  const [textoSei, setTextoSei] = useState("");
  const [modeloPortariaId, setModeloPortariaId] = useState<number | null>(null);
  const [carregandoPreview, setCarregandoPreview] = useState(true);
  const [erroPreview, setErroPreview] = useState<string | null>(null);

  const voltarParaPasso2 = useCallback(() => {
    const url = id
      ? `/pages/designacoes/designacoes-passo-2?id=${id}&rf=${rf}`
      : `/pages/designacoes/designacoes-passo-2?rf=${rf}`;
    router.push(url);
  }, [id, rf, router]);

  useEffect(() => {
    if (!formDesignacaoData || previewSolicitadoRef.current) return;
    previewSolicitadoRef.current = true;

    const buscarPreview = async () => {
      setCarregandoPreview(true);
      setErroPreview(null);

      const dados = montarDadosTextoSeiDesignacao(formDesignacaoData);
      const result = await gerarPreviewTextoSeiAction({
        tipo_portaria: "DESIGNACAO",
        tipo_cargo: mapTipoVagaParaTipoCargo(formDesignacaoData.tipo_cargo),
        dados,
      });

      if (result.success) {
        setTextoSei(result.data.texto);
        setModeloPortariaId(result.data.modelo_portaria_id);
        setCarregandoPreview(false);
      } else {
        setErroPreview(result.error);
        notification.error({
          title: "Não existe modelo de portaria criado",
          description: "Certifique-se de criar um modelo de portaria para designação antes de prosseguir.",
        });
        voltarParaPasso2();
      }
    };

    buscarPreview();
  }, [formDesignacaoData, notification, voltarParaPasso2]);

  const htmlTexto = useMemo(() => {
    if (!textoSei) return "";
    return gerarHtmlPortaria(textoSei);
  }, [textoSei]);

  const salvarPortaria = async (id: string | null) => {
    if (!formDesignacaoData) throw new Error("Dados do formulário não encontrados.");

    const payloadData = {
      ...formDesignacaoData,
      texto_sei: textoSei,
      modelo_portaria: modeloPortariaId,
    };

    const result = await designacaoAction(payloadData, id);
    if (!result.success) {
      if (result.errosSubstituicaoDiretor) {
        throw new ErroSubstituicaoDiretor(result.error, result.errosSubstituicaoDiretor);
      }
      throw new Error(result.error);
    }

    return result.data;
  };

  const handleSalvar = async (id: string | null) => {
    try {
      setSalvando(true);
      setErrosSubstituicaoDiretor(null);
      await salvarPortaria(id);
      notification.success({ title: "Portaria salva com sucesso!" });
      clearFormDesignacaoData();
      router.push("/pages/atos-administrativos");
    } catch (error) {
      if (error instanceof ErroSubstituicaoDiretor) {
        setErrosSubstituicaoDiretor(error.erros);
        return;
      }
      console.error("Erro ao salvar portaria:", error);
      const msg = error instanceof Error ? error.message : "Erro ao salvar a portaria!";
      notification.error({ title: `Erro ao salvar portaria: ${msg}` });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <PageHeader
        title={id ? "Editar Designação" : "Designação"}
        breadcrumbs={[
          { title: "Início", href: "/" },
          { title: "Atos Administrativos", href: "/pages/atos-administrativos" },
          { title: "Designação" }
        ]}
        icon={<Designacao width={24} height={24} color="#660C0B" />}
        showBackButton={false}
      />

      <FundoBranco>
        <StepperDesignacao current={2} />
      </FundoBranco>

      <Card
        title={<span className="text-[#333]">Designação</span>}
        className="mt-4 m-0"
      >
        <div className="card-designacao mb-2">
          {carregandoPreview ? (
            <div className="flex justify-center items-center h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-[#B22B2A]" />
            </div>
          ) : (
            <EditorSEI
              html={htmlTexto}
              titulo="PORTARIA"
              mostrarBotao={false}
            />
          )}
        </div>
      </Card>

      <Card
        title={<span className="text-[#333]">Informações adicionais</span>}
        className="mt-4 m-0"
      >
        <div className="card-designacao">

          <FormProvider {...form}>
            <form >
              <InformacoesAdicionais
                form={form}
                onChangeDescricao={
                  (value) => {
                    setFormDesignacaoData({
                      ...formDesignacaoData,
                      informacoes_adicionais: value,
                    });
                  }}
                onValueChangeDetalheParaQuadroDeHistoricoPorAno={(value) => {
                  const booleanValue = value === "true";
                  setFormDesignacaoData({
                    ...formDesignacaoData,
                    detalhe_para_quadro_de_historico_por_ano: booleanValue,
                  });
                }}
                disableFields={false}
              />
            </form>
          </FormProvider>
        </div>
      </Card>



      {substituicaoDiretor.assistenteDiretor && !errosSubstituicaoDiretor && (
        <Alert
          type="error"
          showIcon
          className="mt-4"
          data-testid="erro-assistente-diretor-indicado"
          title="Dados do servidor indicado"
          description={MENSAGEM_ASSISTENTE_DIRETOR}
        />
      )}

      {errosSubstituicaoDiretor && (
        <div className="flex flex-col gap-2 mt-4" data-testid="erros-substituicao-diretor">
          {errosSubstituicaoDiretor.eleicao && (
            <Alert
              type="warning"
              showIcon
              title="Necessária eleição para o cargo de Diretor"
              description={errosSubstituicaoDiretor.eleicao}
            />
          )}
          {errosSubstituicaoDiretor.dataFim && (
            <Alert
              type="error"
              showIcon
              title="Período da designação (Até)"
              description={errosSubstituicaoDiretor.dataFim}
            />
          )}
          {errosSubstituicaoDiretor.indicado && (
            <Alert
              type="error"
              showIcon
              title="Dados do servidor indicado"
              description={errosSubstituicaoDiretor.indicado}
            />
          )}
        </div>
      )}

      <div className="w-full flex flex-col mt-6">
        <BotoesDeNavegacao
          disableAnterior={false}
          disableProximo={
            salvando || carregandoPreview || !!erroPreview || substituicaoDiretor.bloqueado
          }
          labelProximo="Salvar"
          showAnterior
          onAnterior={voltarParaPasso2}
          onProximo={() => handleSalvar(id)}
        />
      </div>
    </>
  );
}
