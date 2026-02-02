const { defineConfig } = require('cypress');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const preprocessor = require('@badeball/cypress-cucumber-preprocessor');
const createEsbuildPlugin = require('@badeball/cypress-cucumber-preprocessor/esbuild');
const allureWriter = require('@shelex/cypress-allure-plugin/writer');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://qa-signa.sme.prefeitura.sp.gov.br',
    specPattern: 'cypress/e2e/**/*.feature',
    supportFile: 'cypress/support/e2e.js',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    video: false, // Desabilitado para melhorar performance no Firefox
    videoCompression: 32,
    screenshotOnRunFailure: true,
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
      baseUrl: 'https://qa-signa.sme.prefeitura.sp.gov.br',
      loginUrl: 'https://qa-signa.sme.prefeitura.sp.gov.br/login',
      username: '7311559',
      password: 'Sgp1559',
      allure: true
    },
    async setupNodeEvents(on, config) {
      // IMPORTANTE: Cucumber preprocessor deve ser o primeiro
      await preprocessor.addCucumberPreprocessorPlugin(on, config);
      
      on(
        'file:preprocessor',
        createBundler({
          plugins: [createEsbuildPlugin.default(config)],
        })
      );

      // Allure plugin
      allureWriter(on, config);

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

      return config;
    },
  },
});
