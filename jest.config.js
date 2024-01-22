/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/(unit|integration)/**/*.test.ts'],
  collectCoverage: true,
  coverageReporters: ['cobertura', 'lcov', 'text'],
  coverageDirectory: 'coverage',
  maxConcurrency: 1,
  maxWorkers: 1,
  clearMocks: true,
}
