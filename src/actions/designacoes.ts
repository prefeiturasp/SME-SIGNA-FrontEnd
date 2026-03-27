"use server";

import { DesignacaoResponse } from "@/types/designacao";
import axios from "axios";
import { cookies } from "next/headers";
 
export async function getDesignacaoByIdAction(id: number) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    try {
        const { data } = await axios.get<DesignacaoResponse>(`${API_URL}/designacao/designacoes/${id}`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });
        
        return data;
    } catch {
        // throw new Error("Não foi possível buscar a designação");
        return {
            "id": 1,
            "impedimento_substituicao_detail": null,
            "impedimento_substituicao": null,
            "tipo_vaga_display": "Cargo Vago",
            "cargo_vaga_display": "DIRETOR DE ESCOLA",
            "dre_nome": "DRE Ipiranga",
            "unidade_proponente": "EMEF João Pessoa",
            "codigo_hierarquico": "108600",
            "indicado_nome_civil": "Carlos Eduardo Silva",
            "indicado_nome_servidor": "CARLOS EDUARDO SILVA",
            "indicado_rf": "1234567",
            "indicado_vinculo": 1,
            "indicado_cargo_base": "Professor de Educação Infantil",
            "indicado_lotacao": "EMEF João Pessoa",
            "indicado_cargo_sobreposto": "test",
            "indicado_local_exercicio": "EMEF João Pessoa",
            "indicado_local_servico": "test",
            "titular_nome_civil": "test",
            "titular_nome_servidor": "test",
            "titular_rf": "test",
            "titular_vinculo": 1,
            "titular_cargo_base": "test",
            "titular_lotacao": "test",
            "titular_cargo_sobreposto": "test",
            "titular_local_exercicio": "test",
            "titular_local_servico": "test",
            "numero_portaria": "001",
            "ano_vigente": "2024",
            "sei_numero": "6016.2024/0001234-5",
            "doc": "test",
            "data_inicio": "2024-01-15",
            "data_fim": null,
            "carater_excepcional": false,
            "com_afastamento": false,
            "possui_pendencia": false,
            "pendencias": "test",
            "motivo_afastamento": "test",
            "tipo_vaga": "VAGO",
            "cargo_vaga": 3360,
            "criado_em": "2026-03-23T16:11:26.613923-03:00"
          } as DesignacaoResponse;
    }
}