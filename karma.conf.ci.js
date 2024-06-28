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
      require('karma-spec-reporter'),
      require('karma-junit-reporter'),
      require('karma-sonarqube-unit-reporter'),
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser,
      jasmine: {
        random: false,
      },
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      reporters: [
        { type: 'html' },
        { type: 'lcovonly', subdir: 'report-lcov' },
        { type: 'text-summary' },
        { type: 'cobertura', subdir: 'report-cobertura' },
      ],
      fixWebpackSourcePaths: true,
      check: {
        global: {
          // Setting the thresholds for warning
          statements: 80,
          lines: 80,
          branches: 80,
          functions: 80,
        },
      },
      watermarks: {
        statements: [50, 80],
        functions: [50, 80],
        branches: [50, 80],
        lines: [50, 80],
      },
    },
    sonarQubeUnitReporter: {
      sonarQubeVersion: 'LATEST',
      outputFile: '../coverage/sonar-junit/report.xml',
      overrideTestDescription: true,
      testFilePattern: '.spec.ts',
      useBrowserName: false,
    },
    junitReporter: {
      outputDir: '../coverage/gitlab-junit', // results will be saved as $outputDir/$browserName.xml
      outputFile: 'report.xml', // if included, results will be saved as $outputDir/$browserName/$outputFile
      suite: '', // suite will become the package name attribute in xml testsuite element
      useBrowserName: false, // add browser name to report and classes names
      nameFormatter: undefined, // function (browser, result) to customize the name attribute in xml testcase element
      classNameFormatter: undefined, // function (browser, result) to customize the classname attribute in xml testcase element
      properties: {}, // key value pair of properties to add to the <properties> section of the report
      xmlVersion: null, // use '1' if reporting to be per SonarQube 6.2 XML format
    },
    reporters: ['progress', 'kjhtml', 'coverage', 'sonarqubeUnit', 'junit'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu'],
      },
    },
    singleRun: true, // Ensures Karma exits after running tests
    restartOnFileChange: true,
  });
};
