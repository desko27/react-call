/** @type {import('tailwindcss').Config} */

import animations from '@midudev/tailwind-animations'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [animations],
}
