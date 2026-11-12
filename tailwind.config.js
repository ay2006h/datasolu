/** @type {import('tailwindcss').Config} */

// Brand palette is driven by CSS variables (see src/theme/palette.ts) so the user can pick
// a visual identity at runtime. `indigo` and `violet` are aliased to the brand palette so that
// every accent across the platform stays unified with the selected identity.
const brandVar = (shade) => `rgb(var(--brand-${shade}) / <alpha-value>)`;
const brandScale = Object.fromEntries(
  ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'].map((s) => [s, brandVar(s)])
);

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: brandScale,
        indigo: brandScale,
        violet: brandScale,
      }
    },
  },
  plugins: [],
}
