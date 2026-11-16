"use server";

import axios from "axios";

// Com `contexto=designacao` o backend devolve só as DREs atuais e os tipos de
// UE permitidos na designação. Outras telas não enviam o parâmetro.
export type ContextoUnidades = "designacao";

export async function getDREs(contexto?: ContextoUnidades) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL!;

    try {
        const { data } = await axios.get(`${API_URL}/unidades`, {
            params: { tipo: "DRE", ...(contexto && { contexto }) },
        });
        return data;
    } catch {
        throw new Error("Não foi possível buscar as DREs");
    }
}

export async function getUEs(dre: string, contexto?: ContextoUnidades) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL!;

    try {
        const { data } = await axios.get(`${API_URL}/unidades`, {
            params: { tipo: "UE", dre, ...(contexto && { contexto }) },
        });
        return data;
    } catch {
        throw new Error("Não foi possível buscar as UEs");
    }
}
