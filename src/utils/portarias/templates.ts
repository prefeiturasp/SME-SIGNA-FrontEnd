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