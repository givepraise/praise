module.exports = {
  mode: 'jit',
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    screens: {
      'xs': '376px',
      'sm': '640px',
      'md': '750px',
      'lg': '1024px',
      'xl': '1270px',
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
