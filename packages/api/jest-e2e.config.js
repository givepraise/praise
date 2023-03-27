const JestBaseConfiguration = require('./jest-base.config');

module.exports = Object.assign(JestBaseConfiguration, {
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.e2e-spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>/test'],
  coverageDirectory: '<rootDir>/docs/e2e-coverage',
  coverageThreshold: {
    global: {
      branches: 5,
      functions: 5,
      lines: 5,
      statements: 5,
    },
  },
  testTimeout: 30000, // Set in each file in case different values are needed
});
