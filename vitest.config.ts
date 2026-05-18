import { defineConfig } from 'vitest/config'

const DIST_TESTS = [
  'packages/*/src/**/bundle-content.test.ts',
  'packages/*/src/**/tarball-snapshot.test.ts',
]

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./packages/react-call/src/__tests__/setup.ts'],
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['packages/*/src/**/*.test.{ts,tsx}'],
          exclude: DIST_TESTS,
        },
      },
      {
        extends: true,
        test: {
          name: 'dist',
          include: DIST_TESTS,
        },
      },
    ],
  },
})
