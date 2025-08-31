// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'deep-blue': '#1E6A8C',
        'teal': '#2E86A7',
        'purple': '#3B2F57',
        'magenta': '#A24A74',
        'gold': '#C19A3A',
        'brass': '#9C7A3B',
        'copper': '#7B5A3D',
        'soft-white': '#EDEFF3',
        'light-gray': '#C9D2DC',
        'wood-dark': '#5A3E2B',
        'wood-deep': '#3D2A1F',
        'red-mist': '#C75A63',
        'pink-mist': '#D97A85',
        'black-victorian': '#1A1A1C',
        'dark-gray': '#2B2A2A',
      },
      fontFamily: {
        cinzel: ["Cinzel", "serif"],                       // headings
        cinzelDecorative: ["Cinzel Decorative", "Cinzel", "serif"], // display title/tagline
        cormorant: ["Cormorant Garamond", "serif"],        // body/subheads
        fell: ["IM Fell English SC", "serif"],             // small-caps accents
        macondo: ["Macondo Swash Caps", "serif"],          // display headings (legacy)
      },
    },
  },
  plugins: [],
}
