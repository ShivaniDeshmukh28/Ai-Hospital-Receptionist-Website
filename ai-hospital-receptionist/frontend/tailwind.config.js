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
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        medical: {
          blue: '#0284c7',
          sky: '#e0f2fe',
          teal: '#0d9488',
          darkTeal: '#0f766e',
          ice: '#f0f9f8',
          surface: '#f8fafc',
          card: '#ffffff',
          slate: '#0f172a',
        },
        ward: {
          general:   '#0d9488',
          emergency: '#dc2626',
          mental:    '#7c3aed',
          pediatric: '#d97706',
          ortho:     '#0284c7',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'sans-serif'],
        display: ['Sora', 'Syne', 'sans-serif'],
      },
      boxShadow: {
        'clinical': '0 1px 3px 0 rgba(15, 23, 42, 0.03), 0 4px 16px -2px rgba(13, 148, 136, 0.08)',
        'clinical-lg': '0 10px 30px -4px rgba(13, 148, 136, 0.12), 0 4px 12px rgba(15, 23, 42, 0.04)',
        'glow': '0 0 20px rgba(13, 148, 136, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        'typing': 'typing 1.2s steps(3,end) infinite',
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4,0,0.6,1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        typing:  { '0%,100%': { content: '●' }, '33%': { content: '● ●' }, '66%': { content: '● ● ●' } },
        float: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } }
      }
    },
  },
  plugins: [],
}

