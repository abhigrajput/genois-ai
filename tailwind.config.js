module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#00FF94",
        secondary: "#7B61FF",
        calm: "#4A9EFF",
        warning: "#FFB347",
        danger: "#FF6B6B",
        success: "#00D68F",
        dark: {
          900: "#0A0A0F",
          800: "#12121A",
          700: "#1A1A27",
          600: "#222233",
          500: "#2A2A3F",
        },
      },
      fontFamily: {
        heading: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
