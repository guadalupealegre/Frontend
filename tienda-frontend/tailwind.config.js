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
          50: '#fff9f5',
          100: '#ffede2',
          200: '#fed8c3',
          300: '#fdb697',
          400: '#fa8862',
          500: '#f55f36',
          600: '#e3421e',
          700: '#be3216',
          800: '#9b2c17',
          900: '#7d2818',
          950: '#431108',
        },
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        caramel: {
          light: '#fdf6e2',
          50: '#fffbeb',
          100: '#fef3c7',
          DEFAULT: '#d97706',
          dark: '#b45309',
        },
        pastry: {
          cream: '#fffdfa',
          vanilla: '#fefaf3',
          rose: '#fff1f3',
          chocolate: '#27140c',
          darkChocolate: '#1c0c06',
          cacao: '#3e2014',
          accent: '#e11d48',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Outfit"', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'warm': '0 10px 25px -5px rgba(62, 32, 20, 0.08), 0 8px 10px -6px rgba(62, 32, 20, 0.06)',
        'warm-hover': '0 20px 35px -10px rgba(62, 32, 20, 0.15), 0 10px 15px -5px rgba(225, 29, 72, 0.12)',
        'glow-rose': '0 0 25px -5px rgba(225, 29, 72, 0.35)',
        'glow-caramel': '0 0 25px -5px rgba(217, 119, 6, 0.35)',
        'glass': '0 8px 32px 0 rgba(44, 24, 16, 0.12)',
      }
    },
  },
  plugins: [],
}
