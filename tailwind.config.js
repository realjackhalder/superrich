/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0E11', // Binance deep dark background
        panel: '#181A20',      // Binance panel color
        textMain: '#EAECEF',   // Light text
        textMuted: '#848E9C',  // Muted text
        emeraldGreen: '#00C087', // Buy/Growth
        roseRed: '#FF3B69',      // Sell/Loss
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
