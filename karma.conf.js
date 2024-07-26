module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with `random: false`
        // or set a specific seed with `seed: 4321`
      },
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true, // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(
        __dirname,
        './coverage/cable_network_visualization'
      ),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }],
      fixWebpackSourcePaths: true,
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true,

    // Including both PNG and JPG images
    files: [
      {
        pattern: 'src/assets/images/**/*.{png,jpg}',
        watched: false,
        included: false,
        served: true,
        nocache: false,
      },
    ],

    // Proxies configuration to serve the assets correctly
    proxies: {
      '/assets/images/': '/base/src/assets/images/',
    },
  });
};
