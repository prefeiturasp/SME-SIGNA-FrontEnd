// Exclui a pasta /testes (mantida pela equipe de QA) do lint de pre-commit.
const isQaTestesPath = (file) => {
  const normalized = file.replaceAll("\\", "/");
  return /(^|\/)testes\//.test(normalized);
};

export default {
  "*.{js,jsx,ts,tsx,mjs,cjs}": (files) => {
    const filtered = files.filter((file) => !isQaTestesPath(file));

    if (filtered.length === 0) return [];

    // TEMPORÁRIO: oxlint no lugar do eslint enquanto estivermos no TypeScript 7.
    // Voltar para `eslint --fix` quando o TS 7.1 sair — ver .oxlintrc.json.
    return [`oxlint --fix ${filtered.join(" ")}`];
  },
};
