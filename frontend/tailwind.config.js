/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      animation: {
        blink: 'blink 1s steps(2, start) infinite',
        pulseGlow: 'pulseGlow 1.5s ease-in-out infinite'
      },
      keyframes: {
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '.25' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(239, 68, 68, 0)' },
          '50%': { boxShadow: '0 0 42px rgba(239, 68, 68, .55)' }
        }
      }
    }
  },
  plugins: []
};
