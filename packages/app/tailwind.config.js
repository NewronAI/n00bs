/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],

  daisyui: {
    themes: [
      {
        dark: {
          "primary": "#84cc16",
          "secondary": "#f59e0b",
          "accent": "#7c3aed",
          // "neutral": "#191D24",
          // "base-100": "#090a01",
          "base-100": "#ffffff",
          // "info": "#1d4ed8",
          // "success": "#22c55e",
          // "warning": "#fdba74",
          // "error": "#e11d48",
        },
      },
    ],
    darkTheme: "dark",
  }
}


