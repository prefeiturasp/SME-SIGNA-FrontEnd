import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Proíbe asserções de tipo em objetos literais (`{} as Foo` / `{...} as Foo`),
      // que desligam completamente a checagem de propriedades excedentes/faltantes.
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        {
          assertionStyle: "as",
          objectLiteralTypeAssertions: "allow-as-parameter",
        },
      ],
    },
  },
  {
    // Mocks de teste legitimamente montam objetos parciais/simplificados (ex: `{} as never`)
    // só pra satisfazer um tipo que o teste não usa; forçar tipagem completa ali seria
    // trabalho artificial sem ganho real de segurança, por isso a regra vale só em produção.
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "@typescript-eslint/consistent-type-assertions": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
