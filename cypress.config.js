const { defineConfig } = require('cypress');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const preprocessor = require('@badeball/cypress-cucumber-preprocessor');
const createEsbuildPlugin = require('@badeball/cypress-cucumber-preprocessor/esbuild');
const { cloudPlugin } = require('cypress-cloud/plugin');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://qa-signa.sme.prefeitura.sp.gov.br',
    specPattern: 'cypress/e2e/**/*.feature',
    supportFile: 'cypress/support/e2e.js',

    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',

    video: false,
    videoCompression: false,
    screenshotOnRunFailure: true,

    chromeWebSecurity: false,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,
    requestTimeout: 10000,
    responseTimeout: 30000,

    viewportWidth: 1920,
    viewportHeight: 1080,

    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 0,
    watchForFileChanges: false,

    retries: {
      runMode: 1,
      openMode: 0
    },

    env: {
      baseUrl: 'https://qa-signa.sme.prefeitura.sp.gov.br',
      loginUrl: 'https://qa-signa.sme.prefeitura.sp.gov.br/login',
      username: '7311559',
      password: 'Sgp1559'
    },

    async setupNodeEvents(on, config) {

      // =========================
      // 1️⃣ Cucumber (SEMPRE PRIMEIRO)
      // =========================
      await preprocessor.addCucumberPreprocessorPlugin(on, config);

      on(
        'file:preprocessor',
        createBundler({
          plugins: [createEsbuildPlugin.default(config)],
        })
      );

      // =========================
      // 2️⃣ Tasks personalizadas
      // =========================
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

      // =========================
      // 3️⃣ Config Firefox
      // =========================
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'firefox') {
          launchOptions.preferences['layers.acceleration.disabled'] = true;
          launchOptions.preferences['dom.max_script_run_time'] = 0;
          launchOptions.preferences['dom.max_chrome_script_run_time'] = 0;
          launchOptions.preferences['browser.cache.disk.enable'] = false;
          launchOptions.preferences['browser.cache.memory.enable'] = false;
        }
        return launchOptions;
      });

      // =========================
      // 4️⃣ Cypress Cloud (SEMPRE POR ÚLTIMO)
      // =========================
      const enhancedConfig = await cloudPlugin(on, config);

      return enhancedConfig;
    },
  },
});
