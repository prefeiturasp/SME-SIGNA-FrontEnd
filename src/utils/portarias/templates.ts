export const TEMPLATE_INSUBSISTENCIA_DESIGNACAO = `
PORTARIA Nº {{portaria}}/{{ano}} 
SEI nº {{sei}}
{{dre}}
O Secretário Municipal de Educação, no uso de suas atribuições legais,

R E S O L V E:

TORNAR INSUBSISTENTE a portaria nº {{portaria_designacao}}, de S.M.E, D.O.C. de {{doc_designacao}}, SEI nº {{sei_designacao}}, pela qual o(a) servidor(a) {{nome_indicado}}, RF {{rf}}, vínculo {{vinculo}}, {{cargo_base}}, foi designado(a) para exercer o cargo de {{cargo}}, no {{ue}}, {{periodo}}.
`;

export const TEMPLATE_INSUBSISTENCIA_CESSACAO = `
PORTARIA Nº {{portaria}}/{{ano}} 
SEI nº {{sei}}
{{dre}}
O Secretário Municipal de Educação, usando das atribuições que lhe são conferidas,

R E S O L V E:

TORNAR INSUBSISTENTE a portaria nº {{portaria_cessacao}}, de S.M.E, D.O.C. de {{doc_cessacao}}, SEI nº {{sei_cessacao}}, que cessou os efeitos da Port. nº {{portaria_designacao}}, de S.M.E., D.O.C. de {{doc_designacao}}, SEI nº {{sei_designacao}}, pela qual o(a) servidor(a) {{nome_indicado}}, RF {{rf}}, vínculo {{vinculo}}, {{cargo_base}}, foi designado(a) para exercer o cargo de {{cargo}}, no {{ue}}, {{periodo}}.
`;



export const TEMPLATE_CESSACAO = `EXPEDE:
PORTARIA Nº {{portaria}}/{{ano}} SEI nº {{sei}}
{{dre}}
O Secretário Municipal de Educação, usando das atribuições que lhe são conferidas,

R E S O L V E:

FAZER CESSAR, {{tipo_cessacao}}, os efeitos da portaria nº {{portaria_designacao}}, de S.M.E, D.O.C. de {{doc_designacao}}, SEI nº {{sei_designacao}}, pela qual o(a) Sr.(a). {{nome_indicado}}, RF {{rf}}, vínculo {{vinculo}}, {{cargo_base}}, foi designado(a) para exercer o cargo de {{cargo}}, no {{ue}}, a partir de {{data_inicio}}.
`;

export const TEMPLATE_DESIGNACAO = `PORTARIA Nº {{portaria}}
SEI Nº {{sei}}

{{dre}}

{{autoridade}}, no uso de suas atribuições legais,

EXPEDE:

A presente portaria, designando o(a) Sr.(a) {{nome_indicado}}, RF {{rf}}, vínculo {{vinculo}}, {{cargo_base}}, efetivo, lotado(a) na {{lotacao_indicado}}, para exercer cargo de {{cargo_indicado}}, no {{ue}}, EH: {{eh}}, {{trecho_substituicao}}, {{trecho_final}}`;

export const TEMPLATE_APOSTILA = `SEI nº {{sei}}

APOSTILA FEITA NA PORTARIA, Nº {{portaria_designacao}}/{{ano}}, DA S.M.E., D.O.C. DE {{doc_designacao}}, SEI Nº {{sei_designacao}}, EM NOME DE {{nome_indicado}}, RF {{rf}}, VÍNCULO {{vinculo}}.

{{dre}}

É a presente portaria apostilada, a fim de declarar que a servidora foi designada para exercer cargo vago de {{cargo}}, na {{ue}} E.H: {{eh}} e não como constou.`;




export const TEMPLATE_DESIGNACAO_BAIXAR_LAUDA = `DESIGNANDO
{{dre}}
Port. {{portaria}} - SEI nº {{sei}} - 728.817.4, vínculo {{vinculo}} {{nome_indicado}}, {{cargo_base}}, efetivo, lotado(a) na {{lotacao_indicado}},
para exercer cargo de {{cargo_indicado}}, no {{ue}},  EH: {{eh}}, {{trecho_substituicao}}, {{trecho_final}}`


 
export const TEMPLATE_CESSACAO_BAIXAR_LAUDA = `FAZENDO CESSAR
{{dre}}
Port. {{portaria}} - SEI nº {{sei}} - 728.817.4, vínculo {{vinculo}} {{nome_indicado}}, {{cargo_base}}, {{tipo_cessacao}}, os efeitos da portaria nº {{portaria_designacao}}, de S.M.E., D.O.C. de {{doc_designacao}}, SEI nº {{sei_designacao}}, pela qual o(a) servidor(a) foi designado(a), {{trecho_para_substituir}}, `


 
export const TEMPLATE_INSUBSISTENCIA_DESIGNACAO_BAIXAR_LAUDA = `
TORNANDO INSUBSISTENTE
{{dre}}
Port.{{portaria}}/{{ano}} - FALTA ESSE (779.776.1), vínculo {{vinculo}} - {{nome_indicado}}, {{cargo_base}} - FALTA ESSA (Categoria 3), os efeitos da portaria nº {{portaria_designacao}}, de S.M.E, D.O.C. de {{doc_designacao}}, pela qual o(a) servidor(a) foi designado(a) para exercer o cargo de {{cargo}}, no {{ue}},{{periodo}}, em face do Despacho publicado no DOC de {{doc}}.
`;


export const TEMPLATE_INSUBSISTENCIA_CESSACAO_BAIXAR_LAUDA = `
TORNANDO INSUBSISTENTE
{{dre}}
Port.{{portaria_insubsistencia}}/{{ano_insubsistencia}} - FALTA ESSE (779.776.1), vínculo {{vinculo}} - {{nome_indicado}}, {{cargo_base}} - FALTA ESSA (Categoria 3),

os efeitos da portaria nº {{portaria_cessacao}}, de S.M.E, D.O.C. de {{doc_cessacao}}, que cessou os efeitos da Port.nº {{portaria_designacao}}, de S.M.E., D.O.C. de {{doc_designacao}},
, de S.M.E, D.O.C. de {{doc_designacao}}, 
pela qual o(a) servidor(a) foi designado(a) para exercer o cargo de {{cargo}}, no {{ue}},{{periodo}}, em face do Despacho publicado no DOC de {{doc_insubsistencia}}.


PORTARIA Nº {{portaria}}/{{ano}} 
SEI nº {{sei}}
{{dre}}
O Secretário Municipal de Educação, usando das atribuições que lhe são conferidas,

R E S O L V E:

TORNAR INSUBSISTENTE a portaria nº {{portaria_cessacao}}, de S.M.E, D.O.C. de {{doc_cessacao}}, SEI nº {{sei_cessacao}}, que cessou os efeitos da Port. nº {{portaria_designacao}}, de S.M.E., D.O.C. de {{doc_designacao}}, SEI nº {{sei_designacao}}, pela qual o(a) servidor(a) {{nome_indicado}}, RF {{rf}}, vínculo {{vinculo}}, {{cargo_base}}, foi designado(a) para exercer o cargo de {{cargo}}, no {{ue}}, {{periodo}}.



`;
