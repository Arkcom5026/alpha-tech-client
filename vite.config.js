// ✅ vite.config.js
// 🏛️ Premium Enterprise POS Bundler Configuration

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const testFilePattern = /\.(?:test|spec)\.(?:js|jsx|ts|tsx)$/
const vitestImportPattern = /\bfrom\s+['"]vitest['"]|\brequire\(\s*['"]vitest['"]\s*\)|\bimport\(\s*['"]vitest['"]\s*\)/
const toPosixPath = (value) => value.split(path.sep).join('/')

const discoverNonVitestTestFiles = (rootDir) => {
  const nonVitestFiles = []

  const visit = (directory) => {
    if (!existsSync(directory)) return

    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        visit(absolutePath)
        continue
      }

      if (!entry.isFile() || !testFilePattern.test(entry.name)) continue

      const source = readFileSync(absolutePath, 'utf8')
      if (!vitestImportPattern.test(source)) {
        nonVitestFiles.push(toPosixPath(path.relative(rootDir, absolutePath)))
      }
    }
  }

  visit(path.join(rootDir, 'src'))
  visit(path.join(rootDir, 'tests'))

  return nonVitestFiles
}

const nonVitestTestFiles = discoverNonVitestTestFiles(__dirname)

const vendorChunkFor = (moduleId) => {
  const id = toPosixPath(moduleId)
  if (!id.includes('/node_modules/')) {
    const featureName = id.match(/\/src\/features\/([^/]+)\//)?.[1]
    return featureName
      ? `feature-${featureName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`
      : undefined
  }

  const groups = [
    ['vendor-react', ['/react/', '/react-dom/', '/react-router', '/scheduler/']],
    ['vendor-mui', ['/@mui/', '/@emotion/']],
    ['vendor-motion', ['/framer-motion/', '/motion/']],
    ['vendor-charts', ['/recharts/', '/d3-', '/victory-vendor/']],
    ['vendor-documents', ['/xlsx/', '/html2pdf.js/', '/jspdf/', '/html2canvas/']],
    ['vendor-media', ['/@cloudinary/', '/cloudinary/', '/swiper/', '/react-webcam/']],
    ['vendor-ui', ['/@radix-ui/', '/@dnd-kit/', '/react-datepicker/', '/react-day-picker/', '/rc-slider/', '/react-icons/', '/lucide-react/']],
    ['vendor-forms', ['/react-hook-form/', '/@hookform/', '/zod/']],
    ['vendor-data', ['/@tanstack/', '/axios/', '/zustand/']],
    ['vendor-utils', ['/lodash', '/date-fns/', '/dayjs/', '/moment/', '/numeral/']],
  ]

  return groups.find(([, patterns]) => patterns.some((pattern) => id.includes(pattern)))?.[0]
    || 'vendor-misc'
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@api': path.resolve(__dirname, './src/api'),
      '@features': path.resolve(__dirname, './src/features'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@store': path.resolve(__dirname, './src/store'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@routes': path.resolve(__dirname, './src/routes'),
      'react': path.resolve(__dirname, './node_modules/react')
    }
  },
  server: {
    historyApiFallback: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: vendorChunkFor
      }
    }
  },
  test: {
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'tests/**/*.{test,spec}.{js,jsx,ts,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'e2e/**',
      '**/*.e2e.*',
      'src/features/**/e2e/**/*.browser.spec.{js,jsx,ts,tsx}',
      ...nonVitestTestFiles
    ]
  }
})
