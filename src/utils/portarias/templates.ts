export const TEMPLATE_INSUBSISTENCIA_DESIGNACAO = `
PORTARIA Nº {{portaria}}/{{ano}} 
SEI nº {{sei}}
{{dre}}
O Secretário Municipal de Educação, no uso de suas atribuições legais,

R E S O L V E:

TORNAR INSUBSISTENTE a portaria nº {{portaria_designacao}}, de S.M.E, D.O.C. de {{doc_designacao}}, SEI nº {{sei_designacao}}, pela qual o(a) servidor(a) {{nome_indicado}}, RF {{rf}}, vínculo {{vinculo}}, {{cargo_base}}, foi designado(a) para exercer o cargo de {{cargo}}, {{trecho_unidade}}, {{periodo}}.
`;

export const TEMPLATE_INSUBSISTENCIA_CESSACAO = `
PORTARIA Nº {{portaria}}/{{ano}} 
SEI nº {{sei}}
{{dre}}
O Secretário Municipal de Educação, usando das atribuições que lhe são conferidas,

R E S O L V E:

TORNAR INSUBSISTENTE a portaria nº {{portaria_cessacao}}, de S.M.E, D.O.C. de {{doc_cessacao}}, SEI nº {{sei_cessacao}}, que cessou os efeitos da Port. nº {{portaria_designacao}}, de S.M.E., D.O.C. de {{doc_designacao}}, SEI nº {{sei_designacao}}, pela qual o(a) servidor(a) {{nome_indicado}}, RF {{rf}}, vínculo {{vinculo}}, {{cargo_base}}, foi designado(a) para exercer o cargo de {{cargo}}, {{trecho_unidade}}, {{periodo}}.
`;



export const TEMPLATE_CESSACAO = `PORTARIA Nº {{portaria}}/{{ano}}
SEI Nº {{sei}}

{{dre}}

O Secretário Municipal de Educação, usando das atribuições que lhe são conferidas,

R E S O L V E:

FAZER CESSAR, {{tipo_cessacao}}, os efeitos da portaria nº {{portaria_designacao}}, de S.M.E, D.O.C. de {{doc_designacao}}, SEI nº {{sei_designacao}}, pela qual o(a) Sr.(a). {{nome_indicado}}, RF {{rf}}, vínculo {{vinculo}}, {{cargo_base}}, foi designado(a) para exercer o cargo de {{cargo}}, {{trecho_unidade}}, a partir de {{data_inicio}}{{trecho_afastamento}}.
`;

export const TEMPLATE_DESIGNACAO = `PORTARIA Nº {{portaria}}
SEI Nº {{sei}}

{{dre}}

{{autoridade}}, no uso de suas atribuições legais,

EXPEDE:

A presente portaria, designando o(a) Sr.(a) {{nome_indicado}}, RF {{rf}}, vínculo {{vinculo}}, {{cargo_base}}, efetivo, lotado(a) na {{lotacao_indicado}}, para exercer cargo de {{cargo_indicado}}, {{trecho_unidade}}, EH: {{eh}}, {{trecho_substituicao}}{{trecho_afastamento}}, {{trecho_final}}`;

export const TEMPLATE_APOSTILA = `SEI nº {{sei}}

APOSTILA FEITA NA PORTARIA, Nº {{portaria_designacao}}/{{ano}}, DA S.M.E., D.O.C. DE {{doc_designacao}}, SEI Nº {{sei_designacao}}, EM NOME DE {{nome_indicado}}, RF {{rf}}, VÍNCULO {{vinculo}}.

{{dre}}

É a presente portaria apostilada, a fim de declarar que a servidora foi designada para exercer cargo vago de {{cargo}}, na {{ue}} E.H: {{eh}} e não como constou.`;





export const TEMPLATE_ANULAR_APOSTILA = `PORTARIA Nº {{portaria}}/{{ano}}
SEI Nº {{numero_sei}}


APOSTILA FEITA NA PORTARIA, Nº {{portaria_apostilada}}/{{ano_apostilado}}, DA S.M.E., D.O.C. DE {{doc_apostilado}}, SEI Nº {{sei_apostilado}}, EM NOME DE {{nome_indicado}}, RF {{rf}}, VÍNCULO {{vinculo}}.


{{dre}}


{{texto_para_apostila}}`;


export const TEMPLATE_TORNAR_SEM_EFEITO_INSUBSISTENCIA = `PORTARIA Nº {{portaria}}/{{ano}}
SEI Nº {{numero_sei}}

{{dre}}

O Secretário Municipal de Educação, no uso de suas atribuições legais,

R E S O L V E:

TORNAR SEM EFEITO a publicação no D.O.C. de {{doc_da_insubsistencia}}, SEI Nº {{numero_sei_da_insubsistencia}}, que tornou Insubsistente o ato publicado no DOC {{doc_do_ato_insubsistido}}.
`;