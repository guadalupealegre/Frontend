/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dulce: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        caramel: {
          light: '#fdf6e2',
          DEFAULT: '#d97706',
          dark: '#b45309',
        },
        pastry: {
          cream: '#fffdfa',
          rose: '#fff1f2',
          chocolate: '#382216',
          accent: '#e11d48',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Outfit"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'warm': '0 10px 25px -5px rgba(234, 88, 12, 0.1), 0 8px 10px -6px rgba(234, 88, 12, 0.1)',
        'warm-hover': '0 20px 30px -10px rgba(234, 88, 12, 0.2), 0 10px 15px -5px rgba(234, 88, 12, 0.15)',
      }
    },
  },
  plugins: [],
}
