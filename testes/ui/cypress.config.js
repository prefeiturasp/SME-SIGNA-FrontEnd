require('dotenv').config();
const { defineConfig } = require('cypress');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const preprocessor = require('@badeball/cypress-cucumber-preprocessor');
const createEsbuildPlugin = require('@badeball/cypress-cucumber-preprocessor/esbuild');
const allureWriter = require('@shelex/cypress-allure-plugin/writer');
const cypressOnFix = require('cypress-on-fix');

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.BASE_URL || 'https://qa-signa.sme.prefeitura.sp.gov.br',
    specPattern: 'cypress/e2e/**/*.feature',
    supportFile: 'cypress/support/e2e.js',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    video: false, // Vídeos desabilitados (não necessários no repositório)
    videoCompression: false,
    screenshotOnRunFailure: true, // Screenshots apenas em falhas
    chromeWebSecurity: false,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    viewportWidth: 1920,
    viewportHeight: 1080,
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 0, // Desabilita cache para Firefox
    watchForFileChanges: false,
    retries: {
      runMode: 1,
      openMode: 0
    },
    env: {
      baseUrl: process.env.BASE_URL || 'https://qa-signa.sme.prefeitura.sp.gov.br',
      loginUrl: process.env.LOGIN_URL || 'https://qa-signa.sme.prefeitura.sp.gov.br/login',
      username: process.env.SIGNA_USERNAME,
      password: process.env.SIGNA_PASSWORD,
      newPasswordTest: process.env.SIGNA_NEW_PASSWORD_TEST,
      allure: true,
      allureResultsPath: 'allure-results'
    },
    async setupNodeEvents(cypressOn, config) {
      const on = cypressOnFix(cypressOn);

      // IMPORTANTE: Cucumber preprocessor DEVE ser configurado primeiro
      await preprocessor.addCucumberPreprocessorPlugin(on, config);
      
      // Bundler para processar arquivos
      on(
        'file:preprocessor',
        createBundler({
          plugins: [createEsbuildPlugin.default(config)],
        })
      );

      // Geração de resultados Allure para CI/Jenkins
      allureWriter(on, config);

      // Tasks personalizadas
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        }
      });

      // Configurações específicas para Firefox
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'firefox') {
          // Desabilita aceleração de hardware
          launchOptions.preferences['layers.acceleration.disabled'] = true;
          // Aumenta timeout de inicialização
          launchOptions.preferences['dom.max_script_run_time'] = 0;
          launchOptions.preferences['dom.max_chrome_script_run_time'] = 0;
          // Desabilita cache
          launchOptions.preferences['browser.cache.disk.enable'] = false;
          launchOptions.preferences['browser.cache.memory.enable'] = false;
        }
        return launchOptions;
      });

      // IMPORTANTE: Retornar o config no final
      return config;
    },
  },
});
