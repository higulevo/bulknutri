/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bn: {
          orange:  '#FF6500',
          'orange-light': '#FF8533',
          'orange-dark':  '#CC5200',
          black:   '#000000',
          'gray-950': '#0A0A0A',
          'gray-900': '#111111',
          'gray-800': '#1A1A1A',
          'gray-700': '#252525',
          'gray-600': '#333333',
          'gray-500': '#555555',
          'gray-400': '#777777',
          'gray-300': '#999999',
          'gray-200': '#BBBBBB',
          'gray-100': '#DDDDDD',
          'gray-50':  '#F5F5F5',
        }
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '24px',
      }
    },
  },
  plugins: [],
}
