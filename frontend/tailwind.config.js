/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#edf7f6',
          100: '#c7e9e6',
          200: '#9dd6d1',
          300: '#6ec0ba',
          400: '#3da8a1',
          500: '#1d9e97',
          600: '#0f7a74',
          700: '#085c57',
          800: '#043d3a',
          900: '#021f1d',
        },
        ward: {
          general:   '#1d9e97',
          emergency: '#dc2626',
          mental:    '#7c3aed',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'typing': 'typing 1.2s steps(3,end) infinite',
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        typing:  { '0%,100%': { content: '●' }, '33%': { content: '● ●' }, '66%': { content: '● ● ●' } },
      }
    },
  },
  plugins: [],
}
