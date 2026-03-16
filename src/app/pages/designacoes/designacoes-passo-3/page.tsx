"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, message, Modal, Result } from "antd";
import { useRouter } from "next/navigation";
import StepperDesignacao from "@/components/dashboard/Designacao/StepperDesignacao";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import BotoesDeNavegacao from "@/components/dashboard/Designacao/BotoesDeNavegacao";
import Designacao from "@/assets/icons/Designacao";
import { useDesignacaoContext } from "../DesignacaoContext";
import { preencherTemplate } from "@/utils/portarias/preencherTemplate";
import { gerarDadosPortaria } from "@/utils/portarias/gerarDadosPortaria";
import { designacaoAction } from "@/actions/cadastro-designacao";

const TEMPLATE_PORTARIA = `
PORTARIA Nº {{portaria}}/{{ano}}
SEI nº {{sei}}

Diretoria Regional de Educação {{dre}}

{{autoridade}}

EXPEDE:

A presente portaria, designando o(a) Sr.(a) {{nome}}, RF {{rf}}, vínculo {{vinculo}}, {{cargo_base}}, efetivo, lotado(a) na {{lotacao_indicado}}, para exercer cargo de {{cargo_indicado}}, no {{ue}}, EH: {{eh}}, {{trecho_substituicao}}, {{trecho_final}}
`;

export default function DesignacoesPasso3() {
  const router = useRouter();
  const { formDesignacaoData } = useDesignacaoContext();

  const [textoEditado, setTextoEditado] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalErro, setModalErro] = useState(false);

  const textoInicial = useMemo(() => {
    if (!formDesignacaoData) return "";

    const dados = gerarDadosPortaria(formDesignacaoData);
    return preencherTemplate(TEMPLATE_PORTARIA, dados);
  }, [formDesignacaoData]);

  useEffect(() => {
    setTextoEditado(textoInicial);
  }, [textoInicial]);

  const salvarPortaria = async () => {
    if (!formDesignacaoData) {
      throw new Error("Dados do formulário não encontrados.");
    }

    const result = await designacaoAction(formDesignacaoData);

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  };

  const handleSalvar = async () => {
    try {
      setSalvando(true);

      message.loading({
        content: "Salvando portaria...",
        duration: 0,
      });

      await salvarPortaria();

      message.destroy();

      setModalSucesso(true);

      setTimeout(() => {
        router.push("/");
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

          <textarea
            className="w-full min-h-[350px] border border-gray-300 rounded p-4 text-sm text-gray-800 resize-y bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 leading-relaxed"
            value={textoEditado}
            onChange={(e) => setTextoEditado(e.target.value)}
          />
        </div>
      </Card>

      <div className="w-full flex flex-col mt-6">
        <BotoesDeNavegacao
          disableAnterior={false}
          disableProximo={salvando}
          showAnterior
          onAnterior={() =>
            router.push("/pages/designacoes/designacoes-passo-2")
          }
          onProximo={handleSalvar}
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