/** @type {import('jest').Config} */
const config = {
  preset: 'jest-expo',

  // Run global setup (fast-check config) after the test framework is installed
  setupFilesAfterEnv: ['./jest.setup.ts'],

  // Transform TypeScript files; allow Jest to process Expo/RN packages
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)',
  ],

  // Module name mapper for path aliases defined in tsconfig
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    // Mock react-native-svg to avoid native module issues in Jest
    '^react-native-svg$': '<rootDir>/__mocks__/react-native-svg.js',
  },

  // Collect coverage from source files
  collectCoverageFrom: [
    'src/lib/**/*.{ts,tsx}',
    'src/store/**/*.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/*.d.ts',
  ],

  testMatch: [
    '**/__tests__/**/*.{ts,tsx}',
    '**/*.test.{ts,tsx}',
    '**/*.spec.{ts,tsx}',
  ],
};

module.exports = config;
