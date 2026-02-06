"use server";

import axios from "axios";

export async function getDesignacaoUnidadeAction(codigo_ue:string) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL!;

    try {
        const { data } = await axios.get(`${API_URL}/designacao/unidade`, {
            params: { codigo_ue },
        });
        return data;
    } catch {
        throw new Error("Não foi possível buscar os dados da unidade");
    }
}

 