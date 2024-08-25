/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      keyframes: {
        fadeInRight: {
          "0%": {
            opacity: "0",
            transform: "translate3d(100%, 0, 0)",
          },
          "100%": {
            opacity: "1",
            transform: "translate3d(0, 0, 0)",
          },
        },
        "heading-before-animation": {
          "0%": {
            width: "0",
            top: "50%",
          },
          "50%": {
            width: "100%",
            top: "50%",
          },
          "100%": {
            width: "100%",
            top: "-10px",
          },
        },
        "heading-after-animation": {
          "0%": {
            width: "0",
            bottom: "50%",
          },
          "50%": {
            width: "100%",
            bottom: "50%",
          },
          "100%": {
            width: "100%",
            bottom: "-10px",
          },
        },
      },
      animation: {
        fadeInRight: "fadeInRight 0.8s ease-in-out forwards",
        "heading-before-animation": "heading-before-animation 1s ease-in-out forwards",
        "heading-after-animation": "heading-after-animation 1s ease-in-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animation-delay")],
};
