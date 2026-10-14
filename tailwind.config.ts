import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { raven: { 950: "#080b12", 900: "#101521", 800: "#171f2d", 700: "#273448", 500: "#7b8ba6", 400: "#aab8ce", 300: "#d4deeb" }, accent: "#8b9cff" } } },
  plugins: []
};
export default config;
