/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@workspace/db$': '<rootDir>/tests/__mocks__/workspace-db.ts',
    '^@workspace/api-zod$': '<rootDir>/tests/__mocks__/workspace-api-zod.ts',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ESNext',
          moduleResolution: 'Bundler',
          target: 'ES2022',
          strict: true,
        },
      },
    ],
  },
  testMatch: ['**/tests/**/*.test.ts'],
  resetMocks: true,
  collectCoverageFrom: [
    'src/routes/**/*.ts',
    'src/services/**/*.ts',
    'src/middlewares/**/*.ts',
    '!src/routes/health.ts',
    '!src/routes/auth.ts',
    '!src/routes/index.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 90,
    },
  },
};
