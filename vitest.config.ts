import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
    include: ["src/**/*.{test,spec}.{ts,tsx,js,jsx}"],

    // a opção coverage fica dentro de `test`
    coverage: {
      provider: "v8", // usa @vitest/coverage-v8
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage",
      include: ["src/**/*.{ts,tsx,js,jsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/__tests__/**",
        "src/**/__mocks__/**",
        "src/**/?(*.)+(test|spec).{ts,tsx,js,jsx}",
        "node_modules/**",
        ".next/**",
      ],
    },
  },
});
