/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        // The Calm Future palette
        sand: {
          50: '#faf9f7',
          100: '#f5f3ef',
          200: '#ebe7df',
          300: '#ddd7cb',
          400: '#cec4b3',
          500: '#b8ab97',
        },
        lilac: {
          50: '#f9f7fb',
          100: '#f3eff7',
          200: '#e7dfef',
          300: '#d4c3e3',
          400: '#bca3d4',
          500: '#a082c4',
        },
        ink: {
          50: '#f5f7f9',
          100: '#e8ecf1',
          200: '#d1d9e3',
          300: '#a8b8cb',
          400: '#7891ae',
          500: '#556d8f',
          600: '#445775',
          700: '#38465f',
          800: '#2d3749',
          900: '#1f2937',
        },
        golden: {
          50: '#fdfaf5',
          100: '#faf3e6',
          200: '#f5e6c8',
          300: '#eed19f',
          400: '#e5b671',
          500: '#d99d4d',
        },
        breath: {
          blue: '#e8f1fa',
          gold: '#faf5eb',
          pink: '#fbeef3',
          gray: '#f1f3f5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Satoshi', 'Inter', 'sans-serif'],
      },
      animation: {
        'breathe': 'breathe 4s ease-in-out infinite',
        'ripple': 'ripple 3s ease-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.5', filter: 'blur(20px)' },
          '50%': { opacity: '0.8', filter: 'blur(30px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    },
  },
  plugins: [],
}
