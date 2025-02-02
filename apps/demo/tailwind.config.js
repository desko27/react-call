/** @type {import('tailwindcss').Config} */

import animations from '@midudev/tailwind-animations'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'fade-out-up-lg': 'fade-out-up-lg 0.6s ease-out both',
        'fade-in-down-lg': 'fade-in-down-lg 0.6s ease-out both',
      },
      keyframes: {
        'fade-out-up-lg': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-64px)' },
        },
        'fade-in-down-lg': {
          '0%': { opacity: '0', transform: 'translateY(-64px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [animations],
  future: {
    hoverOnlyWhenSupported: true,
  },
}
