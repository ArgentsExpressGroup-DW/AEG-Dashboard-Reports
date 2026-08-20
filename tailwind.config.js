/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        maroon: '#98012E',            // primary brand / all primary actions
        'maroon-bright': '#C4123F',   // hover state + accent
        charcoal: '#21201E',          // dark surfaces, secondary chart series
      },
      fontFamily: {
        sans: ['Calibri', 'Segoe UI', 'system-ui', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
