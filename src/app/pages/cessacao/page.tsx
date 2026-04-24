"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, message } from "antd";
import { Loader2 } from "lucide-react";
import { useSalvarCessacao } from "@/hooks/useSalvarCessacao";

import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { CustomAccordionItem } from "@/components/dashboard/Designacao/CustomAccordionItem";

import PortariaCessacaoFields from "@/components/dashboard/Cessacao/PortariaCessacaoFields/PortariaCessacaoFields";

import ResumoDesignacaoServidorIndicado from "@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado";
import ResumoPortariaDesigacao from "@/components/dashboard/Designacao/ResumoPortariaDesigacao";
import ResumoTitular from "@/components/dashboard/Designacao/ResumoTitular";

import formSchemaCessacao, {
  formSchemaCessacaoData,
} from "./schema";

import { useSearchParams, useRouter } from "next/navigation";
import { useFetchDesignacoesById } from "@/hooks/useVisualizarDesignacoes";
import { Servidor } from "@/types/designacao-unidade";
import Designacao from "@/assets/icons/Designacao";

import EditorSEI, { gerarHtmlPortaria } from "@/components/dashboard/EditorTextoSEI/EditorTextoSEI";
import { TEMPLATE_CESSACAO } from "@/utils/portarias/templates";
import { nameToCamelCase, nameToCamelCaseUe, formatarRF } from "@/utils/portarias/formatadores";

export default function CessacaoPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const salvarCessacao = useSalvarCessacao();
  const router = useRouter();


  const { data: designacao, isLoading } =
    useFetchDesignacoesById(Number(id));

  const form = useForm<formSchemaCessacaoData>({
    resolver: zodResolver(formSchemaCessacao),
    defaultValues: {
      cessacao: {
        numero_portaria: "",
        ano: new Date().getFullYear().toString(),
        numero_sei: "",
        a_pedido: "nao",
        data_inicio: new Date(),
        remocao: "nao",
        aposentadoria: "nao",
        doc: "",
      },
    },
  });

  const dadosTitular: Servidor | null = useMemo(() => {
    if (!designacao) return null;

    const hasTitular =
      designacao.titular_nome_servidor?.trim() &&
      designacao.titular_rf?.trim();

    if (!hasTitular) return null;

    return {
      rf: designacao.titular_rf,
      nome_servidor: designacao.titular_nome_servidor,
      nome_civil: designacao.titular_nome_civil,
      vinculo: designacao.titular_vinculo,
      lotacao: designacao.titular_lotacao,
      cargo_base: designacao.titular_cargo_base,
      cd_cargo_base: designacao.titular_codigo_cargo_base,
      cd_cargo_sobreposto_funcao_atividade:
        designacao.titular_codigo_cargo_sobreposto ?? 0,
      cargo_sobreposto_funcao_atividade:
        designacao.titular_cargo_sobreposto,
      cursos_titulos: "-",
      laudo_medico: "-",
      local_de_servico: designacao.titular_local_servico,
      local_de_exercicio: designacao.titular_local_exercicio,
    };
  }, [designacao]);


  const dadosPortaria = useMemo(() => {
    if (!designacao) return null;

    return {
      numero_portaria: designacao.numero_portaria,
      ano_vigente: designacao.ano_vigente,
      sei_numero: designacao.sei_numero,
      doc: designacao.doc,
      data_inicio: designacao.data_inicio,
      data_fim: designacao.data_fim,
      carater_excepcional: designacao.carater_excepcional,
      impedimento_substituicao: designacao.impedimento_substituicao,
      motivo_afastamento: designacao.motivo_afastamento,
      pendencias: designacao.pendencias,
    };
  }, [designacao]);

  const dadosIndicado: Servidor | null = useMemo(() => {
    if (!designacao) return null;

    return {
      rf: designacao.indicado_rf,
      nome_servidor: designacao.indicado_nome_servidor,
      nome_civil: designacao.indicado_nome_civil,
      vinculo: designacao.indicado_vinculo,
      cargo_base: designacao.indicado_cargo_base,
      lotacao: designacao.indicado_lotacao,
      cargo_sobreposto_funcao_atividade:
        designacao.indicado_cargo_sobreposto,
      local_de_exercicio: designacao.indicado_local_exercicio,
      local_de_servico: designacao.indicado_local_servico,
    } as Servidor;
  }, [designacao]);

  useEffect(() => {
    if (!designacao) return;

    form.reset({
      cessacao: {
        numero_portaria: "",
        numero_sei: "",
        ano: new Date().getFullYear().toString(),
        doc: "",
        data_inicio: new Date(),
        a_pedido: "nao",
        remocao: "nao",
        aposentadoria: "nao",
      },
    });
  }, [designacao, form]);

  const [mostrarEditor, setMostrarEditor] = useState(false);
  const [htmlPortaria, setHtmlPortaria] = useState("");

  const gerarDados = (values: formSchemaCessacaoData) => ({
    portaria: values.cessacao.numero_portaria,
    ano: values.cessacao.ano,
    sei: values.cessacao.numero_sei,
    dre: designacao?.dre_nome ?? "-",
    tipo_cessacao:
      values.cessacao.a_pedido === "sim" ? "a pedido" : "de ofício",
    portaria_designacao: designacao?.numero_portaria ?? "-",
    doc_designacao: designacao?.doc ?? "-",
    sei_designacao: designacao?.sei_numero ?? "-",
    nome_indicado: designacao?.indicado_nome_servidor ?? "-",
    rf: formatarRF(designacao?.indicado_rf ?? "-"),
    vinculo: designacao?.indicado_vinculo ?? "-",
    cargo_base: nameToCamelCase(designacao?.indicado_cargo_base ?? "-"),
    cargo: nameToCamelCase(designacao?.indicado_cargo_sobreposto ?? "-"),
    ue: nameToCamelCaseUe(designacao?.indicado_local_exercicio ?? "-"), // NAO TEM TIPO DA ESCOLA NO BANCO!! VER COMO ARRUMAR
    data_inicio:
      values.cessacao.data_inicio?.toLocaleDateString("pt-BR"),
  });

  const handleGerarPortaria = () => {
    const values = form.getValues();
    console.log('values', values);
    const dados = gerarDados(values);

    let texto = TEMPLATE_CESSACAO;

    Object.entries(dados).forEach(([key, value]) => {
      let val = String(value ?? "");

      if (["nome_indicado"].includes(key)) {
        val = `<strong>${val}</strong>`;
      }

      texto = texto.replaceAll(`{{${key}}}`, val);
    });

    setHtmlPortaria(gerarHtmlPortaria(texto));
    setMostrarEditor(true);
  };

  const onSubmit = async (values: formSchemaCessacaoData) => {
    try {
      await salvarCessacao.mutateAsync({
        values,
        designacaoId: Number(id),
        id: null,
      });

      message.success("Cessação salva com sucesso!");

      router.push("/pages/listagem-designacoes");

    } catch (error: unknown) {
      console.error("Erro ao salvar cessação:", error);
      message.error("Erro ao salvar");
    }
  };

  const title = (
    <span>
      Cessação - Servidor:{" "}
      <span className="text-[#B22B2A] font-semibold">
        {designacao?.indicado_nome_servidor ?? "-"}
      </span>
    </span>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#B22B2A]" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={title}
        breadcrumbs={[{ title: "Início", href: "/" }, { title: "Cessação" }]}
        icon={<Designacao width={24} height={24} fill="#B22B2A" />}
        showBackButton={false}
      />

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>          <Card className="mt-4">
          <Accordion type="multiple">
            <CustomAccordionItem title="Portaria de designação" value="1" color="purple">
              {dadosPortaria && (
                <ResumoPortariaDesigacao defaultValues={dadosPortaria} />
              )}
            </CustomAccordionItem>

            <CustomAccordionItem title="Servidor indicado" value="2" color="gold">
              {dadosIndicado && (
                <ResumoDesignacaoServidorIndicado defaultValues={dadosIndicado} onSubmitEditarServidor={() => { }} />
              )}
            </CustomAccordionItem>

            <CustomAccordionItem title="Servidor titular" value="3" color="blue">
              {dadosTitular ? (
                <ResumoTitular data={dadosTitular} onSubmitEditarServidor={() => { }} />
              ) : (
                <div className="text-center text-[#777] p-4">
                  Não há servidor titular
                </div>
              )}
            </CustomAccordionItem>

            <CustomAccordionItem title="Portaria de cessação" value="4" color="silver">
              <PortariaCessacaoFields />
              <div className="w-full flex justify-end pt-[2rem]">
                <div className="w-[200px]">
                  <Button
                    type="button"
                    size="lg"
                    className="w-full flex items-center justify-center gap-6"
                    variant="destructive"
                    onClick={async () => {
                      const isValid = await form.trigger("cessacao");

                      if (!isValid) return;

                      handleGerarPortaria();
                    }}>
                    Trechos para o SEI
                  </Button>
                </div>
              </div>
            </CustomAccordionItem>
          </Accordion>

          {mostrarEditor && (
            <EditorSEI
              html={htmlPortaria}
              titulo="PORTARIA"
              labelBotao="Salvar"
              tipoBotao="submit"
              testId="botao-proximo"
            />
          )}

        </Card>
        </form>
      </FormProvider>
    </>
  );
}