"use server";

import {  ApostilaInsubsistenciasBody } from "@/types/apostila";
import { postWithAuth } from "@/lib/serverRequest";

export async function ApostilaInsubsistenciaAction(payload: ApostilaInsubsistenciasBody) {
  return postWithAuth(
    "/designacao/v2/insubsistencias/",
    payload,
    "Erro ao salvar apostila"
  );
}