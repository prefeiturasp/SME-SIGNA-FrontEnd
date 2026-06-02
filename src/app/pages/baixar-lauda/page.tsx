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
  TipoAto
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

const dadosCessacaoSemTitularComPeriodo = {
  "id": 14,
  "portaria": "4545",
  "doc": null,
  "ano": "2026",
  "tipo_de_ato": "Cessação",
  "nome": "ADALBERTO PAVLIDIS DA SILVA",
  "cargo": "SECRETARIO DE ESCOLA",
  "data_designacao": "2026-06-01",
  "data_cessacao": "2026-06-02",
  "numero_sei": "4545.",
  "observacoes": null,
  "designacao": {
      "portaria": "444",
      "ano_vigente": "2026",
      "numero_sei": "444",
      "doc": null,
      "dre_nome": "DIRETORIA REGIONAL DE EDUCACAO SAO MIGUEL",
      "indicado_rf": "7311559",
      "indicado_vinculo": 1,
      "indicado_nome_civil": "",
      "indicado_nome_servidor": "ADALBERTO PAVLIDIS DA SILVA",
      "indicado_lotacao": "CEI DIRET    - MARIA APARECIDA DOS SANTOS",
      "indicado_cargo_base": "AUXILIAR TECNICO DE EDUCACAO",
      "indicado_cargo_sobreposto": "SECRETARIO DE ESCOLA",
      "indicado_local_exercicio": "EMEF         - JOSE BORGES ANDRADE",
      "tipo_vaga": "VAGO",
      "titular_nome_civil": "",
      "titular_nome_servidor": "",
      "titular_rf": "",
      "titular_cargo_base": "",
      "titular_vinculo": 0,
      "impedimento_substituicao": null,
      "ue": "400105",
      "codigo_hierarquico": "163300000720000",
      "data_inicio": "2026-06-01",
      "data_fim": null,
      "cargo_vaga": 3360,
      "unidade_proponente": "CEI DIRET - MARIA APARECIDA DOS SANTOS"
  },
  "cessacao": {
      "portaria": "4545",
      "ano_vigente": "2026",
      "numero_sei": "4545.",
      "doc": null,
      "remocao": false,
      "a_pedido": true,
      "aposentadoria": false,
      "data_cessacao": "2026-06-02"
  },
  "tipo_insubsistencia": null,
  "tipo_apostila": null,
  "tipo": "CESSACAO"
}

const dadosCessacaoComTitularSemPeriodo={
  "id": 13,
  "portaria": "2323",
  "doc": null,
  "ano": "2026",
  "tipo_de_ato": "Cessação",
  "nome": "ADALBERTO PAVLIDIS DA SILVA",
  "cargo": "SECRETARIO DE ESCOLA",
  "data_designacao": "2026-06-01",
  "data_cessacao": "2026-06-02",
  "numero_sei": "2323.",
  "observacoes": null,
  "designacao": {
      "portaria": "222222",
      "ano_vigente": "2026",
      "numero_sei": "2222.2222/2222222-2",
      "doc": "2026-06-03",
      "dre_nome": "DIRETORIA REGIONAL DE EDUCACAO PIRITUBA/JARAGUA",
      "indicado_rf": "7311559",
      "indicado_vinculo": 1,
      "indicado_nome_civil": "",
      "indicado_nome_servidor": "ADALBERTO PAVLIDIS DA SILVA",
      "indicado_lotacao": "CEI DIRET    - MARIA APARECIDA DOS SANTOS",
      "indicado_cargo_base": "AUXILIAR TECNICO DE EDUCACAO",
      "indicado_cargo_sobreposto": "SECRETARIO DE ESCOLA",
      "indicado_local_exercicio": "EMEF         - JOSE BORGES ANDRADE",
      "tipo_vaga": "DISPONIVEL",
      "titular_nome_civil": "",
      "titular_nome_servidor": "VANESSA GUSTAVO DA SILVA",
      "titular_rf": "7914229",
      "titular_cargo_base": "COORDENADOR PEDAGOGICO",
      "titular_vinculo": 1,
      "impedimento_substituicao": null,
      "ue": "014893",
      "codigo_hierarquico": "163000000170000",
      "data_inicio": "2026-06-01",
      "data_fim": null,
      "cargo_vaga": 3360,
      "unidade_proponente": "EMEI - MARIA DAILCE MONTEIRO DA SILVA GOMES, PROFA."
  },
  "cessacao": {
      "portaria": "2323",
      "ano_vigente": "2026",
      "numero_sei": "2323.",
      "doc": null,
      "remocao": false,
      "a_pedido": false,
      "aposentadoria": false,
      "data_cessacao": "2026-06-02"
  },
  "tipo_insubsistencia": null,
  "tipo_apostila": null,
  "tipo": "CESSACAO"
}


const dadosDesignacaoVagoSemPeriodo = {
  "id": 10,
  "portaria": "444",
  "doc": null,
  "ano": "2026",
  "tipo_de_ato": "Designação",
  "nome": "ADALBERTO PAVLIDIS DA SILVA",
  "cargo": "SECRETARIO DE ESCOLA",
  "data_designacao": "2026-06-01",
  "data_cessacao": null,
  "numero_sei": "444",
  "observacoes": null,
  "designacao": {
      "portaria": "444",
      "ano_vigente": "2026",
      "numero_sei": "444",
      "doc": null,
      "dre_nome": "DIRETORIA REGIONAL DE EDUCACAO SAO MIGUEL",
      "indicado_rf": "7311559",
      "indicado_vinculo": 1,
      "indicado_nome_civil": "",
      "indicado_nome_servidor": "ADALBERTO PAVLIDIS DA SILVA",
      "indicado_lotacao": "CEI DIRET    - MARIA APARECIDA DOS SANTOS",
      "indicado_cargo_base": "AUXILIAR TECNICO DE EDUCACAO",
      "indicado_cargo_sobreposto": "SECRETARIO DE ESCOLA",
      "indicado_local_exercicio": "EMEF         - JOSE BORGES ANDRADE",
      "tipo_vaga": "VAGO",
      "titular_nome_civil": "",
      "titular_nome_servidor": "",
      "titular_rf": "",
      "titular_cargo_base": "",
      "titular_vinculo": 0,
      "impedimento_substituicao": null,
      "ue": "400105",
      "codigo_hierarquico": "163300000720000",
      "data_inicio": "2026-06-01",
      "data_fim": null,
      "cargo_vaga": 3360,
      "unidade_proponente": "CEI DIRET - MARIA APARECIDA DOS SANTOS"
  },
  "cessacao": null,
  "tipo_insubsistencia": null,
  "tipo_apostila": null,
  "tipo": "DESIGNACAO"
}

const dadosDesignacaoVagoComPeriodo = {
  "id": 10,
  "portaria": "444",
  "doc": null,
  "ano": "2026",
  "tipo_de_ato": "Designação",
  "nome": "ADALBERTO PAVLIDIS DA SILVA",
  "cargo": "SECRETARIO DE ESCOLA",
  "data_designacao": "2026-06-01",
  "data_cessacao": "2026-06-06",
  "numero_sei": "444",
  "observacoes": null,
  "designacao": {
      "portaria": "444",
      "ano_vigente": "2026",
      "numero_sei": "444",
      "doc": null,
      "dre_nome": "DIRETORIA REGIONAL DE EDUCACAO SAO MIGUEL",
      "indicado_rf": "7311559",
      "indicado_vinculo": 1,
      "indicado_nome_civil": "",
      "indicado_nome_servidor": "ADALBERTO PAVLIDIS DA SILVA",
      "indicado_lotacao": "CEI DIRET    - MARIA APARECIDA DOS SANTOS",
      "indicado_cargo_base": "AUXILIAR TECNICO DE EDUCACAO",
      "indicado_cargo_sobreposto": "SECRETARIO DE ESCOLA",
      "indicado_local_exercicio": "EMEF         - JOSE BORGES ANDRADE",
      "tipo_vaga": "VAGO",
      "titular_nome_civil": "",
      "titular_nome_servidor": "",
      "titular_rf": "",
      "titular_cargo_base": "",
      "titular_vinculo": 0,
      "impedimento_substituicao": null,
 
      "ue": "014893",
      "codigo_hierarquico": "163000000170000",
      "data_inicio": "2026-06-01",
      "data_fim": "2026-06-06",
      "cargo_vaga": 3360,
      "unidade_proponente": "EMEI - MARIA DAILCE MONTEIRO DA SILVA GOMES, PROFA."
  },
  "cessacao": null,
  "tipo_insubsistencia": null,
  "tipo_apostila": null,
  "tipo": "DESIGNACAO"
}
const dadosDesignacaoComTitular ={
  "id": 9,
  "portaria": "222222",
  "doc": null,
  "ano": "2026",
  "tipo_de_ato": "Designação",
  "nome": "ADALBERTO PAVLIDIS DA SILVA",
  "cargo": "SECRETARIO DE ESCOLA",
  "data_designacao": "2026-06-01",
  "data_cessacao": null,
  "numero_sei": "2222.2222/2222222-2",
  "observacoes": null,
  "designacao": {
      "portaria": "222222",
      "ano_vigente": "2026",
      "numero_sei": "2222.2222/2222222-2",
      "doc": null,
      "dre_nome": "DIRETORIA REGIONAL DE EDUCACAO PIRITUBA/JARAGUA",
      "indicado_rf": "7311559",
      "indicado_vinculo": 1,
      "indicado_nome_civil": "",
      "indicado_nome_servidor": "ADALBERTO PAVLIDIS DA SILVA",
      "indicado_lotacao": "CEI DIRET    - MARIA APARECIDA DOS SANTOS",
      "indicado_cargo_base": "AUXILIAR TECNICO DE EDUCACAO",
      "indicado_cargo_sobreposto": "SECRETARIO DE ESCOLA",
      "indicado_local_exercicio": "EMEF         - JOSE BORGES ANDRADE",
      "tipo_vaga": "DISPONIVEL",
      "titular_nome_civil": "",
      "titular_nome_servidor": "VANESSA GUSTAVO DA SILVA",
      "titular_rf": "7914229",
      "titular_cargo_base": "COORDENADOR PEDAGOGICO",
      "titular_vinculo": 1,
      "impedimento_substituicao": null,
      "ue": "014893",
      "codigo_hierarquico": "163000000170000",
      "data_inicio": "2026-06-01",
      "data_fim": null,
      "cargo_vaga": 3360,
      "unidade_proponente": "EMEI - MARIA DAILCE MONTEIRO DA SILVA GOMES, PROFA."
  },
  "cessacao": null,
  "tipo_insubsistencia": null,
  "tipo_apostila": null,
  "tipo": "DESIGNACAO"
}

const dadosDesignacaoComTitularFerias ={
  "id": 11,
  "portaria": "77",
  "doc": null,
  "ano": "2026",
  "tipo_de_ato": "Designação",
  "nome": "ADALBERTO PAVLIDIS DA SILVA",
  "cargo": "SECRETARIO DE ESCOLA",
  "data_designacao": "2026-06-01",
  "data_cessacao": "2026-06-06",
  "numero_sei": "7",
  "observacoes": null,
  "designacao": {
      "portaria": "77",
      "ano_vigente": "2026",
      "numero_sei": "7",
      "doc": null,
      "dre_nome": "DIRETORIA REGIONAL DE EDUCACAO PENHA",
      "indicado_rf": "7311559",
      "indicado_vinculo": 1,
      "indicado_nome_civil": "",
      "indicado_nome_servidor": "ADALBERTO PAVLIDIS DA SILVA",
      "indicado_lotacao": "CEI DIRET    - MARIA APARECIDA DOS SANTOS",
      "indicado_cargo_base": "AUXILIAR TECNICO DE EDUCACAO",
      "indicado_cargo_sobreposto": "SECRETARIO DE ESCOLA",
      "indicado_local_exercicio": "EMEF         - JOSE BORGES ANDRADE",
      "tipo_vaga": "DISPONIVEL",
      "titular_nome_civil": "",
      "titular_nome_servidor": "VANESSA GUSTAVO DA SILVA",
      "titular_rf": "7914229",
      "titular_cargo_base": "COORDENADOR PEDAGOGICO",
      "titular_vinculo": 1,
      "impedimento_substituicao": "Por férias",
      "ue": "018279",
      "codigo_hierarquico": "162900000010000",
      "data_inicio": "2026-06-01",
      "data_fim": "2026-06-06",
      "cargo_vaga": 3360,
      "unidade_proponente": "EMEI - CEZAR ROGERIO OLIVEIRA PERAMEZZA, PROF."
  },
  "cessacao": null,
  "tipo_insubsistencia": null,
  "tipo_apostila": null,
  "tipo": "DESIGNACAO"
}




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
  // console.log('resultado', resultado);

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


  const getCargoVagaDisplay = (dadosDesignacao: ListagemPortariasResponse) => {

    if(dadosDesignacao.designacao.tipo_vaga!=="VAGO"){
      return "";
    }
    return cargos.filter((cargo)=>cargo.id===dadosDesignacao.designacao.cargo_vaga)[0]?.label ??""    
  }
  const gerarTextoDesignacaoLauda = (dadosDesignacao: ListagemPortariasResponse) => {
    

    const cargo_vaga_display=getCargoVagaDisplay(dadosDesignacao)
    
    console.log("cargos",cargo_vaga_display)
    const dadosPuros = gerarDadosLaudaDesignacao(
    dadosDesignacao,
    cargo_vaga_display
  );

    const dadosEscapados = gerarDadosEscapados(dadosPuros);

    const text =preencherTemplate(TEMPLATE_DESIGNACAO_BAIXAR_LAUDA , dadosEscapados)
    return text;
  };


  const gerarTextoCessacaoLauda = (dadosDesignacao: ListagemPortariasResponse) => {
    const cargo_vaga_display=getCargoVagaDisplay(dadosDesignacao)

    const dadosPuros = gerarDadosLaudaCessacao(dadosDesignacao,cargo_vaga_display);

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

    // selectedRows.map((ato)=>{
    //   if(ato.tipo==="DESIGNACAO"){
    //     const texto_desigancao=gerarTextoDesignacaoLauda(ato)
    //     console.log('texto_desigancao',texto_desigancao)
    //   }

    // })
    const texto_desigancao=gerarTextoDesignacaoLauda(dadosDesignacaoVagoSemPeriodo)
    const texto_desigancao_vago_com_periodo=gerarTextoDesignacaoLauda(dadosDesignacaoVagoComPeriodo)
    const texto_desigancao_com_titular=gerarTextoDesignacaoLauda(dadosDesignacaoComTitular)
    const texto_desigancao_com_titular_ferias=gerarTextoDesignacaoLauda(dadosDesignacaoComTitularFerias)
    // console.log('texto_desiganca_cargo_vago',texto_desigancao)
    // console.log('texto_desiganca_cargo_vago_com_periodo',texto_desigancao_vago_com_periodo)
    // console.log('texto_desigancao_com_titular',texto_desigancao_com_titular)
    // console.log('texto_desigancao_com_titular_e_periodo_e_ferias',texto_desigancao_com_titular_ferias)

    const texto_cessacao_com_titular_sem_periodo=gerarTextoCessacaoLauda(dadosCessacaoComTitularSemPeriodo)
    console.log('texto_cessacao_com_titular_sem_periodo',texto_cessacao_com_titular_sem_periodo)

    const texto_cessacao_sem_titular_com_periodo=gerarTextoCessacaoLauda(dadosCessacaoSemTitularComPeriodo)
    console.log('texto_cessacao_sem_titular_com_periodo',texto_cessacao_sem_titular_com_periodo)

    // // TODO: ATUALIZAR AS INTERFACES DE CESSACAO E DESIGNAÇÃO

    // const texto_insubsistencia=gerarTextoInsubsistenciaDesignacaoLauda(dadosInsubsistenciaDesignacao)
    // // console.log('texto_insubsistencia',texto_insubsistencia)

    // const texto_insubsistencia_cessacao=gerarTextoInsubsistenciaCessacaoLauda(dadosInsubsistenciaCessacao)
    // console.log('texto_insubsistencia_cessacao',texto_insubsistencia_cessacao)
         
    
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
