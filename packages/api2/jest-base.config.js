const tsconfig = require('./tsconfig.json');
const moduleNameMapper = require('tsconfig-paths-jest')(tsconfig);

module.exports = {
  moduleNameMapper,
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './',
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/**/*.ts',
    '!<rootDir>/**/*.interface.ts',
    '!<rootDir>/**/*.mock.ts',
    '!<rootDir>/**/*.module.ts',
    '!<rootDir>/**/__mock__/*',
    '!<rootDir>/src/main.ts',
  ],
  coverageProvider: 'v8',
  setupFilesAfterEnv: ['jest-extended'],
  verbose: true,
};
