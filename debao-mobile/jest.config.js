module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  transformIgnorePatterns: [
    'node_modules/.pnpm/(?!(react-native|@react-native\\+.*|@react-native-community\\+.*|react-native-svg|lucide-react-native)@)',
    'node_modules/(?!.pnpm|react-native|@react-native|@react-native-community|react-native-svg|lucide-react-native)',
  ],
};
