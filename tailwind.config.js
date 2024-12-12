/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        lexend: ['Lexend', 'system-ui', '-apple-system', 'sans-serif'],
        quicksand: ['Quicksand', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}