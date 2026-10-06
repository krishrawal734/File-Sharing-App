module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  moduleNameMapper: {
    "^react-native$": "<rootDir>/src/__mocks__/react-native.js",
    "^expo-network$": "<rootDir>/src/__mocks__/expo-network.js",
    "^expo-device$": "<rootDir>/src/__mocks__/expo-device.js",
  },
  collectCoverageFrom: [
    "src/utils/**/*.ts",
    "src/services/**/*.ts",
    "!**/node_modules/**",
  ],
};
