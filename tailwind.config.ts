import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        java: {
          "50": "#f1fcfa",
          "100": "#d1f6f2",
          "200": "#a2ede6",
          "300": "#6cdcd6",
          "400": "#40c4c2",
          "500": "#24a8a8",
          "600": "#1b8386",
          "700": "#196a6c",
          "800": "#195356",
          "900": "#194648",
          "950": "#08282b",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
