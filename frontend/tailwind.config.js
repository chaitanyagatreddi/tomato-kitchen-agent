/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#0b1614',
        surface:  '#112120',
        surface2: '#182e2c',
        border:   '#1f3d3a',
        muted:    '#5f8a85',
        teal:     '#00CCBC',
        'teal-dark': '#00857A',
        tomato:   '#FF5733',
        swiggy:   '#FC8019',
        zomato:   '#E23744',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
