/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'amazon-orange': '#FF9900',
        'amazon-blue': '#232F3E',
        'investor-green': '#10B981',
        'investor-red': '#EF4444',
      }
    },
  },
  plugins: [],
}
