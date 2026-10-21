/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{html,js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        voco: {
          bg: "#0A120E",
          forest: "#224338",
          gold: "#C1A278",
          sage: "#9EB0AA",
          line: "rgba(193, 162, 120, 0.2)"
        }
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        syne: ["Syne", "sans-serif"],
        display: ["'Playfair Display'", "Georgia", "serif"],
        jost: ["Jost", "sans-serif"]
      }
    }
  },
  plugins: []
};
