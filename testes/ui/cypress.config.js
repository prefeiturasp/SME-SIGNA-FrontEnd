const { defineConfig } = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const preprocessor = require("@badeball/cypress-cucumber-preprocessor");
const createEsbuildPlugin = require("@badeball/cypress-cucumber-preprocessor/esbuild");
const allureWriter = require("@shelex/cypress-allure-plugin/writer");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, ".env") });

module.exports = defineConfig({
  // cypress-mochawesome-reporter roda só localmente (fora do CI): gera 1
  // relatório HTML consolidado (com screenshots embutidos) ao final da run,
  // em cypress/reports/mochawesome/index.html — útil para inspecionar uma
  // execução local. No Jenkins (CI=true) o pipeline já roda com
  // --reporter mocha-allure-reporter (ver Jenkinsfile_qa) e arquiva o
  // relatório Allure; gerar mochawesome também na esteira seria relatório
  // duplicado e desnecessário, por isso reporter/reporterOptions ficam
  // condicionados a !process.env.CI (sem eles, Cypress usa o reporter
  // "spec" padrão em CI).
  ...(process.env.CI
    ? {}
    : {
        reporter: "cypress-mochawesome-reporter",
        reporterOptions: {
          reportDir: "cypress/reports/mochawesome",
          reportFilename: "[status]_[datetime]-relatorio-signa",
          reportPageTitle: "Relatório de Testes — SIGNA",
          charts: true,
          embeddedScreenshots: true,
          inlineAssets: true,
          saveAllAttempts: false,
          overwrite: false,
        },
      }),

  e2e: {
    baseUrl: "https://qa-signa.sme.prefeitura.sp.gov.br",

    specPattern: process.env.CI
      ? ["cypress/e2e/**/*.feature", "!cypress/e2e/ui/*.feature"]
      : "cypress/e2e/**/*.feature",
    excludeSpecPattern: [
      "cypress/e2e/ui/consulta_rf.feature",
      // Retiradas do repositório (mantidas só localmente) — não executar.
      "cypress/e2e/ui/cessacao.feature",
      "cypress/e2e/ui/designacao.feature",
      "cypress/e2e/ui/insubsistente.feature",
      "cypress/e2e/ui/apostilar.feature",
      "cypress/e2e/ui/altera_DO.feature",
    ],

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
    responseTimeout: 120000,
    testRunTimeout: 120000,

    viewportWidth: 1920,
    viewportHeight: 1080,

    experimentalMemoryManagement: true,
    // 0 no CI para economizar memória em execuções longas (Jenkins);
    // no modo local/interativo (cypress open) mantém snapshots de mais testes
    // para o time-travel debugging (clicar num comando passado no Command Log).
    // 10 era baixo demais: só o filtra_atos.feature já gera 12 testes (8
    // exemplos do Esquema do Cenário + 4 cenários), então os snapshots dos
    // primeiros testes eram descartados antes de dar tempo de revisá-los.
    numTestsKeptInMemory: process.env.CI ? 0 : 50,
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

      CI: process.env.CI || false,

      API_EOL_BASE_URL:
        process.env.API_EOL_BASE_URL ||
        "https://hom-smeintegracaoapi.sme.prefeitura.sp.gov.br",
      API_EOL_KEY: process.env.API_EOL_KEY,
      API_RF_LOGIN: process.env.API_RF_LOGIN,
      API_PASSWORD: process.env.API_PASSWORD,
      API_EMAIL: process.env.API_EMAIL,
      tags: process.env.CYPRESS_TAGS || "not @skip",
    },

    async setupNodeEvents(on, config) {
      allureWriter(on, config);

      // Mochawesome: registra os hooks (before:run/after:run/after:spec) que
      // mesclam os resultados de todos os specs num único relatório HTML ao
      // final da execução. Só localmente — ver comentário em "reporter" no
      // topo do arquivo; sem esse guard, os hooks rodariam (e escreveriam
      // arquivos em cypress/reports/mochawesome) mesmo no Jenkins, mesmo com
      // o reporter/reporterOptions do config já desativados lá em cima.
      if (!process.env.CI) {
        require("cypress-mochawesome-reporter/plugin")(on);
      }

      // =========================
      // CUCUMBER
      // =========================
      await preprocessor.addCucumberPreprocessorPlugin(on, config);

      on(
        "file:preprocessor",
        createBundler({
          plugins: [createEsbuildPlugin.default(config)],
        })
      );

      // =========================
      // TASKS
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
      // FIREFOX
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
