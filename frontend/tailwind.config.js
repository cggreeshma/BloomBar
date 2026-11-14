/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        blush: {
          50: "#fbf6f4",
          100: "#f7ebe8",
          200: "#f0d5d1",
          300: "#e4b4b0",
          400: "#d48c8a",
          500: "#c97b84",
          600: "#b45a66",
        },
        cream: {
          50: "#fdfbf7",
          100: "#f7f1e9",
          200: "#efe4d4",
          300: "#e2d1b8",
        },
        sage: {
          50: "#f3f6f2",
          100: "#e4ebe2",
          400: "#8fa38a",
          500: "#6f876b",
          700: "#3f5340",
        },
        ink: "#2c2420",
      },
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        sans: ["Outfit", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 20px 50px -24px rgba(44,36,32,0.25)",
      },
    },
  },
  plugins: [],
};
