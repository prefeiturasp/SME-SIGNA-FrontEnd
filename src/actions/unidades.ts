"use server";

import axios from "axios";

export async function getDREs() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL!;

    try {
        const { data } = await axios.get(`${API_URL}/unidades`, {
            params: { tipo: "DRE" },
        });
        return data;
    } catch {
        throw new Error("Não foi possível buscar as DREs");
    }
}

export async function getUEs(dre: string) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL!;

    try {
        const { data } = await axios.get(`${API_URL}/unidades`, {
            params: { tipo: "UE", dre },
        });
        return data;
    } catch {
        throw new Error("Não foi possível buscar as UEs");
    }
}