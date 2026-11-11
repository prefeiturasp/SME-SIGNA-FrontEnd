"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { getDadosPortaria } from "@/utils/designacao/getDadosPortaria";
import { getDadosPortariaCessacao } from "@/utils/cessacao/getDadosPortaria";
import { getDadosIndicado } from "@/utils/ServidorIndicado/getDadosIndicado";

import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { gerarHtmlPortaria } from "@/components/dashboard/EditorTextoSEI/EditorTextoSEI";
import AnularApostilaTornarSemEfeitoFormCard from "@/components/dashboard/apostila/AnularApostilaTornarSemEfeitoFormCard";

import { useRouter } from "next/navigation";
import { Servidor } from "@/types/designacao-unidade";
import { Cessacao, DesignacaoResponse } from "@/types/designacao";
import formSchemaAnularApostilaTornarSemEfeito, {
  formSchemaAnularApostilaTornarSemEfeitoData,
} from "@/app/pages/anular-apostila/schema";
import { useAppNotification } from "@/components/providers/NotificationProvider";
import { montarDadosTextoSeiAnularApostila } from "@/utils/anularApostila/montarDadosTextoSei";
import { useGerarPreviewTextoSei } from "@/hooks/useGerarPreviewTextoSei";
import { codigosCargosDaDesignacao } from "@/utils/portarias/cargoIndicado";
import { mapTipoVagaParaTipoCargo } from "@/utils/portarias/tipoCargo";

export type AnularApostilaCampos =
  formSchemaAnularApostilaTornarSemEfeitoData["apostila_insubsistencia"];

/**
 * Ato de onde saem os dados exibidos em tela. Serve tanto para a apostila
 * (cadastro) quanto para a anulação já existente (edição) — as duas trazem
 * a designação e, quando houver, a cessação.
 */
export interface AtoAnulavel {
  designacao?: DesignacaoResponse;
  cessacao?: Cessacao | null;
}

/** Texto SEI e modelo resolvidos na tela, entregues junto do salvamento. */
export interface AnularApostilaExtras {
  textoSei: string;
  modeloPortaria: number | null;
}

export const DEFAULT_VALUES_ANULAR_APOSTILA: AnularApostilaCampos = {
  portaria: "",
  ano: "",
  numero_sei: "",
  doc: new Date(),
  observacao: "",
  texto_para_apostila: "É a presente portaria apostilada",
};

type Props = Readonly<{
  ato: AtoAnulavel | undefined;
  isLoading: boolean;
  titulo: string;
  mensagemSucesso: string;
  /** Preenche o formulário na edição; ausente no cadastro. */
  valoresIniciais?: AnularApostilaCampos | null;
  /** Texto SEI já gravado, exibido de saída na edição. */
  textoSeiSalvo?: string;
  onSalvar: (
    values: formSchemaAnularApostilaTornarSemEfeitoData,
    extras: AnularApostilaExtras
  ) => Promise<unknown>;
}>;

export default function AnularApostilaForm({
  ato,
  isLoading,
  titulo,
  mensagemSucesso,
  valoresIniciais,
  textoSeiSalvo = "",
  onSalvar,
}: Props) {
  const router = useRouter();
  const notification = useAppNotification();

  const tipoPortaria = ato?.cessacao ? "cessacao" : "designacao";

  const form = useForm<formSchemaAnularApostilaTornarSemEfeitoData>({
    resolver: zodResolver(formSchemaAnularApostilaTornarSemEfeito),
    defaultValues: {
      apostila_insubsistencia: DEFAULT_VALUES_ANULAR_APOSTILA,
    },
  });

  const dadosPortaria = useMemo(() => getDadosPortaria(ato?.designacao), [ato]);
  const dadosPortariaCessacao = useMemo(() => getDadosPortariaCessacao(ato), [ato]);
  const dadosIndicado: Servidor | null = useMemo(
    () => getDadosIndicado(ato?.designacao),
    [ato]
  );

  // Estado só do que o usuário regera na tela; o já gravado é derivado do
  // dado carregado, sem setState em efeito.
  const [textoSeiGerado, setTextoSeiGerado] = useState("");
  const [htmlPortariaGerado, setHtmlPortariaGerado] = useState("");
  const [modeloPortariaId, setModeloPortariaId] = useState<number | null>(null);
  const { gerandoPreview, gerarPreview } = useGerarPreviewTextoSei();

  const htmlPortariaSalvo = useMemo(
    () => (textoSeiSalvo ? gerarHtmlPortaria(textoSeiSalvo) : ""),
    [textoSeiSalvo]
  );

  // Sem isso, salvar sem clicar em "Gerar texto SEI" enviaria texto vazio.
  const textoSei = textoSeiGerado || textoSeiSalvo;
  const htmlPortaria = htmlPortariaGerado || htmlPortariaSalvo;
  const mostrarEditor = Boolean(htmlPortaria);

  useEffect(() => {
    if (!valoresIniciais) return;

    form.reset({ apostila_insubsistencia: valoresIniciais });
  }, [valoresIniciais, form]);

  const handleGerarPortaria = async () => {
    const values = form.getValues();
    const atoApostilado = tipoPortaria === "cessacao" ? ato?.cessacao : ato?.designacao;

    const preview = await gerarPreview({
      tipo_portaria: "INSUBSISTENCIA",
      tipo_ato_pai: "APOSTILA",
      tipo_cargo: mapTipoVagaParaTipoCargo(ato?.designacao?.tipo_vaga),
      codigosCargos: codigosCargosDaDesignacao(ato?.designacao),
      montarDados: (descricoes) =>
        montarDadosTextoSeiAnularApostila(ato?.designacao, atoApostilado, values.apostila_insubsistencia, descricoes),
    });
    if (!preview) return;

    setTextoSeiGerado(preview.texto);
    setModeloPortariaId(preview.modelo_portaria_id);
    setHtmlPortariaGerado(gerarHtmlPortaria(preview.texto));
  };

  const onSubmit = async (values: formSchemaAnularApostilaTornarSemEfeitoData) => {
    try {
      await onSalvar(values, { textoSei, modeloPortaria: modeloPortariaId });

      notification.success({ title: mensagemSucesso });
      router.push("/pages/atos-administrativos");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao salvar";
      notification.error({ title: msg });
    }
  };

  return (
    <>
      <PageHeader
        title={<span>{titulo}</span>}
        breadcrumbs={[{ title: "Início", href: "/" }, { title: titulo }]}
        showBackButton={false}
      />
      {isLoading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-[#B22B2A]" />
        </div>
      ) : (
        <AnularApostilaTornarSemEfeitoFormCard
          form={form}
          onSubmit={onSubmit}
          tipoPortaria={tipoPortaria}
          dadosIndicado={dadosIndicado}
          dadosPortaria={dadosPortaria}
          dadosPortariaCessacao={dadosPortariaCessacao}
          triggerField="apostila_insubsistencia"
          onGerarPortaria={handleGerarPortaria}
          gerandoPreview={gerandoPreview}
          mostrarEditor={mostrarEditor}
          htmlPortaria={htmlPortaria}
          showTextoParaApostila
          tituloForm="Dados da portaria de anulação"
        />
      )}
    </>
  );
}
