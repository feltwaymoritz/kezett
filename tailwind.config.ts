import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      boxShadow: { soft: "0 18px 50px rgba(15,23,42,.08)" },
      borderRadius: { xl2: "1.35rem" },
    },
  },
  plugins: [],
} satisfies Config;
