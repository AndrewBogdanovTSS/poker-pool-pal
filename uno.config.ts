import { defineConfig, presetUno, presetAttributify, presetIcons, presetWebFonts } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true
    }),
    presetWebFonts({
      fonts: {
        sans: 'Inter:400,500,600,700',
        mono: 'Fira Code'
      }
    })
  ],
  
  theme: {
    colors: {
      primary: {
        50: '#f0fdfa',
        100: '#ccfbf1',
        200: '#99f6e4',
        300: '#5eead4',
        400: '#2dd4bf',
        500: '#14b8a6',
        600: '#0d9488',
        700: '#0f766e',
        800: '#115e59',
        900: '#134e4a',
        950: '#042f2e'
      }
    }
  },

  shortcuts: {
    'btn': 'px-6 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
    'btn-primary': 'btn bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-lg hover:shadow-xl',
    'btn-secondary': 'btn bg-gray-200 c-gray-800 hover:bg-gray-300 active:bg-gray-400',
    'btn-danger': 'btn bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    'card': 'bg-white rounded-xl shadow-lg p-6 border b-gray-100',
    'input-field': 'w-full px-4 py-3 border-2 b-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all',
    'badge': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    'badge-primary': 'badge bg-primary-100 text-primary-800',
    'badge-success': 'badge bg-green-100 text-green-800',
    'badge-warning': 'badge bg-yellow-100 text-yellow-800',
    'badge-danger': 'badge bg-red-100 text-red-800'
  }
})
