"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
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

const TEMPLATE_PORTARIA = `PORTARIA Nº {{portaria}}
SEI Nº {{sei}}

{{dre}}

{{autoridade}}, no uso de suas atribuições legais,

EXPEDE:

A presente portaria, designando o(a) Sr.(a) {{nome_indicado}}, RF {{rf}}, vínculo {{vinculo}}, {{cargo_base}}, efetivo, lotado(a) na {{lotacao_indicado}}, para exercer cargo de {{cargo_indicado}}, no {{ue}}, EH: {{eh}}, {{trecho_substituicao}}, {{trecho_final}}`;

const CAMPOS_NEGRITO = ["nome_indicado", "autoridade", "portaria", "sei"] as const;

function normalizarQuebras(texto: string) {
  return texto
    .replaceAll("<​br>", "\n")
    .replaceAll("<​BR>", "\n")
    .replaceAll("<​br/>", "\n")
    .replaceAll("<​BR/>", "\n")
    .replaceAll("<​br />", "\n")
    .replaceAll("<​BR />", "\n")
    .replaceAll("<​​br>", "\n")
    .replaceAll("<​​BR>", "\n")
    .replaceAll("<​​br/>", "\n")
    .replaceAll("<​​BR/>", "\n")
    .replaceAll("<​​br />", "\n")
    .replaceAll("<​​BR />", "\n")
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n");
}

function escapeHtml(s: string) {
  return s.replaceAll("&", "&amp;").replaceAll("<​", "&lt;").replaceAll(">", "&gt;");
}

function gerarHtmlPortaria(texto: string): string {
  if (!texto) return "";

  const textoLimpo = normalizarQuebras(texto);

  const linhasHtml = textoLimpo.split("\n").map((linha) => {
    if (!linha.trim()) return `<div><br></div>`;
    let l = linha;
    const palavrasFixas = ["EXPEDE:", "PORTARIA Nº", "SEI Nº"];
    for (const palavra of palavrasFixas) {
      l = l.replaceAll(new RegExp(`(${palavra})`, "g"), "<strong>$1</strong>");
    }

    return `<div>${l}</div>`;
  });

  return linhasHtml.join("");
}

export default function DesignacoesPasso3() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { formDesignacaoData } = useDesignacaoContext();
  const textoPlanoRef = useRef<string>("");

  const [salvando, setSalvando] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalErro, setModalErro] = useState(false);

  useEffect(() => {
    if (!formDesignacaoData) return;

    const dadosPuros = gerarDadosPortaria({
      ...formDesignacaoData,
      designacao_data_final: formDesignacaoData.designacao_data_final ?? undefined,
      impedimento_substituicao: formDesignacaoData.impedimento_substituicao ?? undefined,
    });

    const textoRaw = preencherTemplate(TEMPLATE_PORTARIA, dadosPuros);

    const textoPlano = normalizarQuebras(
      textoRaw.replaceAll(/<\/?strong>/g, "")
    );

    textoPlanoRef.current = textoPlano;
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
      if (val) {
        dadosEscapados[campo] = `<strong>${val}</strong>`;
      }
    }

    const textoRaw = preencherTemplate(TEMPLATE_PORTARIA, dadosEscapados);

    return gerarHtmlPortaria(textoRaw);
  }, [formDesignacaoData]);

  const editorRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node !== null) {
        node.innerHTML = htmlInicial;
      }
    },
    [htmlInicial]
  );

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    textoPlanoRef.current = e.currentTarget.innerText;
  }, []);

  const salvarPortaria = async (id: string | null) => {
    if (!formDesignacaoData) {
      throw new Error("Dados do formulário não encontrados.");
    }

    const result = await designacaoAction(formDesignacaoData, id);

    if (!result.success) {
      throw new Error(result.error);
    }

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
      setTimeout(() => {
        router.push("/pages/listagem-designacoes");
      }, 2200);
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
        <div className="flex flex-col gap-4">
          <span className="text-sm font-semibold text-[#333] uppercase tracking-wide">
            PORTARIA
          </span>

          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            className="w-full min-h-[350px] border border-gray-300 rounded p-4 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 leading-relaxed overflow-auto"
          />
        </div>
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