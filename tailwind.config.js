/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    container: false,
  },
  content: ["./dist/**/*.html", "./dist/js/**/*.js"],
  theme: {
    extend: {
      boxShadow: {
        ui: `inset 0 0 0 0.0625rem #3c3b5e`,
        search: `inset 0 0 0 0.0625rem #302f4a`,
      },
      colors: {
        neutral: {
          200: "#d4d3d9",
          300: "#acacb7",
          600: "#3c3b5e",
          700: "#302f4a",
          800: "#262540",
          900: "#02012c",
        },
        orange: {
          500: "#ff820a",
        },
        blue: {
          500: "#4658d9",
          700: "#2b1b9c",
        },
      },
      fontFamily: {
        "dm-sans": "'DM Sans', sans-serif",
        "bricolage-grotesque": "'Bricolage Grotesque', sans-serif",
      },
      fontSize: {
        "2.8xl": "1.75rem",
        "3.24xl": "2rem",
        "5.25xl": "3.25rem",
      },
      height: {
        4.25: "1.0625rem",
        4.5: "1.125rem",
        30: "7.5rem",
      },
      minHeight: {
        15: "3.75rem",
        41.25: "10.3125rem",
      },
      maxHeight: {
        15: "3.75rem",
        46: "11.5rem",
        148: "37rem",
      },
      lineHeight: {
        5.25: "1.3125rem",
        tighter: 1.2,
      },
      spacing: {
        4.5: "1.125rem",
        6.25: "1.5625rem",
        7.5: "1.875rem",
        9.5: "2.375rem",
        10.25: "2.5625rem",
        10.5: "2.625rem",
        20.75: "5.1875rem",
      },
      width: {
        2.25: "0.5625rem",
      },
      maxWidth: {
        120.5: "30.125rem",
        164: "41rem",
      },
      outlineOffset: {
        3: "3px",
      },
      borderRadius: {
        "2.5xl": "1.25rem",
      },
    },
  },
  plugins: [
    require("tailwindcss-debug-screens"),

    function ({ addComponents }) {
      addComponents({
        ".container": {
          maxWidth: "79rem",
        },
      });
    },
  ],
};
