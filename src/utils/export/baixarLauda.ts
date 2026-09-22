import { format } from "date-fns";
import { baixarArquivo } from "./baixarArquivo";

export type FormatoLauda = "PDF" | "WORD";

export type BaixarLaudaResult =
  | { success: true }
  | { success: false; error: string };

const EXTENSAO_POR_FORMATO: Record<FormatoLauda, string> = {
  PDF: "pdf",
  WORD: "docx",
};

const nomeArquivoPadrao = (formato: FormatoLauda) =>
  `lauda-${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.${EXTENSAO_POR_FORMATO[formato]}`;

// Extrai o filename de `attachment; filename="lauda-....pdf"`
const nomeArquivoDoHeader = (contentDisposition: string | null): string | undefined => {
  const match = contentDisposition?.match(/filename="?([^";]+)"?/);
  return match?.[1];
};

export const baixarLauda = async (ids: number[], formato: FormatoLauda): Promise<BaixarLaudaResult> => {
  try {
    const response = await fetch("/api/lauda", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, formato }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      return { success: false, error: body?.detail ?? "Erro ao gerar a lauda" };
    }

    const blob = await response.blob();
    const fileName = nomeArquivoDoHeader(response.headers.get("Content-Disposition")) ?? nomeArquivoPadrao(formato);
    baixarArquivo(blob, fileName);

    return { success: true };
  } catch {
    return { success: false, error: "Erro ao gerar a lauda" };
  }
};
