/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        karla: ["var(--font-karla)", "sans-serif"],
        satoshi: ["var(--font-satoshi)", "sans-serif"],
      },
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        "blue-100": "#2c325d",
        "light-100": "#fff8fb",
        "dark-100": "#212121",
        "gray-20": "rgba(108, 102, 133, 0.2)",
        "gray-25": "rgba(108, 102, 133, 0.25)",
        "gray-40": "rgba(58, 56, 77, 0.04)",
        "gray-100": "#6c6685",
        "pink-10": "#ffeef5",
        "pink-100": "#ff4393",
        "orange-100": "#ff751f",
      },
      fontSize: {
        28: "1.75rem",
      },
      boxShadow: {
        10: "0px 6px 24px 0px rgba(0, 0, 0, 0.1)",
        15: "0px 8px 24px 0px rgba(0, 0, 0, 0.15)",
        20: "0px 10px 30px 0px rgba(0, 0, 0, 0.2)",
        "inset-20":
          "0px 10px 40px 0px rgba(0, 0, 0, 0.2), 0px 0px 0px 1px #d7d5dd inset",
      },
      borderRadius: {
        18: "18px",
        20: "20px",
        28: "28px",
        "4xl": "2rem",
      },
      backgroundImage: {
        "radial-100": `radial-gradient(
          79.36% 59.94% at 101.94% -1.83%, #ffe5f0 0%, #fff 42%, rgba(0,0,0,0) 42%
        ), radial-gradient(
          60.29% 53.62% at 0% 100%, #ffd8e9 0%, #fff 42%, rgba(0,0,0,0) 42%
        )`,
      },
    },
  },
  plugins: [],
};
