import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        typewriter: {
          from: { width: "0ch" },
          to: { width: "21ch" }, 
        },
        blink: {
          "50%": { borderColor: "transparent" },
          "100%": { borderColor: "#3b82f6" },
        },
      },
      animation: {
        typewriterBlink: 'typewriter 3s steps(21) forwards infinite, blink 0.8s step-end infinite',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["forest"],
  },
};
