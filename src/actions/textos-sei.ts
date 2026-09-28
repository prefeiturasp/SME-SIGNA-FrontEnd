"use server";

import { postWithAuth } from "@/lib/serverRequest";

export interface TextoSeiPreviewPayload {
  tipo_portaria: string;
  tipo_ato_pai?: string;
  tipo_cargo: string;
  dados: Record<string, string>;
}

export interface TextoSeiPreviewResponse {
  modelo_portaria_id: number;
  texto: string;
}

export const gerarPreviewTextoSeiAction = async (
  payload: TextoSeiPreviewPayload
) => {
  return postWithAuth<TextoSeiPreviewPayload, TextoSeiPreviewResponse>(
    "/designacao/textos-sei/preview/",
    payload,
    "Erro ao gerar o texto da portaria"
  );
};
