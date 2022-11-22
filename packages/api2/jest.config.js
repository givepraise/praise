const JestBaseConfiguration = require('./jest-base.config');

module.exports = Object.assign(JestBaseConfiguration, {
  roots: ['<rootDir>/src'],
  coverageDirectory: '<rootDir>/docs/coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  testTimeout: 30000, // Set in each config in case different values are needed
});
