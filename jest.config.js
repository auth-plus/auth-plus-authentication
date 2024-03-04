/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/(unit|integration)/**/*.test.ts'],
  transformIgnorePatterns: ['/node_modules/(?!chai).+\\.js$'],
  coverageReporters: ['text', 'html'],
  collectCoverageFrom: ['**/src/**/*.test.ts'],
  coverageDirectory: '/test/coverage',
  maxConcurrency: 1,
}
