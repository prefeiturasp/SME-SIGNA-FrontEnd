import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
    include: ["src/**/*.{test,spec}.{ts,tsx,js,jsx}"],

    // a opção coverage fica dentro de `test`
    coverage: {
      provider: "v8", // usa @vitest/coverage-v8
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "coverage",
      include: ["src/**/*.{ts,tsx,js,jsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/__tests__/**",
        "src/**/__mocks__/**",
        "src/**/?(*.)+(test|spec).{ts,tsx,js,jsx}",
        "node_modules/**",
        ".next/**",
        'src/lib/**',
        "**/.next/**",  
        "src/components/ui/**",  
        "src/const.ts",
        "src/app/api/*",
        "*/types/*",
        "next.config.mjs",
        "tailwind.config.js",
        "postcss.config.mjs",
        "src/lib/zod-i18n.ts",
        "next-env.d.ts",
        "vitest.config.ts",
        "eslint.config.mjs",
        "*/.next/*", // Pode ser redundante, mas não atrapalha
        "testes/**", // Exclui a pasta de testes de QA
        "src/assets/icons/**",
        "src/assets/images/**",
        "src/assets/fonts/**",
        "src/assets/videos/**",
        "src/assets/sounds/**",
        "src/assets/documents/**",
        "src/assets/spreadsheets/**",
        "src/assets/presentations/**",
        "src/assets/emails/**",
        "cypress.config.js", // Exclui config do Cypress
        "cypress/support/**", // Exclui arquivos de suporte do Cypress
    ],
    },
  },
});
