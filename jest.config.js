module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
  collectCoverageFrom: ["src/**/*.js"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
