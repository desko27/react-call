import { defineConfig } from 'vitest/config'

const DIST_TESTS = [
  'packages/*/src/**/bundle-content.test.ts',
  'packages/*/src/**/tarball-snapshot.test.ts',
  'packages/*/src/**/fast-refresh-compat.test.ts',
]

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./packages/react-call/src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      all: true,
      include: ['packages/*/src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/__tests__/**',
        '**/*.d.ts',
        // Type-only modules compile to nothing — no runtime to cover.
        '**/types.*.ts',
        // Re-export barrels carry no logic.
        'packages/*/src/main.ts',
      ],
      reporter: ['text', 'html'],
      // Ratchet, not aspiration: floored to today's measured coverage so
      // the gate blocks regressions without demanding new tests. Bump up
      // as coverage grows. See ADR-0017.
      thresholds: {
        statements: 99,
        branches: 91,
        functions: 100,
        lines: 99,
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: [
            'packages/*/src/**/*.test.{ts,tsx}',
            'sites/*/src/**/*.test.{ts,tsx}',
          ],
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
