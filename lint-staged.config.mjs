// Exclui a pasta /testes (mantida pela equipe de QA) do lint de pre-commit.
const isQaTestesPath = (file) => {
  const normalized = file.replaceAll("\\", "/");
  return /(^|\/)testes\//.test(normalized);
};

export default {
  "*.{js,jsx,ts,tsx,mjs,cjs}": (files) => {
    const filtered = files.filter((file) => !isQaTestesPath(file));

    if (filtered.length === 0) return [];

    return [`eslint --fix ${filtered.join(" ")}`];
  },
};
