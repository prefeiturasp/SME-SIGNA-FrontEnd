"use client";


import { usePortariasDO } from "../../../hooks/usePortariasDO";
import FiltroDeDo from "@/components/dashboard/Designacao/FiltroDeDo/FiltroDeDo";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import FBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import { PORTARIAS_SEM_DATA_DE_PUBLICACAO } from "@/components/dashboard/Designacao/MainDOForm/MainDOForm";
import { FormProvider } from "react-hook-form";
import ListagemDeDo from "@/components/dashboard/Designacao/ListagemDeDo/ListagemDeDo";
import {
  DesignacaoResponse,
  ListagemPortariasResponse,
} from "@/types/designacao";
import {  gerarDadosInsubsistenciaCessacao, gerarDadosInsubsistenciaDesignacao, gerarDadosLaudaCessacao, gerarDadosLaudaDesignacao } from "@/utils/portarias/gerarDadosLauda";
import { useMemo } from "react";
import { gerarHtmlPortaria } from "@/components/dashboard/EditorTextoSEI/EditorTextoSEI";
import { preencherTemplate } from "@/utils/portarias/preencherTemplate";
import { TEMPLATE_CESSACAO_BAIXAR_LAUDA, TEMPLATE_DESIGNACAO_BAIXAR_LAUDA, TEMPLATE_INSUBSISTENCIA_CESSACAO_BAIXAR_LAUDA, TEMPLATE_INSUBSISTENCIA_DESIGNACAO, TEMPLATE_INSUBSISTENCIA_DESIGNACAO_BAIXAR_LAUDA   } from "@/utils/portarias/templates";
import { escapeHtml } from "../designacoes/designacoes-passo-3/page";
import { Button } from "antd";
import { useFetchCargos } from "@/hooks/useCargos";
import { useFetchDREs } from "@/hooks/useUnidades";
const CAMPOS_NEGRITO = ["nome_indicado", "autoridade", "portaria", "sei"] as const;


const dadosInsubsistenciaCessacao:DesignacaoResponse = {
  "id": 50,
  "tipo": "DESIGNACAO",
  "status": "ativo",
  "ato_pai_id": null,
  "ato_raiz_id": null,
  "numero_portaria": "12",
  "ano_vigente": "2026",
  "sei_numero": "12",
  "doc": null,
  "criado_em": "2026-05-28T10:24:18.567499-03:00",
  "dre_nome": "DIRETORIA REGIONAL DE EDUCACAO PENHA",
  "unidade_proponente": "EMEI - CEZAR ROGERIO OLIVEIRA PERAMEZZA, PROF.",
  "codigo_hierarquico": "162900000010000",
  "dre": "108900",
  "ue": "018279",
  "funcionarios_da_unidade": "3360",
  "indicado_nome_civil": "",
  "indicado_nome_servidor": "VANESSA GUSTAVO DA SILVA",
  "indicado_rf": "7914229",
  "indicado_vinculo": 1,
  "indicado_cargo_base": "COORDENADOR PEDAGOGICO",
  "indicado_codigo_cargo_base": 3379,
  "indicado_lotacao": "EMEF         - LIA - MARIA DOS REIS DE JESUS SOUZA SILVA, PROFA.",
  "indicado_cargo_sobreposto": "DIRETOR DE ESCOLA",
  "indicado_codigo_cargo_sobreposto": 3360,
  "indicado_local_exercicio": "EMEF         - ULYSSES DA SYLVEIRA GUIMARAES",
  "indicado_local_servico": "Indisponível",
  "titular_nome_civil": "",
  "titular_nome_servidor": "",
  "titular_rf": "",
  "titular_vinculo": 0,
  "titular_cargo_base": "",
  "titular_codigo_cargo_base": 0,
  "titular_lotacao": "",
  "titular_cargo_sobreposto": "",
  "titular_codigo_cargo_sobreposto": 0,
  "titular_local_exercicio": "",
  "titular_local_servico": "",
  "data_inicio": "2026-05-28",
  "data_fim": null,
  "carater_excepcional": false,
  "com_afastamento": false,
  "possui_pendencia": false,
  "pendencias": "",
  "motivo_afastamento": "",
  "informacoes_adicionais": "",
  "detalhe_para_quadro_de_historico_por_ano": true,
  "impedimento_substituicao": null,
  "impedimento_substituicao_detail": null,
  "impedimento_display": null,
  "tipo_vaga": "VAGO",
  "cargo_vaga": 3360,
  "tipo_vaga_display": "Cargo Vago",
  "cargo_vaga_display": "DIRETOR DE ESCOLA",
  "cessacao": {
      "id": 51,
      "numero_portaria": "13",
      "ano_vigente": "2026",
      "sei_numero": "13",
      "doc": null,
      "status": "insubsistente",
      "a_pedido": false,
      "remocao": false,
      "aposentadoria": false,
      "data_cessacao": "2026-05-28",
      "criado_em": "2026-05-28T13:24:37.392080Z",
      "apostilas": [],
      "insubsistencia": {
          "id": 52,
          "numero_portaria": "11111",
          "ano_vigente": "2026",
          "sei_numero": "1111.1111/1111111-1",
          "doc": null,
          "observacoes": "insubsistente",
          "criado_em": "2026-05-28T12:35:52.287817Z"
      }
  },
  "apostilas": [],
  "insubsistencia": null
}

const dadosInsubsistenciaDesignacao:DesignacaoResponse = {
  
    "id": 45,
    "tipo": "DESIGNACAO",
    "status": "insubsistente",
    "ato_pai_id": null,
    "ato_raiz_id": null,
    "numero_portaria": "99999999999999999999",
    "ano_vigente": "2026",
    "sei_numero": "9999.9999/9999999-9",
    "doc": null,
    "criado_em": "2026-05-28T09:31:20.833975-03:00",
    "dre_nome": "DIRETORIA REGIONAL DE EDUCACAO SAO MIGUEL",
    "unidade_proponente": "EMEI - DORACIL DINA BENICIO, PROFA.",
    "codigo_hierarquico": "163300000820000",
    "dre": "109300",
    "ue": "013692",
    "funcionarios_da_unidade": "3085",
    "indicado_nome_civil": "",
    "indicado_nome_servidor": "ADALBERTO PAVLIDIS DA SILVA",
    "indicado_rf": "7311559",
    "indicado_vinculo": 1,
    "indicado_cargo_base": "AUXILIAR TECNICO DE EDUCACAO",
    "indicado_codigo_cargo_base": 4906,
    "indicado_lotacao": "CEI DIRET    - MARIA APARECIDA DOS SANTOS",
    "indicado_cargo_sobreposto": "SECRETARIO DE ESCOLA",
    "indicado_codigo_cargo_sobreposto": 3182,
    "indicado_local_exercicio": "EMEF         - JOSE BORGES ANDRADE",
    "indicado_local_servico": "Indisponível",
    "titular_nome_civil": "",
    "titular_nome_servidor": "",
    "titular_rf": "",
    "titular_vinculo": 0,
    "titular_cargo_base": "",
    "titular_codigo_cargo_base": 0,
    "titular_lotacao": "",
    "titular_cargo_sobreposto": "",
    "titular_codigo_cargo_sobreposto": 0,
    "titular_local_exercicio": "",
    "titular_local_servico": "",
    "data_inicio": "2026-05-28",
    "data_fim": null,
    "carater_excepcional": false,
    "com_afastamento": false,
    "possui_pendencia": false,
    "pendencias": "",
    "motivo_afastamento": "",
    "informacoes_adicionais": "",
    "detalhe_para_quadro_de_historico_por_ano": true,
    "impedimento_substituicao": null,
    "impedimento_substituicao_detail": null,
    "impedimento_display": null,
    "tipo_vaga": "VAGO",
    "cargo_vaga": 3360,
    "tipo_vaga_display": "Cargo Vago",
    "cargo_vaga_display": "DIRETOR DE ESCOLA",
    "cessacao": null,
    "apostilas": [],
    "insubsistencia": {
        "id": 46,
        "numero_portaria": "11111",
        "ano_vigente": "2026",
        "sei_numero": "1111.1111/1111111-1",
        "doc": null,
        "observacoes": "insubsistente",
        "criado_em": "2026-05-28T12:35:52.287817Z"
    }

}


const dadosNovosCessacao:DesignacaoResponse = {
  
    "id": 47,
    "tipo": "DESIGNACAO",
    "status": "cessada",
    "ato_pai_id": null,
    "ato_raiz_id": null,
    "numero_portaria": "222222",
    "ano_vigente": "2026",
    "sei_numero": "2222.22",
    "doc": null,
    "criado_em": "2026-05-28T10:18:25.902312-03:00",
    "dre_nome": "DIRETORIA REGIONAL DE EDUCACAO SANTO AMARO",
    "unidade_proponente": "EMEI - RAUL JOVIANO DO AMARAL",
    "codigo_hierarquico": "163100000470000",
    "dre": "109100",
    "ue": "000388",
    "funcionarios_da_unidade": "3360",
    "indicado_nome_civil": "",
    "indicado_nome_servidor": "VANESSA GUSTAVO DA SILVA",
    "indicado_rf": "7914229",
    "indicado_vinculo": 1,
    "indicado_cargo_base": "COORDENADOR PEDAGOGICO",
    "indicado_codigo_cargo_base": 3379,
    "indicado_lotacao": "EMEF         - LIA - MARIA DOS REIS DE JESUS SOUZA SILVA, PROFA.",
    "indicado_cargo_sobreposto": "DIRETOR DE ESCOLA",
    "indicado_codigo_cargo_sobreposto": 3360,
    "indicado_local_exercicio": "EMEF         - ULYSSES DA SYLVEIRA GUIMARAES",
    "indicado_local_servico": "Indisponível",
    "titular_nome_civil": "",
    "titular_nome_servidor": "",
    "titular_rf": "",
    "titular_vinculo": 0,
    "titular_cargo_base": "",
    "titular_codigo_cargo_base": 0,
    "titular_lotacao": "",
    "titular_cargo_sobreposto": "",
    "titular_codigo_cargo_sobreposto": 0,
    "titular_local_exercicio": "",
    "titular_local_servico": "",
    "data_inicio": "2026-05-28",
    "data_fim": null,
    "carater_excepcional": false,
    "com_afastamento": false,
    "possui_pendencia": false,
    "pendencias": "",
    "motivo_afastamento": "",
    "informacoes_adicionais": "",
    "detalhe_para_quadro_de_historico_por_ano": true,
    "impedimento_substituicao": null,
    "impedimento_substituicao_detail": null,
    "impedimento_display": null,
    "tipo_vaga": "VAGO",
    "cargo_vaga": 3360,
    "tipo_vaga_display": "Cargo Vago",
    "cargo_vaga_display": "DIRETOR DE ESCOLA",
    "cessacao": {
        "id": 48,
        "numero_portaria": "3333",
        "ano_vigente": "2026",
        "sei_numero": "3333.33",
        "doc": null,
        "status": "ativo",
        "a_pedido": false,
        "remocao": false,
        "aposentadoria": false,
        "data_cessacao": "2026-05-28",
        "criado_em": "2026-05-28T13:19:08.872379Z",
        "apostilas": [],
        "insubsistencia": null
    },
    "apostilas": [],
    "insubsistencia": null
 
}

const dadosCessacao = {
  "portaria_designacao": "2604",

  "ano": "2026",
  "numero_sei": "1111.1111/1111111-1",
  "sei": "728.817.4",      

  "servidorIndicado": {
    "vinculo": 1,
    "nome_servidor": "ADALBERTO PAVLIDIS DA SILVA",
    "nome_civil": "",
    "rf": "7311559",      
    "cargo_base": "AUXILIAR TECNICO DE EDUCACAO",
    "lotacao": "CEI DIRET    - MARIA APARECIDA DOS SANTOS",
    "cargo_sobreposto_funcao_atividade": "SECRETARIO DE ESCOLA",
    "local_de_exercicio": "EMEF         - JOSE BORGES ANDRADE",
    "laudo_medico": "Indisponível",
    "local_de_servico": "Indisponível"
  },
  "dre": "108100",
  "dre_nome": "DIRETORIA REGIONAL DE EDUCACAO BUTANTA",
  "ue": "000191",
  "ue_nome": "EMEF - ALIPIO CORREA NETO, PROF.",
  "funcionarios_da_unidade": "3085",
  "quantidade_turmas": "-",
  "codigo_hierarquico": "162100000550000",
  "cargo_sobreposto": "",
  "modulos": 1,
  "a_partir_de": "2026-05-26",
  "designacao_data_final": "2026-10-27",
  "com_afastamento": false,
  "motivo_afastamento": "",
  "com_pendencia": false,
  "motivo_pendencia": "",
  // "tipo_cargo": "vago"
   "tipo_cargo": "disponivel",
  "rf_titular": "",
  "cargo_vago_selecionado": {
    "id": 3360,
    "label": "DIRETOR DE ESCOLA"
  },
  "dadosTitular": {
    "vinculo": 1,
    "nome_servidor": "ALICE",
    "nome_civil": "",
    "rf": "111111",      
    "cargo_base": "AUXILIAR TECNICO DE EDUCACAO",     
  },
  "informacoes_adicionais": "",
  "detalhe_para_quadro_de_historico_por_ano": true,



 


  "a_pedido":"nao"
};


const dadosDesignacao = {
  "portaria_designacao": "2604",

  "ano": "2026",
  "numero_sei": "1111.1111/1111111-1",
  "sei": "728.817.4",      

  "servidorIndicado": {
    "vinculo": 1,
    "nome_servidor": "ADALBERTO PAVLIDIS DA SILVA",
    "nome_civil": "",
    "rf": "7311559",      
    "cargo_base": "AUXILIAR TECNICO DE EDUCACAO",
    "lotacao": "CEI DIRET    - MARIA APARECIDA DOS SANTOS",
    "cargo_sobreposto_funcao_atividade": "SECRETARIO DE ESCOLA",
    "local_de_exercicio": "EMEF         - JOSE BORGES ANDRADE",
    "laudo_medico": "Indisponível",
    "local_de_servico": "Indisponível"
  },
  "dre": "108100",
  "dre_nome": "DIRETORIA REGIONAL DE EDUCACAO BUTANTA",
  "ue": "000191",
  "ue_nome": "EMEF - ALIPIO CORREA NETO, PROF.",
  "funcionarios_da_unidade": "3085",
  "quantidade_turmas": "-",
  "codigo_hierarquico": "162100000550000",
  "cargo_sobreposto": "",
  "modulos": 1,
  "a_partir_de": "2026-05-26",
  "designacao_data_final": "2026-10-27",
  "com_afastamento": false,
  "motivo_afastamento": "",
  "com_pendencia": false,
  "motivo_pendencia": "",
  "tipo_cargo": "vago",
  "rf_titular": "",
  "cargo_vago_selecionado": {
    "id": 3360,
    "label": "DIRETOR DE ESCOLA"
  },
  "dadosTitular": null,
  "informacoes_adicionais": "",
  "detalhe_para_quadro_de_historico_por_ano": true
};


export default function BaixarLauda() {
  const {
    handleClear,
    isPending,
    tabelaKey,
    resultado,
    filterForm,
    onSubmitFilterForm,
    salvando,
  } = usePortariasDO();

  const { data: dreOptions = [] } = useFetchDREs();
  console.log('resultado', resultado);

  const { data: cargosData = [] } = useFetchCargos();
  const cargos = cargosData.map(cargo => ({
    id: cargo.codigoCargo,
    label: cargo.nomeCargo,
  }));

  const gerarDadosEscapados = (dadosPuros: Record<string, string>) => {

    const dadosEscapados: Record<string, string> = {};
    for (const [k, v] of Object.entries(dadosPuros)) {
      if (v === undefined || v === null) continue;
      dadosEscapados[k] = escapeHtml(String(v));
    }

    for (const campo of CAMPOS_NEGRITO) {
      const val = dadosEscapados[campo];
      if (val) dadosEscapados[campo] = `<strong>${val}</strong>`;
    }
    return dadosEscapados;
  };

  const gerarTextoDesignacaoLauda = (dadosDesignacao: any) => {
    const dadosPuros = gerarDadosLaudaDesignacao({
      ...dadosDesignacao,
      designacao_data_final: dadosDesignacao.designacao_data_final ?? undefined,
      impedimento_substituicao: dadosDesignacao.impedimento_substituicao ?? undefined,
    });

    const dadosEscapados = gerarDadosEscapados(dadosPuros);

    const text =preencherTemplate(TEMPLATE_DESIGNACAO_BAIXAR_LAUDA , dadosEscapados)
    return text;
  };


  const gerarTextoCessacaoLauda = (dadosDesignacao: any) => {
    const dadosPuros = gerarDadosLaudaCessacao({
      ...dadosDesignacao,
      designacao_data_final: dadosDesignacao.designacao_data_final ?? undefined,
      impedimento_substituicao: dadosDesignacao.impedimento_substituicao ?? undefined,
    });

    const dadosEscapados = gerarDadosEscapados(dadosPuros);

    const text =preencherTemplate(TEMPLATE_CESSACAO_BAIXAR_LAUDA , dadosEscapados)
    return text;
  };


  const gerarTextoInsubsistenciaDesignacaoLauda = (dadosDesignacao: DesignacaoResponse) => {
    const dadosPuros = gerarDadosInsubsistenciaDesignacao({
      ...dadosDesignacao      
    });

    const dadosEscapados = gerarDadosEscapados(dadosPuros);

    const text =preencherTemplate(TEMPLATE_INSUBSISTENCIA_DESIGNACAO_BAIXAR_LAUDA , dadosEscapados)
    return text;
  }



  const gerarTextoInsubsistenciaCessacaoLauda = (dadosCessacao: DesignacaoResponse) => {
    const dadosPuros = gerarDadosInsubsistenciaCessacao({
      ...dadosCessacao      
    });

    const dadosEscapados = gerarDadosEscapados(dadosPuros);

    const text =preencherTemplate(TEMPLATE_INSUBSISTENCIA_CESSACAO_BAIXAR_LAUDA , dadosEscapados)
    return text;
  }



 
 
  const handleBaixarLauda = async (selectedRows: ListagemPortariasResponse[], tipoArquivo: string) => {
    console.log('selectedRows', selectedRows, tipoArquivo);
    const texto_desigancao=gerarTextoDesignacaoLauda(dadosDesignacao)
    // console.log('texto_desigancao',texto_desigancao)

    const texto_cessacao=gerarTextoCessacaoLauda(dadosCessacao)
    // console.log('texto_cessacao',texto_cessacao)

    // TODO: ATUALIZAR AS INTERFACES DE CESSACAO E DESIGNAÇÃO

    const texto_insubsistencia=gerarTextoInsubsistenciaDesignacaoLauda(dadosInsubsistenciaDesignacao)
    // console.log('texto_insubsistencia',texto_insubsistencia)

    const texto_insubsistencia_cessacao=gerarTextoInsubsistenciaCessacaoLauda(dadosInsubsistenciaCessacao)
    console.log('texto_insubsistencia_cessacao',texto_insubsistencia_cessacao)
         
    
  };



  return (
    <>
      <PageHeader
        showBackButton={false}
        title={
          "Baixar lauda"
        }
        breadcrumbs={[
          { title: "Início", href: "/" },
          { title: "Designações", href: "/pages/listagem-designacoes" },
          { title: "Baixar lauda" }
        ]}        
      />
      <Button
      onClick ={()=>handleBaixarLauda([],'pdf')}>
wewewewew
      </Button>

      <FBranco className="mb-4">
        <FormProvider {...filterForm}>
          <form onSubmit={filterForm.handleSubmit(onSubmitFilterForm)}>
            <FiltroDeDo onClear={handleClear} />
          </form>
        </FormProvider>
      </FBranco>

      <FBranco className="mb-4">

        <ListagemDeDo
          isListagemDo={false}
          onClickBaixarLauda={handleBaixarLauda}
          isLoading={isPending}
          data={resultado ?? []}              
          value={PORTARIAS_SEM_DATA_DE_PUBLICACAO}          
          data_considerada_portaria={new Date()}          
          isDisabled={salvando}
          data_publicacao={new Date()}
          key={tabelaKey}
        />

      </FBranco>
    </>
  );
}
