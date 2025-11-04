import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#176F3C",
        accent: "#FFD700",
      },
      fontFamily: {
        sans: ["Poppins", "Raleway", "Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

