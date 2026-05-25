"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { ICargoType } from "@/types/cargos";

 export async function getCargosBaseBancoDeDados() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL!;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;    
    try {
        const { data } = await axios.get<ICargoType[]>(`${API_URL}/designacao/designacoes/cargos-base-pareados`,             {
            headers: {
                Authorization: `Bearer ${token}`,
            },
         });
        return data;
    } catch {
        throw new Error("Não foi possível buscar os cargos base do banco de dados");
    }
}

 export async function getCargosSobrepostosBancoDeDados() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL!;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;    
    try {
        const { data } = await axios.get<ICargoType[]>(`${API_URL}/designacao/designacoes/cargos-sobrepostos-pareados`,             {
            headers: {
                Authorization: `Bearer ${token}`,
            },
         });
        return data;
    } catch {
        throw new Error("Não foi possível buscar os cargos sobrepostos do banco de dados");
    }
}