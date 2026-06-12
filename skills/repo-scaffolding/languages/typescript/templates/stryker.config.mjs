/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: "pnpm",
  testRunner: "vitest",
  reporters: ["progress", "clear-text", "json"],
  coverageAnalysis: "perTest",
  mutate: ["packages/*/src/**/*.ts", "!packages/*/src/**/*.test.ts"],
};
