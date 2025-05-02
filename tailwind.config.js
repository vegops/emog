/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
      extend: {
        backgroundImage: {
          'game-bg': "url('/static/images/natural-stone-floor-with-grass-patches-seamless-texture-tile-tileable-background-3d.jpg')",
        },
      },
    },
    plugins: [],
  };
  