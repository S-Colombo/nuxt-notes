import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

const appRoot = fileURLToPath(new URL('./app', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '~': appRoot,
      '@': appRoot,
    },
  },
  define: {
    'import.meta.client': true,
  },
  test: {
    projects: [
      {
        resolve: {
          alias: {
            '~': appRoot,
            '@': appRoot,
          },
        },
        define: {
          'import.meta.client': true,
        },
        test: {
          name: 'unit',
          include: ['test/unit/*.{test,spec}.ts'],
          environment: 'happy-dom',
        },
      },
      {
        test: {
          name: 'e2e',
          include: ['test/e2e/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/*.{test,spec}.ts'],
          environment: 'nuxt',
        },
      }),
    ],
  },
})
