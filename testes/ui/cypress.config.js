const { defineConfig } = require('cypress');
const allureWriter = require('@shelex/cypress-allure-plugin/writer');
const { cloudPlugin } = require('cypress-cloud/plugin');
const webpackPreprocessor = require('@cypress/webpack-preprocessor');
const webpack = require('webpack');
require('dotenv').config();

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://qa-signa.sme.prefeitura.sp.gov.br',
    supportFile: 'cypress/support/e2e.js',
    specPattern: ['cypress/e2e/**/*.feature'],

    video: false,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,

    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,

    viewportWidth: 1920,
    viewportHeight: 1080,

    retries: {
      runMode: 1,
      openMode: 0
    },

    env: {
      loginUrl: '/login',
      username: '7311559',
      password: process.env.CYPRESS_PASSWORD
    },

    async setupNodeEvents(on, config) {

      // ✅ ALLURE
      allureWriter(on, config);

      // ✅ WEBPACK COMPLETO (Cucumber + polyfills)
      const options = {
        webpackOptions: {
          resolve: {
            extensions: ['.js', '.json'],
            fallback: {
              path: require.resolve('path-browserify'),
              process: require.resolve('process/browser') // 🔥 CORREÇÃO AQUI
            }
          },
          plugins: [
            new webpack.ProvidePlugin({
              process: 'process/browser' // 🔥 injeta globalmente
            })
          ],
          module: {
            rules: [
              {
                test: /\.feature$/,
                use: [
                  {
                    loader: 'cypress-cucumber-preprocessor/loader'
                  }
                ]
              },
              {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: ['@babel/preset-env']
                  }
                }
              }
            ]
          }
        }
      };

      on('file:preprocessor', webpackPreprocessor(options));

      // ✅ TASKS
      on('task', {
        log(message) {
          console.log(message);
          return null;
        }
      });

      // ✅ CLOUD
      const finalConfig = await cloudPlugin(on, config);

      return finalConfig;
    },
  },
});