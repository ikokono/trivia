/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Arial', 'sans-serif'], // Font default
        retro: ['"Press Start 2P"', 'cursive'], // Tambahkan font baru
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        border: "var(--border)",
        retroGreen: "#91C483"
      },
      fontSize: {
        '5xl': '3rem', 
        '6xl': '4rem',
        '7xl': '5rem',
      },
    },
  },
  plugins: [],
};
