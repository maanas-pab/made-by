import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F5F2EC",
        ink: "#1C1C1A",
        warmgray: "#8A877F",
        line: "#D9D5CC",
        softwhite: "#FBFAF7",
        clay: "#E9E3D6",
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Instrument Serif"', "Georgia", "serif"],
        sans: ['"Inter"', '"Helvetica Neue"', "Helvetica", "Arial", "sans-serif"],
      },
      letterSpacing: {
        micro: "0.18em",
      },
    },
  },
  plugins: [],
};
export default config;
