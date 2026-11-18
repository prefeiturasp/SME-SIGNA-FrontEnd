// "DRE FREGUESIA/BRASILANDIA" -> "FREGUESIA/BRASILANDIA"; vazio/nulo -> "-"
export const nomeDreSemPrefixo = (nome?: string | null): string => {
  const semPrefixo = nome?.replace(/^\s*DRE\s+/i, "").trim();
  return semPrefixo || "-";
};
