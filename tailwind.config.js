/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    container: false,
  },
  content: ["./dist/**/*.html", "./dist/js/**/*.js"],
  theme: {
    extend: {
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
