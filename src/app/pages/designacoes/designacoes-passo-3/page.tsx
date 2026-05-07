"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Card, message, Modal, Result } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import StepperDesignacao from "@/components/dashboard/Designacao/StepperDesignacao";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import BotoesDeNavegacao from "@/components/dashboard/Designacao/BotoesDeNavegacao";
import Designacao from "@/assets/icons/Designacao";
import { useDesignacaoContext } from "../DesignacaoContext";
import { preencherTemplate } from "@/utils/portarias/preencherTemplate";
import { gerarDadosPortaria } from "@/utils/portarias/gerarDadosPortaria";
import { designacaoAction } from "@/actions/cadastro-designacao";
import { TEMPLATE_DESIGNACAO } from "@/utils/portarias/templates";
import EditorSEI, {
  gerarHtmlPortaria,
  normalizarQuebras,
  EditorSEIHandle,
} from "@/components/dashboard/EditorTextoSEI/EditorTextoSEI";
import { FormField, FormLabel } from "@/components/ui/form";
import { FormControl, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import formSchemaDesignacaoPasso3, { formSchemaDesignacaoPasso3Data } from "./schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const CAMPOS_NEGRITO = ["nome_indicado", "autoridade", "portaria", "sei"] as const;

function escapeHtml(s: string) {
  return s.replaceAll("&", "&amp;").replaceAll("<​", "&lt;").replaceAll(">", "&gt;");
}

export default function DesignacoesPasso3() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { formDesignacaoData, clearFormDesignacaoData, setFormDesignacaoData } = useDesignacaoContext();

  const editorSEIRef = useRef<EditorSEIHandle>(null);
  const textoPlanoRef = useRef<string>("");

  const [salvando, setSalvando] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalErro, setModalErro] = useState(false);

  const form = useForm<formSchemaDesignacaoPasso3Data>({
    resolver: zodResolver(formSchemaDesignacaoPasso3),
    defaultValues: {
      informacoes_adicionais: "",
      detalhe_para_quadro_de_historico_por_ano: true,
    },
    mode: "onChange",
  });


  // Mantém textoPlanoRef sincronizado (usado caso precise do texto puro)
  useEffect(() => {
    if (!formDesignacaoData) return;

    const dadosPuros = gerarDadosPortaria({
      ...formDesignacaoData,
      designacao_data_final: formDesignacaoData.designacao_data_final ?? undefined,
      impedimento_substituicao: formDesignacaoData.impedimento_substituicao ?? undefined,
    });

    const textoRaw = preencherTemplate(TEMPLATE_DESIGNACAO, dadosPuros);
    textoPlanoRef.current = normalizarQuebras(textoRaw.replaceAll(/<\/?strong>/g, ""));
  }, [formDesignacaoData]);

  const htmlInicial = useMemo(() => {
    if (!formDesignacaoData) return "";

    const dadosPuros = gerarDadosPortaria({
      ...formDesignacaoData,
      designacao_data_final: formDesignacaoData.designacao_data_final ?? undefined,
      impedimento_substituicao: formDesignacaoData.impedimento_substituicao ?? undefined,
    });

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
  }, [formDesignacaoData]);

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    textoPlanoRef.current = e.currentTarget.innerText;
  }, []);

  const salvarPortaria = async (id: string | null) => {
    if (!formDesignacaoData) throw new Error("Dados do formulário não encontrados.");

    const result = await designacaoAction(formDesignacaoData, id);
    if (!result.success) throw new Error(result.error);

    return result.data;
  };

  const handleSalvar = async (id: string | null) => {
    try {
      setSalvando(true);
      message.loading({ content: "Salvando portaria...", duration: 0 });
      await salvarPortaria(id);
      message.destroy();
      setModalSucesso(true);
      setSalvando(false);
      clearFormDesignacaoData();
      setTimeout(() => router.push("/pages/listagem-designacoes"), 2200);
    } catch (error) {
      console.error("Erro ao salvar portaria:", error);
      message.destroy();
      setModalErro(true);
      setSalvando(false);
    }
  };

  return (
    <>
      <PageHeader
        title={id ? "Editar Designação" : "Designação"}
        breadcrumbs={[
          { title: "Início", href: "/" },
          { title: "Listagem de Designações", href: "/pages/listagem-designacoes" },
          { title: "Designação" }
        ]}
        icon={<Designacao width={24} height={24} fill="#B22B2A" />}
        showBackButton={false}
      />

      <FundoBranco>
        <StepperDesignacao current={2} />
      </FundoBranco>

      <Card
        title={<span className="text-[#333]">Designação</span>}
        className="mt-4 m-0"
      >
        <EditorSEI
          ref={editorSEIRef}
          html={htmlInicial}
          titulo="PORTARIA"
          onInput={handleInput}
          mostrarBotao={false}
        />
      </Card>

      <Card
        title={<span className="text-[#333]">Informações adicionais</span>}
        className="mt-4 m-0"
      >
        <FormProvider {...form}>
          <form >
            <div className="w-full pt-4">
              <FormField
                {...form.register("informacoes_adicionais")}
                control={form.control}
                name="informacoes_adicionais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required font-[400] ">
                      Insira informações que considerar importante no processo da designação. Este é um campo opcional.
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder=""
                        value={field.value}
                        onChange={(value) => {
                          setFormDesignacaoData({
                            ...formDesignacaoData,
                            informacoes_adicionais: value.target.value,
                          });
                          return field.onChange(value.target.value)
                        }
                        }
                        data-testid="input-descricao-pendencia"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>


            <div className="w-full pt-4">
              <FormField
                control={form.control}
                name="detalhe_para_quadro_de_historico_por_ano"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-[#42474a]">
                      Detalhe para quadro de histórico por ano
                    </FormLabel>

                    <Select
                      value={field.value !== undefined ? String(field.value) : undefined}
                      onValueChange={(value) => {
                        const booleanValue = value === "true";

                        setFormDesignacaoData({
                          ...formDesignacaoData,
                          detalhe_para_quadro_de_historico_por_ano: booleanValue,
                        });

                        return field.onChange(booleanValue)
                      }
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o Detalhe..." />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="false">Não contabilizar</SelectItem>
                        <SelectItem value="true">Contabilizar</SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </FormProvider>
      </Card>



      <div className="w-full flex flex-col mt-6">
        <BotoesDeNavegacao
          disableAnterior={false}
          disableProximo={salvando}
          labelProximo="Salvar"
          showAnterior
          onAnterior={() => router.push("/pages/designacoes/designacoes-passo-2")}
          onProximo={() => handleSalvar(id)}
        />
      </div>

      <Modal open={modalSucesso} footer={null} closable={false} centered>
        <Result
          status="success"
          title="Portaria salva com sucesso!"
          subTitle="Redirecionando para a página inicial..."
        />
      </Modal>

      <Modal open={modalErro} footer={null} closable={false} centered>
        <Result
          status="error"
          title="Erro ao salvar a portaria!"
          subTitle="Ocorreu um erro ao tentar salvar. Tente novamente."
          extra={[
            <button
              key="fechar"
              onClick={() => setModalErro(false)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Fechar
            </button>,
          ]}
        />
      </Modal>
    </>
  );
}