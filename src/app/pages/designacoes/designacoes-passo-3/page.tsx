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

const CAMPOS_NEGRITO = ["nome_indicado", "autoridade", "portaria", "sei"] as const;

function escapeHtml(s: string) {
  return s.replaceAll("&", "&amp;").replaceAll("<​", "&lt;").replaceAll(">", "&gt;");
}

export default function DesignacoesPasso3() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { formDesignacaoData, clearFormDesignacaoData } = useDesignacaoContext();

  const editorSEIRef = useRef<EditorSEIHandle>(null);
  const textoPlanoRef = useRef<string>("");

  const [salvando, setSalvando] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalErro, setModalErro] = useState(false);

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
        title="Designação"
        breadcrumbs={[{ title: "Início", href: "/" }, { title: "Designação" }]}
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