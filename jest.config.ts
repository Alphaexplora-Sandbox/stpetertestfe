import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  // jsdom, so component tests can click things. The pure-logic specs do not
  // need it and do not care; the alternative is a per-file docblock on every
  // component spec, which is one more thing to forget.
  testEnvironment: 'jsdom',
  testMatch: [
    '**/*.spec.ts',
    '**/*.test.ts',
    '**/*.spec.tsx',
    '**/*.test.tsx',
  ],
  // The Playwright suite lives in tests/e2e and is named *.e2e-spec.ts, which
  // the patterns above already miss. Ignored explicitly as well, so renaming a
  // browser spec cannot drag it into the unit runner - where page.goto would
  // fail in a way that looks like an application bug.
  testPathIgnorePatterns: ['/node_modules/', '/tests/e2e/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    // The mount shim: three lines that hand the app to react-dom. Covering it
    // would mean asserting that createRoot was called, which tests React
    // rather than this project.
    '!src/main.tsx',
  ],
  coverageDirectory: 'coverage',
  // json-summary is the one that matters: it writes coverage-summary.json,
  // which is the ONLY file the CI coverage gate reads. Jest's defaults are
  // clover, json, lcov and text - none of them that - so the suite passed,
  // wrote three reports, and the gate failed saying the file was not found.
  // lcov is kept for SonarCloud, text for the log.
  coverageReporters: ['text', 'lcov', 'json-summary'],
};

export default config;
