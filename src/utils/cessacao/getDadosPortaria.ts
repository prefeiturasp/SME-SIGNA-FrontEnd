import { Cessacao } from "@/types/designacao";

export function getDadosPortariaCessacao(
  designacao: { cessacao?: Cessacao | null } | undefined
): Cessacao | null {
  return designacao?.cessacao ?? null;
}