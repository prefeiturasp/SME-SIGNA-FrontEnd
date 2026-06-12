const { defineConfig } = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const preprocessor = require("@badeball/cypress-cucumber-preprocessor");
const createEsbuildPlugin = require("@badeball/cypress-cucumber-preprocessor/esbuild");
const allureWriter = require("@shelex/cypress-allure-plugin/writer");
let cloudPlugin;
try {
  cloudPlugin = require("cypress-cloud/plugin").cloudPlugin;
} catch (e) {
  console.warn(
    '\u001b[33m⚠ AVISO: cypress-cloud/plugin não está instalado. Testes continuarão sem o plugin.\u001b[0m'
  );
  cloudPlugin = null;
}
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, ".env") });

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://qa-signa.sme.prefeitura.sp.gov.br",

    specPattern: process.env.CI
      ? ["cypress/e2e/**/*.feature", "!cypress/e2e/ui/*.feature"]
      : "cypress/e2e/**/*.feature",
    excludeSpecPattern: ["cypress/e2e/ui/consulta_rf.feature"],

    supportFile: "cypress/support/e2e.js",

    screenshotsFolder: "cypress/screenshots",
    videosFolder: "cypress/videos",

    // Grava vídeo apenas para features da pasta ui, nunca grava no Jenkins (CI)
    video: process.env.CI
      ? false
      : process.env.npm_config_spec &&
        process.env.npm_config_spec.startsWith("cypress/e2e/ui/")
      ? true
      : false,
    videoCompression: false,
    screenshotOnRunFailure: true,

    chromeWebSecurity: false,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,
    requestTimeout: 10000,
    responseTimeout: 120000, // 2 minutos
    testRunTimeout: 120000, // 2 minutos

    viewportWidth: 1920,
    viewportHeight: 1080,

    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 0,
    watchForFileChanges: false,

    retries: {
      runMode: 1,
      openMode: 0,
    },

    env: {
      baseUrl:
        process.env.BASE_URL || "https://qa-signa.sme.prefeitura.sp.gov.br",
      loginUrl:
        process.env.LOGIN_URL ||
        "https://qa-signa.sme.prefeitura.sp.gov.br/login",
      username: process.env.SIGNA_USERNAME || process.env.USERNAME || "",
      password: process.env.SIGNA_PASSWORD || process.env.PASSWORD || "",
      newPasswordTest: process.env.SIGNA_NEW_PASSWORD_TEST || "",

      // Detectar contexto de execução (CI=true na esteira Jenkins)
      CI: process.env.CI || false,

      // API EOL — SME Integração
      // CI: credenciais vêm do secret cypress_env_signa (Jenkins)
      // Local: credenciais carregadas do arquivo .env via dotenv
      API_EOL_BASE_URL:
        process.env.API_EOL_BASE_URL ||
        "https://hom-smeintegracaoapi.sme.prefeitura.sp.gov.br",
      API_EOL_KEY: process.env.API_EOL_KEY,
      API_RF_LOGIN: process.env.API_RF_LOGIN,
      API_PASSWORD: process.env.API_PASSWORD,
      API_EMAIL: process.env.API_EMAIL,
    },

    async setupNodeEvents(on, config) {
      allureWriter(on, config);

      // =========================
      // 1️⃣ CUCUMBER
      // =========================
      await preprocessor.addCucumberPreprocessorPlugin(on, config);

      on(
        "file:preprocessor",
        createBundler({
          plugins: [createEsbuildPlugin.default(config)],
        })
      );

      // =========================
      // 3️⃣ TASKS
      // =========================
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        },
        // Leitura segura de arquivo — nunca falha se o arquivo não existe
        // Obrigatório para testes de API (token.json, etc.)
        lerArquivoSeguro(caminho) {
          try {
            const fs = require("fs");
            const path = require("path");
            const caminhoAbsoluto = path.isAbsolute(caminho)
              ? caminho
              : path.join(process.cwd(), caminho);
            if (fs.existsSync(caminhoAbsoluto)) {
              return fs.readFileSync(caminhoAbsoluto, "utf8");
            }
            return null;
          } catch (e) {
            return null;
          }
        },
      });

      // =========================
      // 4️⃣ FIREFOX
      // =========================
      on("before:browser:launch", (browser, launchOptions) => {
        if (browser.family === "firefox") {
          launchOptions.preferences["layers.acceleration.disabled"] = true;
          launchOptions.preferences["dom.max_script_run_time"] = 0;
          launchOptions.preferences["dom.max_chrome_script_run_time"] = 0;
          launchOptions.preferences["browser.cache.disk.enable"] = false;
          launchOptions.preferences["browser.cache.memory.enable"] = false;
        }
        return launchOptions;
      });

      // =========================
      // 5️⃣ CYPRESS CLOUD PLUGIN
      // =========================
      if (cloudPlugin) {
        const enhancedConfig = await cloudPlugin(on, config);
        return enhancedConfig;
      }
      
      return config;
    },
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
});
