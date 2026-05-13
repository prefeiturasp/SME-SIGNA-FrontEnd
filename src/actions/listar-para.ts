"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { ICargoType } from "@/types/cargos";

 export async function listarParaAction() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL!;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;    
    try {
        const { data } = await axios.get<ICargoType[]>(`${API_URL}/designacao/unidade/cargos/`,             {
            headers: {
                Authorization: `Bearer ${token}`,
            },
         });
        return data;
    } catch {
        throw new Error("Não foi possível buscar os cargos");
    }
}